import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import Invoice, Product, InvoiceItem
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
        start_date = datetime.utcnow() - timedelta(days=30)
        invoices = db.query(
            func.date(Invoice.created_at).label('date'),
            func.sum(Invoice.total_amount).label('daily_total')
        ).filter(
            Invoice.company_id == company_id,
            Invoice.created_at >= start_date,
            Invoice.is_deleted == False
        ).group_by(func.date(Invoice.created_at)).all()

        if not invoices:
            return []

        # Convert to Pandas for DS operations
        df = pd.DataFrame(invoices)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # Feature Engineering: Days since start
        start_day = df['date'].min()
        df['day_index'] = (df['date'] - start_day).dt.days
        
        # Prepare data for ML model
        X = df[['day_index']].values
        y = df['daily_total'].values

        # Train a Linear Regression model
        model = LinearRegression()
        model.fit(X, y)

        # Generate future predictions
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
        # Fetch last 100 invoices for this company
        invoices = db.query(Invoice).filter(
            Invoice.company_id == company_id,
            Invoice.is_deleted == False
        ).order_by(Invoice.created_at.desc()).limit(100).all()

        if not invoices or len(invoices) < 5:
            return []

        amounts = [float(inv.total_amount) for inv in invoices]
        mean = np.mean(amounts)
        std = np.std(amounts)

        anomalies = []
        for inv in invoices:
            # Z-Score = (X - μ) / σ
            z_score = (float(inv.total_amount) - mean) / std if std > 0 else 0
            
            # Typically 3 is the threshold for a major outlier
            if abs(z_score) > 2.5:
                anomalies.append({
                    "invoice_id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "amount": float(inv.total_amount),
                    "z_score": round(z_score, 2),
                    "severity": "HIGH" if abs(z_score) > 3.5 else "MEDIUM"
                })
        
        return anomalies

    @staticmethod
    def get_inventory_optimization(db: Session, company_id: int):
        """
        [DS: Consumption Velocity]
        Calculates reorder dates using the 'Lead Time' formula.
        """
        products = db.query(Product).filter(
            Product.company_id == company_id,
            Product.is_deleted == False
        ).all()

        recommendations = []
        for product in products:
            # Calculate average daily sales in the last 14 days
            last_14_days = datetime.utcnow() - timedelta(days=14)
            items_sold = db.query(func.sum(InvoiceItem.quantity)).join(Invoice).filter(
                InvoiceItem.product_id == product.id,
                Invoice.created_at >= last_14_days,
                Invoice.is_deleted == False
            ).scalar() or 0

            avg_daily_velocity = items_sold / 14 if items_sold > 0 else 0
            
            # Inventory calculation (ML-like regression of remaining days)
            if avg_daily_velocity > 0:
                days_remaining = (product.stock + (product.store_room_stock or 0)) / avg_daily_velocity
                if days_remaining < 7:
                    recommendations.append({
                        "product_name": product.name,
                        "current_stock": product.stock,
                        "daily_velocity": round(avg_daily_velocity, 2),
                        "days_to_zero": round(days_remaining, 1),
                        "status": "RESTOCK_URGENT" if days_remaining < 3 else "PLAN_PURCHASE"
                    })
        
        return recommendations
