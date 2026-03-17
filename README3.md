Good. This is legit solid. No shortcuts taken 👍

## 🚀 START: Milestone 1 — Units v1

### 1️⃣ DB Changes

* add to `products`:

  * `base_unit` (kg, piece)
  * `base_unit_multiplier`
* add to `invoice_items`:

  * `quantity_base`
  * `display_unit`
  * `display_quantity`

---

### 2️⃣ Core Logic (IMPORTANT ⚠️)

* store ONLY in base unit
* convert on input/output

👉 stock always in base unit

---

### 3️⃣ Service Update

* update `invoice_service.py`
* convert:

```python
quantity_base = display_qty * multiplier
```

---

### 4️⃣ Stock Deduction

* use `quantity_base`
  👉 no direct display unit math

---

### 5️⃣ Frontend

* add unit selector
* allow fractional input

---

## ⚠️ Rule

Never mix units internally. Only convert at edges.

---

Say if you want conversion design (this part can break system if wrong).
Alright. Here’s **proper implementation (no guessing)** 👇

---

## 🧱 1️⃣ DB Model (SQLAlchemy)

### `products`

```python
base_unit = Column(String, nullable=False, default="piece")  
base_unit_multiplier = Column(Numeric(10, 4), nullable=False, default=1)
```

### `invoice_items`

```python
quantity_base = Column(Numeric(12, 4), nullable=False)

display_unit = Column(String, nullable=True)
display_quantity = Column(Numeric(12, 4), nullable=True)
```

---

## ⚙️ 2️⃣ Unit Conversion (CORE)

👉 keep this in `inventory_service.py`

```python
from decimal import Decimal

UNIT_MAP = {
    "kg": Decimal("1"),
    "g": Decimal("0.001"),
    "mg": Decimal("0.000001"),
    "piece": Decimal("1")
}

def to_base(quantity, unit):
    return Decimal(quantity) * UNIT_MAP[unit]
```

---

## 🔥 3️⃣ Invoice Service Update

```python
qty_base = to_base(item.display_quantity, item.display_unit)

if product.stock < qty_base:
    raise Exception("Insufficient stock")

product.stock -= qty_base
```

---

## 💰 4️⃣ Price Logic

```python
price = product.price_per_base_unit * qty_base
```

---

## 🧪 5️⃣ Example

* 250g @ ₹100/kg

```python
qty_base = 0.25  
price = 100 * 0.25 = 25
```

---

## ⚠️ RULES

* stock ALWAYS in base unit
* never mix display + base
* Decimal only

---

## 🎯 Next

If he implements this, ask me for:
👉 multi-unit UI + precision handling (this is where most people mess up)
