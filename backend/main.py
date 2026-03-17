from fastapi import FastAPI, Depends
import sentry_sdk
from backend.config import settings
from backend.middleware import TenantMiddleware
from backend.database import engine, Base  # noqa: F401
import backend.models  # noqa: F401

# Note: database schema is managed by Alembic migrations (Milestone 0).
# Do not call Base.metadata.create_all() in production.


# Initialize Sentry if configured
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
    )

from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.rate_limit import limiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="BusinessHub ERP Minimum Viable Product API",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
