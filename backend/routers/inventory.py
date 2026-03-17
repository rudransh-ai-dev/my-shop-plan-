from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Product, StockMovement
from backend.schemas import ProductCreate, ProductUpdate, ProductResponse, StockUpdate
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
from backend.services.inventory_service import apply_stock_movement
from backend.services.audit_service import audit_log
from backend.rate_limit import limiter

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return company_id

@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    products = db.query(Product).filter(
        Product.company_id == company_id,
        Product.is_active == True,
        Product.is_deleted == False
    ).all()
    return products

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    user_id = get_current_user_id()
    with transactional(db):
        db_product = Product(**product.model_dump(), company_id=company_id)
        db.add(db_product)
        audit_log(
            db=db,
            company_id=company_id,
            user_id=user_id,
            action="PRODUCT_CREATED",
            details={"product": product.model_dump()},
        )
        db.flush()
        db.refresh(db_product)
        return db_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    update_data = product.model_dump(exclude_unset=True)
    user_id = get_current_user_id()
    with transactional(db):
        db_product = db.query(Product).filter(
            Product.id == product_id,
            Product.company_id == company_id,
            Product.is_active == True,
            Product.is_deleted == False
        ).first()

        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        before = {k: getattr(db_product, k) for k in update_data.keys()}
        for key, value in update_data.items():
            setattr(db_product, key, value)
        audit_log(
            db=db,
            company_id=company_id,
            user_id=user_id,
            action="PRODUCT_UPDATED",
            details={"product_id": product_id, "before": before, "after": update_data},
        )
        db.flush()
        db.refresh(db_product)
        return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    user_id = get_current_user_id()
    with transactional(db):
        db_product = db.query(Product).filter(
            Product.id == product_id,
            Product.company_id == company_id,
            Product.is_active == True,
            Product.is_deleted == False
        ).first()

        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        db_product.is_active = False
        db_product.is_deleted = True
        audit_log(
            db=db,
            company_id=company_id,
            user_id=user_id,
            action="PRODUCT_DELETED_SOFT",
            details={"product_id": product_id},
        )
        return {"message": "Product deleted successfully"}

@router.post("/{product_id}/stock", response_model=ProductResponse)
@limiter.limit("60/minute")
def update_stock(
    request: Request,
    product_id: int,
    stock_update: StockUpdate,
    db: Session = Depends(get_db),
    company_id: int = Depends(get_company_id),
):
    idempotency_key = request.headers.get("Idempotency-Key")
    endpoint = f"{request.method}:{request.url.path}"
    user_id = get_current_user_id()

    request_hash = None
    if idempotency_key:
        request_hash = sha256(stable_json_dumps(stock_update.model_dump()))

    with transactional(db):
        if idempotency_key:
            existing = idempotency_key_get(db=db, company_id=company_id, endpoint=endpoint, key=idempotency_key)
            if existing and existing.request_hash and existing.request_hash != request_hash:
                raise HTTPException(status_code=409, detail="Idempotency key reuse with different request payload")
            if existing and existing.response_status and existing.response_body:
                body = idempotency_key_parse_response(existing)
                return body

        idem_row = None
        if idempotency_key:
            idem_row = idempotency_key_create(
                db=db,
                company_id=company_id,
                endpoint=endpoint,
                key=idempotency_key,
                request_hash=request_hash,
            )

        product = apply_stock_movement(
            db=db,
            company_id=company_id,
            user_id=user_id,
            product_id=product_id,
            stock_update=stock_update,
        )
        db.refresh(product)

        if idem_row:
            # Persist response for duplicate retry safety
            payload = ProductResponse.model_validate(product).model_dump()
            idempotency_key_store_response(row=idem_row, status_code=200, response_body=payload)

        return product
