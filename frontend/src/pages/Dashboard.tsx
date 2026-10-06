import React, { useState } from 'react';
import { Pond, Reading, Alert } from '../types';
import { StageBadge } from '../components/StageBadge';
import { TelemetryGauge } from '../components/TelemetryGauge';
import { Fish, Plus, Upload, ArrowRight, ShieldAlert, Sparkles, Scale, Clock } from 'lucide-react';

interface DashboardProps {
  ponds: Pond[];
  readingsMap: Record<number, Reading>;
  alerts: Alert[];
  onSelectPond: (pondId: number) => void;
  onOpenCreateModal: () => void;
  onUploadCsv: (file: File) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ponds,
  readingsMap,
  alerts,
  onSelectPond,
  onOpenCreateModal,
  onUploadCsv,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Aggregated fleet metrics
  const totalBiomass = ponds.reduce((acc, p) => acc + p.biomass_kg, 0);
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      onUploadCsv(e.target.files[0]);
      setTimeout(() => setIsUploading(false), 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Fleet Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 radial-glow border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Bioenergetic Optimization Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Aquaculture Fleet Command
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5 leading-relaxed">
              Real-time diurnal water quality telemetry modulating species growth models, reducing feed costs by 20%+,
              and preventing organic nitrogen dead zones.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            <label className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{isUploading ? 'Importing...' : 'Upload CSV'}</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Pond</span>
            </button>
          </div>
        </div>

        {/* Fleet KPI Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 font-medium">Monitored Ponds</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{ponds.length}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Active Biomass</span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-slate-400 font-normal">kg</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Stress Alerts</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {criticalCount + warningCount}
              </span>
              {criticalCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {criticalCount} CRITICAL
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Optimization Status</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-emerald-300">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ponds Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Fish className="w-5 h-5 text-cyan-400" />
            <span>Pond Enclosures</span>
          </h2>
          <span className="text-xs text-slate-400">Click any card to inspect bioenergetic telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ponds.map((pond) => {
            const latest = readingsMap[pond.id] || {
              temperature: 28.0,
              dissolved_oxygen: 5.5,
              ph: 7.5,
            };
            const pondAlerts = alerts.filter((a) => a.pond_id === pond.id && !a.is_resolved);
            const hasCritical = pondAlerts.some((a) => a.severity === 'CRITICAL');
            const hasWarning = pondAlerts.some((a) => a.severity === 'WARNING');

            // Determine border and card style based on alert severity
            const cardBorder = hasCritical
              ? 'border-rose-500/60 shadow-rose-900/30 shadow-xl'
              : hasWarning
              ? 'border-amber-500/50 shadow-amber-950/20 shadow-lg'
              : 'border-slate-800 hover:border-cyan-500/40 hover:shadow-cyan-950/30';

            return (
              <div
                key={pond.id}
                onClick={() => onSelectPond(pond.id)}
                className={`group rounded-2xl glass-panel p-5 border transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between ${cardBorder}`}
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    hasCritical
                      ? 'bg-rose-500 animate-pulse'
                      : hasWarning
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-400 to-teal-400'
                  }`}
                />

                <div>
                  {/* Pond Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                          {pond.name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 capitalize">
                        {pond.species} • {pond.fish_count.toLocaleString()} head
                      </span>
                    </div>
                    <StageBadge stage={pond.current_stage} />
                  </div>

                  {/* Telemetry Gauges */}
                  <div className="grid grid-cols-2 gap-2.5 my-4">
                    <TelemetryGauge type="do" value={latest.dissolved_oxygen} species={pond.species} />
                    <TelemetryGauge type="temp" value={latest.temperature} species={pond.species} />
                  </div>

                  {/* Stock Characteristics */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Scale className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Biomass: <strong className="text-slate-200 font-mono">{pond.biomass_kg.toFixed(1)} kg</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Avg: <strong className="text-slate-200 font-mono">{pond.avg_weight_g.toFixed(1)}g</strong></span>
                    </div>
                  </div>

                  {/* Alert notification preview if present */}
                  {pondAlerts.length > 0 && (
                    <div
                      className={`mt-3 p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                        hasCritical ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="truncate">{pondAlerts[0].message}</span>
                    </div>
                  )}
                </div>

                {/* Footer link */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:text-cyan-300">
                  <span>Inspect Bioenergetics</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
