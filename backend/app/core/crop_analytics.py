from datetime import date, timedelta


def build_demo_dashboard() -> dict:
    """Return a deterministic, explainable crop analytics demo payload."""
    today = date.today()
    expected_yield_tonnes = 18.4
    markets = [
        {"market": "Nagpur APMC", "price": 2425, "change_pct": 4.8, "distance_km": 38},
        {"market": "Wardha APMC", "price": 2350, "change_pct": 1.7, "distance_km": 19},
        {"market": "Amravati APMC", "price": 2490, "change_pct": 5.4, "distance_km": 92},
    ]
    gross_values = [round(expected_yield_tonnes * market["price"]) for market in markets]

    return {
        "generated_on": today.isoformat(),
        "data_mode": "Seeded demo data — replace with verified field, weather, satellite, and mandi feeds before production.",
        "farm": {"name": "Patil Family Farm", "location": "Wardha, Maharashtra"},
        "summary": {
            "fields": 3,
            "expected_harvest_tonnes": 41.8,
            "portfolio_value_inr": 101365,
            "weather_risks": 1,
        },
        "selected_field": {
            "id": 1,
            "name": "North Field",
            "crop": "Soybean",
            "variety": "JS 335",
            "area_hectares": 4.2,
            "planting_date": (today - timedelta(days=82)).isoformat(),
            "harvest_window": f"{(today + timedelta(days=19)).strftime('%d %b')} – {(today + timedelta(days=29)).strftime('%d %b')}",
            "crop_stage": "Pod filling",
            "satellite": {
                "indicator": "NDVI",
                "current": 0.72,
                "change_pct": 6.1,
                "status": "Healthy canopy",
                "series": [0.34, 0.42, 0.51, 0.59, 0.66, 0.68, 0.72],
            },
            "yield": {
                "estimate_tonnes": expected_yield_tonnes,
                "per_hectare": 4.38,
                "low_tonnes": 16.7,
                "high_tonnes": 20.1,
                "confidence_pct": 78,
                "drivers": [
                    "Vegetation health is 6.1% above last week.",
                    "Rain forecast supports pod filling; monitor drainage after Thursday.",
                    "Historical yield for this field averages 4.1 t/ha.",
                ],
            },
        },
        "weather": {
            "location": "Wardha, Maharashtra",
            "forecast": [
                {"day": "Today", "condition": "Partly cloudy", "high_c": 31, "rain_mm": 1},
                {"day": "Wed", "condition": "Light rain", "high_c": 29, "rain_mm": 6},
                {"day": "Thu", "condition": "Heavy rain", "high_c": 27, "rain_mm": 24},
                {"day": "Fri", "condition": "Sunny", "high_c": 30, "rain_mm": 0},
            ],
            "risk": "Heavy rain is expected Thursday. Inspect drainage and avoid field operations that day.",
        },
        "markets": [
            {**market, "gross_value_inr": gross_value}
            for market, gross_value in zip(markets, gross_values)
        ],
        "recommendation": {
            "title": "Stage sales across two market windows",
            "action": "Sell 40% at Nagpur APMC during the harvest window; monitor Amravati prices for the remaining 60%.",
            "why": "Nagpur offers a strong nearby price and positive trend. Amravati has the highest quoted price, but its distance adds transport risk.",
            "best_market": "Nagpur APMC",
            "best_price_inr": 2425,
            "estimated_value_inr": round(expected_yield_tonnes * 2425),
            "assumptions": "Estimate uses seeded NDVI, forecast, historical yield, and market observations. Prices and yields are not guaranteed.",
        },
    }
