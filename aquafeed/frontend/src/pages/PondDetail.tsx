import React, { useState } from 'react';
import { Pond, Reading, FeedPlan } from '../types';
import { StageBadge } from '../components/StageBadge';
import { TelemetryGauge } from '../components/TelemetryGauge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  AlertTriangle,
  Send,
  Droplets,
  Flame,
} from 'lucide-react';

interface PondDetailProps {
  pond: Pond;
  readings: Reading[];
  feedPlan: FeedPlan | null;
  onBack: () => void;
  onLogMeal: (mealNumber: number, feedGivenKg: number, response: string, leftoverPct: number) => void;
  onAddManualReading: (reading: { temperature: number; dissolved_oxygen: number; ph?: number }) => void;
}

export const PondDetail: React.FC<PondDetailProps> = ({
  pond,
  readings,
  feedPlan,
  onBack,
  onLogMeal,
  onAddManualReading,
}) => {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [feedGiven, setFeedGiven] = useState<number>(0);
  const [feedResponse, setFeedResponse] = useState<string>('eaten_fully');
  const [leftoverPct, setLeftoverPct] = useState<number>(0);

  // Manual reading state
  const [manualTemp, setManualTemp] = useState<number>(28.5);
  const [manualDO, setManualDO] = useState<number>(5.5);

  const latestReading = readings[readings.length - 1] || {
    temperature: 28.5,
    dissolved_oxygen: 5.8,
  };

  // Format data for Recharts
  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    dissolved_oxygen: r.dissolved_oxygen,
  }));

  const handleOpenLogModal = (mealNumber: number, plannedKg: number) => {
    setSelectedMeal(mealNumber);
    setFeedGiven(plannedKg);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeal !== null) {
      onLogMeal(selectedMeal, Number(feedGiven), feedResponse, Number(leftoverPct));
      setSelectedMeal(null);
    }
  };

  const handleManualReadingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddManualReading({
      temperature: Number(manualTemp),
      dissolved_oxygen: Number(manualDO),
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Fleet Overview</span>
        </button>
        <span className="text-xs font-mono text-slate-500">Pond ID: #{pond.id}</span>
      </div>

      {/* Header Profile Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/30 radial-glow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{pond.name}</h1>
              <StageBadge stage={pond.current_stage} />
            </div>
            <p className="text-slate-400 text-sm">
              <strong className="text-cyan-300 uppercase">{pond.species}</strong> cohort • Stocked on{' '}
              {pond.stocking_date} • Area: {pond.area_ha} ha • Survival rate: {(pond.survival_rate * 100).toFixed(0)}%
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Head Count</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{pond.fish_count.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Mean Weight</span>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">{pond.avg_weight_g.toFixed(1)} g</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Active Biomass</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{pond.biomass_kg.toFixed(1)} kg</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Target FCR</span>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">1.40</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Water Quality Time Series Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span>Diurnal Limnological Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              24-hour sinusoidal solar & respiration cycles for Dissolved Oxygen and Water Temperature.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" />
              <span>Dissolved Oxygen (mg/L)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-3 h-1 bg-amber-400 rounded-full" />
              <span>Temperature (°C)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="do" domain={[0, 10]} stroke="#06b6d4" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="temp" orientation="right" domain={[10, 40]} stroke="#f59e0b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a192f',
                  borderColor: '#0284c7',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <ReferenceLine yAxisId="do" y={3.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Hypoxia Halt (3.0 mg/L)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine yAxisId="do" y={5.0} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Optimal DO (5.0 mg/L)', fill: '#10b981', fontSize: 10 }} />
              <Line yAxisId="do" type="monotone" dataKey="dissolved_oxygen" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feeding Optimization Engine & Explainability Panel */}
      {feedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Feed Card */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Today's Modulated Allowance</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {feedPlan.adjusted_daily_feed_kg.toFixed(2)}
                </span>
                <span className="text-slate-400 text-sm font-semibold">kg / day</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Nominal Static Baseline:</span>
                  <span className="font-mono text-slate-200 line-through">
                    {feedPlan.unadjusted_feed_kg.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Rate for Stage ({feedPlan.stage}):</span>
                  <span className="font-mono text-slate-200">{feedPlan.base_rate_pct.toFixed(1)}% body wt</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Feed Saved vs Baseline:</span>
                  <span className="font-mono">
                    {Math.max(0, feedPlan.unadjusted_feed_kg - feedPlan.adjusted_daily_feed_kg).toFixed(2)} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Current Water Gauges */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
              <TelemetryGauge type="do" value={feedPlan.factors.do_mg_l} species={pond.species} />
              <TelemetryGauge type="temp" value={feedPlan.factors.temp_celsius} species={pond.species} />
            </div>
          </div>

          {/* Explainability Breakdown Panel */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-cyan-500/20">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Bioenergetic Explainability ("Why this amount?")</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Audit trail showing how biological and thermal factors modulate the nominal feed ration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Temp Factor</span>
                <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                  {(feedPlan.factors.temp_factor * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">{feedPlan.factors.temp_celsius.toFixed(1)}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">DO Factor</span>
                <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                  {(feedPlan.factors.do_factor * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">{feedPlan.factors.do_mg_l.toFixed(1)} mg/L</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Crash Buffer</span>
                <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                  {(feedPlan.factors.recent_crash_penalty * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">24h history</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Appetite Multiplier</span>
                <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                  {(feedPlan.factors.hunger_feedback_factor * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">Prior meal feedback</span>
              </div>
            </div>

            {/* Rationale explanation quote */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-100 leading-relaxed">
              <strong className="text-cyan-300 font-semibold block mb-1">Algorithmic Decision Rationale:</strong>
              {feedPlan.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Circadian Meal Schedule Timeline */}
      {feedPlan && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Today's Meal Distribution Schedule</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ration partitioned into diurnal windows, avoiding pre-dawn oxygen minimums.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedPlan.meals.map((meal) => {
              const isCompleted = meal.status === 'completed';
              const isSkipped = meal.status === 'skipped';

              return (
                <div
                  key={meal.meal_number}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-200'
                      : isSkipped
                      ? 'bg-rose-950/30 border-rose-500/30 text-slate-300 opacity-80'
                      : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/30 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Meal #{meal.meal_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSkipped
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {meal.status}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2 my-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xl font-bold font-mono text-white">{meal.scheduled_time}</span>
                    <span className="text-slate-400 text-xs">({meal.planned_feed_kg.toFixed(2)} kg)</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{meal.why}</p>

                  {!isCompleted && !isSkipped && (
                    <button
                      onClick={() => handleOpenLogModal(meal.meal_number, meal.planned_feed_kg)}
                      className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Log Feeding & Feedback</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Reading Injection Form for Testing / Demo */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-2 mb-3">
          <Send className="w-4 h-4 text-teal-400" />
          <span>Manual Probe Reading Input (Live Field Override)</span>
        </h3>
        <form onSubmit={handleManualReadingSubmit} className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Water Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={manualTemp}
              onChange={(e) => setManualTemp(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono w-28"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Dissolved Oxygen (mg/L)</label>
            <input
              type="number"
              step="0.1"
              value={manualDO}
              onChange={(e) => setManualDO(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono w-28"
            />
          </div>
          <button
            type="submit"
            className="self-end px-4 py-1.5 rounded-lg font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors cursor-pointer"
          >
            Submit Reading
          </button>
        </form>
      </div>

      {/* Feed Log Modal */}
      {selectedMeal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-6 border border-cyan-500/30">
            <h3 className="text-base font-bold text-white mb-4">
              Log Meal #{selectedMeal} Appetite Feedback
            </h3>
            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Feed Given (kg)</label>
                <input
                  type="number"
                  step="0.05"
                  value={feedGiven}
                  onChange={(e) => setFeedGiven(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Fish Appetite Response</label>
                <select
                  value={feedResponse}
                  onChange={(e) => setFeedResponse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="eaten_fully">Eaten fully & vigorously (0% leftovers)</option>
                  <option value="normal">Normal intake (minor leftovers &lt; 5%)</option>
                  <option value="leftovers">Uneaten pellets floating (15-30% leftovers)</option>
                  <option value="refused">Refused feeding / lethargic (&gt; 40% leftovers)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Leftover Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={leftoverPct}
                  onChange={(e) => setLeftoverPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedMeal(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
