from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BusinessHub ERP"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "changeme_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5433/businesshub"
    
    # Redis (Rate Limiting, Caching, Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Development-only fallback (do not enable in production)
    ALLOW_INSECURE_TENANT_HEADER: bool = False
    
    # Sentry & AWS/MinIO (Optional)
    SENTRY_DSN: str | None = None
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_REGION: str | None = None
    S3_BUCKET_NAME: str = "businesshub-invoices"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
