import contextvars
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from backend.config import settings

# Global ContextVar to store company_id for the current request
tenant_company_id: contextvars.ContextVar[int | None] = contextvars.ContextVar("tenant_company_id", default=None)
tenant_user_id: contextvars.ContextVar[int | None] = contextvars.ContextVar("tenant_user_id", default=None)

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # In a real scenario, the company_id would be extracted from the JWT token
        # inside the Authorization header. For scaffolding purposes, we simulate this.
        # Ensure we don't block auth or health endpoints
        if request.url.path.startswith(f"{settings.API_V1_STR}/auth") or request.url.path == "/health":
            return await call_next(request)
            
        company_id = None
        user_id = None
        
        # 1. Try to extract from Authorization Bearer token
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token_str = auth_header.split(" ")[1]
            try:
                from jose import jwt
                payload = jwt.decode(token_str, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
                company_id = payload.get("company_id")
                sub = payload.get("sub")
                if sub and str(sub).isdigit():
                    user_id = int(sub)
            except Exception:
                # If a token is present but invalid, do not silently fall back to headers.
                from fastapi.responses import JSONResponse
                return JSONResponse(status_code=401, content={"detail": "Invalid authentication token"})
                
        # 2. Optional fallback to X-Company-ID header (development only)
        if not company_id and getattr(settings, "ALLOW_INSECURE_TENANT_HEADER", False):
            x_company_id = request.headers.get("X-Company-ID")
            if x_company_id and x_company_id.isdigit():
                company_id = int(x_company_id)
            
        # Set the global context variable for this request lifecycle
        token = tenant_company_id.set(company_id)
        user_token = tenant_user_id.set(user_id)
        
        try:
            response = await call_next(request)
            return response
        finally:
            tenant_company_id.reset(token)
            tenant_user_id.reset(user_token)

def get_current_company_id() -> int | None:
    return tenant_company_id.get()


def get_current_user_id() -> int | None:
    return tenant_user_id.get()
