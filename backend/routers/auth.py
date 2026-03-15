from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Company, UserRole
from backend.schemas import Token, UserCreate, CompanyCreate
from backend.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from pydantic import BaseModel
from jose import JWTError

router = APIRouter()

class RegisterRequest(BaseModel):
    company: CompanyCreate
    user: UserCreate

@router.post("/register", response_model=Token)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == request.user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create Company
    db_company = Company(
        name=request.company.name,
        gstin=request.company.gstin,
        address=request.company.address
    )
    db.add(db_company)
    db.flush() # Get company id
    
    # Create User
    db_user = User(
        company_id=db_company.id,
        email=request.user.email,
        hashed_password=get_password_hash(request.user.password),
        role=UserRole.ADMIN.value
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate Tokens
    access_token = create_access_token(subject=db_user.id, company_id=db_company.id)
    refresh_token = create_refresh_token(subject=db_user.id, company_id=db_company.id)
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id, company_id=user.company_id)
    refresh_token = create_refresh_token(subject=user.id, company_id=user.company_id)
    
    # Normally we also send company_id to frontend but it can decode the token or we can add it to token
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=Token)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(request.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if not user_id or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
            
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        access_token = create_access_token(subject=user.id, company_id=user.company_id)
        refresh_token = create_refresh_token(subject=user.id, company_id=user.company_id)
        
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
