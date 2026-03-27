from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric, BigInteger, Date, Index
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import enum

class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    is_active = Column(Boolean, default=True)
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

class Customer(BaseModel):
    __tablename__ = "customers"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    customer_id = Column(String, unique=True, index=True) # E.g., CUST000001
    first_name = Column(String)
    last_name = Column(String)
    dob = Column(Date, nullable=True)
    segment = Column(String, index=True) # Consumer, Corporate
    region = Column(String, index=True) # East, West, South
    country = Column(String)
    state = Column(String)
    city_type = Column(String) # Tier 1, Village
    postal_code = Column(String)

class Product(BaseModel):
    __tablename__ = "products"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    product_id = Column(String, unique=True, index=True) # E.g., PROD000001
    category = Column(String, index=True)
    sub_category = Column(String)
    name = Column(String)
    stock = Column(Integer, default=100)
    store_room_stock = Column(Integer, default=500)

class Order(BaseModel):
    __tablename__ = "orders"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    order_id = Column(String, unique=True, index=True) # E.g., ORD000001
    customer_key = Column(Integer, ForeignKey("customers.id"))
    order_date = Column(Date, index=True)
    ship_date = Column(Date, nullable=True)
    ship_mode = Column(String)
    outlet_type = Column(String)
    year = Column(Integer, index=True)
    
    # Relationships
    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(BaseModel):
    __tablename__ = "order_items"
    order_key = Column(Integer, ForeignKey("orders.id"), index=True)
    product_key = Column(Integer, ForeignKey("products.id"), index=True)
    
    quantity = Column(Integer, default=1)
    sales = Column(Numeric(12, 2))
    discount = Column(Numeric(5, 2))
    profit = Column(Numeric(12, 2))
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    action = Column(String, index=True)
    details = Column(Text)

class IdempotencyKey(BaseModel):
    __tablename__ = "idempotency_keys"
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    key = Column(String, index=True)
    endpoint = Column(String, index=True)
    request_hash = Column(String, nullable=True)
    response_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
