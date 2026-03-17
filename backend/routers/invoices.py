from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from backend.database import get_db
from backend.models import Invoice, Company
from backend.schemas import InvoiceCreate, InvoiceResponse
from backend.middleware import get_current_company_id, get_current_user_id
from backend.services.db_utils import (
    transactional,
    idempotency_key_get,
    idempotency_key_create,
    idempotency_key_store_response,
    idempotency_key_parse_response,
    sha256,
    stable_json_dumps,
)
from backend.services.invoice_service import create_invoice_atomic
from backend.rate_limit import limiter

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return company_id

@router.post("/", response_model=InvoiceResponse)
@limiter.limit("30/minute")
def create_invoice(
    request: Request,
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    company_id: int = Depends(get_company_id),
):
    idempotency_key = request.headers.get("Idempotency-Key")
    endpoint = f"{request.method}:{request.url.path}"
    user_id = get_current_user_id()

    request_hash = None
    if idempotency_key:
        request_hash = sha256(stable_json_dumps(invoice.model_dump()))

    with transactional(db):
        if idempotency_key:
            existing = idempotency_key_get(db=db, company_id=company_id, endpoint=endpoint, key=idempotency_key)
            if existing and existing.request_hash and existing.request_hash != request_hash:
                raise HTTPException(status_code=409, detail="Idempotency key reuse with different request payload")
            if existing and existing.response_status and existing.response_body:
                return idempotency_key_parse_response(existing)

        idem_row = None
        if idempotency_key:
            idem_row = idempotency_key_create(
                db=db,
                company_id=company_id,
                endpoint=endpoint,
                key=idempotency_key,
                request_hash=request_hash,
            )

        db_invoice = create_invoice_atomic(db=db, company_id=company_id, user_id=user_id, invoice=invoice)
        db.refresh(db_invoice)

        if idem_row:
            payload = InvoiceResponse.model_validate(db_invoice).model_dump()
            idempotency_key_store_response(row=idem_row, status_code=200, response_body=payload)

        return db_invoice

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    invoices = (
        db.query(Invoice)
        .filter(Invoice.company_id == company_id, Invoice.is_deleted == False)  # noqa: E712
        .order_by(Invoice.created_at.desc())
        .all()
    )
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.company_id == company_id, Invoice.is_deleted == False)  # noqa: E712
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
