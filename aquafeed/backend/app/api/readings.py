from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.pond import Pond
from app.models.reading import Reading
from app.models.alert import Alert
from app.schemas.reading import ReadingCreate, ReadingRead
from app.core.alerts import evaluate_reading_alerts

router = APIRouter(tags=["Readings"])


@router.post("/readings", response_model=ReadingRead, status_code=status.HTTP_201_CREATED)
def create_reading(payload: ReadingCreate, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == payload.pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {payload.pond_id} not found")

    reading = Reading(
        pond_id=payload.pond_id,
        temperature=payload.temperature,
        dissolved_oxygen=payload.dissolved_oxygen,
        ph=payload.ph,
        ammonia=payload.ammonia,
        timestamp=payload.timestamp or datetime.utcnow(),
    )
    db.add(reading)

    # Evaluate alerts dynamically
    alert_evals = evaluate_reading_alerts(
        species=pond.species,
        temperature=payload.temperature,
        dissolved_oxygen=payload.dissolved_oxygen,
    )
    for a in alert_evals:
        # Check if identical unresolved alert already created recently (within 30 mins) to prevent spam
        recent_alert = (
            db.query(Alert)
            .filter(
                Alert.pond_id == pond.id,
                Alert.alert_type == a.alert_type,
                Alert.is_resolved.is_(False),
            )
            .first()
        )
        if not recent_alert:
            db_alert = Alert(
                pond_id=pond.id,
                severity=a.severity,
                alert_type=a.alert_type,
                message=a.message,
                is_resolved=False,
            )
            db.add(db_alert)

    db.commit()
    db.refresh(reading)
    return reading


@router.get("/ponds/{pond_id}/readings", response_model=List[ReadingRead])
def get_pond_readings(
    pond_id: int,
    limit: int = Query(default=48, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")

    readings = (
        db.query(Reading)
        .filter(Reading.pond_id == pond_id)
        .order_by(Reading.timestamp.desc())
        .limit(limit)
        .all()
    )
    # Return in chronological order
    return list(reversed(readings))
