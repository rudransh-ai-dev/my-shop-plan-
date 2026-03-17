import json
import subprocess
import threading
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8000/api/v1"


def http_json(method, url, body=None, headers=None):
    data = None
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            payload = json.loads(raw) if raw else None
        except Exception:
            payload = raw
        return e.code, payload


def oauth_login(username, password):
    data = urllib.parse.urlencode({"username": username, "password": password}).encode("utf-8")
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def register_and_login():
    st, tok = oauth_login("admin@shop.com", "admin123")
    if st == 200:
        return tok

    import random

    email = f"test{random.randint(10000,99999)}@shop.com"
    payload = {
        "company": {"name": "Test Shop", "gstin": None, "address": None},
        "user": {"email": email, "password": "test12345", "role": "employee"},
    }
    st, tok = http_json("POST", f"{BASE}/auth/register", payload)
    if st != 200:
        raise RuntimeError(("register_failed", st, tok))
    return tok


def auth_headers(tok):
    return {"Authorization": f"Bearer {tok['access_token']}"}


def get_products(tok):
    return http_json("GET", f"{BASE}/inventory/", headers=auth_headers(tok))


def create_product(tok, sku, name, stock, selling_price=10.0, purchase_price=5.0, gst_rate=0.0):
    payload = {
        "sku": sku,
        "name": name,
        "purchase_price": purchase_price,
        "selling_price": selling_price,
        "stock": stock,
        "store_room_stock": 0,
        "gst_rate": gst_rate,
        "hsn_code": None,
        "supplier": None,
    }
    return http_json("POST", f"{BASE}/inventory/", payload, headers=auth_headers(tok))


def delete_product(tok, pid):
    return http_json("DELETE", f"{BASE}/inventory/{pid}", headers=auth_headers(tok))


def create_invoice(tok, items, idem=None):
    payload = {"customer_name": "C1", "customer_gstin": None, "items": items}
    headers = auth_headers(tok)
    if idem:
        headers["Idempotency-Key"] = idem
    return http_json("POST", f"{BASE}/invoices/", payload, headers=headers)


def stock_action(tok, pid, movement_type, qty, idem=None):
    payload = {"quantity": qty, "movement_type": movement_type, "remarks": "test"}
    headers = auth_headers(tok)
    if idem:
        headers["Idempotency-Key"] = idem
    return http_json("POST", f"{BASE}/inventory/{pid}/stock", payload, headers=headers)


def psql_scalar(sql):
    cmd = [
        "docker",
        "exec",
        "-i",
        "shopsystem-db-1",
        "psql",
        "-U",
        "postgres",
        "-d",
        "businesshub",
        "-t",
        "-c",
        sql,
    ]
    out = subprocess.check_output(cmd).decode("utf-8").strip()
    return out


def get_audit_count():
    return int(psql_scalar("select count(*) from audit_logs where is_deleted=false;"))

def get_idempotency_count():
    return int(psql_scalar("select count(*) from idempotency_keys where is_deleted=false;"))


def product_row(pid):
    return psql_scalar(f"select id, is_deleted, is_active, stock from products where id={pid};")


def main():
    print("--- Milestone 0 Verification ---")
    tok = register_and_login()
    print("auth: ok")

    # Create product (stock=5)
    import random
    sku = f"TST-{random.randint(100000, 999999)}"
    st, prod = create_product(tok, sku, "TestItem", 5, selling_price=12.34, gst_rate=5.0)
    assert st == 200, (st, prod)
    pid = prod["id"]
    print("product created:", pid, "sku:", sku)

    # 1) Atomicity: fail invoice mid-way (2nd item invalid), stock must remain unchanged
    items_fail = [
        {"product_id": pid, "quantity": 1, "unit_price": 12.34, "total": 12.34},
        {"product_id": 99999999, "quantity": 1, "unit_price": 1.00, "total": 1.00},
    ]
    st_fail, body_fail = create_invoice(tok, items_fail, idem="atomicity-1")
    assert st_fail == 404, (st_fail, body_fail)
    st_list, prods = get_products(tok)
    assert st_list == 200
    stock_now = next(p["stock"] for p in prods if p["id"] == pid)
    assert stock_now == 5, ("atomicity_stock_changed", stock_now)
    print("atomicity: pass")

    # 2) Idempotency: same invoice twice -> same invoice id and stock decremented once
    items_ok = [{"product_id": pid, "quantity": 2, "unit_price": 12.34, "total": 24.68}]
    st1, inv1 = create_invoice(tok, items_ok, idem="idem-invoice-1")
    assert st1 == 200, (st1, inv1)
    print("idempotency rows after first invoice:", get_idempotency_count())
    st2, inv2 = create_invoice(tok, items_ok, idem="idem-invoice-1")
    assert st2 == 200, (st2, inv2)
    assert inv1["id"] == inv2["id"], ("idempotency_invoice_id_mismatch", inv1["id"], inv2["id"])
    st_list, prods = get_products(tok)
    stock_now = next(p["stock"] for p in prods if p["id"] == pid)
    assert stock_now == 3, ("idempotency_double_decrement", stock_now)
    print("idempotency: pass")

    # 3) Concurrency: 2 threads attempt sale qty=3 while stock=3 -> one success, one failure, no negative
    results = []

    def worker(name):
        st, body = stock_action(tok, pid, "sale", 3, idem=f"conc-{name}")
        results.append((name, st, body))

    t1 = threading.Thread(target=worker, args=("A",))
    t2 = threading.Thread(target=worker, args=("B",))
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    codes = sorted([r[1] for r in results])
    assert 200 in codes and any(c in (400, 409) for c in codes), ("unexpected_concurrency_codes", results)
    st_list, prods = get_products(tok)
    stock_now = next(p["stock"] for p in prods if p["id"] == pid)
    assert stock_now >= 0, ("negative_stock", stock_now, results)
    assert stock_now == 0, ("expected_stock_zero_after_one_sale", stock_now, results)
    print("concurrency: pass", results, "final_stock", stock_now)

    # 4) Audit logs present
    count = get_audit_count()
    assert count > 0
    print("audit logs: pass (count=", count, ")")

    # 5) Soft delete: delete product -> hidden from list, still in DB with is_deleted=true
    st_del, del_body = delete_product(tok, pid)
    assert st_del == 200, (st_del, del_body)
    st_list, prods = get_products(tok)
    assert all(p["id"] != pid for p in prods), "soft_delete_not_hidden"
    row = product_row(pid)
    assert row, "product_row_missing"
    print("soft delete: pass (db_row=", row, ")")

    print("ALL_TESTS_PASS")


if __name__ == "__main__":
    main()

