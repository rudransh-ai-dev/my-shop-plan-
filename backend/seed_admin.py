import psycopg2

conn = psycopg2.connect('postgresql://postgres:password@localhost:5433/businesshub')
cur = conn.cursor()

try:
    cur.execute("INSERT INTO companies (name, gstin, address, is_active, created_at, updated_at) VALUES ('Main Shop', '27AADCB2230M1Z2', '123 Market St', true, now(), now()) RETURNING id")
    comp_id = cur.fetchone()[0]
    # Password is 'admin123' bcrypt hashed
    cur.execute("INSERT INTO users (company_id, email, hashed_password, role, is_active, created_at, updated_at) VALUES (%s, 'admin@shop.com', '$2b$12$k8BwDZZwQ3R5fBqWlqjKReXzR8F2H5hCqVq9v/sR2R5Y4y/aQ0L', 'admin', true, now(), now())", (comp_id,))
    conn.commit()
    print("Successfully created admin user!")
except Exception as e:
    print(f"Error: {e}")
finally:
    cur.close()
    conn.close()
