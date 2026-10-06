from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, crop_analytics
from app.config import settings
from app.core.security import hash_password
from app.db import models  # noqa: F401 — ensures all tables are registered with Base
from app.db.models import User
from app.db.session import SessionLocal, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schemas
    init_db()
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "farmer").first():
            db.add(
                User(
                    username="farmer",
                    hashed_password=hash_password("farmer123"),
                    role="farmer",
                    full_name="Demo Farmer",
                    farm_name="Demo Farm",
                    location="Kolhapur, Maharashtra",
                )
            )
        if not db.query(User).filter(User.username == "admin").first():
            db.add(
                User(
                    username="admin",
                    hashed_password=hash_password("admin123"),
                    role="admin",
                    full_name="Platform Administrator",
                )
            )
        db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Crop yield forecasting and market decision support API",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(crop_analytics.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT,
    }
