import React from 'react';
import { Droplets, Thermometer } from 'lucide-react';

interface TelemetryGaugeProps {
  type: 'do' | 'temp';
  value: number;
  species?: string;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({ type, value, species = 'tilapia' }) => {
  if (type === 'do') {
    // DO: < 3.0 critical (red), 3.0-5.0 warning (amber), >= 5.0 optimal (cyan/emerald)
    const isCritical = value < 3.0;
    const isWarning = value >= 3.0 && value < 5.0;
    const isOptimal = value >= 5.0;

    const statusColor = isCritical
      ? 'text-rose-400 border-rose-500/40 bg-rose-950/30'
      : isWarning
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
      : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';

    const barColor = isCritical
      ? 'bg-rose-500 shadow-rose-500/50'
      : isWarning
      ? 'bg-amber-400 shadow-amber-400/50'
      : 'bg-cyan-400 shadow-cyan-400/50';

    const pct = Math.min(100, Math.max(0, (value / 8.0) * 100));

    return (
      <div className={`p-3.5 rounded-xl border backdrop-blur-md ${statusColor}`}>
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5 opacity-90">
          <span className="flex items-center space-x-1">
            <Droplets className="w-3.5 h-3.5" />
            <span>Dissolved Oxygen</span>
          </span>
          <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/40">
            {isCritical ? 'HYPOXIA CRASH' : isWarning ? 'LOW STRESS' : 'OPTIMAL'}
          </span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight">{value.toFixed(1)}</span>
          <span className="text-xs text-slate-400 font-medium">mg/L</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-900/80 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 shadow-sm ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // Temperature
  // < 15 cold, 26-31 optimal, 31-35 warm, > 35 extreme
  const isExtreme = value >= 35.0 || value <= 14.0;
  const isStressed = (value > 31.0 && value < 35.0) || (value > 14.0 && value < 26.0);

  const statusColor = isExtreme
    ? 'text-rose-400 border-rose-500/40 bg-rose-950/30'
    : isStressed
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';

  const barColor = isExtreme
    ? 'bg-rose-500 shadow-rose-500/50'
    : isStressed
    ? 'bg-amber-400 shadow-amber-400/50'
    : 'bg-emerald-400 shadow-emerald-400/50';

  const pct = Math.min(100, Math.max(0, ((value - 10) / 30) * 100));

  return (
    <div className={`p-3.5 rounded-xl border backdrop-blur-md ${statusColor}`}>
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5 opacity-90">
        <span className="flex items-center space-x-1">
          <Thermometer className="w-3.5 h-3.5" />
          <span>Water Temp</span>
        </span>
        <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/40">
          {isExtreme ? 'LETHAL HEAT' : isStressed ? 'THERMAL STRESS' : 'OPTIMAL'}
        </span>
      </div>
      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight">{value.toFixed(1)}</span>
        <span className="text-xs text-slate-400 font-medium">°C</span>
      </div>
      <div className="w-full bg-slate-900/80 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 shadow-sm ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
