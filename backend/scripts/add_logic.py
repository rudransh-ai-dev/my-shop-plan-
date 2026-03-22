import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.models import Invoice, InvoiceItem, Product, Company

from datetime import datetime
import random

engine = create_engine('postgresql://postgres:password@localhost:5433/businesshub')
Session = sessionmaker(bind=engine)
db = Session()
company_id = 1

print("Updating massive invoice amounts to realistic levels...")
db.execute(text("UPDATE invoices SET total_amount = total_amount / 2000;"))
db.commit()

now = datetime.utcnow()
month_start = datetime(now.year, now.month, 1)

print("Fetching recent invoices for realistic GST/Item generation...")
recent_invoices = db.query(Invoice).filter(
    Invoice.company_id == company_id,
    Invoice.invoice_date >= month_start
).limit(10000).all()

# Get 50 products to act as consistent "top sellers"
top_products = db.query(Product).filter(Product.company_id == company_id).limit(50).all()

print(f"Generating items for {len(recent_invoices)} recent invoices...")
items_to_insert = []
for inv in recent_invoices:
    num_items = random.randint(1, 4)
    selected_products = random.sample(top_products, num_items)
    
    inv_total = 0
    for p in selected_products:
        qty = random.randint(1, 5)
        price = float(p.selling_price)
        total = qty * price
        
        # Realistic GST logic (18% split into CGST/SGST)
        cgst = total * 0.09
        sgst = total * 0.09
        igst = 0
        
        line_total = total + cgst + sgst
        inv_total += line_total
        
        items_to_insert.append(
            InvoiceItem(
                invoice_id=inv.id,
                product_id=p.id,
                quantity=qty,
                unit_price=price,
                cgst=cgst,
                sgst=sgst,
                igst=igst,
                total=line_total
            )
        )
    # Patch the invoice to have a true total matching its items
    inv.total_amount = inv_total

# Bulk insert items
if items_to_insert:
    db.bulk_save_objects(items_to_insert)
    db.commit()
    print(f"Inserted {len(items_to_insert)} realistic invoice items with proper GST logic!")
print("Done!")
