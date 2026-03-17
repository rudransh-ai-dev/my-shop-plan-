from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from backend.database import get_db
from backend.models import Invoice, InvoiceItem, Product
from backend.middleware import get_current_company_id

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return company_id

@router.get("/metrics")
def get_dashboard_metrics(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_type: Optional[str] = Query(None, description="Preset range: current_month, previous_month, last_3_months"),
    db: Session = Depends(get_db),
    company_id: int = Depends(get_company_id)
):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    
    # Determine date range for filtered queries
    if range_type == "previous_month":
        first_of_current = datetime(now.year, now.month, 1)
        filter_end = first_of_current
        if now.month == 1:
            filter_start = datetime(now.year - 1, 12, 1)
        else:
            filter_start = datetime(now.year, now.month - 1, 1)
    elif range_type == "last_3_months":
        filter_end = now
        month = now.month - 3
        year = now.year
        if month <= 0:
            month += 12
            year -= 1
        filter_start = datetime(year, month, 1)
    elif date_from and date_to:
        try:
            filter_start = datetime.strptime(date_from, "%Y-%m-%d")
            filter_end = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
        except ValueError:
            filter_start = datetime(now.year, now.month, 1)
            filter_end = now
    else:
        # Default: current month
        filter_start = datetime(now.year, now.month, 1)
        filter_end = now

    # Daily Sales (always today)
    daily_sales = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.is_deleted == False,
        Invoice.created_at >= today_start
    ).scalar() or 0.0

    # Monthly Revenue (current month, always)
    month_start = datetime(now.year, now.month, 1)
    monthly_revenue = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.is_deleted == False,
        Invoice.created_at >= month_start
    ).scalar() or 0.0

    # Filtered Revenue (based on date range selection)
    filtered_revenue = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.is_deleted == False,
        Invoice.created_at >= filter_start,
        Invoice.created_at <= filter_end
    ).scalar() or 0.0

    # Top Products (within date range)
    top_products = db.query(
        Product.name,
        func.sum(InvoiceItem.quantity).label('total_sold')
    ).join(InvoiceItem).join(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.is_deleted == False,
        Invoice.created_at >= filter_start,
        Invoice.created_at <= filter_end
    ).group_by(Product.name).order_by(func.sum(InvoiceItem.quantity).desc()).limit(5).all()

    formatted_top_products = [{"name": p.name, "sold": p.total_sold} for p in top_products]

    # GST Summary (filtered by date range)
    gst_totals = db.query(
        func.sum(InvoiceItem.cgst).label('total_cgst'),
        func.sum(InvoiceItem.sgst).label('total_sgst'),
        func.sum(InvoiceItem.igst).label('total_igst')
    ).join(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.is_deleted == False,
        Invoice.created_at >= filter_start,
        Invoice.created_at <= filter_end
    ).first()

    gst_summary = {
        "cgst": float(gst_totals.total_cgst or 0.0),
        "sgst": float(gst_totals.total_sgst or 0.0),
        "igst": float(gst_totals.total_igst or 0.0),
        "total_tax": float((gst_totals.total_cgst or 0) + (gst_totals.total_sgst or 0) + (gst_totals.total_igst or 0))
    }

    # Low Stock Products (stock <= 10 on shop shelf)
    low_stock_products = db.query(Product).filter(
        Product.company_id == company_id,
        Product.is_active == True,
        Product.is_deleted == False,
        Product.stock <= 10
    ).order_by(Product.stock.asc()).all()

    low_stock_list = []
    for p in low_stock_products:
        if p.stock == 0:
            status = "OUT_OF_STOCK"
        elif p.stock <= 10:
            status = "LOW_STOCK"
        else:
            status = "OK"
        low_stock_list.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "shop_stock": p.stock,
            "store_room_stock": p.store_room_stock or 0,
            "status": status
        })

    # Daily sales breakdown for chart (last 7 days)
    sales_by_day = []
    for i in range(6, -1, -1):
        day_start = datetime(now.year, now.month, now.day) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_total = db.query(func.sum(Invoice.total_amount)).filter(
            Invoice.company_id == company_id,
            Invoice.is_deleted == False,
            Invoice.created_at >= day_start,
            Invoice.created_at < day_end
        ).scalar() or 0.0
        sales_by_day.append({
            "date": day_start.strftime("%b %d"),
            "sales": float(day_total)
        })

    return {
        "daily_sales": float(daily_sales or 0),
        "monthly_revenue": float(monthly_revenue or 0),
        "filtered_revenue": float(filtered_revenue or 0),
        "top_products": formatted_top_products,
        "gst_summary": gst_summary,
        "low_stock_products": low_stock_list,
        "low_stock_count": len([p for p in low_stock_list if p["status"] in ("LOW_STOCK", "OUT_OF_STOCK")]),
        "out_of_stock_count": len([p for p in low_stock_list if p["status"] == "OUT_OF_STOCK"]),
        "sales_by_day": sales_by_day,
        "filter_start": filter_start.isoformat(),
        "filter_end": filter_end.isoformat()
    }
