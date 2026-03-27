import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import Order, Product, OrderItem
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    def get_sales_forecast(db: Session, company_id: int, days_ahead: int = 7):
        """
        [ML: Linear Regression] 
        Predicts future sales based on historical data.
        """
        # Fetch last 30 days of sales
        start_date = datetime.utcnow().date() - timedelta(days=30)
        orders = db.query(
            Order.order_date.label('date'),
            func.sum(OrderItem.sales).label('daily_total')
        ).join(OrderItem, OrderItem.order_key == Order.id).filter(
            Order.company_id == company_id,
            Order.order_date >= start_date,
            Order.is_deleted == False
        ).group_by(Order.order_date).all()

        if not orders:
            return []

        df = pd.DataFrame(orders)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        start_day = df['date'].min()
        df['day_index'] = (df['date'] - start_day).dt.days
        
        X = df[['day_index']].values
        y = df['daily_total'].values

        model = LinearRegression()
        model.fit(X, y)

        last_day = df['day_index'].max()
        future_days = np.array([[last_day + i + 1] for i in range(days_ahead)])
        predictions = model.predict(future_days)
        
        forecast = []
        for i, pred in enumerate(predictions):
            future_date = datetime.utcnow() + timedelta(days=i+1)
            forecast.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "estimated_value": max(0.0, float(pred))
            })
            
        return forecast

    @staticmethod
    def detect_anomalies(db: Session, company_id: int):
        """
        [DS: Statistical Z-Score]
        Detects transactions that are statistical outliers.
        """
        orders_totals = db.query(
            Order.order_id,
            func.sum(OrderItem.sales).label('total_amount')
        ).join(OrderItem, OrderItem.order_key == Order.id).filter(
            Order.company_id == company_id,
            Order.is_deleted == False
        ).group_by(Order.order_id).order_by(Order.order_date.desc()).limit(100).all()

        if not orders_totals or len(orders_totals) < 5:
            return []

        amounts = [float(o.total_amount) for o in orders_totals]
        mean = np.mean(amounts)
        std = np.std(amounts)

        anomalies = []
        for o in orders_totals:
            z_score = (float(o.total_amount) - mean) / std if std > 0 else 0
            
            if abs(z_score) > 2.5:
                anomalies.append({
                    "invoice_id": o.order_id,
                    "invoice_number": o.order_id,
                    "amount": float(o.total_amount),
                    "z_score": round(z_score, 2),
                    "severity": "HIGH" if abs(z_score) > 3.5 else "MEDIUM"
                })
        
        return anomalies

    @staticmethod
    def get_inventory_optimization(db: Session, company_id: int):
        # We don't have stock metrics in the new Indian dataset, return empty to prevent crash
        return []
