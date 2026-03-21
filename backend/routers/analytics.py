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

# --- BCA6004: DATA SCIENCE & MACHINE LEARNING ---

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

# --- BCA6001/6002: INFORMATION & CYBER SECURITY ---

@router.get("/security-threats")
def get_security_audit(db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Monitors audit logs for brute-force and geo-anomaly detection."""
    return SecurityService.monitor_threats(db, company_id)

@router.get("/security-compliance")
def get_compliance_status():
    """Returns the state of encryption and PII protection within the ERP."""
    return SecurityService.check_data_encryption_compliance()

# --- BCA6002: INTERNET OF THINGS (IoT) ---

@router.get("/iot-device-health")
def get_iot_status():
    """Monitors the operational health of shop shelf sensors (Virtual Mesh)."""
    return IoTService.get_device_health()

@router.get("/iot-simulate-reading/{sku}")
def simulate_sensor(sku: str):
    """Generates a virtual weight reading for a specific product SKU."""
    return IoTService.simulate_sensor_reading(sku)

@router.post("/iot-sync-stock")
def sync_sensor_to_db(sku: str, quantity: int, db: Session = Depends(get_db), company_id: int = Depends(get_company_id)):
    """Demonstrates real-time hardware-to-cloud synchronization for inventory."""
    return IoTService.push_sensor_to_inventory(db, company_id, sku, quantity)
