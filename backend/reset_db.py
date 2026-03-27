import os
import sys

# Add the parent directory (project root) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
import backend.models  # Ensure models are imported so Base knows about them

def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully.")
    
    print("Recreating database schema using Alembic...")
    os.system("alembic upgrade head")
    print("Database schema upgraded to head.")
    
    print("Seeding initial data...")
    os.system("python backend/seed_admin.py")
    print("Data seeded successfully.")

if __name__ == "__main__":
    reply = input("Are you sure you want to reset the database? This will ERASE everything. (yes/no): ")
    if reply.strip().lower() == "yes":
        reset_database()
    else:
        print("Database reset aborted.")
