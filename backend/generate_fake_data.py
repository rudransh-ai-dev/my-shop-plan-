import os
import sys
from datetime import datetime, timedelta
import random
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, SessionLocal
from backend.models import Customer, Product, Order, OrderItem, Company
from sqlalchemy import text
import random

random.seed(42)

COMPANY_ID = 1
ITEMS_PER_ORDER = (1, 5)
MIN_DATE = datetime(2024, 1, 1).date()
MAX_DATE = datetime(2026, 4, 16).date()

REGIONS = ["East", "West", "North", "South"]
SEGMENTS = ["Consumer", "Corporate"]
STATES = ["West Bengal", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Punjab", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh"]
CITY_TYPES = ["Tier 1", "Tier 2", "Village"]
SHIP_MODES = ["Standard Class", "First Class", "Second Class", "Same Day"]
OUTLET_TYPES = ["Small", "Medium", "Large"]

CATEGORIES = ["Fast Food", "Dairy Products", "Furniture", "Electric Appliances", "Household Items", "Sessional Fruits & Vegetables"]
SUBCATEGORIES = {
    "Fast Food": ["Burgers", "Pizzas", "Fries"],
    "Dairy Products": ["Milk", "Yogurt", "Cheese"],
    "Furniture": ["Beds", "Chairs", "Tables"],
    "Electric Appliances": ["Fans", "Washing Machines", "Refrigerators"],
    "Household Items": ["Mops", "Buckets", "Brooms"],
    "Sessional Fruits & Vegetables": ["Mangoes", "Tomatoes", "Apples"]
}

FIRST_NAMES = ["Raj", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Ravi", "Kavita", "Suresh", "Meera",
               "Arun", "Deepa", "Mohan", "Lakshmi", "Sanjay", "Geeta", "Harish", "Sunita", "Nikhil", "Pooja"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Reddy", "Kumar", "Gupta", "Mehta", "Joshi", "Rao", "Nair",
              "Verma", "Agarwal", "Chopra", "Malhotra", "Iyer", "Menon", "Das", "Mukherjee", "Banerjee", "Chatterjee"]

def random_date():
    delta = MAX_DATE - MIN_DATE
    return MIN_DATE + timedelta(days=random.randint(0, delta.days))

