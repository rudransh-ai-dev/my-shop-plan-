from pydantic import BaseModel, EmailStr, Field
from pydantic.config import ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from backend.models import UserRole, InvoiceStatus, StockMovementType


def _decimal_to_float(v: Decimal) -> float:
    # Keep API backward compatible for current frontend (expects numbers, uses toFixed()).
    # Server-side calculations must still use Decimal.
    try:
        return float(v)
    except Exception:
        return 0.0

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
    model_config = ConfigDict(json_encoders={Decimal: _decimal_to_float})
    sku: str
    name: str
    purchase_price: Decimal = Decimal("0.00")
    selling_price: Decimal = Decimal("0.00")
    stock: int = 0
    store_room_stock: int = 0
    gst_rate: Decimal = Decimal("0.00")
    hsn_code: Optional[str] = None
    supplier: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    gst_rate: Optional[Decimal] = None
    hsn_code: Optional[str] = None
    supplier: Optional[str] = None

class StockUpdate(BaseModel):
    quantity: int
    movement_type: StockMovementType
    remarks: Optional[str] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: _decimal_to_float})
    id: int
    company_id: int
    is_active: bool
    is_deleted: bool = False
    total_sold: int = 0
    created_at: datetime

class InvoiceItemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: _decimal_to_float})
    product_id: int
    quantity: int
    unit_price: Decimal
    cgst: Decimal = Decimal("0.00")
    sgst: Decimal = Decimal("0.00")
    igst: Decimal = Decimal("0.00")
    total: Decimal

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_gstin: Optional[str] = None
    items: List[InvoiceItemBase]

class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: _decimal_to_float})
    id: int
    invoice_number: str
    customer_name: str
    customer_gstin: Optional[str]
    invoice_date: datetime
    total_amount: Decimal
    status: InvoiceStatus
    items: List[InvoiceItemBase]
