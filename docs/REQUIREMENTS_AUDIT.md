# KisanMitra requirements audit

Audit date: 2026-10-07. This report distinguishes source-code evidence from live-data claims.

## System trace

```text
Farmer login → POST /api/auth/token → SQLite users table → JWT in session storage
Farmer input → POST /api/crop-analytics/analyze → SQLite farms table
  → Open-Meteo geocoding + forecast when reachable
  → bundled historical crop and market JSON
  → transparent baseline calculation + market rule
  → SQLite analysis_runs table → dashboard
```

Satellite imagery is outside this flow. The API explicitly returns `not_connected`; no fabricated NDVI appears in the new analysis result.

## Original status

| Feature | Status | Evidence | Problem |
| --- | --- | --- | --- |
| Farmer input | ❌ NOT IMPLEMENTED | `build_demo_dashboard()` returned one fixed farm | No form or persisted farm data |
| Satellite / crop monitoring | 🟡 MOCK/HARDCODED | Static NDVI `0.72` and series in the original `crop_analytics.py` | No imagery provider, field boundary, or analytics use |
| Weather | 🟡 MOCK/HARDCODED | Fixed four-day forecast in the original dashboard payload | No location lookup or API call |
| Historical crop data | 🟡 MOCK/HARDCODED | A string claimed historical yield was 4.1 t/ha | No dataset or processing |
| Yield prediction | 🟡 MOCK/HARDCODED | Fixed 18.4 tonnes / 4.38 t/ha | No model or calculation |
| Market data / trend | 🟡 MOCK/HARDCODED | Fixed three APMC prices and percentages | No source or trend calculation |
| Selling recommendation | 🟡 MOCK/HARDCODED | Fixed “Sell 40%…” text | No decision rule |
| Dashboard | ⚠️ PARTIALLY IMPLEMENTED | React tabs rendered the fixed payload | Usable UI, but unconnected analytics |
| End-to-end integration | ❌ NOT IMPLEMENTED | Dashboard endpoint had no auth, input, storage, or provider calls | No real pipeline |

## Changes made and final status

| Requirement | Before | After | Evidence |
| --- | --- | --- | --- |
| Farmer input | ❌ | ✅ FULLY IMPLEMENTED | `FarmForm` posts crop, location, area, sowing date, and storage days; `FarmAnalysisRequest` validates values; `Farm` stores them. |
| Satellite imagery/data | 🟡 | ❌ NOT IMPLEMENTED | `analyze_farm` returns `not_connected` and does not use NDVI. A provider, farm polygon, and credentials are still required. |
| Local weather | 🟡 | ⚠️ PARTIALLY IMPLEMENTED | `services/weather.py` geocodes location and calls Open-Meteo for temperature, rainfall, and humidity. Failure is explicit and the baseline omits weather adjustment. |
| Historical crop data | 🟡 | ⚠️ PARTIALLY IMPLEMENTED | `data/sample_crop_history.json` provides labelled bundled sample yield observations, averaged by crop. It is not a verified government or farm dataset. |
| Crop yield prediction | 🟡 | ⚠️ PARTIALLY IMPLEMENTED | `analyze_farm` calculates tonnes/hectare and total tonnes from historical mean × weather/maturity factors × area. It is a transparent baseline, not ML. |
| Market price data | 🟡 | ⚠️ PARTIALLY IMPLEMENTED | Crop-selected bundled market histories are in `sample_market_history.json`. They are labelled sample data, not live mandi prices. |
| Market trend analysis | 🟡 | ✅ FULLY IMPLEMENTED for bundled data | Trend percentage and five-observation average are calculated in `_market_recommendation`. |
| Selling-time recommendation | 🟡 | ✅ FULLY IMPLEMENTED for bundled data | Rule returns `SELL NOW`, `WAIT`, or `MONITOR` from price movement, recent average, and storage days, with an explanation. |
| Farmer dashboard | ⚠️ | ✅ FULLY IMPLEMENTED | Input screen, weather, satellite availability state, yield unit/range, market history, and reason for decision render from API output. |
| End-to-end integration | ❌ | ⚠️ PARTIALLY IMPLEMENTED | Authenticated user input → persisted farm/run → weather adapter → baseline → stored response → dashboard. Satellite and live market sources remain absent. |
| Real vs mock identification | ❌ | ✅ FULLY IMPLEMENTED | API response `data_mode`, source fields, unavailable state, and UI labels disclose the data origin. |

