from fastapi import APIRouter

from app.core.crop_analytics import build_demo_dashboard

router = APIRouter(prefix="/crop-analytics", tags=["Crop analytics"])


@router.get("/dashboard")
def get_dashboard():
    return build_demo_dashboard()
