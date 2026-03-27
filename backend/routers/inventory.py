from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Product

router = APIRouter()

@router.get("/")
def list_products(
    skip: int = Query(0, description="Pagination offset"),
    limit: int = Query(50, description="Pagination limit"),
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
        
    total = query.count()
    products = query.order_by(Product.product_id).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "size": limit,
        "data": [{"id": p.id, "product_id": p.product_id, "category": p.category, "sub_category": p.sub_category, "name": p.name, "stock": p.stock, "store_room_stock": p.store_room_stock} for p in products]
    }

from pydantic import BaseModel

class StockUpdate(BaseModel):
    quantity: int
    movement_type: str
    remarks: str

@router.post("/{id}/stock")
def update_stock(id: int, payload: StockUpdate, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if payload.movement_type == "move_to_shop":
        if product.store_room_stock < payload.quantity:
            raise HTTPException(status_code=400, detail="Not enough items in store room")
        product.store_room_stock -= payload.quantity
        product.stock += payload.quantity
    elif payload.movement_type == 'restock_store':
        product.store_room_stock += payload.quantity
    elif payload.movement_type == 'restock_shop':
        product.stock += payload.quantity
        
    db.commit()
    return {"message": "Stock updated successfully"}
