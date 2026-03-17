from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models import Company, Invoice, InvoiceItem, Product, StockMovement, StockMovementType
from backend.schemas import InvoiceCreate
from backend.services.audit_service import audit_log


TWOPLACES = Decimal("0.01")


def q2(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def generate_invoice_number(db: Session, company_id: int) -> str:
    # Reuse existing logic (kept here so router stays thin)
    from datetime import datetime

    current_year = datetime.now().year
    current_month = datetime.now().month

    if current_month >= 4:
        fy_start = current_year
        fy_end = current_year + 1
    else:
        fy_start = current_year - 1
        fy_end = current_year

    fy_str = f"{fy_start}-{str(fy_end)[-2:]}"

    last_invoice = (
        db.query(Invoice)
        .filter(
            Invoice.company_id == company_id,
            Invoice.invoice_number.like(f"INV-{fy_str}-%"),
            Invoice.is_deleted == False,  # noqa: E712
        )
        .order_by(Invoice.id.desc())
        .first()
    )

    if last_invoice:
        last_seq = int(last_invoice.invoice_number.split("-")[-1])
        new_seq = last_seq + 1
    else:
        new_seq = 1

    return f"INV-{fy_str}-{new_seq:04d}"


def create_invoice_atomic(
    *,
    db: Session,
    company_id: int,
    user_id: Optional[int],
    invoice: InvoiceCreate,
) -> Invoice:
    """
    Creates invoice + invoice items + decrements stock + writes stock movements + audit logs.
    Must be called inside a transaction.
    """
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()  # noqa: E712

    is_inter_state = False
    if company and company.gstin and invoice.customer_gstin:
        if company.gstin[:2] != invoice.customer_gstin[:2]:
            is_inter_state = True

    invoice_number = generate_invoice_number(db, company_id)

    db_invoice = Invoice(
        company_id=company_id,
        invoice_number=invoice_number,
        customer_name=invoice.customer_name,
        customer_gstin=invoice.customer_gstin,
        total_amount=Decimal("0.00"),
    )
    db.add(db_invoice)
    db.flush()

    total_amount = Decimal("0.00")

    for item in invoice.items:
        product = (
            db.query(Product)
            .filter(
                Product.id == item.product_id,
                Product.company_id == company_id,
                Product.is_active == True,  # noqa: E712
                Product.is_deleted == False,  # noqa: E712
            )
            .with_for_update()
            .first()
        )
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        qty = int(item.quantity)
        if qty <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")

        if product.stock < qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")

        before_stock = int(product.stock)
        product.stock -= qty

        movement = StockMovement(
            company_id=company_id,
            product_id=product.id,
            quantity=qty,
            movement_type=StockMovementType.SALE.value,
            remarks=f"Sold via {invoice_number}",
        )
        db.add(movement)

        unit_price = Decimal(str(item.unit_price))
        base_total = Decimal(qty) * unit_price

        gst_rate = Decimal(str(product.gst_rate or 0))
        cgst = Decimal("0.00")
        sgst = Decimal("0.00")
        igst = Decimal("0.00")

        if gst_rate:
            if is_inter_state:
                igst = base_total * (gst_rate / Decimal("100"))
            else:
                half = gst_rate / Decimal("2")
                cgst = base_total * (half / Decimal("100"))
                sgst = base_total * (half / Decimal("100"))

        cgst = q2(cgst)
        sgst = q2(sgst)
        igst = q2(igst)
        item_total = q2(base_total + cgst + sgst + igst)
        total_amount += item_total

        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=product.id,
            quantity=qty,
            unit_price=q2(unit_price),
            cgst=cgst,
            sgst=sgst,
            igst=igst,
            total=item_total,
        )
        db.add(db_item)

        audit_log(
            db=db,
            company_id=company_id,
            user_id=user_id,
            action="INVOICE_ITEM_SOLD",
            details={
                "invoice_number": invoice_number,
                "invoice_id": db_invoice.id,
                "product_id": product.id,
                "quantity": qty,
                "unit_price": str(q2(unit_price)),
                "stock_before": before_stock,
                "stock_after": int(product.stock),
            },
        )

    db_invoice.total_amount = q2(total_amount)

    audit_log(
        db=db,
        company_id=company_id,
        user_id=user_id,
        action="INVOICE_CREATED",
        details={"invoice_id": db_invoice.id, "invoice_number": invoice_number, "total_amount": str(db_invoice.total_amount)},
    )

    db.flush()
    return db_invoice

