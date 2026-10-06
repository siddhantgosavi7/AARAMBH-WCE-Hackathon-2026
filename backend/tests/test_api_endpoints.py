"""
Integration tests for AquaFeed REST API.
"""

from datetime import date


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"


def test_ponds_crud_lifecycle(client):
    # 1. Create pond
    payload = {
        "name": "Nursery Pond Beta",
        "species": "tilapia",
        "fish_count": 8000,
        "avg_weight_g": 12.5,
        "area_ha": 0.35,
        "stocking_date": str(date.today()),
        "survival_rate": 0.95,
    }
    create_res = client.post("/api/ponds", json=payload)
    assert create_res.status_code == 201
    pond_data = create_res.json()
    pond_id = pond_data["id"]
    assert pond_data["name"] == "Nursery Pond Beta"
    assert pond_data["current_stage"] == "fingerling"
    assert pond_data["biomass_kg"] == 95.0

    # 2. Get single pond
    get_res = client.get(f"/api/ponds/{pond_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == pond_id

    # 3. List ponds
    list_res = client.get("/api/ponds")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 4. Update pond
    update_res = client.put(f"/api/ponds/{pond_id}", json={"name": "Nursery Pond Beta (Updated)"})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Nursery Pond Beta (Updated)"

    # 5. Delete pond
    del_res = client.delete(f"/api/ponds/{pond_id}")
    assert del_res.status_code == 204
    assert client.get(f"/api/ponds/{pond_id}").status_code == 404


def test_readings_and_alert_trigger(client):
    # Create pond
    pond_res = client.post("/api/ponds", json={
        "name": "Grower Pond 1",
        "species": "tilapia",
        "fish_count": 5000,
        "avg_weight_g": 200.0,
        "area_ha": 0.5,
        "stocking_date": str(date.today()),
        "survival_rate": 0.90,
    })
    pond_id = pond_res.json()["id"]

    # Ingest healthy reading
    r1 = client.post("/api/readings", json={
        "pond_id": pond_id,
        "temperature": 28.5,
        "dissolved_oxygen": 6.2,
        "ph": 7.5,
        "ammonia": 0.02,
    })
    assert r1.status_code == 201

    # Ingest critical reading (DO 2.2 mg/L - lethal crash!)
    r2 = client.post("/api/readings", json={
        "pond_id": pond_id,
        "temperature": 28.5,
        "dissolved_oxygen": 2.2,
        "ph": 7.1,
        "ammonia": 0.12,
    })
    assert r2.status_code == 201

    # Verify alert was automatically created
    alerts_res = client.get(f"/api/ponds/{pond_id}/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] == "CRITICAL"
    assert alerts[0]["alert_type"] == "LOW_DO_HYPOXIA"

    # Resolve alert
    alert_id = alerts[0]["id"]
    resolve_res = client.post(f"/api/alerts/{alert_id}/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["is_resolved"] is True


def test_feed_plan_and_logging_pipeline(client):
    # Create pond
    pond_res = client.post("/api/ponds", json={
        "name": "Feed Test Pond",
        "species": "tilapia",
        "fish_count": 5000,
        "avg_weight_g": 220.0,
        "area_ha": 0.5,
        "stocking_date": str(date.today()),
        "survival_rate": 0.90,
    })
    pond_id = pond_res.json()["id"]

    # Ingest reading: 29.0°C, 5.5 mg/L DO (optimal)
    client.post("/api/readings", json={
        "pond_id": pond_id,
        "temperature": 29.0,
        "dissolved_oxygen": 5.5,
    })

    # Fetch feed plan
    plan_res = client.get(f"/api/ponds/{pond_id}/feed-plan")
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert plan["pond_id"] == pond_id
    assert plan["stage"] == "grower"
    assert plan["factors"]["temp_factor"] == 1.0
    assert plan["factors"]["do_factor"] == 1.0
    assert plan["adjusted_daily_feed_kg"] > 0.0
    assert len(plan["meals"]) == 2  # Grower Tilapia has 2 meals
    assert plan["meals"][0]["status"] == "pending"

    # Log meal execution
    log_res = client.post(f"/api/ponds/{pond_id}/feed-log", json={
        "pond_id": pond_id,
        "meal_number": 1,
        "feed_given_kg": plan["meals"][0]["planned_feed_kg"],
        "feed_response": "eaten_fully",
        "leftover_pct": 1.0,
        "notes": "Eaten completely within 10 minutes",
    })
    assert log_res.status_code == 201
    assert log_res.json()["feed_response"] == "eaten_fully"


def test_savings_report(client):
    res = client.get("/api/reports/savings")
    assert res.status_code == 200
    data = res.json()
    assert "total_feed_saved_kg" in data
    assert "total_cost_saved_inr" in data
    assert "nitrogen_avoided_kg" in data
    assert "pollution_risk_score" in data
    assert isinstance(data["ponds_summary"], list)
