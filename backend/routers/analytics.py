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
    from sqlalchemy import func
    from backend.models import Order, OrderItem, Customer
    from datetime import datetime
    
    user_msg = msg.message.lower()

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

    context_data = {
        "total_sales": float(totals.total_sales or 0),
        "total_profit": float(totals.total_profit or 0),
        "top_region": top_region.region if top_region else "Unknown"
    }

    # 2. Attempt to use Ollama LLaMA3 if installed and running
    try:
        system_prompt = f"""You are a top-tier Business Analyst AI for the 'BusinessHub' ERP system. 
Your goal is to be precise, short, and highly professional. Do not use generic filler words. 
Always use the following live database context to answer the user's question, and format your text beautifully with bullet points or bold text where appropriate.

LIVE ERP DATA CONTEXT:
- Total Lifetime Sales: ₹{context_data['total_sales']:,.2f}
- Total Lifetime Profit: ₹{context_data['total_profit']:,.2f}
- Best Performing Region: {context_data['top_region']}
"""
        
        full_prompt = f"{system_prompt}\n\nUSER QUESTION: {msg.message}\nYOUR ANALYSIS:"

        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.1:latest", 
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

    # 3. High-speed Fallback Logic (Presentation Safe!)
    if "revenue" in user_msg or "sales" in user_msg or "earn" in user_msg:
        return {"response": f"📊 Your total sales stand at **₹{context_data['total_sales']:,.2f}**. Keep pushing!"}
    
    elif "profit" in user_msg or "margin" in user_msg:
        return {"response": f"💰 Your total captured profit is **₹{context_data['total_profit']:,.2f}**!"}
        
    elif "region" in user_msg or "best" in user_msg:
        return {"response": f"🌍 Your best performing region is the **{context_data['top_region']}** region. Allocate marketing budget accordingly."}

    else:
        return {"response": f"🤖 I am connected to your live BusinessHub ERP! Your total sales are ₹{context_data['total_sales']:,.2f}. How can I assist you?"}
