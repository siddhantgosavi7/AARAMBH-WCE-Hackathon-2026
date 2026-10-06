import React from 'react';
import { Pond, FeedPlan } from '../types';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ScheduleViewProps {
  ponds: Pond[];
  plansMap: Record<number, FeedPlan>;
  onSelectPond: (pondId: number) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ ponds, plansMap, onSelectPond }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 radial-glow">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1.5">
          <Calendar className="w-4 h-4" />
          <span>Circadian Meal Chronology</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Fleet Feeding Schedule</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-xl">
          Automated daylight meal distribution synchronized with natural photosynthesis cycles and species digestive windows.
        </p>
      </div>

      <div className="space-y-6">
        {ponds.map((pond) => {
          const plan = plansMap[pond.id];
          return (
            <div key={pond.id} className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <h2
                    onClick={() => onSelectPond(pond.id)}
                    className="text-lg font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {pond.name}
                  </h2>
                  <span className="text-xs text-slate-400 capitalize">
                    {pond.species} • {pond.current_stage} • Total Biomass: {pond.biomass_kg.toFixed(1)} kg
                  </span>
                </div>
                {plan && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Today</span>
                    <div className="text-base font-bold font-mono text-cyan-300">
                      {plan.adjusted_daily_feed_kg.toFixed(2)} kg
                    </div>
                  </div>
                )}
              </div>

              {plan && plan.meals && plan.meals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plan.meals.map((meal) => {
                    const isDone = meal.status === 'completed';
                    const isSkipped = meal.status === 'skipped';

                    return (
                      <div
                        key={meal.meal_number}
                        className={`p-4 rounded-xl border flex flex-col justify-between ${
                          isDone
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : isSkipped
                            ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-slate-400 uppercase">Meal #{meal.meal_number}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isSkipped
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              {meal.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 my-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <span className="text-xl font-bold font-mono text-white">{meal.scheduled_time}</span>
                            <span className="text-xs text-slate-400">({meal.planned_feed_kg.toFixed(2)} kg)</span>
                          </div>

                          <p className="text-xs text-slate-400 mt-2">{meal.why}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Awaiting sensor telemetry to compile feeding schedule.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
