from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from backend.database import get_db
from backend.models import Order, Customer, OrderItem, Product
from backend.schemas import PaginatedOrders, OrderResponse
from typing import Optional

router = APIRouter()

@router.get("/", response_model=PaginatedOrders)
def list_orders(
    skip: int = Query(0, description="Pagination offset"),
    limit: int = Query(50, description="Pagination limit"),
    customer_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    )
    
    if customer_name:
        query = query.join(Customer).filter(
            (Customer.first_name.ilike(f"%{customer_name}%")) | 
            (Customer.last_name.ilike(f"%{customer_name}%"))
        )
        
    total = query.count()
    orders = query.order_by(Order.order_date.desc()).offset(skip).limit(limit).all()
    
    orders_data = []
    for o in orders:
        cname = f"{o.customer.first_name} {o.customer.last_name}".strip() if o.customer else "Walk-in"
        total_sales = sum(float(i.sales) for i in o.items)
        total_profit = sum(float(i.profit) for i in o.items)
        orders_data.append({
            "id": o.id,
            "order_id": o.order_id,
            "customer_name": cname,
            "customer_region": o.customer.region if o.customer else "",
            "order_date": str(o.order_date),
            "ship_mode": o.ship_mode,
            "total_sales": total_sales,
            "total_profit": total_profit,
            "item_count": len(o.items),
        })

    return {
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "size": limit,
        "data": orders_data
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

from pydantic import BaseModel
from typing import List
from datetime import date
import uuid

class CartItem(BaseModel):
    id: int
    quantity: int
    price: float

class CreateOrderRequest(BaseModel):
    customer_id: str
    items: List[CartItem]

@router.post("/")
def create_order(
    payload: CreateOrderRequest, 
    db: Session = Depends(get_db)
):
    # Mocking company_id for the checkout demo instead of deep Auth deps
    company = db.query(Customer).first()
    company_id = company.company_id if company else 1
    
    # Simple customer creation or fetch
    customer = db.query(Customer).filter(Customer.customer_id == payload.customer_id).first()
    if not customer:
        customer = Customer(
            company_id=company_id,
            customer_id=payload.customer_id,
            first_name="Walk-in",
            last_name="Customer",
            segment="Consumer",
            region="Local"
        )
        db.add(customer)
        db.flush()

    new_order = Order(
        company_id=company_id,
        order_id=f"POS-{uuid.uuid4().hex[:8].upper()}",
        customer_key=customer.id,
        order_date=date.today(),
        ship_mode="Store Pickup",
        outlet_type="Retail",
        year=date.today().year
    )
    db.add(new_order)
    db.flush()

    for item in payload.items:
        # Fetch the product from db to decrement stock
        product = db.query(Product).filter(Product.id == item.id).first()
        if product and product.stock >= item.quantity:
            product.stock -= item.quantity
        
        order_item = OrderItem(
            order_key=new_order.id,
            product_key=item.id,
            quantity=item.quantity,
            sales=item.price * item.quantity,
            discount=0,
            profit=(item.price * item.quantity) * 0.15 # 15% estimated profit
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return {"message": "Invoice generated successfully", "order_id": new_order.order_id}