def generate_fake_data():
    db = SessionLocal()
    
    try:
        company = db.query(Company).filter(Company.id == COMPANY_ID).first()
        if not company:
            print("Company not found. Run migrate_csv.py first.")
            return
        
        existing_customers = {c.customer_id: c for c in db.query(Customer).filter(Customer.company_id == COMPANY_ID).all()}
        existing_products = {p.product_id: p for p in db.query(Product).filter(Product.company_id == COMPANY_ID).all()}
        
        print(f"Found {len(existing_customers)} existing customers, {len(existing_products)} existing products")
        
        print("Generating new customers...")
        new_customers = []
        for i in range(100):
            cust_id = f"CUST{100001 + i:06d}"
            if cust_id not in existing_customers:
                dob_year = random.randint(1970, 2005)
                customer = Customer(
                    company_id=COMPANY_ID,
                    customer_id=cust_id,
                    first_name=random.choice(FIRST_NAMES),
                    last_name=random.choice(LAST_NAMES),
                    dob=datetime(random.randint(1970, 2005), random.randint(1, 12), random.randint(1, 28)).date(),
                    segment=random.choice(SEGMENTS),
                    region=random.choice(REGIONS),
                    country="India",
                    state=random.choice(STATES),
                    city_type=random.choice(CITY_TYPES),
                    postal_code=f"{random.randint(100000, 900000)}",
                    is_active=True,
                    is_deleted=False
                )
                new_customers.append(customer)
        
        db.add_all(new_customers)
        db.commit()
        print(f"Added {len(new_customers)} new customers")
        
        all_customers = db.query(Customer).filter(Customer.company_id == COMPANY_ID, Customer.is_active == True).all()
        all_products = db.query(Product).filter(Product.company_id == COMPANY_ID, Product.is_active == True).all()
        
        print("Generating new products...")
        new_products = []
        product_counter = len(existing_products) + 1
        for category in CATEGORIES:
            for sub_cat in SUBCATEGORIES[category]:
                prod_id = f"PROD{product_counter:07d}"
                if prod_id not in existing_products:
                    product = Product(
                        company_id=COMPANY_ID,
                        product_id=prod_id,
                        category=category,
                        sub_category=sub_cat,
                        name=f"{sub_cat} - {random.randint(100, 999)}",
                        stock=random.randint(10, 200),
                        store_room_stock=random.randint(100, 1000),
                        is_active=True,
                        is_deleted=False
                    )
                    new_products.append(product)
                    product_counter += 1
        
        db.add_all(new_products)
        db.commit()
        print(f"Added {len(new_products)} new products")
        
        all_products = db.query(Product).filter(Product.company_id == COMPANY_ID, Product.is_active == True).all()
        
        print("Updating store room inventory...")
        for product in all_products:
            product.store_room_stock = random.randint(50, 1500)
            product.stock = random.randint(5, 300)
        db.commit()
        print("Store room inventory updated")
        
        print("Generating orders for 2024-2026...")
        existing_order_ids = set()
        for order in db.query(Order).filter(Order.company_id == COMPANY_ID).all():
            existing_order_ids.add(order.order_id)
        
        new_orders = []
        new_order_items = []
        order_counter = db.query(Order).filter(Order.company_id == COMPANY_ID).count() + 1
        
        target_orders = 500
        for i in range(target_orders):
            order_id = f"ORD{100000 + order_counter:06d}"
            if order_id in existing_order_ids:
                order_counter += 1
                continue
            
            customer = random.choice(all_customers)
            order_date = random_date()
            ship_date = order_date + timedelta(days=random.randint(1, 5))
            
            order = Order(
                company_id=COMPANY_ID,
                order_id=order_id,
                customer_key=customer.id,
                order_date=order_date,
                ship_date=ship_date,
                ship_mode=random.choice(SHIP_MODES),
                outlet_type=random.choice(OUTLET_TYPES),
                year=order_date.year,
                is_active=True,
                is_deleted=False
            )
            new_orders.append(order)
            
            for _ in range(random.randint(*ITEMS_PER_ORDER)):
                product = random.choice(all_products)
                quantity = random.randint(1, 10)
                sales = round(random.uniform(100, 5000), 2)
                discount = round(random.uniform(0, 0.5), 2)
                profit = round(sales * random.uniform(0.1, 0.4), 2)
                
                order_item = OrderItem(
                    order_key=None,
                    product_key=product.id,
                    quantity=quantity,
                    sales=sales,
                    discount=discount,
                    profit=profit,
                    is_active=True,
                    is_deleted=False
                )
                new_order_items.append((order, order_item))
            
            order_counter += 1
        
        db.add_all(new_orders)
        db.flush()
        
        for order, item in new_order_items:
            item.order_key = order.id
        
        db.add_all([item for _, item in new_order_items])
        db.commit()
        print(f"Added {len(new_orders)} new orders with {len(new_order_items)} order items")
        
        print("\n=== Summary ===")
        print(f"Total Customers: {db.query(Customer).filter(Customer.company_id == COMPANY_ID).count()}")
        print(f"Total Products: {db.query(Product).filter(Product.company_id == COMPANY_ID).count()}")
        print(f"Total Orders: {db.query(Order).filter(Order.company_id == COMPANY_ID).count()}")
        print(f"Total Order Items: {db.query(OrderItem).filter(OrderItem.order_key == Order.id, Order.company_id == COMPANY_ID).count()}")
        
        print("\nStore Room Stock by Category:")
        result = db.execute(text("""
            SELECT category, SUM(store_room_stock) as total_stock 
            FROM products 
            WHERE company_id = 1 AND is_active = true 
            GROUP BY category
        """))
        for row in result:
            print(f"  {row[0]}: {row[1]}")
        
        print("\nRecent Orders (last 5):")
        recent = db.query(Order).filter(Order.company_id == COMPANY_ID).order_by(Order.order_date.desc()).limit(5).all()
        for o in recent:
            print(f"  {o.order_id} - {o.order_date} - {o.year}")
        
    finally:
        db.close()

if __name__ == "__main__":
    generate_fake_data()
