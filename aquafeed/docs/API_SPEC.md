# AquaFeed REST API Specification

Base URL: `http://localhost:8000/api`

---

## 1. Ponds Endpoints

### 1.1 List Ponds
`GET /ponds`
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Pond North-1",
    "species": "tilapia",
    "fish_count": 5000,
    "avg_weight_g": 180.5,
    "area_ha": 0.5,
    "stocking_date": "2026-08-15",
    "survival_rate": 0.92,
    "current_stage": "grower",
    "biomass_kg": 830.3,
    "created_at": "2026-10-01T08:00:00Z"
  }
]
```

### 1.2 Create Pond
`POST /ponds`
- **Request Body**:
```json
{
  "name": "Nursery Pond A",
  "species": "tilapia",
  "fish_count": 10000,
  "avg_weight_g": 5.2,
  "area_ha": 0.25,
  "stocking_date": "2026-10-01",
  "survival_rate": 0.95
}
```
- **Response**: `201 Created`

### 1.3 Get Single Pond
`GET /ponds/{id}`

---

## 2. Water Quality Readings

### 2.1 Ingest Sensor Reading
`POST /readings`
- **Request Body**:
```json
{
  "pond_id": 1,
  "temperature": 28.5,
  "dissolved_oxygen": 5.8,
  "ph": 7.6,
  "ammonia": 0.04,
  "timestamp": "2026-10-07T08:30:00Z"
}
```
- **Response**: `201 Created`

### 2.2 Get Pond Readings History
`GET /ponds/{id}/readings?limit=48`
- **Response**: `200 OK`
```json
[
  {
    "id": 101,
    "pond_id": 1,
    "temperature": 28.5,
    "dissolved_oxygen": 5.8,
    "ph": 7.6,
    "ammonia": 0.04,
    "timestamp": "2026-10-07T08:30:00Z"
  }
]
```

---

## 3. Dynamic Feeding Engine & Plans

### 3.1 Get Dynamic Feed Plan & Schedule
`GET /ponds/{id}/feed-plan`
- **Query Parameters**: `target_date` (optional, default: current UTC date)
- **Response**: `200 OK`
```json
{
  "pond_id": 1,
  "pond_name": "Pond North-1",
  "species": "tilapia",
  "stage": "grower",
  "biomass_kg": 830.3,
  "base_rate_pct": 2.5,
  "unadjusted_feed_kg": 20.76,
  "adjusted_daily_feed_kg": 18.25,
  "factors": {
    "temp_celsius": 28.5,
    "temp_factor": 1.0,
    "do_mg_l": 4.6,
    "do_factor": 0.8,
    "recent_crash_penalty": 1.0,
    "hunger_feedback_factor": 1.1
  },
  "explanation": "Dissolved oxygen is at 4.6 mg/L (slightly below optimum 5.0 mg/L), reducing feed intake by 20%. Water temperature (28.5°C) is in optimal zone.",
  "meals": [
    {
      "meal_number": 1,
      "scheduled_time": "08:00",
      "planned_feed_kg": 9.12,
      "status": "completed",
      "why": "Morning window: Photosynthesis active, DO climbing above 4.5 mg/L."
    },
    {
      "meal_number": 2,
      "scheduled_time": "16:30",
      "planned_feed_kg": 9.13,
      "status": "pending",
      "why": "Late afternoon window: Peak thermal assimilation before evening respiration."
    }
  ]
}
```

### 3.2 Log Actual Feeding & Appetite Feedback
`POST /ponds/{id}/feed-log`
- **Request Body**:
```json
{
  "pond_id": 1,
  "meal_number": 1,
  "feed_given_kg": 9.0,
  "feed_response": "eaten_fully",
  "leftover_pct": 2.0,
  "notes": "Fish fed actively near surface"
}
```
- **Response**: `201 Created`

---

## 4. Alerts Endpoints

### 4.1 Get Pond Alerts
`GET /ponds/{id}/alerts?active_only=true`
- **Response**: `200 OK`
```json
[
  {
    "id": 12,
    "pond_id": 1,
    "severity": "CRITICAL",
    "alert_type": "LOW_DO_HYPOXIA",
    "message": "DO dropped to 2.8 mg/L! Feeding immediately suspended to prevent mortality.",
    "created_at": "2026-10-07T05:15:00Z",
    "is_resolved": false
  }
]
```

---

## 5. Environmental & Financial Savings Reports

### 5.1 Cumulative Farm Savings
`GET /reports/savings`
- **Response**: `200 OK`
```json
{
  "total_feed_saved_kg": 432.5,
  "total_cost_saved_inr": 32437.5,
  "nitrogen_avoided_kg": 14.88,
  "phosphorus_avoided_kg": 2.12,
  "average_fcr": 1.38,
  "baseline_fcr": 1.75,
  "pollution_risk_score": 24.5,
  "ponds_summary": [
    {
      "pond_id": 1,
      "pond_name": "Pond North-1",
      "feed_saved_kg": 182.0,
      "cost_saved_inr": 13650.0,
      "current_risk_score": 18.0
    }
  ]
}
```

---

## 6. Simulator & Telemetry Controls

### 6.1 Start Autonomous Background Simulation
`POST /simulate/start`
- **Request Body**:
```json
{
  "scenario": "normal",
  "tick_interval_seconds": 10,
  "speed_multiplier": 60
}
```
- **Response**: `200 OK`

### 6.2 Stop Simulation
`POST /simulate/stop`

### 6.3 Upload CSV Dataset
`POST /upload/csv`
- **Form Data**: `file` (multipart/form-data CSV containing `pond_id,timestamp,temperature,dissolved_oxygen,ph,ammonia`)
- **Response**: `200 OK` with imported count.
