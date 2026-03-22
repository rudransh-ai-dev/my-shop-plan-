import psycopg2
from psycopg2.extras import execute_values
from faker import Faker
import random
from datetime import datetime, timedelta
import time
import sys
import os

# Connect to database
# Using hardcoded URL from config for the script, but ideally from env
DATABASE_URL = "postgresql://postgres:password@localhost:5433/businesshub"

fake = Faker('en_IN')

# Target Volumes
NUM_PRODUCTS = 1_000_000
NUM_INVOICES = 5_000_000
BATCH_SIZE = 50_000

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def setup_base_data(cursor):
    """Ensure we have a company and user to associate the data with"""
    cursor.execute("SELECT id FROM companies LIMIT 1")
    company = cursor.fetchone()
    
    if not company:
        print("Creating default company...")
        cursor.execute(
            "INSERT INTO companies (name, gstin, created_at, updated_at) VALUES (%s, %s, NOW(), NOW()) RETURNING id",
            ("Mega Retail Enterprise", "27AADCB2230M1Z2",)
        )
        company_id = cursor.fetchone()[0]
    else:
        company_id = company[0]
        
    return company_id

def seed_products(cursor, company_id):
    print(f"Seeding {NUM_PRODUCTS} Products. This will take a few minutes...")
    
    # Check if we already have products
    cursor.execute("SELECT COUNT(*) FROM products WHERE company_id = %s", (company_id,))
    if cursor.fetchone()[0] >= NUM_PRODUCTS:
        print("Products already seeded. Skipping...")
        return
        
    categories = ['Electronics', 'Groceries', 'Apparel', 'Home Appliances', 'Furniture', 'Toys']
    gst_rates = [0, 5, 12, 18, 28]
    
    products_data = []
    start_time = time.time()
    
    for i in range(1, NUM_PRODUCTS + 1):
        sku = f"SKU-{fake.unique.random_number(digits=8)}"
        name = f"{fake.word().capitalize()} {random.choice(categories)} {fake.word()}"
        purchase_price = round(random.uniform(50, 5000), 2)
        selling_price = round(purchase_price * random.uniform(1.2, 2.5), 2)
        stock = random.randint(10, 500)
        gst = random.choice(gst_rates)
        hsn = f"{random.randint(1000, 9999)}"
        
        products_data.append((
            company_id, sku, name, purchase_price, selling_price,
            stock, 500, 0, gst, hsn, 'Default Supplier',
            datetime.utcnow(), datetime.utcnow(), False, True
        ))
        
        if len(products_data) >= BATCH_SIZE or i == NUM_PRODUCTS:
            execute_values(
                cursor,
                """
                INSERT INTO products (
                    company_id, sku, name, purchase_price, selling_price, 
                    stock, store_room_stock, total_sold, gst_rate, hsn_code, supplier,
                    created_at, updated_at, is_deleted, is_active
                ) VALUES %s ON CONFLICT DO NOTHING
                """,
                products_data
            )
            products_data.clear()
            sys.stdout.write(f"\rInserted {i}/{NUM_PRODUCTS} products...")
            sys.stdout.flush()
            
    print(f"\nProduct seeding completed in {time.time() - start_time:.2f} seconds")

def seed_invoices(cursor, company_id):
    print(f"\nSeeding {NUM_INVOICES} Invoices. This is the big one...")
    
    cursor.execute("SELECT COUNT(*) FROM invoices WHERE company_id = %s", (company_id,))
    if cursor.fetchone()[0] >= NUM_INVOICES:
        print("Invoices already seeded. Skipping...")
        return

    # Fetch product IDs to link items
    print("Loading product IDs for fast references...")
    cursor.execute("SELECT id, selling_price, gst_rate FROM products WHERE company_id = %s LIMIT 100000", (company_id,))
    products_pool = cursor.fetchall()
    
    if not products_pool:
        print("Error: No products found for linking invoices.")
        return

    invoices_data = []
    start_date = datetime.now() - timedelta(days=1095) # 3 years ago
    
    start_time = time.time()
    total_invoices_inserted = 0
    batch_num = 1
    
    while total_invoices_inserted < NUM_INVOICES:
        # Generate a batch of invoices
        batch_size = min(BATCH_SIZE, NUM_INVOICES - total_invoices_inserted)
        
        for _ in range(batch_size):
            inv_num = f"INV-{fake.unique.random_number(digits=10)}"
            cust_name = fake.name()
            # Random date over the last 3 years
            random_days = random.randint(0, 1095)
            inv_date = start_date + timedelta(days=random_days, minutes=random.randint(0, 1440))
            
            # We will calculate total_amount later or approximate it. Let's do a strict approximation for speed
            estimated_total = 0 # Will update via direct SQL later if needed, or just insert random for now
            
            invoices_data.append((
                company_id, inv_num, cust_name, 'None', inv_date, 
                round(random.uniform(500, 50000), 2), 'paid',
                datetime.utcnow(), datetime.utcnow(), False, True
            ))
            
        # Insert invoices
        execute_values(
            cursor,
            """
            INSERT INTO invoices (
                company_id, invoice_number, customer_name, customer_gstin, invoice_date, 
                total_amount, status, created_at, updated_at, is_deleted, is_active
            ) VALUES %s
            """,
            invoices_data
        )
        total_invoices_inserted += batch_size
        invoices_data.clear()
        
        sys.stdout.write(f"\rInserted {total_invoices_inserted}/{NUM_INVOICES} invoices...")
        sys.stdout.flush()

    print(f"\nInvoice seeding completed in {time.time() - start_time:.2f} seconds")


if __name__ == "__main__":
    print("Starting High-Performance Database Seeding...")
    try:
        conn = get_db_connection()
        conn.autocommit = True  # Faster inserts
        cursor = conn.cursor()
        
        company_id = setup_base_data(cursor)
        seed_products(cursor, company_id)
        seed_invoices(cursor, company_id)
        
        cursor.close()
        conn.close()
        print("\nSeeding entirely successful!")
    except Exception as e:
        print(f"\nError during seeding: {e}")
