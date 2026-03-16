"""
Add store_room_stock and total_sold columns to products table.
Run this script once to migrate the existing database.
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from backend.database import engine

def migrate():
    # Add store_room_stock
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN store_room_stock INTEGER DEFAULT 0"))
            conn.commit()
            print("Added column 'store_room_stock' to products.")
    except Exception as e:
        if "already exists" in str(e) or "duplicate column" in str(e).lower():
            print("Column 'store_room_stock' already exists, skipping.")
        else:
            print(f"Note for store_room_stock: {e}")

    # Add total_sold
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN total_sold INTEGER DEFAULT 0"))
            conn.commit()
            print("Added column 'total_sold' to products.")
    except Exception as e:
        if "already exists" in str(e) or "duplicate column" in str(e).lower():
            print("Column 'total_sold' already exists, skipping.")
        else:
            print(f"Note for total_sold: {e}")

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
