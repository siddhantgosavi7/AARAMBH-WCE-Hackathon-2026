"""
Integration tests for Simulation Controls and CSV Upload.
"""

import io
from datetime import date


def test_simulation_status_and_tick(client):
    status_res = client.get("/api/simulate/status")
    assert status_res.status_code == 200
    data = status_res.json()
    assert "is_running" in data
    assert "readings_generated" in data

    # Trigger manual tick
    tick_res = client.post("/api/simulate/tick")
    assert tick_res.status_code == 200
    tick_data = tick_res.json()
    assert tick_data["status"] == "success"


def test_simulation_start_stop(client):
    start_res = client.post("/api/simulate/start", json={
        "scenario": "heat_wave",
        "tick_interval_seconds": 10,
        "speed_multiplier": 60,
    })
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["is_running"] is True
    assert start_data["current_scenario"] == "heat_wave"

    stop_res = client.post("/api/simulate/stop")
    assert stop_res.status_code == 200
    stop_data = stop_res.json()
    assert stop_data["is_running"] is False


def test_upload_csv_valid_and_invalid(client):
    # Create pond first
    pond_res = client.post("/api/ponds", json={
        "name": "CSV Ingest Pond",
        "species": "tilapia",
        "fish_count": 1000,
        "avg_weight_g": 50.0,
        "area_ha": 0.2,
        "stocking_date": str(date.today()),
        "survival_rate": 0.90,
    })
    pond_id = pond_res.json()["id"]

    # 1. Valid CSV
    valid_csv = (
        f"pond_id,timestamp,temperature,dissolved_oxygen,ph,ammonia\n"
        f"{pond_id},2026-10-07T08:00:00Z,28.5,5.6,7.5,0.04\n"
        f"{pond_id},2026-10-07T10:00:00Z,29.1,6.2,7.7,0.03\n"
    )
    file_bytes = io.BytesIO(valid_csv.encode("utf-8"))
    res = client.post(
        "/api/upload/csv",
        files={"file": ("test_readings.csv", file_bytes, "text/csv")},
    )
    assert res.status_code == 200
    assert res.json()["imported_readings_count"] == 2

    # 2. Invalid non-csv extension
    bad_file = io.BytesIO(b"data")
    bad_res = client.post(
        "/api/upload/csv",
        files={"file": ("test.txt", bad_file, "text/plain")},
    )
    assert bad_res.status_code == 400

    # 3. Missing required columns
    bad_csv = "pond_id,notes\n1,test\n"
    res_missing = client.post(
        "/api/upload/csv",
        files={"file": ("bad.csv", io.BytesIO(bad_csv.encode("utf-8")), "text/csv")},
    )
    assert res_missing.status_code == 400
