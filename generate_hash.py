from passlib.context import CryptContext
import psycopg2

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def fix():
    good_hash = pwd_context.hash("admin123")
    print(f"Hash: {good_hash}")
    try:
        conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
        cur = conn.cursor()
        cur.execute("UPDATE users SET hashed_password = %s WHERE email = 'admin@shop.com'", (good_hash,))
        conn.commit()
        print("Updated password hash successfully in DB.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    fix()
