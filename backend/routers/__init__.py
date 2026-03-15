from fastapi import APIRouter
from backend.routers import auth, inventory, invoices, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
