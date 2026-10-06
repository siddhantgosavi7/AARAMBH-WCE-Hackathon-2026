from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import init_db
from app.api import crop_analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schemas
    init_db()
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
