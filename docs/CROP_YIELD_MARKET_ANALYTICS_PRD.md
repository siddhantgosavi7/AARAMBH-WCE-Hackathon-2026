# Crop Yield & Market Analytics Platform

## Product brief

Build a farmer-facing analytics application that combines field-level crop history, satellite-derived crop observations, local weather, and commodity prices to estimate harvest yield and help farmers decide when and where to sell.

## Current repository status

The current application is **AquaFeed Optimizer**, an aquaculture monitoring and feeding product. Its domain models are ponds, fish, readings, feed plans, and alerts. The React dashboard, API routes, simulator, seed data, and tests all use that domain. The repository has no crop, field, satellite, weather-forecast, yield, or commodity-market modules, and no previous PRD was present in `docs/` when this brief was written.

The existing project is a useful runnable foundation for a demo (FastAPI, React/TypeScript, SQLite, Docker Compose, sample data, and a dashboard), but its aquaculture logic cannot be presented as crop analytics. The crop product requires a deliberate domain pivot across the data model, API, seed/demo data, frontend, and tests.

## Users and decisions

- **Primary user:** A farmer or farm advisor managing one or more fields.
- **Yield question:** What is the likely harvest quantity for each field, and how confident is that estimate?
- **Selling question:** Given current and recent local market prices, forecast harvest timing, and expected costs, which market and selling window look most favorable?
- **Operational question:** Which fields may need attention because recent weather or crop observations suggest elevated risk?

Recommendations are decision support. Every estimate should show its data date, assumptions, and uncertainty; it must not be presented as a guaranteed yield or price.

## Hackathon MVP

1. **Field setup:** Create/select a farm and fields with crop, area, planting date, location, and season.
2. **Crop history:** Provide a small, clearly labeled sample dataset with past yields and field observations. Support CSV import only if time permits.
3. **Weather:** Show recent and forecast conditions for the field location. Keep the provider behind a small adapter so the demo can use cached/sample data if network access is unavailable.
4. **Satellite signal:** Show a time series of a vegetation indicator (for example, NDVI) for each field using supplied sample observations or a documented imagery source. Do not imply raw imagery is processed if the demo only loads precomputed values.
5. **Yield estimate:** Produce a baseline estimate from crop history, field area, crop stage, weather, and vegetation observations. Show estimated tonnes, yield per hectare, key factors, and a confidence range. Label the model and its limitations.
6. **Market view:** Show recent prices for the selected crop and local market(s), including source and observation date. Compare a few transparent selling-window scenarios; avoid claiming precise future prices without a validated forecast.
7. **Actionable dashboard:** Put expected yield, estimate confidence, crop/weather risk, current market price, and the suggested next selling window on one field dashboard.
8. **Explainability:** Every recommendation should say which inputs moved it and offer a simple “what if” control, such as yield change or price change.

## Demo success criteria

- A judge can open a seeded farm, choose a field, and understand its crop, area, and planting stage without setup.
- The field page visibly combines crop history, weather, satellite indicator history, yield estimate, and market context.
- The selling recommendation includes a comparison, assumptions, source/date labels, and a reason in plain language.
- The demo works with deterministic seeded data and does not depend on live API credentials or network availability.
- No screen or README claims that sample data is live or that a baseline estimate is a validated prediction.

## Suggested architecture and mapping from the current repository

| Current area | Crop-platform target |
| --- | --- |
| `backend/app/models/pond.py` and related pond/feed models | Farm, Field, CropSeason, YieldObservation, SatelliteObservation, WeatherObservation, MarketPrice, Recommendation |
| `backend/app/api/ponds.py`, `readings.py`, `feed.py` | Farm/field, observation ingestion, yield estimate, market, and recommendation endpoints |
| `backend/app/core/growth.py`, `feed_calculator.py`, `scheduler.py` | A small, documented yield baseline and transparent selling-window comparison |
| `backend/simulator/` and `backend/seed_db.py` | Deterministic crop, weather, vegetation, yield, and market demo fixtures |
| `frontend/src/pages/` and `frontend/src/components/` | Farm dashboard, field detail, market comparison, and recommendation explanation |
| `frontend/src/api/client.ts` and `frontend/src/types/index.ts` | Typed crop-domain API calls and interfaces |
| Aquaculture tests in `backend/tests/` | Crop estimate, market comparison, API lifecycle, and deterministic demo-data coverage |

Keep the first demo deliberately small: one region, one or two crops, a handful of fields, and a few markets. Prefer traceable sample data and simple baselines over an opaque “AI” claim. Add external data integrations only when their source, access method, and demo fallback are clear.

## Proposed implementation order

1. Define crop-domain schemas and deterministic demo fixtures.
2. Add field and observation endpoints plus a yield baseline with visible uncertainty.
3. Replace the aquaculture frontend flow with a field dashboard and field detail view.
4. Add market comparison and an explainable selling-window recommendation.
5. Update tests, README setup instructions, screenshots, and the final demo script to describe the crop product accurately.

This document is a product requirements brief, not evidence that the implementation is complete. Track feature completion in the pull request description when implementation begins.
