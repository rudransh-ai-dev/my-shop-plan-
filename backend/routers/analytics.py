from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.database import get_db
from backend.middleware import get_current_company_id, get_current_user_id
from backend.services.analytics import AnalyticsService
from backend.services.cybersecurity import SecurityService
from backend.services.iot import IoTService

router = APIRouter()

def get_company_id():
    company_id = get_current_company_id()
    if not company_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return company_id

def get_user_id():
    user_id = get_current_user_id()
    return user_id

# --- CORE ANALYTICS: DATA SCIENCE & MACHINE LEARNING ---

@router.get("/forecast")
def get_ml_forecast(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Predicts next 7 days of sales using Linear Regression."""
    return AnalyticsService.get_sales_forecast(db, company_id)

@router.get("/anomalies")
def get_ds_anomalies(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Detects transaction outliers using Z-Score statistical analysis."""
    return AnalyticsService.detect_anomalies(db, company_id)

@router.get("/inventory-optimization")
def get_stock_recommendations(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Calculates reorder dates using consumption velocity models."""
    return AnalyticsService.get_inventory_optimization(db, company_id)

# --- SECURITY: INFORMATION & CYBER SECURITY ---

@router.get("/security-threats")
def get_security_audit(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Monitors audit logs for brute-force and geo-anomaly detection."""
    return SecurityService.monitor_threats(db, company_id)

@router.get("/security-compliance")
def get_compliance_status():
    """Returns the state of encryption and PII protection within the ERP."""
    return SecurityService.check_data_encryption_compliance()

from pydantic import BaseModel
import re
import requests

class ChatMessage(BaseModel):
    message: str

# --- IOT: DEVICE MANAGEMENT & SENSOR SIMULATION ---

@router.get("/iot-device-health")
def get_iot_device_health():
    """Returns simulated health status for IoT sensor mesh devices."""
    return IoTService.get_device_health()

@router.get("/iot-simulate-reading/{sku}")
def simulate_iot_reading(sku: str, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Simulates a weight/RFID sensor reading for a given product SKU."""
    return IoTService.simulate_sensor_reading(sku)

@router.post("/iot-sync-stock")
def sync_iot_stock(sku: str, quantity: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Pushes a sensor reading to the ERP inventory database."""
    return IoTService.push_sensor_to_inventory(db, company_id, sku, quantity)

@router.post("/chat")
def ai_chat(msg: ChatMessage, db: Session = Depends(get_db)):
    """Smart assistant for business insights using Ollama with a fail-safe fallback."""
    from sqlalchemy import func, extract
    from backend.models import Order, OrderItem, Customer
    from datetime import datetime
    
    user_msg = msg.message.lower()

    # Get available year range
    year_range = db.query(
        func.min(extract('year', Order.order_date)).label("min_year"),
        func.max(extract('year', Order.order_date)).label("max_year")
    ).first()
    min_year = int(year_range.min_year) if year_range.min_year else 2024
    max_year = int(year_range.max_year) if year_range.max_year else 2026
    current_year = datetime.now().year

    # 1. Gather live database context (Top level metrics)
    totals = db.query(
        func.sum(OrderItem.sales).label("total_sales"),
        func.sum(OrderItem.profit).label("total_profit")
    ).first()
    
    # Top Region
    top_region = db.query(
        Customer.region,
        func.sum(OrderItem.sales).label("sales")
    ).join(Order, Order.customer_key == Customer.id).join(
        OrderItem, OrderItem.order_key == Order.id
    ).group_by(Customer.region).order_by(func.sum(OrderItem.sales).desc()).first()

    # Get year-wise data
    yearly_data = db.query(
        extract('year', Order.order_date).label("year"),
        func.sum(OrderItem.sales).label("sales"),
        func.sum(OrderItem.profit).label("profit")
    ).join(OrderItem, OrderItem.order_key == Order.id).group_by(
        extract('year', Order.order_date)
    ).order_by(extract('year', Order.order_date)).all()

    yearly_str = "\n".join([f"- {int(y.year)}: Sales ₹{float(y.sales):,.2f}, Profit ₹{float(y.profit):,.2f}" for y in yearly_data])

    context_data = {
        "total_sales": float(totals.total_sales or 0),
        "total_profit": float(totals.total_profit or 0),
        "top_region": top_region.region if top_region else "Unknown",
        "year_range": f"{min_year}-{max_year}",
        "current_year": current_year,
        "yearly_data": yearly_str
    }

    # 2. Attempt to use Ollama LLaMA3 if installed and running
    try:
        system_prompt = f"""You are a Business Analyst AI for the 'BusinessHub' ERP system.
CRITICAL RULES:
1. ONLY use data from the provided database context - NEVER make up numbers
2. Only answer questions about years {min_year} to {max_year} (our data range)
3. If asked about years outside this range, politely say "We don't have data for that year. Our records span from {min_year} to {max_year}."
4. Be precise, short, and professional. Never hallucinate or estimate data.

ACTUAL DATABASE DATA:
- Available Years: {min_year} to {max_year}
- Yearly Breakdown:
{yearly_str}
- Total Lifetime Sales: ₹{context_data['total_sales']:,.2f}
- Total Lifetime Profit: ₹{context_data['total_profit']:,.2f}
- Best Performing Region: {context_data['top_region']}
- Current Date: {datetime.now().strftime('%Y-%m-%d')}

Answer based ONLY on the data above."""
        
        full_prompt = f"{system_prompt}\n\nUSER QUESTION: {msg.message}\nYOUR ANALYSIS (only use real data, no estimates):"

        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.1:8b", 
                "prompt": full_prompt, 
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9
                }
            },
            timeout=90.0
        )
        res.raise_for_status()
        return {"response": res.json().get("response", "Error parsing AI response.")}
    except Exception as e:
        print(f"Ollama AI Error: {e}") # Fallback linearly

    # 3. High-speed Fallback Logic (Only real data, no hallucination!)
    import re
    year_mentioned = re.search(r'\b(19|20)\d{2}\b', msg.message)
    
    if year_mentioned:
        year = int(year_mentioned.group())
        if year < min_year or year > max_year:
            return {"response": f"⚠️ We don't have data for **{year}**. Our records span from **{min_year}** to **{max_year}**."}
    
    if "revenue" in user_msg or "sales" in user_msg or "earn" in user_msg:
        return {"response": f"📊 Total sales: **₹{context_data['total_sales']:,.2f}** (years {min_year}-{max_year})."}
    
    elif "profit" in user_msg or "margin" in user_msg:
        return {"response": f"💰 Total profit: **₹{context_data['total_profit']:,.2f}**."}
        
    elif "region" in user_msg or "best" in user_msg:
        return {"response": f"🌍 Best region: **{context_data['top_region']}**."}

    else:
        return {"response": f"🤖 Connected to BusinessHub ERP. Data range: **{min_year}-{max_year}**. Ask about sales, profit, or specific years."}
