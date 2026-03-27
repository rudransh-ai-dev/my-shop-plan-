import sys
import os

# Ensure backend module can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 100;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN store_room_stock INTEGER DEFAULT 500;"))
    print("Successfully patched 'products' table with stock tracking columns.")
except Exception as e:
    print(f"Error: {e}")
