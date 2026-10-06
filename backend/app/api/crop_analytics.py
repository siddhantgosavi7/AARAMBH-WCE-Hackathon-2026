import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.crop_analytics import analyze_farm
from app.db.models import AnalysisRun, Farm, User
from app.db.session import get_db
from app.schemas.farm import FarmAnalysisRequest
from app.services.weather import fetch_weather

router = APIRouter(prefix="/crop-analytics", tags=["Crop analytics"])


@router.post("/analyze")
def analyze(
    request: FarmAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = Farm(
        user_id=current_user.id,
        name=request.farm_name,
        location=request.location,
        crop=request.crop,
        area_acres=request.area_acres,
        sowing_date=request.sowing_date,
        storage_days=request.storage_days,
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    result = analyze_farm(farm, fetch_weather(farm.location))
    db.add(AnalysisRun(farm_id=farm.id, result_json=json.dumps(result)))
    db.commit()
    return result


@router.get("/latest")
def latest(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    run = (
        db.query(AnalysisRun)
        .join(Farm)
        .filter(Farm.user_id == current_user.id)
        .order_by(AnalysisRun.created_at.desc())
        .first()
    )
    return json.loads(run.result_json) if run else None
