from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Product, OrderItem

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
    
    product_ids = [p.id for p in products]
    sold_counts = {}
    if product_ids:
        rows = db.query(
            OrderItem.product_key,
            func.sum(OrderItem.quantity).label('total')
        ).filter(
            OrderItem.product_key.in_(product_ids)
        ).group_by(OrderItem.product_key).all()
        sold_counts = {r.product_key: int(r.total) for r in rows}
    
    return {
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "size": limit,
        "data": [{
            "id": p.id,
            "product_id": p.product_id,
            "sku": p.product_id,
            "category": p.category,
            "sub_category": p.sub_category,
            "name": p.name,
            "stock": p.stock,
            "store_room_stock": p.store_room_stock or 0,
            "total_sold": sold_counts.get(p.id, 0)
        } for p in products]
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
    
    store_stock = product.store_room_stock or 0
    shop_stock = product.stock or 0
        
    if payload.movement_type == "move_to_shop":
        if store_stock < payload.quantity:
            raise HTTPException(status_code=400, detail="Not enough items in store room")
        product.store_room_stock = store_stock - payload.quantity
        product.stock = shop_stock + payload.quantity
    elif payload.movement_type == 'restock_store':
        product.store_room_stock = store_stock + payload.quantity
    elif payload.movement_type == 'restock_shop':
        product.stock = shop_stock + payload.quantity
    else:
        raise HTTPException(status_code=400, detail="Invalid movement type")
        
    db.commit()
    return {"message": "Stock updated successfully"}
