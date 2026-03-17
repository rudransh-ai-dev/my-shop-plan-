from __future__ import annotations

from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models import Product, StockMovement, StockMovementType
from backend.schemas import StockUpdate
from backend.services.audit_service import audit_log


def get_product_for_update(*, db: Session, company_id: int, product_id: int) -> Product:
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.company_id == company_id,
            Product.is_active == True,  # noqa: E712
            Product.is_deleted == False,  # noqa: E712
        )
        .with_for_update()
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def apply_stock_movement(
    *,
    db: Session,
    company_id: int,
    user_id: Optional[int],
    product_id: int,
    stock_update: StockUpdate,
) -> Product:
    """
    Applies stock movement with row lock + movement record + audit.
    Must be called inside a transaction.
    """
    product = get_product_for_update(db=db, company_id=company_id, product_id=product_id)

    movement_type = (
        stock_update.movement_type.value
        if hasattr(stock_update.movement_type, "value")
        else str(stock_update.movement_type)
    )

    before = {"stock": int(product.stock), "store_room_stock": int(product.store_room_stock or 0), "total_sold": int(product.total_sold or 0)}

    qty = int(stock_update.quantity)
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    if movement_type == StockMovementType.SALE.value:
        if product.stock < qty:
            raise HTTPException(status_code=400, detail="Insufficient shop shelf stock")
        product.stock -= qty
        product.total_sold = (product.total_sold or 0) + qty
    elif movement_type == StockMovementType.PURCHASE.value:
        product.stock += qty
    elif movement_type == StockMovementType.ADJUSTMENT.value:
        product.stock += qty
    elif movement_type == StockMovementType.MOVE_TO_SHOP.value:
        if (product.store_room_stock or 0) < qty:
            raise HTTPException(status_code=400, detail="Insufficient store room stock")
        product.store_room_stock = (product.store_room_stock or 0) - qty
        product.stock += qty
    elif movement_type == StockMovementType.MOVE_TO_STORE.value:
        if product.stock < qty:
            raise HTTPException(status_code=400, detail="Insufficient shop shelf stock")
        product.stock -= qty
        product.store_room_stock = (product.store_room_stock or 0) + qty
    elif movement_type == StockMovementType.RESTOCK_STORE.value:
        product.store_room_stock = (product.store_room_stock or 0) + qty
    elif movement_type == StockMovementType.RESTOCK_SHOP.value:
        product.stock += qty
    else:
        raise HTTPException(status_code=400, detail="Unsupported movement type")

    after = {"stock": int(product.stock), "store_room_stock": int(product.store_room_stock or 0), "total_sold": int(product.total_sold or 0)}

    movement = StockMovement(
        company_id=company_id,
        product_id=product_id,
        quantity=qty,
        movement_type=movement_type,
        remarks=stock_update.remarks,
    )
    db.add(movement)

    audit_log(
        db=db,
        company_id=company_id,
        user_id=user_id,
        action="PRODUCT_STOCK_CHANGE",
        details={
            "product_id": product_id,
            "movement_type": movement_type,
            "quantity": qty,
            "remarks": stock_update.remarks,
            "before": before,
            "after": after,
        },
    )

    db.flush()
    return product

