from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertRead

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=List[AlertRead])
def get_all_alerts(
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Alert)
    if active_only:
        query = query.filter(Alert.is_resolved.is_(False))
    return query.order_by(Alert.created_at.desc()).limit(100).all()


@router.get("/ponds/{pond_id}/alerts", response_model=List[AlertRead])
def get_pond_alerts(
    pond_id: int,
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).filter(Alert.pond_id == pond_id)
    if active_only:
        query = query.filter(Alert.is_resolved.is_(False))
    return query.order_by(Alert.created_at.desc()).limit(50).all()


@router.post("/alerts/{alert_id}/resolve", response_model=AlertRead)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")

    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
