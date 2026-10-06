import sys
import csv
import io
import threading
import time
from pathlib import Path
from datetime import datetime
from typing import Optional

# Ensure backend directory is in sys.path
_backend_root = Path(__file__).resolve().parent.parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db.session import get_db, SessionLocal
from app.models.pond import Pond
from app.models.reading import Reading
from app.models.alert import Alert
from app.schemas.simulation import SimulationStartRequest, SimulationStatusResponse
from app.core.alerts import evaluate_reading_alerts
from simulator.scenarios import generate_scenario_reading, SCENARIO_CONFIGS

router = APIRouter(tags=["Simulation & Ingestion"])


class SimulatorManager:
    def __init__(self):
        self.is_running = False
        self.current_scenario = "normal"
        self.tick_interval_seconds = 5
        self.speed_multiplier = 60
        self.readings_generated = 0
        self.last_tick_at = None
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()

    def start(self, scenario: str, tick_interval: int, speed_multiplier: int):
        if scenario not in SCENARIO_CONFIGS:
            raise ValueError(f"Unknown scenario '{scenario}'. Choose from: {list(SCENARIO_CONFIGS.keys())}")

        self.current_scenario = scenario
        self.tick_interval_seconds = tick_interval
        self.speed_multiplier = speed_multiplier
        self.is_running = True
        self._stop_event.clear()

        if self._thread is None or not self._thread.is_alive():
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()

    def stop(self):
        self.is_running = False
        self._stop_event.set()

    def tick_once(self) -> int:
        db = SessionLocal()
        count = 0
        try:
            ponds = db.query(Pond).all()
            if not ponds:
                return 0

            now = datetime.utcnow()
            hour_of_day = now.hour + now.minute / 60.0

            for p in ponds:
                temp, do, ph, nh3 = generate_scenario_reading(self.current_scenario, hour_of_day)
                reading = Reading(
                    pond_id=p.id,
                    temperature=temp,
                    dissolved_oxygen=do,
                    ph=ph,
                    ammonia=nh3,
                    timestamp=now,
                )
                db.add(reading)
                count += 1

                # Alerts
                alerts = evaluate_reading_alerts(p.species, temp, do)
                for a in alerts:
                    active = db.query(Alert).filter(
                        Alert.pond_id == p.id,
                        Alert.alert_type == a.alert_type,
                        Alert.is_resolved.is_(False),
                    ).first()
                    if not active:
                        db.add(Alert(
                            pond_id=p.id,
                            severity=a.severity,
                            alert_type=a.alert_type,
                            message=a.message,
                        ))

            db.commit()
            self.readings_generated += count
            self.last_tick_at = now.isoformat()
        finally:
            db.close()
        return count

    def _run_loop(self):
        while self.is_running and not self._stop_event.is_set():
            try:
                self.tick_once()
            except Exception:
                pass
            self._stop_event.wait(self.tick_interval_seconds)


sim_manager = SimulatorManager()


@router.post("/simulate/start", response_model=SimulationStatusResponse)
def start_simulation(payload: SimulationStartRequest):
    try:
        sim_manager.start(
            scenario=payload.scenario,
            tick_interval=payload.tick_interval_seconds,
            speed_multiplier=payload.speed_multiplier,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return SimulationStatusResponse(
        is_running=sim_manager.is_running,
        current_scenario=sim_manager.current_scenario,
        tick_interval_seconds=sim_manager.tick_interval_seconds,
        last_tick_at=sim_manager.last_tick_at,
        readings_generated=sim_manager.readings_generated,
    )


@router.post("/simulate/stop", response_model=SimulationStatusResponse)
def stop_simulation():
    sim_manager.stop()
    return SimulationStatusResponse(
        is_running=sim_manager.is_running,
        current_scenario=sim_manager.current_scenario,
        tick_interval_seconds=sim_manager.tick_interval_seconds,
        last_tick_at=sim_manager.last_tick_at,
        readings_generated=sim_manager.readings_generated,
    )


@router.get("/simulate/status", response_model=SimulationStatusResponse)
def get_simulation_status():
    return SimulationStatusResponse(
        is_running=sim_manager.is_running,
        current_scenario=sim_manager.current_scenario,
        tick_interval_seconds=sim_manager.tick_interval_seconds,
        last_tick_at=sim_manager.last_tick_at,
        readings_generated=sim_manager.readings_generated,
    )


@router.post("/simulate/tick")
def trigger_manual_tick():
    count = sim_manager.tick_once()
    return {
        "status": "success",
        "scenario": sim_manager.current_scenario,
        "readings_created": count,
    }


@router.post("/upload/csv")
async def upload_csv_readings(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    try:
        decoded = content.decode("utf-8")
    except UnicodeDecodeError:
        decoded = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    required_cols = {"pond_id", "temperature", "dissolved_oxygen"}
    if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must include columns: {list(required_cols)}. Found: {reader.fieldnames}",
        )

    imported_count = 0
    now = datetime.utcnow()

    for row in reader:
        try:
            p_id = int(row["pond_id"])
            pond = db.query(Pond).filter(Pond.id == p_id).first()
            if not pond:
                continue

            temp = float(row["temperature"])
            do = float(row["dissolved_oxygen"])
            ph = float(row["ph"]) if "ph" in row and row["ph"] else None
            nh3 = float(row["ammonia"]) if "ammonia" in row and row["ammonia"] else None

            # Parse timestamp if available
            ts = now
            if "timestamp" in row and row["timestamp"]:
                try:
                    ts = datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                except ValueError:
                    ts = now

            reading = Reading(
                pond_id=p_id,
                temperature=temp,
                dissolved_oxygen=do,
                ph=ph,
                ammonia=nh3,
                timestamp=ts,
            )
            db.add(reading)

            # Evaluate alerts for imported data
            alerts = evaluate_reading_alerts(pond.species, temp, do)
            for a in alerts:
                active = db.query(Alert).filter(
                    Alert.pond_id == p_id,
                    Alert.alert_type == a.alert_type,
                    Alert.is_resolved.is_(False),
                ).first()
                if not active:
                    db.add(Alert(
                        pond_id=p_id,
                        severity=a.severity,
                        alert_type=a.alert_type,
                        message=a.message,
                    ))

            imported_count += 1
        except (ValueError, KeyError):
            continue

    db.commit()
    return {
        "status": "success",
        "imported_readings_count": imported_count,
        "filename": file.filename,
    }
