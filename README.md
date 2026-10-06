# Crop Yield & Market Analytics Platform

Farmer-focused decision-support software that accepts a farmer's field details, fetches local weather when available, applies a transparent crop-yield baseline, and explains a selling decision from market history.

## What the demo does

- Saves crop, location, farm area, sowing date, and storage availability for the signed-in farmer.
- Uses Open-Meteo geocoding and forecast data for local temperature, rainfall, and humidity when the provider is reachable.
- Calculates expected yield per hectare and total production using a transparent historical-yield baseline.
- Calculates a `SELL NOW`, `WAIT`, or `MONITOR` decision from the bundled crop-specific market price history and storage time.
- Shows each source and limitation in the farmer dashboard.

Bundled crop and market histories are sample data for the hackathon prototype. Satellite imagery is **not connected**: no NDVI is displayed or used. The weather view states when live weather is unavailable instead of substituting invented values.

## Run with Docker

```powershell
cd D:\WCE
docker compose up --build
```

Open the dashboard at http://localhost:3000 and API documentation at http://localhost:8000/docs.

To stop the services:

```powershell
docker compose down
```

## Run locally

Start the API:

```powershell
cd D:\WCE\backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In a second terminal, start the web app:

```powershell
cd D:\WCE\frontend
npm install
npm run dev
```

Open the Vite address printed in the terminal, normally http://localhost:5173.

## Login and analysis API

The app creates demo accounts at startup:

- Farmer: `farmer` / `farmer123`
- Admin: `admin` / `admin123`

Farmer flow:

1. `POST /api/auth/token` — sign in.
2. `POST /api/crop-analytics/analyze` — submit crop, farm location, area, sowing date, and storage days. Requires a bearer token.
3. `GET /api/crop-analytics/latest` — retrieve the signed-in farmer's latest saved result. Requires a bearer token.

## Structure

```
backend/app/api/crop_analytics.py       Authenticated farm-analysis endpoints
backend/app/core/crop_analytics.py      Transparent yield and selling baseline
backend/app/services/weather.py          Open-Meteo weather adapter
backend/app/data/                        Labelled bundled sample crop and market history
backend/app/db/models.py                 User, Farm, and AnalysisRun persistence
backend/tests/test_crop_analytics.py    Calculation and input checks
frontend/src/pages/CropDashboard.tsx    Farmer input and analysis dashboard
frontend/src/api/client.ts               Typed API client
frontend/src/types/index.ts              Dashboard type definitions
docs/CROP_YIELD_MARKET_ANALYTICS_PRD.md Product requirements and delivery plan
```

## Product scope

See [the requirements audit](docs/REQUIREMENTS_AUDIT.md) for implemented features, source evidence, mock-data disclosures, and remaining limitations.
