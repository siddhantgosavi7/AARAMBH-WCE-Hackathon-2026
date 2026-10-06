# Pull Request (PR) Execution Roadmap

This roadmap partitions the AquaFeed Optimizer system into 12 self-contained, fully tested, and independently reviewable increments.

---

### PR-01: Project Scaffold & DevOps Baseline
- **Deliverables**: Directory trees, `docker-compose.yml`, GitHub Actions CI workflow, `.gitignore`, initial `README.md`, `requirements.txt`, Ruff configuration.
- **Verification**: Git tree clean, CI workflow valid, docker compose config passes verification.

### PR-02: Comprehensive Documentation Suite
- **Deliverables**: Complete `PRD.md`, `ARCHITECTURE.md`, `ALGORITHM.md`, `API_SPEC.md`, `DATA_MODEL.md`, `TEST_PLAN.md`, `PR_PLAN.md`, and `DEMO_SCRIPT.md`.
- **Verification**: Markdown formatting validated, Mermaid diagrams render, mathematical formulas formally stated.

### PR-03: Data Layer & Persistence
- **Deliverables**: SQLAlchemy 2.0 ORM models (`Pond`, `Reading`, `FeedPlan`, `FeedMeal`, `FeedLog`, `Alert`, `DailyMetric`), Pydantic v2 schemas, DB session provider, initial migration/schema creation helper.
- **Verification**: In-memory database initialization, schema integrity tests.

### PR-04: Core Engine - Species Profiles & Environmental Factors
- **Deliverables**: `species_profiles.py` (Tilapia, Rohu, Shrimp config tables), `growth.py` (SGR & Biomass formulas), thermal bell curve & DO piecewise modulators in pure functions.
- **Verification**: Pytest unit tests for all mathematical functions with 100% path coverage on threshold boundaries.

### PR-05: Core Engine - Feed Calculator & Circadian Scheduler
- **Deliverables**: `feed_calculator.py` (nominal & adjusted rations, FCR cap, explainability builder), `scheduler.py` (meal partitioning, daylight window assignment, feedback adaptation, post-crash recovery).
- **Verification**: Pytest unit tests covering lethal hypoxia ($DO < 3.0$), thermal spikes, hunger feedback loops, and stage differences.

### PR-06: Core Engine - Pollution Accounting & Alerting System
- **Deliverables**: `pollution.py` (Nitrogen load formula, Pollution Risk Score, feed & economic savings calculator), `alerts.py` (threshold evaluation & severity classification).
- **Verification**: Pytest unit tests verifying mass balance math, score limits (0–100), and alert generation rules. Core engine coverage $\ge 85\%$.

### PR-07: REST Application Layer & Engine Integration
- **Deliverables**: FastAPI application entrypoint, routers (`/ponds`, `/readings`, `/feed-plan`, `/feed-log`, `/alerts`, `/reports/savings`), dependency injection for DB session.
- **Verification**: Integration tests via FastAPI `TestClient` executing end-to-end flows for all endpoints.

### PR-08: Sensor Simulator Subsystem & CSV Ingestion
- **Deliverables**: `sensor_sim.py` (diurnal sine wave stream generator with noise), `scenarios.py` (Normal, Heat Wave, Algal Bloom, DO Crash), `/simulate` and `/upload/csv` endpoints, sample test CSV files.
- **Verification**: End-to-end simulation cycle test; CSV parser validation with sample and malformed files.

### PR-09: Frontend Foundation & Fleet Dashboard
- **Deliverables**: React 18 + Vite + TypeScript setup, Tailwind CSS theme, TanStack Query client, API services, Navigation layout, Fleet Dashboard with pond cards (live DO, temp gauges, stage badges, alert status).
- **Verification**: Clean Vite build, TypeScript typecheck passes, dashboard renders seeded ponds.

### PR-10: Pond Detail, Telemetry Charts & Explainability
- **Deliverables**: `PondDetail` view with Recharts diurnal telemetry graph, growth projection curves, today's feed plan card, and interactive "Why this amount?" explainability factor breakdown.
- **Verification**: Charts display diurnal series, factors match API output.

### PR-11: Schedule, Alerts, Reports & What-If Simulator
- **Deliverables**: Cross-pond Schedule timeline, Alerts notification panel, ROI & Environmental Savings report view (cost saved, N discharge avoided, FCR improvements), interactive "What-If" slider simulator.
- **Verification**: What-if recalculations reflect real-time feedback; report graphs accurately sum cumulative metrics.

### PR-12: Polish, End-to-End Demo Script & Final Hardening
- **Deliverables**: `scripts/seed_db.py` (3 distinct demo ponds: Healthy, Heat Stress, DO Crash), `scripts/run_demo.sh`, mobile responsive UI tuning, error handling, final README documentation.
- **Verification**: One-click startup via `docker compose up` and seed script; full 3-minute pitch run-through without manual workarounds.
