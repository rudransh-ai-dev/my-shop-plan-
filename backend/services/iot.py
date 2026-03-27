import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from backend.models import Product

logger = logging.getLogger(__name__)

class IoTService:
    @staticmethod
    def simulate_sensor_reading(product_sku: str):
        return {
            "sensor_id": f"SN_GATEWAY_0{random.randint(1, 4)}",
            "sku": product_sku,
            "weight_grams": random.randint(100, 5000),
            "units_calculated": random.randint(5, 50),
            "battery_level": f"{random.randint(85, 100)}%",
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    def push_sensor_to_inventory(db: Session, company_id: int, sku: str, quantity: int):
        product = db.query(Product).filter(
            Product.company_id == company_id,
            Product.product_id == sku,
            Product.is_deleted == False
        ).first()

        if not product:
            return {"status": "ERROR", "message": "Product ID not found for sensor node."}

        old_stock = product.stock
        product.stock = quantity
        db.commit()
        
        return {
            "status": "SUCCESS", 
            "product": product.name,
            "old_val": old_stock,
            "new_val": quantity,
            "sync_time": datetime.utcnow().isoformat()
        }

    @staticmethod
    def get_device_health():
        """
        [IoT: Device Management] 
        Simulates health monitoring for a mesh of shop shelf sensors.
        """
        shelves = ["North Rack", "Beverage Cooler", "Premium Goods B1"]
        health_data = []
        for shelf in shelves:
            health_data.append({
                "shelf": shelf,
                "node_status": "ONLINE" if random.choice([True, True, False]) else "OFFLINE",
                "last_ping": (datetime.utcnow() - timedelta(minutes=random.randint(2, 60))).isoformat(),
                "connectivity": f"-{random.randint(40, 90)} dBm (Mesh Node)"
            })
        return health_data
