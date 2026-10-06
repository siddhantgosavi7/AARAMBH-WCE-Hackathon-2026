"""
Auth API routes — login + current user.
Demo credentials:
  admin  / admin123
  farmer / farmer123
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token, verify_password
from app.db.models import User
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


# ── Schemas ────────────────────────────────────────────────────────────────
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str | None = None


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    full_name: str | None
    farm_name: str | None
    location: str | None
    is_active: bool

    class Config:
        from_attributes = True


# ── Login ──────────────────────────────────────────────────────────────────
@router.post("/token", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user: User | None = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = create_access_token({"sub": user.username, "role": user.role, "id": user.id})
    return TokenOut(
        access_token=token,
        role=user.role,
        username=user.username,
        full_name=user.full_name,
    )


# ── Current user ───────────────────────────────────────────────────────────
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