## Real versus mock audit

| File | Function / component | Current behavior | Real data required | Fix path |
| --- | --- | --- | --- | --- |
| `backend/app/data/sample_crop_history.json` | crop history | Bundled sample observations by crop | Verified farm, district, or government historical yields | Import a documented dataset and record source, dates, units, and region. |
| `backend/app/data/sample_market_history.json` | market history | Bundled sample prices by crop | Live and historical mandi prices | Add a licensed/source-approved mandi adapter, persist observations with timestamps, and retain the sample fallback label. |
| `backend/app/services/weather.py` | `fetch_weather` | Live Open-Meteo geocoding + forecast; explicit failure fallback | None for this provider, subject to its terms | Keep timeout/error handling; cache responses before scaling. |
| `backend/app/core/crop_analytics.py` | `analyze_farm` | Baseline calculation from farm input, sample history, and weather | Verified historical observations and calibrated agronomy | Replace baseline after collecting enough labelled data; evaluate before describing it as ML. |
| `backend/app/core/crop_analytics.py` | satellite response | Explicit `not_connected` state | Sentinel-2/Landsat provider, polygon, cloud handling | Connect Sentinel Hub or Google Earth Engine with a field boundary and provider credentials. |
| `frontend/src/pages/AdminDashboard.tsx` | `DEMO_FARMERS`, `DEMO_ALERTS` | Static administrator display only | Real user/alert records | Either label as demo or replace after creating admin APIs. |
| `backend/seed_users.py` | `DEMO_USERS` | Demo login accounts | Production account lifecycle | Disable demo seeding in production and add user provisioning. |

## Analytics and recommendation audit

The former project had no model. It now has a baseline rather than a claimed ML model:

- **Inputs:** crop, area in acres, sowing date, storage days, bundled crop yield observations, bundled crop-specific market prices, and live weather when returned.
- **Yield unit:** tonnes/hectare. Total production is `yield/hectare × acres × 0.404686`.
- **Weather use:** rain and heat adjust the baseline only when the live weather adapter succeeds. The API says when it did not use weather.
- **Accuracy:** no train/test split, evaluation, or accuracy figure exists. There is no data leakage analysis because there is no trained model.
- **Recommendation:** falling trend ≤ -2% → `SELL NOW`; current price below five-period average with positive overall trend and at least seven storage days → `WAIT`; otherwise → `MONITOR`.
- **Limit:** the price history is bundled sample data. The decision logic is real and deterministic, but it is only as credible as the source data.

## Security and engineering audit

- JWT secret moved from a committed static value to an environment value; development creates a process-local fallback and production refuses to start without `JWT_SECRET_KEY`.
- Farmer API routes require JWT authentication. The frontend sends the token only for protected API requests and keeps it in `sessionStorage`.
- Farm input uses Pydantic validation for crop, dates, area, and storage days.
- CORS is configured from `CORS_ORIGINS`; production must set the exact deployed frontend origin.
- Weather calls have an eight-second timeout and a visible unavailable state.
- Remaining P1 gaps: no rate limiting, no refresh-token lifecycle, no database migrations, no auth test coverage, no provider response cache, and no real admin data APIs.

## Test record

- `python -m pytest tests -q` — passed: baseline calculation and Wheat/Kolhapur/5-acre input validation.
- `python -m ruff check app tests` — passed.
- `npm run build` — passed.
- Docker API smoke test passed with the requested Wheat / Kolhapur / 5-acre input: login succeeded, live weather loaded, expected production was 6.52 tonnes, and the rule returned `MONITOR`.

## P0 / P1 follow-up

P0: provide a satellite provider account plus a field polygon and a legitimate mandi-price source. P1: replace bundled historical data with documented records, cache provider responses, add migrations and API integration tests, and evaluate a model only after enough labelled yield records exist.
