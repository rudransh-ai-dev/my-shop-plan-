from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
from backend.models import UserRole, InvoiceStatus, StockMovementType

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.EMPLOYEE

class CompanyCreate(BaseModel):
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None

class ProductBase(BaseModel):
    sku: str
    name: str
    purchase_price: float = 0.0
    selling_price: float = 0.0
    stock: int = 0
    store_room_stock: int = 0
    gst_rate: float = 0.0
    hsn_code: Optional[str] = None
    supplier: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    gst_rate: Optional[float] = None
    hsn_code: Optional[str] = None
    supplier: Optional[str] = None

class StockUpdate(BaseModel):
    quantity: int
    movement_type: StockMovementType
    remarks: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    company_id: int
    is_active: bool
    total_sold: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    cgst: float = 0.0
    sgst: float = 0.0
    igst: float = 0.0
    total: float

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_gstin: Optional[str] = None
    items: List[InvoiceItemBase]

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    customer_gstin: Optional[str]
    invoice_date: datetime
    total_amount: float
    status: InvoiceStatus
    items: List[InvoiceItemBase]

    class Config:
        from_attributes = True
