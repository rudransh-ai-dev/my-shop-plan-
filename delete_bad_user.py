import psycopg2
def delete_user():
    conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE email='admin@shop.com'")
    cur.execute("DELETE FROM companies WHERE name='Main Shop'")
    conn.commit()
    print("Deleted cleanly")
    cur.close()
    conn.close()

if __name__== "__main__":
    delete_user()
