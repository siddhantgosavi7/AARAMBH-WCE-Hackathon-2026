import React from 'react';
import { Droplets, Thermometer, AlertCircle, CheckCircle } from 'lucide-react';

interface TelemetryGaugeProps {
  type: 'do' | 'temp';
  value: number;
  species?: string;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({ type, value, species = 'tilapia' }) => {
  if (type === 'do') {
    // DO thresholds
    const isCritical = value < 3.0;
    const isWarning = value >= 3.0 && value < 5.0;
    const isOptimal = value >= 5.0;

    let badgeText = 'SAFE (DO ≥ 5.0)';
    let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let cardBg = 'bg-[#0a241f] border-emerald-800/50';
    let valueColor = 'text-emerald-300';
    let barColor = 'bg-emerald-400';

    if (isCritical) {
      badgeText = 'CRITICAL HYPOXIA (STOP FEED)';
      badgeColor = 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse';
      cardBg = 'bg-[#290d14] border-rose-700/60 shadow-lg shadow-rose-950/40';
      valueColor = 'text-rose-400';
      barColor = 'bg-rose-500';
    } else if (isWarning) {
      badgeText = 'CAUTION: LOW OXYGEN';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      cardBg = 'bg-[#26180a] border-amber-800/60';
      valueColor = 'text-amber-400';
      barColor = 'bg-amber-400';
    }

    const pct = Math.min(100, Math.max(0, (value / 8.0) * 100));

    return (
      <div className={`p-3.5 rounded-xl border transition-all ${cardBg}`}>
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dissolved Oxygen</span>
          </span>
          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className={`text-3xl font-extrabold font-mono tracking-tight ${valueColor}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-medium">mg/L</span>
        </div>

        {/* Gauge bar with target marker at 5.0 */}
        <div className="relative w-full bg-slate-900/90 rounded-full h-2 mt-2 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
          <span>0 mg/L</span>
          <span className="text-rose-400">3.0 (Min)</span>
          <span className="text-emerald-400">5.0 (Target)</span>
          <span>8.0+</span>
        </div>
      </div>
    );
  }

  // Water Temperature
  const isLethal = value >= 36.0 || value <= 14.0;
  const isStressed = (value > 31.0 && value < 36.0) || (value > 14.0 && value < 26.0);
  const isOptimal = value >= 26.0 && value <= 31.0;

  let badgeText = 'OPTIMAL (26-31°C)';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let cardBg = 'bg-[#0a241f] border-emerald-800/50';
  let valueColor = 'text-emerald-300';
  let barColor = 'bg-emerald-400';

  if (isLethal) {
    badgeText = 'LETHAL HEAT (>36°C)';
    badgeColor = 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse';
    cardBg = 'bg-[#290d14] border-rose-700/60 shadow-lg shadow-rose-950/40';
    valueColor = 'text-rose-400';
    barColor = 'bg-rose-500';
  } else if (isStressed) {
    badgeText = 'HEAT STRESS (FEED CUT)';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    cardBg = 'bg-[#26180a] border-amber-800/60';
    valueColor = 'text-amber-400';
    barColor = 'bg-amber-400';
  }

  const pct = Math.min(100, Math.max(0, ((value - 12) / 26) * 100));

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${cardBg}`}>
      <div className="flex items-center justify-between text-xs font-semibold mb-1">
        <span className="flex items-center space-x-1.5 text-slate-300">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>Water Temperature</span>
        </span>
        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      <div className="flex items-baseline space-x-1.5 my-1">
        <span className={`text-3xl font-extrabold font-mono tracking-tight ${valueColor}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-400 font-medium">°C</span>
      </div>

      <div className="relative w-full bg-slate-900/90 rounded-full h-2 mt-2 overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
        <span>12°C</span>
        <span className="text-emerald-400">28°C (Optimum)</span>
        <span className="text-rose-400">38°C</span>
      </div>
    </div>
  );
};
