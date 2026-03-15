from fastapi import FastAPI, Depends
import sentry_sdk
from backend.config import settings
from backend.middleware import TenantMiddleware
from backend.database import engine, Base
from backend.models import Base as ModelsBase # Actually just importing the module is enough so Base knows
import backend.models

# In a real app, migrations are preferred. We'll rely on Alembic later, but for scaffolding, this handles quick creation.
Base.metadata.create_all(bind=engine)


# Initialize Sentry if configured
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
    )

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="BusinessHub ERP Minimum Viable Product API",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's MVP, we'll allow all. Usually ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Global Tenancy Middleware
app.add_middleware(TenantMiddleware)

@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint for Docker and monitoring platforms.
    """
    return {"status": "ok", "version": "1.0.0"}

# Include the main API router
from backend.routers import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)
