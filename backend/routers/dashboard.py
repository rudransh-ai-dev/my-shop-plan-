from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models import Invoice, InvoiceItem, Product
from backend.middleware import get_current_company_id

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=400, detail="X-Company-ID header is missing")
    return company_id

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)

    # Daily Sales Pipeline
    daily_sales = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.created_at >= today_start
    ).scalar() or 0.0

    # Monthly Revenue
    monthly_revenue = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.company_id == company_id,
        Invoice.created_at >= month_start
    ).scalar() or 0.0

    # Top Products
    top_products = db.query(
        Product.name,
        func.sum(InvoiceItem.quantity).label('total_sold')
    ).join(InvoiceItem).join(Invoice).filter(
        Invoice.company_id == company_id
    ).group_by(Product.name).order_by(func.sum(InvoiceItem.quantity).desc()).limit(5).all()

    formatted_top_products = [{"name": p.name, "sold": p.total_sold} for p in top_products]

    # GST Summary (for current month)
    gst_totals = db.query(
        func.sum(InvoiceItem.cgst).label('total_cgst'),
        func.sum(InvoiceItem.sgst).label('total_sgst'),
        func.sum(InvoiceItem.igst).label('total_igst')
    ).join(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.created_at >= month_start
    ).first()

    gst_summary = {
        "cgst": float(gst_totals.total_cgst or 0.0),
        "sgst": float(gst_totals.total_sgst or 0.0),
        "igst": float(gst_totals.total_igst or 0.0),
        "total_tax": float((gst_totals.total_cgst or 0) + (gst_totals.total_sgst or 0) + (gst_totals.total_igst or 0))
    }

    return {
        "daily_sales": daily_sales,
        "monthly_revenue": monthly_revenue,
        "top_products": formatted_top_products,
        "gst_summary": gst_summary
    }
