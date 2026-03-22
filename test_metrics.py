import time
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from backend.models import Invoice, InvoiceItem, Product, Company

engine = create_engine('postgresql://postgres:password@localhost:5433/businesshub')
Session = sessionmaker(bind=engine)
db = Session()
company_id = 1

print("Testing dashboard queries...")
t0 = time.time()
db.query(Invoice).filter(Invoice.company_id == company_id).limit(1).all()
print(f"Connection setup: {time.time() - t0:.2f}s")

now = datetime.utcnow()
today_start = datetime(now.year, now.month, now.day)
filter_start = datetime(now.year, now.month, 1)
filter_end = now

t0 = time.time()
db.query(func.sum(Invoice.total_amount)).filter(
    Invoice.company_id == company_id,
    Invoice.invoice_date >= today_start
).scalar()
print(f"Daily sales: {time.time() - t0:.2f}s")

t0 = time.time()
db.query(func.sum(Invoice.total_amount)).filter(
    Invoice.company_id == company_id,
    Invoice.invoice_date >= filter_start,
    Invoice.invoice_date <= filter_end
).scalar()
print(f"Filtered revenue: {time.time() - t0:.2f}s")

t0 = time.time()
db.query(
    Product.name,
    func.sum(InvoiceItem.quantity).label('total_sold')
).join(InvoiceItem).join(Invoice).filter(
    Invoice.company_id == company_id,
    Invoice.invoice_date >= filter_start,
    Invoice.invoice_date <= filter_end
).group_by(Product.name).order_by(func.sum(InvoiceItem.quantity).desc()).limit(5).all()
print(f"Top products: {time.time() - t0:.2f}s")

t0 = time.time()
db.query(Product).filter(
    Product.company_id == company_id,
    Product.stock <= 10
).order_by(Product.stock.asc()).limit(20).all()
print(f"Low stock products: {time.time() - t0:.2f}s")

t0 = time.time()
for i in range(6, -1, -1):
    day_start = datetime(now.year, now.month, now.day) - timedelta(days=i)
    day_end = day_start + timedelta(days=1)
    db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_date >= day_start,
        Invoice.invoice_date < day_end
    ).scalar()
print(f"Sales by day (7 loops): {time.time() - t0:.2f}s")
