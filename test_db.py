import time
from sqlalchemy import create_engine
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
