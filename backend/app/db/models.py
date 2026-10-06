"""
Database models — User table for KisanMitra auth.
Extend this file with Pond, Reading, FeedPlan etc. as needed.
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Boolean
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(128), nullable=False)
    role = Column(String(16), nullable=False, default="farmer")  # "admin" | "farmer"
    full_name = Column(String(128), nullable=True)
    farm_name = Column(String(128), nullable=True)
    location = Column(String(128), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} username={self.username!r} role={self.role!r}>"
