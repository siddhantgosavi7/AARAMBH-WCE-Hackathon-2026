# AquaFeed Test Plan & Validation Strategy

## 1. Scope & Quality Objectives

The system enforces strict reliability boundaries:
1. **Core Bioenergetic Logic (`backend/app/core/`)**: 100% pure mathematical code, zero I/O, target $\ge 85\%$ unit test coverage (enforced via Pytest CI gate).
2. **API & Integration Layer (`backend/app/api/`)**: Comprehensive endpoint coverage using FastAPI `TestClient` and an isolated in-memory SQLite database.
3. **Safety & Edge-Case Protection**: Explicit validation against lethal water quality conditions, DO crashes, negative inputs, and data corruption.

---

## 2. Test Suites Matrix

### 2.1 Pure Core Engine Unit Tests (`tests/test_core_*.py`)

| Test File | Component Under Test | Scenarios & Edge Cases Verified | Target Coverage |
| :--- | :--- | :--- | :--- |
| `test_species_profiles.py` | `species_profiles.py` | Stage resolution from body weight (boundary values, e.g., 0.99g vs 1.01g). Verification of config constants for all 3 species (Tilapia, Rohu, Shrimp). | 100% |
| `test_growth.py` | `growth.py` | SGR calculations, biomass calculations with survival rate, daily weight increment under zero stress, mild stress, and extreme hypoxia stress. | $\ge 90\%$ |
| `test_temp_do_factors.py` | `feed_calculator.py` | Bell curve at exact optimum ($T=29^\circ\text{C} \implies 1.0$), lower lethal ($T \le 12^\circ\text{C} \implies 0.0$), upper lethal ($T \ge 38^\circ\text{C} \implies 0.0$), transitional points. DO piecewise ($DO \ge 5.0 \implies 1.0$, $DO=4.0 \implies 0.5$, $DO < 3.0 \implies 0.0$). | 100% |
| `test_feed_calculator.py` | `feed_calculator.py` | Unadjusted vs adjusted feed calculation. FCR cap constraints. Generation of transparent explainability reasoning text. Zero feed when $DO < 3.0$. | $\ge 90\%$ |
| `test_scheduler.py` | `scheduler.py` | Meal partitioning by stage (fry gets 6 meals, grower gets 2). Pre-dawn exclusion window (no meals before 07:00). Appetite feedback reductions (leftover penalty). Post-DO-crash penalty. | $\ge 90\%$ |
| `test_pollution.py` | `pollution.py` | Nitrogen load formula precision. Pollution Risk Score (0-100 range constraints). Feed and financial savings versus static feeding charts. | $\ge 90\%$ |
| `test_alerts.py` | `alerts.py` | CRITICAL hypoxia trigger, heat stress alert, high pollution warning, alert deduplication. | $\ge 90\%$ |

### 2.2 Integration & API Test Suite (`tests/test_api_*.py`)

| Test File | Scope | Key Test Cases |
| :--- | :--- | :--- |
| `test_api_ponds.py` | Pond lifecycle | Create valid pond, reject negative weight, list ponds, fetch single pond with calculated current stage and biomass. |
| `test_api_readings.py` | Telemetry pipeline | Ingest valid reading, verify persistence, verify time-series query ordering, automated alert firing on critical DO reading. |
| `test_api_feed.py` | Feed engine API | Request feed plan for pond, verify meal timeline matches stage, verify explainability factors in JSON payload. Log feed meal and confirm appetite modifier updates subsequent meal. |
| `test_api_reports.py` | Reporting & savings | Verify cumulative savings endpoint aggregates multiple ponds, calculates ₹ correctly (at ₹75/kg baseline). |
| `test_api_simulator.py` | Simulation & CSV | Start/stop background simulation tick. Upload valid CSV file and assert batch records created; reject malformed CSV headers. |

---

## 3. High-Priority Biological Edge Cases

1. **Lethal Hypoxia ($DO = 2.4\text{ mg/L}$)**:
   - *Expected Outcome*: Daily feed immediately reduced to $0.0\text{ kg}$, all meals marked as `skipped`, CRITICAL alert emitted.
2. **Extreme Heat Wave ($T = 37.5^\circ\text{C}$ for Tilapia)**:
   - *Expected Outcome*: Thermal factor drops below $0.1$, afternoon meal suppressed or rescheduled, WARNING alert emitted.
3. **Severe Overfeeding Response (Worker reports $35\%$ leftovers)**:
   - *Expected Outcome*: Feedback modifier curtails next meal by $40\%$, warning of unconsumed nutrient leaching.
4. **Boundary Stage Transition ($W = 100.0\text{g}$)**:
   - *Expected Outcome*: Smooth transition from Juvenile to Grower without divide-by-zero or step discontinuties.

---

## 4. Execution Commands

```bash
# Run unit tests only
pytest tests/test_core_*.py -v

# Run full suite with core coverage gate (>= 85%)
pytest tests/ -v --cov=app/core --cov-report=term-missing --cov-fail-under=85

# Format and lint check
ruff check app/ tests/
```
