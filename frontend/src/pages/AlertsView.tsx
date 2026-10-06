import React, { useState } from 'react';
import { Alert, Pond } from '../types';
import { ShieldAlert, AlertOctagon, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  ponds: Pond[];
  onResolveAlert: (id: number) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, ponds, onResolveAlert }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const pondMap = Object.fromEntries(ponds.map((p) => [p.id, p.name]));

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'critical') return a.severity === 'CRITICAL';
    if (filterSeverity === 'warning') return a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 radial-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-widest mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Limnological Safeguards</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Environmental Risk Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time notifications triggered when ambient temperature, dissolved oxygen, or pollution indices breach biological thresholds.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Severities ({alerts.length})</option>
            <option value="critical">Critical Hypoxia / Lethal Heat</option>
            <option value="warning">Suboptimal Warnings</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-white">All Clear</h3>
            <p className="text-slate-400 text-sm mt-1">No active limnological threshold violations detected across monitored ponds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCritical
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-100 shadow-lg shadow-rose-950/30'
                    : isWarning
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-100 shadow-md shadow-amber-950/20'
                    : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isCritical ? <AlertOctagon className="w-6 h-6 animate-bounce" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-black/50">
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-xs text-cyan-300">
                        {pondMap[alert.pond_id] || `Pond #${alert.pond_id}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-white">{alert.alert_type.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">{alert.message}</p>
                  </div>
                </div>

                {!alert.is_resolved && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Acknowledge & Resolve</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
