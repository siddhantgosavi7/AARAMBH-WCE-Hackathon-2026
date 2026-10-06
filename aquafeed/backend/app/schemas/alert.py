from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AlertBase(BaseModel):
    pond_id: int
    severity: str  # INFO, WARNING, CRITICAL
    alert_type: str
    message: str


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    id: int
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
