from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Product, StockMovement
from backend.schemas import ProductCreate, ProductUpdate, ProductResponse, StockUpdate
from backend.middleware import get_current_company_id

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=400, detail="X-Company-ID header is missing")
    return company_id

@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    products = db.query(Product).filter(
        Product.company_id == company_id,
        Product.is_active == True
    ).all()
    return products

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    db_product = Product(**product.model_dump(), company_id=company_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    db_product = db.query(Product).filter(
        Product.id == product_id, 
        Product.company_id == company_id,
        Product.is_active == True
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    db_product = db.query(Product).filter(
        Product.id == product_id, 
        Product.company_id == company_id,
        Product.is_active == True
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db_product.is_active = False # Soft delete
    db.commit()
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/stock", response_model=ProductResponse)
def update_stock(product_id: int, stock_update: StockUpdate, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    db_product = db.query(Product).filter(
        Product.id == product_id, 
        Product.company_id == company_id,
        Product.is_active == True
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if stock_update.movement_type == "sale":
        if db_product.stock < stock_update.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        db_product.stock -= stock_update.quantity
    elif stock_update.movement_type == "purchase":
        db_product.stock += stock_update.quantity
    elif stock_update.movement_type == "adjustment":
        # Adjustment can be positive or negative
        db_product.stock += stock_update.quantity
        
    # Record movement
    movement = StockMovement(
        company_id=company_id,
        product_id=product_id,
        quantity=stock_update.quantity,
        movement_type=stock_update.movement_type.value,
        remarks=stock_update.remarks
    )
    db.add(movement)
    db.commit()
    db.refresh(db_product)
    
    return db_product
