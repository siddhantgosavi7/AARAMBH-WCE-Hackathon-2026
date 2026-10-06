from app.core.crop_analytics import build_demo_dashboard


def test_crop_dashboard_has_explainable_market_recommendation():
    dashboard = build_demo_dashboard()

    assert dashboard["selected_field"]["yield"]["low_tonnes"] < dashboard["selected_field"]["yield"]["estimate_tonnes"]
    assert dashboard["recommendation"]["best_market"]
    assert len(dashboard["markets"]) >= 2
