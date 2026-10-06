# Product Requirements Document (PRD)

## Project: AquaFeed Optimizer
**Author**: Senior Full-Stack Engineer & Aquaculture Systems Analyst  
**Version**: 1.0.0  
**Status**: Ready for Implementation  
**Aligned SDGs**: UN SDG 2 (Zero Hunger), SDG 6 (Clean Water), SDG 12 (Responsible Consumption & Production), SDG 14 (Life Below Water)

---

## 1. Executive Summary & Problem Statement

In commercial aquaculture, feed constitutes **50% to 70% of total operational expenditure**. Despite this immense financial weight, the predominant feeding practice in developing and mid-tier aquaculture facilities is **manual static rationing** (feeding fixed percentages of nominal fish biomass based on static calendar charts).

### The Dual Crises:
1. **Economic Inefficiency**: In periods of sub-optimal water temperature or depressed Dissolved Oxygen (DO), aquatic species exhibit reduced gastric evacuation rates and metabolic depression. Feed administered during these periods goes unconsumed, eroding farm profit margins and inflating the Feed Conversion Ratio (FCR).
2. **Environmental & Ecological Degradation**: Unconsumed extruded pellets disintegrate within 15–30 minutes, solubilizing reactive nitrogen (TAN/ammonia) and phosphorus. In warm ponds, microbial decomposition of excess organic feed consumes dissolved oxygen, catalyzing **hypoxic dead zones, sudden DO crashes, fish suffocation, and eutrophication**.

AquaFeed Optimizer is a **software-only decision engine and automation system** that bridges real-time limnological data (temperature, DO diurnal cycles) with species bioenergetic growth models. It dynamically calculates exact daily feed allowances, generates meal timing schedules that avoid hypoxia windows, evaluates environmental pollution risk, and delivers explainable feeding recommendations.

---

## 2. Target Users & Personas

### Persona 1: Commercial Aquaculture Farm Manager ("Rajesh")
- **Scale**: Manages 12 freshwater ponds stocking Nile Tilapia and Rohu.
- **Pain Points**: Rising feed pellet costs (₹75/kg), sudden early morning fish mortality due to nocturnal DO drops, lack of visibility into daily feed conversion.
- **Needs**: Real-time alerts, daily feed plans per pond, clear "why this amount" guidance for pond workers.

### Persona 2: Hatchery / Nursery Specialist ("Elena")
- **Scale**: Intensive fry and fingerling nursery ponds.
- **Pain Points**: Fry require 6–8 small meals per day; overfeeding clouds nursery tanks and spikes unionized ammonia (`NH3`), killing delicate fry.
- **Needs**: High-frequency meal scheduling, micro-rationing, sensitive DO thresholds.

### Persona 3: Environmental Compliance & ESG Auditor ("Dr. Aris")
- **Role**: Validates sustainable farm certification (BAP / ASC).
- **Pain Points**: Difficulty quantifying nitrogen discharge and feed waste reductions.
- **Needs**: Quantitative pollution metrics (kg Nitrogen load avoided, Pollution Risk Index 0–100, cost savings).

---

## 3. Goals & Success Metrics (KPIs)

| Metric | Baseline (Static Schedule) | Target with AquaFeed Optimizer |
| :--- | :--- | :--- |
| **Feed Conversion Ratio (FCR)** | 1.75 - 2.10 | **1.35 - 1.55** (15–25% feed savings) |
| **Pond Ammonia Spikes (`> 1.0 mg/L`)** | 4-6 incidents/crop cycle | **< 1 incident/crop cycle** |
| **Severe DO Crash Mortality** | 3-8% annual biomass loss | **0% avoidable feeding-induced hypoxia** |
| **Economic Feed Savings** | ₹0 saved | **₹18,000–₹45,000 / pond / cycle** |
| **Nitrogen Discharge Avoided** | 0% reduction | **20–35% reduction in organic N load** |

---

## 4. Product Scope & Functional Modules

### In Scope (v1.0):
1. **Multi-Pond Management**: Create and track ponds with species (*Nile Tilapia*, *Rohu / Indian Major Carp*, *Pacific White Shrimp*), stocking counts, area, stocking date, and dynamic biomass.
2. **Sensor Ingestion & Built-in Simulator**:
   - Ingest live water quality readings (DO, Temp, pH, Ammonia).
   - Autonomous background sensor simulator with realistic diurnal DO cycles (photosynthesis peak at 15:00, respiration trough at 05:00) and thermal waves.
   - Scenario triggers: `Normal Diurnal`, `Heat Wave`, `Algal Bloom`, and `DO Crash`.
   - CSV bulk upload for historical or field-collected data.
3. **Core Bioenergetic Feeding Engine**:
   - Stage progression (Fry $\to$ Fingerling $\to$ Juvenile $\to$ Grower $\to$ Finisher).
   - Temperature Bell Factor & Piecewise Dissolved Oxygen Modulator.
   - SGR-driven daily weight growth update.
4. **Intelligent Meal Scheduler**:
   - Divides daily allowance into stage-dependent meal windows (e.g. 6 meals for fry, 2-3 for grower).
   - Enforces temporal exclusion zones (no feeding pre-dawn or high-noon heat spikes).
   - Dynamic real-time recalculation per meal with hunger feedback.
5. **Pollution & Economic Dividend Accounting**:
   - Nitrogen load calculation: $N_{load} = Feed \times Protein\% \times 0.16 \times (1 - Retention)$.
   - Pollution Risk Score (0 to 100).
   - Cumulative savings tracking: Feed saved (kg), Cost saved (₹), and N discharge avoided (kg).
6. **Explainability & "What-If" Analysis**:
   - Every recommendation is accompanied by an audit trail explaining exact modulators.
   - Interactive UI sliders for temperature and DO to preview feeding modifications instantly.

### Out of Scope (Deferred to v2.0):
- Direct hardware serial / RS485 / Modbus hardware sensor integration (v1 is software-only via API & simulator).
- Automated mechanical feeder IoT actuators.
- Multi-tenant enterprise RBAC and billing SaaS tiers.

---

## 5. Technical Constraints & Non-Functional Requirements

- **Response Latency**: Core feed calculation must execute in `< 10ms` per pond. API endpoints `< 100ms`.
- **Reliability**: Pure math logic isolated from database operations with $\ge 85\%$ test coverage.
- **Portability**: Completely containerized via Docker Compose. Operates seamlessly cross-platform (Linux/macOS/Windows).
- **Usability**: Aquatic glassmorphic UI, responsive across mobile, tablet, and desktop viewports.
