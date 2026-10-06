import React from 'react';
import { Pond, Reading, Alert } from '../types';
import { StageBadge } from '../components/StageBadge';
import { TelemetryGauge } from '../components/TelemetryGauge';
import { Fish, Plus, Upload, ArrowRight, ShieldAlert, Scale, Clock, TrendingDown, DollarSign } from 'lucide-react';

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
  const totalBiomass = ponds.reduce((acc, p) => acc + p.biomass_kg, 0);
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.is_resolved).length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && !a.is_resolved).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Farm Overview Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Biomass */}
        <div className="farm-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span>Total Fish Biomass</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Active stock across {ponds.length} farm enclosures</p>
        </div>

        {/* Feeding Status */}
        <div className="farm-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-400 mb-1">
            <span>Feed Efficiency Ratio</span>
            <TrendingDown className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300 mt-1">
            1.38 <span className="text-xs text-slate-400 line-through">1.75</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-emerald-400 font-medium">21% less feed per kg of fish meat</p>
        </div>

        {/* Cost Savings */}
        <div className="farm-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
            <span>Feed Cost Saved</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
            ₹32,437
          </div>
          <p className="text-xs text-slate-400 mt-2">432.5 kg unneeded pellets withheld</p>
        </div>

        {/* Water Health Alerts */}
        <div className="farm-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Water Quality Safeguards</span>
            <ShieldAlert className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-3xl font-extrabold font-mono ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {criticalCount + warningCount}
            </span>
            <span className="text-xs text-slate-400">active alerts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {criticalCount > 0 ? (
              <span className="text-rose-400 font-bold">{criticalCount} CRITICAL: Low oxygen hypoxia!</span>
            ) : (
              <span className="text-emerald-400 font-semibold">All sensors in safe biological limits</span>
            )}
          </p>
        </div>
      </div>

      {/* Ponds Enclosures Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Fish className="w-5 h-5 text-emerald-400" />
            <span>Farm Pond Enclosures</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Select any pond to view feeding plan and hourly probe charts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ponds.map((pond) => {
            const latest = readingsMap[pond.id] || {
              temperature: 28.0,
              dissolved_oxygen: 5.5,
              ph: 7.5,
            };
            const pondAlerts = alerts.filter((a) => a.pond_id === pond.id && !a.is_resolved);
            const hasCritical = pondAlerts.some((a) => a.severity === 'CRITICAL');
            const hasWarning = pondAlerts.some((a) => a.severity === 'WARNING');

            let statusPill = {
              text: 'Normal Feeding (100%)',
              color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            };

            if (hasCritical || latest.dissolved_oxygen < 3.0) {
              statusPill = {
                text: '🔴 FEEDING SUSPENDED (0 kg)',
                color: 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse font-bold',
              };
            } else if (hasWarning || latest.temperature > 32.0 || latest.dissolved_oxygen < 5.0) {
              statusPill = {
                text: '🟡 Heat Throttled (-40%)',
                color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold',
              };
            }

            return (
              <div
                key={pond.id}
                onClick={() => onSelectPond(pond.id)}
                className={`farm-card rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:transform hover:-translate-y-1 relative flex flex-col justify-between ${
                  hasCritical ? 'border-rose-600/70 shadow-lg shadow-rose-950/40' : ''
                }`}
              >
                <div>
                  {/* Card Title & Stage */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300">
                        {pond.name}
                      </h3>
                      <p className="text-xs text-slate-400 capitalize">
                        {pond.species} • {pond.fish_count.toLocaleString()} fish • Area {pond.area_ha} ha
                      </p>
                    </div>
                    <StageBadge stage={pond.current_stage} />
                  </div>

                  {/* Feeding Action Status Pill */}
                  <div className="my-3">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs border ${statusPill.color}`}>
                      {statusPill.text}
                    </span>
                  </div>

                  {/* Tactile Sensor Gauges */}
                  <div className="grid grid-cols-2 gap-2.5 my-3">
                    <TelemetryGauge type="do" value={latest.dissolved_oxygen} species={pond.species} />
                    <TelemetryGauge type="temp" value={latest.temperature} species={pond.species} />
                  </div>

                  {/* Biomass Specs */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#081a17] border border-emerald-900/40 text-xs text-slate-400 my-2">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-500">Total Biomass</span>
                      <strong className="text-white font-mono text-sm">{pond.biomass_kg.toFixed(1)} kg</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-500">Average Weight</span>
                      <strong className="text-white font-mono text-sm">{pond.avg_weight_g.toFixed(1)} g</strong>
                    </div>
                  </div>

                  {/* Alert banner if active */}
                  {pondAlerts.length > 0 && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                        hasCritical
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-600/40'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-600/40'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="truncate">{pondAlerts[0].message}</span>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="mt-4 pt-3 border-t border-emerald-950/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>View Feed Plan & History</span>
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
