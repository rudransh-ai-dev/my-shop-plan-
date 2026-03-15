from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from backend.database import get_db
from backend.models import Invoice, InvoiceItem, Product, Company, StockMovement, StockMovementType
from backend.schemas import InvoiceCreate, InvoiceResponse
from backend.middleware import get_current_company_id

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=400, detail="X-Company-ID header is missing")
    return company_id

def generate_invoice_number(db: Session, company_id: int) -> str:
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    if current_month >= 4:
        fy_start = current_year
        fy_end = current_year + 1
    else:
        fy_start = current_year - 1
        fy_end = current_year

    fy_str = f"{fy_start}-{str(fy_end)[-2:]}"
    
    last_invoice = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_number.like(f"INV-{fy_str}-%")
    ).order_by(Invoice.id.desc()).first()

    if last_invoice:
        last_seq = int(last_invoice.invoice_number.split("-")[-1])
        new_seq = last_seq + 1
    else:
        new_seq = 1

    return f"INV-{fy_str}-{new_seq:04d}"

@router.post("/", response_model=InvoiceResponse)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    company = db.query(Company).filter(Company.id == company_id).first()
    
    # We will assume intra-state (CGST/SGST) if no customer GSTIN or same state code.
    is_inter_state = False
    if company and company.gstin and invoice.customer_gstin:
        # First 2 chars of GSTIN represent state code
        if company.gstin[:2] != invoice.customer_gstin[:2]:
            is_inter_state = True

    invoice_number = generate_invoice_number(db, company_id)
    
    db_invoice = Invoice(
        company_id=company_id,
        invoice_number=invoice_number,
        customer_name=invoice.customer_name,
        customer_gstin=invoice.customer_gstin,
        total_amount=0.0
    )
    db.add(db_invoice)
    db.flush() # To get invoice id

    total_amount = 0.0

    for item in invoice.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.company_id == company_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")

        # Update Stock
        product.stock -= item.quantity
        
        # Record Stock Movement
        movement = StockMovement(
            company_id=company_id,
            product_id=product.id,
            quantity=item.quantity,
            movement_type=StockMovementType.SALE.value,
            remarks=f"Sold via {invoice_number}"
        )
        db.add(movement)

        # Calculate GST
        base_total = item.quantity * item.unit_price
        cgst = 0.0
        sgst = 0.0
        igst = 0.0
        
        gst_rate = product.gst_rate
        if is_inter_state:
            igst = base_total * (gst_rate / 100)
        else:
            cgst = base_total * ((gst_rate / 2) / 100)
            sgst = base_total * ((gst_rate / 2) / 100)
            
        item_total = base_total + cgst + sgst + igst
        total_amount += item_total

        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            cgst=cgst,
            sgst=sgst,
            igst=igst,
            total=item_total
        )
        db.add(db_item)

    db_invoice.total_amount = total_amount
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    invoices = db.query(Invoice).filter(Invoice.company_id == company_id).order_by(Invoice.created_at.desc()).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.company_id == company_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
