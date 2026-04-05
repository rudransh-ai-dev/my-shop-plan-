import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from sqlalchemy import text
import backend.models

CSV_PATH = "/home/rudransh/Projects /My shop plan /indian store data/store_sales_data.csv"

def run_migration():
    print("Dropping old schema...")
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
    print("Creating new schema...")
    Base.metadata.create_all(bind=engine)
    
    with engine.begin() as conn:
        print("Creating staging table...")
        conn.execute(text("""
            CREATE TEMP TABLE staging_sales (
                "Customer ID" text,
                "Customer Name" text,
                "Last Name" text,
                "Date of Birth" date,
                "Sales" numeric,
                "Year" int,
                "Outlet Type" text,
                "City Type" text,
                "Category of Goods" text,
                "Region" text,
                "Country" text,
                "Segment" text,
                "Sales Date" date,
                "Order ID" text,
                "Order Date" date,
                "Ship Date" date,
                "Ship Mode" text,
                "State" text,
                "Postal Code" text,
                "Product ID" text,
                "Sub-Category" text,
                "Product Name" text,
                "Quantity" int,
                "Discount" numeric,
                "Profit" numeric
            );
        """))
        
        print(f"COPYing data from {CSV_PATH} into staging...")
        dbapi_conn = conn.connection
        # Depending on psycopg version or driver, raw copy might vary. 
        # Using psycopg2 connection directly:
        with dbapi_conn.cursor() as cur:
            with open(CSV_PATH, 'r', encoding='utf-8-sig') as f: # utf-8-sig handles BOM if present
                cur.copy_expert("COPY staging_sales FROM STDIN WITH CSV HEADER", f)
        
        print("Cleaning up strings...")
        # Optional: clean up trailing spaces in text fields if any
        
        print("Creating default company (Company ID = 1)")
        conn.execute(text("""
            INSERT INTO companies (id, name, created_at, updated_at)
            VALUES (1, 'Indian Store Hub', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO NOTHING;
        """))
        
        print("Creating default user...")
        conn.execute(text("""
            INSERT INTO users (company_id, email, hashed_password, role, is_active, is_deleted, created_at, updated_at)
            VALUES (1, 'admin@businesshub.com', '$2b$12$.Y81XGgL567jQn2A1zS.LOr58E9j6X2fNnC4tYxJqBx7/70GvWv2a', 'admin', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (email) DO NOTHING;
        """))
        
        print("Inserting DISTINCT Customers...")
        conn.execute(text("""
            INSERT INTO customers (company_id, customer_id, first_name, last_name, dob, segment, region, country, state, city_type, postal_code, is_active, is_deleted, created_at, updated_at)
            SELECT DISTINCT ON ("Customer ID")
                1, "Customer ID", "Customer Name", "Last Name", "Date of Birth", "Segment", "Region", "Country", "State", "City Type", "Postal Code", true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM staging_sales
            WHERE "Customer ID" IS NOT NULL
            ON CONFLICT (customer_id) DO NOTHING;
        """))
        
        print("Inserting DISTINCT Products...")
        conn.execute(text("""
            INSERT INTO products (company_id, product_id, category, sub_category, name, is_active, is_deleted, created_at, updated_at)
            SELECT DISTINCT ON ("Product ID")
                1, "Product ID", "Category of Goods", "Sub-Category", "Product Name", true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM staging_sales
            WHERE "Product ID" IS NOT NULL
            ON CONFLICT (product_id) DO NOTHING;
        """))
        
        print("Inserting DISTINCT Orders...")
        conn.execute(text("""
            INSERT INTO orders (company_id, order_id, customer_key, order_date, ship_date, ship_mode, outlet_type, year, is_active, is_deleted, created_at, updated_at)
            SELECT DISTINCT ON (s."Order ID")
                1, s."Order ID", c.id, s."Order Date", s."Ship Date", s."Ship Mode", s."Outlet Type", s."Year", true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM staging_sales s
            JOIN customers c ON c.customer_id = s."Customer ID"
            WHERE s."Order ID" IS NOT NULL
            ON CONFLICT (order_id) DO NOTHING;
        """))
        
        print("Inserting Order Items...")
        conn.execute(text("""
            INSERT INTO order_items (order_key, product_key, quantity, sales, discount, profit, is_active, is_deleted, created_at, updated_at)
            SELECT
                o.id, p.id, s."Quantity", s."Sales", s."Discount", s."Profit", true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM staging_sales s
            JOIN orders o ON o.order_id = s."Order ID"
            JOIN products p ON p.product_id = s."Product ID";
        """))
        
        # User requested exact indices
        print("Applying Custom Indices...")
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_customer_region ON customers(region);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_orderitem_order ON order_items(order_key);"))

        print("Migration and Indexing complete!")

if __name__ == "__main__":
    run_migration()
