import psycopg2

def check_products():
    try:
        conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
        cur = conn.cursor()
        cur.execute('SELECT sku, name, stock, selling_price, hsn_code FROM products')
        rows = cur.fetchall()
        if not rows:
            print("No products found in database.")
        else:
            print("Products in database:")
            for row in rows:
                print(f"SKU: {row[0]} | Name: {row[1]} | Stock: {row[2]} | Price: {row[3]} | HSN: {row[4]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_products()
