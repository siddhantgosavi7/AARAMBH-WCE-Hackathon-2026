import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';

interface AlertBannerProps {
  alerts: Alert[];
  onResolve?: (id: number) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onResolve }) => {
  if (!alerts || alerts.length === 0) return null;

  // Show top 2 active alerts
  const displayAlerts = alerts.slice(0, 2);

  return (
    <div className="space-y-2 mb-6">
      {displayAlerts.map((alert) => {
        const isCritical = alert.severity === 'CRITICAL';
        const isWarning = alert.severity === 'WARNING';

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-lg ${
              isCritical
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-100 shadow-rose-950/40 animate-pulse'
                : isWarning
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-100 shadow-amber-950/30'
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-100'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`p-2 rounded-lg ${
                  isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {isCritical ? (
                  <AlertOctagon className="w-5 h-5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-black/40">
                    {alert.severity} • {alert.alert_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1 leading-snug">{alert.message}</p>
              </div>
            </div>

            {onResolve && (
              <button
                onClick={() => onResolve(alert.id)}
                className="ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
