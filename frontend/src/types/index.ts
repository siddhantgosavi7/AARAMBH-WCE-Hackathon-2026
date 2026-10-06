export type UserRole = 'admin' | 'farmer';

export interface LoginResponse { access_token: string; token_type: string; role: UserRole; username: string; full_name: string | null; }
export interface AuthUser { username: string; role: UserRole; full_name: string | null; token: string; }

export interface FarmInput { farm_name: string; field_name: string; location: string; crop: 'wheat' | 'soybean'; area_acres: number; sowing_date: string; storage_days: number; }

export interface CropAnalysis {
  data_mode: string;
  farm: { id: number; name: string; location: string; crop: string; area_acres: number; sowing_date: string; storage_days: number };
  weather: { status: 'live' | 'unavailable'; source: string; location?: string; error?: string; current?: { temperature_2m?: number; relative_humidity_2m?: number }; forecast: { date: string; condition: string; high_c: number; low_c: number; rain_mm: number; humidity_pct: number }[] };
  satellite: { status: string; message: string };
  historical_crop_data: { source: string; unit: string; observations: number[]; average_yield_per_hectare: number };
  yield_prediction: { method: string; unit: string; yield_per_hectare: number; expected_production_tonnes: number; low_production_tonnes: number; high_production_tonnes: number; confidence_pct: number; inputs_used: string[]; limitations: string };
  market: { source: string; market: string; unit: string; current_price_inr_per_quintal: number; recent_average_inr_per_quintal: number; trend_pct: number; history: number[] };
  recommendation: { decision: 'SELL NOW' | 'WAIT' | 'MONITOR'; reason: string; current_price_inr_per_quintal: number; recent_average_inr_per_quintal: number; trend_pct: number; estimated_gross_value_inr: number; explanation: string };
}
