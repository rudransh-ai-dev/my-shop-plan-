from pydantic import BaseModel, EmailStr, Field
from pydantic.config import ConfigDict
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from backend.models import UserRole

def _decimal_to_float(v: Decimal) -> float:
    try:
        return float(v)
    except Exception:
        return 0.0

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class CompanyCreate(BaseModel):
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    role: UserRole
    company_id: int

class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_id: str
    first_name: str
    last_name: str
    segment: str
    region: str
    state: str

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: str
    category: str
    sub_category: str
    name: str

class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: _decimal_to_float})
    product: ProductResponse
    quantity: int
    sales: Decimal
    discount: Decimal
    profit: Decimal

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: str
    order_date: date
    customer: CustomerResponse
    items: List[OrderItemResponse]

class OrderListItem(BaseModel):
    id: int
    order_id: str
    customer_name: str
    customer_region: str
    order_date: str
    ship_mode: str
    total_sales: float
    total_profit: float
    item_count: int

class PaginatedOrders(BaseModel):
    total: int
    page: int
    size: int
    data: List[OrderListItem]
