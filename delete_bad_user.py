import psycopg2

def delete_user():
    conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
    cur = conn.cursor()
    
    try:
        # Note: If the user/company has existing records in other tables (audit_logs, products, etc.), 
        # this will throw a ForeignKeyViolation error unless ON DELETE CASCADE is configured.
        cur.execute("DELETE FROM users WHERE email='admin@shop.com'")
        cur.execute("DELETE FROM companies WHERE name='Main Shop'")
        
        conn.commit()
        print("Deleted cleanly")
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # Ensures that the cursor and connection are always closed
        cur.close()
        conn.close()

if __name__== "__main__":
    delete_user()
