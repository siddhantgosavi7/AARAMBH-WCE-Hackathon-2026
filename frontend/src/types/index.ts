export interface CropDashboard {
  generated_on: string;
  data_mode: string;
  farm: { name: string; location: string };
  summary: { fields: number; expected_harvest_tonnes: number; portfolio_value_inr: number; weather_risks: number };
  selected_field: {
    name: string; crop: string; variety: string; area_hectares: number; planting_date: string; harvest_window: string; crop_stage: string;
    satellite: { indicator: string; current: number; change_pct: number; status: string; series: number[] };
    yield: { estimate_tonnes: number; per_hectare: number; low_tonnes: number; high_tonnes: number; confidence_pct: number; drivers: string[] };
  };
  weather: { location: string; forecast: { day: string; condition: string; high_c: number; rain_mm: number }[]; risk: string };
  markets: { market: string; price: number; change_pct: number; distance_km: number; gross_value_inr: number }[];
  recommendation: { title: string; action: string; why: string; best_market: string; best_price_inr: number; estimated_value_inr: number; assumptions: string };
}
