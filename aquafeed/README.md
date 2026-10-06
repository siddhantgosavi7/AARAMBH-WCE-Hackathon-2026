# AquaFeed Optimizer 🐟💧🌾

> **Precision Aquaculture Feeding & Water Quality Optimization System**  
> *Aligned with UN Sustainable Development Goals: SDG 2 (Zero Hunger), SDG 6 (Clean Water), SDG 12 (Responsible Consumption), and SDG 14 (Life Below Water).*

AquaFeed Optimizer is an intelligent, software-only aquaculture decision-support and feeding automation platform. By coupling diurnal water temperature and dissolved oxygen (DO) physics with species-specific bio-energetic growth models, the system dynamically calculates, schedules, and adjusts daily rations down to individual meal windows.

It mitigates the single biggest cost and environmental footprint in aquaculture: **feed wastage and pond eutrophication**.

---

## 🚀 Key Highlights

1. **Biomass & Stage-Aware Growth Modeling**: Dynamic Weight Gain based on Specific Growth Rate (SGR) degraded by water stress factors. Supports **Nile Tilapia**, **Rohu / Indian Major Carp**, and **Pacific White Shrimp**.
2. **Physiological Feeding Modulators**:
   - **Temperature Factor**: Bell-shaped metabolic response tapering smoothly to 0 at thermal extremes.
   - **Dissolved Oxygen Factor**: Full feeding at DO ≥ 5.0 mg/L; linear curtailment down to 3.0 mg/L; absolute feeding halt below 3.0 mg/L to prevent lethal hypoxia.
3. **Smart Circadian Meal Scheduling**: Automatically distributes meals across species-appropriate daylight windows while prohibiting pre-dawn DO troughs and extreme noon heat.
4. **Waste & Nutrient Pollution Module**:
   - Quantitative Nitrogen load estimation: `N_load = Feed × Protein% × 0.16 × (1 - Retention)`.
   - Dynamic **Pollution Risk Score (0–100)**.
   - Live environmental and economic dividend reporting: feed saved (kg), cost savings (₹), and nitrogen discharge avoided.
5. **Real-Time Sensor Simulator & Scenarios**:
   - Diurnal sinusoidal models with stochastic noise.
   - Presets for: `Normal Diurnal`, `Heat Wave`, `Algal Bloom`, and `Lethal DO Crash`.
   - CSV data ingestion and manual telemetric overrides.
6. **Glassmorphic Decision Dashboard**: Modern responsive UI with live gauge widgets, explainability inspection panels ("Why this feed amount?"), timeline schedules, and an interactive "What-If" simulator.

---

## 🛠 Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (PostgreSQL compatible), Pydantic v2, APScheduler, Pytest.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, TanStack React Query, Lucide Icons.
- **Simulator**: Python diurnal biological & environmental stream generator.
- **DevOps**: Docker Compose, GitHub Actions CI (Ruff linter + pytest with ≥85% core coverage threshold).

---

## 📂 Repository Structure

```
aquafeed/
├── README.md                   # Project overview & operational guide
├── docker-compose.yml          # Container orchestration (Backend + Frontend)
├── .github/workflows/ci.yml     # Automated linting, test suite & coverage gates
├── docs/                       # Comprehensive engineering documentation
│   ├── PRD.md                  # Problem statement, personas, scope, KPIs
│   ├── ARCHITECTURE.md         # Full architectural blueprint & Mermaid diagrams
│   ├── ALGORITHM.md            # Bioenergetics, formulas, scientific assumptions
│   ├── API_SPEC.md             # REST API reference with payload schemas
│   ├── DATA_MODEL.md           # Database ER diagram & SQLAlchemy entities
│   ├── TEST_PLAN.md            # Testing strategy, edge cases, unit/integration suites
│   ├── PR_PLAN.md              # 12-step mergeable execution roadmap
│   └── DEMO_SCRIPT.md          # 3-minute executive presentation & demo runbook
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint, lifespan & CORS
│   │   ├── config.py           # Typed application settings
│   │   ├── api/                # Modular REST routers (ponds, readings, feeds, etc.)
│   │   ├── core/               # Pure mathematical feeding & biological engines
│   │   ├── models/             # SQLAlchemy ORM declarations
│   │   ├── schemas/            # Pydantic validation models
│   │   ├── services/           # Business logic & repository orchestrators
│   │   └── db/                 # Database engine & session providers
│   ├── tests/                  # Exhaustive test suite (pure unit + API integration)
│   ├── requirements.txt        # Backend dependencies
│   └── Dockerfile              # Container spec
├── simulator/
│   ├── sensor_sim.py           # Background telemetry generator & API streamer
│   ├── scenarios.py            # Pre-configured environmental scenario engines
│   └── sample_data/*.csv       # Pre-generated realistic dataset archives
├── frontend/
│   ├── src/                    # React + Vite + TypeScript application
│   ├── package.json
│   └── Dockerfile
└── scripts/
    ├── seed_db.py              # Realistic 3-pond demo seeder (Healthy, Heat Stress, DO Crash)
    └── run_demo.sh             # One-click launch script
```

---

## ⚡ Quickstart

### Option A: One Command via Docker Compose (Recommended)

```bash
cd aquafeed
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API Docs (Swagger UI): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Option B: Local Development

#### 1. Backend Setup
```bash
cd aquafeed/backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m pytest tests/ -v --cov=app/core
uvicorn app.main:app --reload --port 8000
```

#### 2. Seed Database
In a new terminal window:
```bash
cd aquafeed
python scripts/seed_db.py
```

#### 3. Frontend Setup
```bash
cd aquafeed/frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 🧪 Running Tests & Coverage

```bash
cd aquafeed/backend
pytest tests/ -v --cov=app/core --cov-report=term-missing --cov-fail-under=85
```

---

## 🌿 UN SDG Alignment

| Goal | Target | AquaFeed Optimizer Contribution |
| :--- | :--- | :--- |
| **SDG 2: Zero Hunger** | Target 2.4 | Optimizes Feed Conversion Ratio (FCR) to produce more aquatic protein with less feed resource input. |
| **SDG 6: Clean Water** | Target 6.3 | Reduces organic feed leaching, unconsumed pellet decomposition, and toxic unionized ammonia accumulation. |
| **SDG 12: Responsible Consumption** | Target 12.2 | Drastically curtails wasteful overfeeding practices using real-time biological feedback loops. |
| **SDG 14: Life Below Water** | Target 14.1 | Curtails nutrient runoff and benthic anoxia caused by decomposing pellet sedimentation. |

---

## 📜 License
MIT License. Built for AARAMBH WCE Hackathon 2026.
