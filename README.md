# AquaFeed Optimizer 🐟💧🌾

> **Precision Aquaculture Feeding & Water Quality Optimization System**  
> *Aligned with UN Sustainable Development Goals: SDG 2, SDG 6, SDG 12, SDG 14.*

AquaFeed Optimizer dynamically calculates, schedules, and adjusts daily fish feed amounts based on water temperature, dissolved oxygen (DO), and species growth stages, minimizing feed waste and preventing lethal hypoxia and water pollution.

> **Hackathon brief fit:** The current codebase is an aquaculture application. It does not yet implement the Crop Yield & Market Analytics Platform brief (satellite imagery, weather forecasts, crop yield prediction, or commodity selling recommendations). See [the product brief](docs/CROP_YIELD_MARKET_ANALYTICS_PRD.md) for the proposed target, MVP scope, and migration plan. Existing AquaFeed functionality remains documented below so the current software is represented accurately.

---

## 📂 Repository Structure

```
d:/WCE/
├── backend/            # FastAPI, SQLAlchemy, SQLite, Bioenergetic Core Engine, Simulator & Tests
│   ├── app/
│   │   ├── api/        # REST routers: ponds, readings, feed, alerts, reports, simulation
│   │   ├── core/       # Pure functions: species profiles, growth, feed calculator, scheduler, pollution, alerts
│   │   ├── models/     # SQLAlchemy ORM models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── db/         # Database session & engine
│   │   ├── config.py
│   │   └── main.py
│   ├── simulator/      # Diurnal sensor simulator & scenario presets
│   ├── tests/          # Pytest unit & integration test suite (62 tests)
│   ├── seed_db.py      # Demo seeder with 3 realistic ponds (Healthy, Heat Stress, DO Crash)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Query
│   ├── src/
│   │   ├── pages/      # Dashboard, PondDetail, Schedule, Alerts, Reports, What-If Simulator
│   │   ├── components/ # TelemetryGauge, StageBadge, AlertBanner, CreatePondModal, Navbar
│   │   ├── api/        # Typed API client
│   │   └── types/      # TypeScript domain interfaces
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml  # One-command container orchestration (Backend + Frontend)
└── README.md
```

---

## ⚡ Quick Start

### Option 1: Docker Compose (One-Command Launch)
```bash
docker compose up --build
```
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development

#### 1. Backend Setup & Run
```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
python seed_db.py
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 🧪 Running Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

All 62 unit and integration tests validate:
- Pure bioenergetic calculations
- Species and stage thresholds
- Temperature bell curve and hypoxia cut-off ($DO < 3.0$ mg/L $\implies 0$ kg feed)
- Mass balance nitrogen load and 0–100 Pollution Risk Index
- REST API lifecycle endpoints and CSV bulk ingestion
