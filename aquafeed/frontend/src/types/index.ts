export interface Pond {
  id: number;
  name: string;
  species: 'tilapia' | 'rohu' | 'shrimp' | string;
  fish_count: number;
  avg_weight_g: number;
  area_ha: number;
  stocking_date: string;
  survival_rate: number;
  current_stage: string;
  biomass_kg: number;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  id: number;
  pond_id: number;
  temperature: number;
  dissolved_oxygen: number;
  ph?: number | null;
  ammonia?: number | null;
  timestamp: string;
}

export interface FactorsBreakdown {
  temp_celsius: number;
  temp_factor: number;
  do_mg_l: number;
  do_factor: number;
  recent_crash_penalty: number;
  hunger_feedback_factor: number;
}

export interface FeedMeal {
  meal_number: number;
  scheduled_time: string;
  planned_feed_kg: number;
  status: 'pending' | 'completed' | 'skipped';
  why: string;
}

export interface FeedPlan {
  pond_id: number;
  pond_name: string;
  species: string;
  stage: string;
  biomass_kg: number;
  base_rate_pct: number;
  unadjusted_feed_kg: number;
  adjusted_daily_feed_kg: number;
  factors: FactorsBreakdown;
  explanation: string;
  meals: FeedMeal[];
  plan_date: string;
}

export interface Alert {
  id: number;
  pond_id: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  alert_type: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string | null;
}

export interface PondSavingsSummary {
  pond_id: number;
  pond_name: string;
  feed_saved_kg: number;
  cost_saved_inr: number;
  current_risk_score: number;
}

export interface SavingsReport {
  total_feed_saved_kg: number;
  total_cost_saved_inr: number;
  nitrogen_avoided_kg: number;
  phosphorus_avoided_kg: number;
  average_fcr: number;
  baseline_fcr: number;
  pollution_risk_score: number;
  ponds_summary: PondSavingsSummary[];
}

export interface SimulationStatus {
  is_running: boolean;
  current_scenario?: string;
  tick_interval_seconds: number;
  last_tick_at?: string;
  readings_generated: number;
}
