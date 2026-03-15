from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from security import get_password_hash

def fix():
    db = SessionLocal()
    user = db.query(User).filter(User.email == 'admin@shop.com').first()
    if user:
        user.hashed_password = get_password_hash('admin123')
        db.commit()
        print(f"User {user.email} password updated!")
    else:
        print("User not found!")
    db.close()

if __name__ == "__main__":
    fix()
