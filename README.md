# Crop Yield & Market Analytics Platform

Farmer-focused decision-support software that brings together field history, satellite crop-health observations, local weather, and mandi price comparisons. It estimates crop yield and explains a practical selling recommendation for a selected field.

## What the demo does

- Shows a farmer's portfolio summary: monitored fields, expected harvest, estimated value, and weather risks.
- Shows a field's crop, area, growing stage, satellite NDVI trend, and harvest window.
- Gives an explainable yield estimate with a range and confidence score.
- Shows a short local weather forecast and an operational risk.
- Compares commodity prices, price trends, distance, and estimated gross value across nearby mandis.
- Recommends a selling strategy and explains the assumptions behind it.

The initial dashboard uses deterministic seeded demo data so it can run reliably without network access or API credentials. Every screen labels that limitation. The next integration step is to replace those fixtures with verified weather, satellite, field-history, and mandi-price sources.

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

## Main endpoint

`GET /api/crop-analytics/dashboard` returns the data used by the dashboard, including field details, crop-health observations, weather outlook, market comparisons, and the selling recommendation.

## Structure

```
backend/app/api/crop_analytics.py       Crop dashboard API endpoint
backend/app/core/crop_analytics.py      Explainable deterministic demo data and recommendation
backend/tests/test_crop_analytics.py    Dashboard data checks
frontend/src/pages/CropDashboard.tsx    Farmer-facing dashboard
frontend/src/api/client.ts               Typed API client
frontend/src/types/index.ts              Dashboard type definitions
docs/CROP_YIELD_MARKET_ANALYTICS_PRD.md Product requirements and delivery plan
```

## Product scope

See [the product brief](docs/CROP_YIELD_MARKET_ANALYTICS_PRD.md) for the full MVP, data-source plan, and demo criteria.
