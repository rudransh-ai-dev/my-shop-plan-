from passlib.context import CryptContext
import psycopg2

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def fix():
    try:
        conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
        cur = conn.cursor()
        good_hash = get_password_hash("admin123")
        cur.execute("UPDATE users SET hashed_password = %s WHERE email = 'admin@shop.com'", (good_hash,))
        conn.commit()
        print("Updated password hash successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix()
