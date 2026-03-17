from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Numeric
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import enum

class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    is_active = Column(Boolean, default=True)
    # Soft delete for audit safety (never hard delete business data)
    is_deleted = Column(Boolean, default=False, server_default="false", index=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Company(BaseModel):
    __tablename__ = "companies"
    name = Column(String, index=True)
    gstin = Column(String, unique=True, index=True, nullable=True)
    address = Column(Text, nullable=True)

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    ACCOUNTANT = "accountant"
    EMPLOYEE = "employee"

class User(BaseModel):
    __tablename__ = "users"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.EMPLOYEE.value)

class Product(BaseModel):
    __tablename__ = "products"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    sku = Column(String, index=True)
    name = Column(String, index=True)
    purchase_price = Column(Numeric(12, 2), default=0)
    selling_price = Column(Numeric(12, 2), default=0)
    stock = Column(Integer, default=0)  # Shop shelf stock
    store_room_stock = Column(Integer, default=0, server_default="0")  # Store room stock
    total_sold = Column(Integer, default=0, server_default="0")  # Total units sold
    gst_rate = Column(Numeric(5, 2), default=0)
    hsn_code = Column(String, nullable=True)
    supplier = Column(String, nullable=True)

class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class Invoice(BaseModel):
    __tablename__ = "invoices"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    invoice_number = Column(String, index=True) # e.g., INV-2026-27-0001
    customer_name = Column(String)
    customer_gstin = Column(String, nullable=True)
    invoice_date = Column(DateTime, default=datetime.utcnow, index=True)
    total_amount = Column(Numeric(12, 2), default=0)
    status = Column(String, default=InvoiceStatus.DRAFT.value)
    
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(BaseModel):
    __tablename__ = "invoice_items"
    invoice_id = Column(Integer, ForeignKey("invoices.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(12, 2))
    cgst = Column(Numeric(12, 2), default=0)
    sgst = Column(Numeric(12, 2), default=0)
    igst = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2))
    
    invoice = relationship("Invoice", back_populates="items")

class StockMovementType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    ADJUSTMENT = "adjustment"
    MOVE_TO_SHOP = "move_to_shop"
    MOVE_TO_STORE = "move_to_store"
    RESTOCK_STORE = "restock_store"
    RESTOCK_SHOP = "restock_shop"

class StockMovement(BaseModel):
    __tablename__ = "stock_movements"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer)
    movement_type = Column(String)
    remarks = Column(Text, nullable=True)

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    action = Column(String, index=True)  # e.g., "LOGIN", "CREATE_INVOICE"
    details = Column(Text)

class IdempotencyKey(BaseModel):
    __tablename__ = "idempotency_keys"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    key = Column(String, index=True)
    # e.g. "POST:/api/v1/invoices/"
    endpoint = Column(String, index=True)
    request_hash = Column(String, nullable=True)
    response_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
