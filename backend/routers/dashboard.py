from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, date
from typing import Optional
from backend.database import get_db
from backend.models import Order, OrderItem, Product, Customer

router = APIRouter()

@router.get("/metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None, description="Filter by year, e.g. 2023"),
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    start_date: Optional[date] = Query(None, description="Custom range start (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Custom range end (YYYY-MM-DD)"),
):
    # Build date filter condition for Order.order_date
    date_filters = []
    if start_date:
        date_filters.append(Order.order_date >= start_date)
    if end_date:
        date_filters.append(Order.order_date <= end_date)
    if year and not start_date:
        date_filters.append(func.extract('year', Order.order_date) == year)
    if month and not start_date:
        date_filters.append(func.extract('month', Order.order_date) == month)

    # Base join with date filters applied
    filtered_order_ids = db.query(Order.id).filter(*date_filters)

    # Total Sales & Profit
    totals = db.query(
        func.sum(OrderItem.sales).label("total_sales"),
        func.sum(OrderItem.profit).label("total_profit"),
        func.avg(OrderItem.discount).label("avg_discount"),
        func.count(func.distinct(OrderItem.order_key)).label("total_orders"),
    ).filter(OrderItem.order_key.in_(filtered_order_ids)).first()

    # Sales by Region
    region_sales = db.query(
        Customer.region,
        func.sum(OrderItem.sales).label("sales")
    ).join(Order, Order.customer_key == Customer.id).join(
        OrderItem, OrderItem.order_key == Order.id
    ).filter(*date_filters).group_by(Customer.region).all()

    # Sales by Segment
    segment_sales = db.query(
        Customer.segment,
        func.sum(OrderItem.sales).label("sales")
    ).join(Order, Order.customer_key == Customer.id).join(
        OrderItem, OrderItem.order_key == Order.id
    ).filter(*date_filters).group_by(Customer.segment).all()

    # Top 5 Sub-Categories by Profit
    top_categories = db.query(
        Product.sub_category,
        func.sum(OrderItem.profit).label("profit")
    ).join(OrderItem, OrderItem.product_key == Product.id).filter(
        OrderItem.order_key.in_(filtered_order_ids)
    ).group_by(Product.sub_category).order_by(func.sum(OrderItem.profit).desc()).limit(5).all()

    # Monthly trend (last 12 months or filtered range)
    monthly_trend = db.query(
        func.extract('year', Order.order_date).label("year"),
        func.extract('month', Order.order_date).label("month"),
        func.sum(OrderItem.sales).label("sales"),
        func.sum(OrderItem.profit).label("profit"),
    ).join(OrderItem, OrderItem.order_key == Order.id).filter(
        *date_filters
    ).group_by(
        func.extract('year', Order.order_date),
        func.extract('month', Order.order_date)
    ).order_by(
        func.extract('year', Order.order_date),
        func.extract('month', Order.order_date)
    ).limit(12).all()

    return {
        "total_sales": float(totals.total_sales or 0),
        "total_profit": float(totals.total_profit or 0),
        "avg_discount": float(totals.avg_discount or 0),
        "total_orders": int(totals.total_orders or 0),
        "sales_by_region": [{"name": r.region, "value": float(r.sales)} for r in region_sales],
        "sales_by_segment": [{"name": s.segment, "value": float(s.sales)} for s in segment_sales],
        "top_categories": [{"name": c.sub_category, "profit": float(c.profit)} for c in top_categories],
        "monthly_trend": [{"year": int(m.year), "month": int(m.month), "sales": float(m.sales), "profit": float(m.profit)} for m in monthly_trend],
    }
