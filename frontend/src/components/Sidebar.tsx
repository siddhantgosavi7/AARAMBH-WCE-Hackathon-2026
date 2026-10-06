import React from 'react';
import {
  Fish,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Sliders,
  RefreshCw,
  Droplets,
  Layers,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { SimulationStatus } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadAlertsCount: number;
  simStatus?: SimulationStatus;
  onScenarioChange?: (scenario: string) => void;
  onManualTick?: () => void;
  isTicking?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  unreadAlertsCount,
  simStatus,
  onScenarioChange,
  onManualTick,
  isTicking,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Ponds & Fish Stock',
      sublabel: 'Live water & biomass',
      icon: Fish,
      badge: null,
    },
    {
      id: 'schedule',
      label: 'Feeding Timeline',
      sublabel: 'Daylight meal windows',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'alerts',
      label: 'Water Quality Alerts',
      sublabel: 'DO & temperature limits',
      icon: AlertTriangle,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeDanger: true,
    },
    {
      id: 'reports',
      label: 'Feed Saved & ROI',
      sublabel: '₹ Saved & UN SDGs',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'simulator',
      label: 'What-If Feed Tool',
      sublabel: 'Simulate DO & heat',
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside className="w-72 bg-[#091b18] border-r border-emerald-900/40 flex flex-col justify-between shrink-0 min-h-screen text-slate-200">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/60 font-black">
              <Fish className="w-6 h-6 text-white transform -rotate-12" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">AquaFeed</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium">Precision Aquaculture System</p>
            </div>
          </div>

          {/* Active Farm Location Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-[#0e2722] border border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-none">Delta Station #1</div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">3 Enclosures Active</div>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 opacity-80" />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60 font-mono">
            Farm Operations
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-800/20 text-white border border-emerald-500/40 shadow-sm shadow-emerald-950/50'
                    : 'text-slate-300 hover:text-white hover:bg-[#0f2824] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-[#122e29] text-emerald-400 group-hover:text-emerald-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold tracking-tight leading-tight">{item.label}</div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge !== null ? (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold font-mono animate-bounce ${
                      item.badgeDanger ? 'bg-rose-500 text-white shadow-sm shadow-rose-950' : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 text-emerald-400/60 transition-transform ${
                      isActive ? 'opacity-100 translate-x-0.5 text-emerald-300' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Sensor Simulator & SDG Footer */}
      <div className="p-3 border-t border-emerald-950/80 space-y-3">
        {/* Farm Simulation & Testing Card */}
        <div className="p-3.5 rounded-xl bg-[#0a231f] border border-emerald-800/40 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[11px] text-emerald-300 flex items-center space-x-1.5 uppercase tracking-wide">
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
              <span>Water Sensor Stream</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </div>

          <label className="text-[10px] text-slate-400 block mb-1">Weather / Water State:</label>
          <select
            value={simStatus?.current_scenario || 'normal'}
            onChange={(e) => onScenarioChange && onScenarioChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#071714] border border-emerald-800/60 text-emerald-200 font-medium text-xs focus:outline-none focus:border-emerald-400 cursor-pointer mb-2"
          >
            <option value="normal">☀️ Normal (Healthy Sun & DO)</option>
            <option value="heat_wave">🌡️ Heat Wave (34°C+ Water)</option>
            <option value="algal_bloom">🌿 Algal Bloom (DO Swing)</option>
            <option value="do_crash">⚠️ Nocturnal DO Crash (&lt;2.5)</option>
          </select>

          {onManualTick && (
            <button
              onClick={onManualTick}
              disabled={isTicking}
              className="w-full py-1.5 px-2 rounded-lg bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-300 hover:text-white border border-emerald-700/50 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTicking ? 'animate-spin text-emerald-300' : ''}`} />
              <span>Simulate Next Water Reading</span>
            </button>
          )}
        </div>

        {/* UN Sustainable Development Goals */}
        <div className="px-2 py-1 text-center">
          <div className="text-[10px] text-slate-400 font-mono mb-1.5">Aligned with UN SDG Goals</div>
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold">
            <span className="py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20" title="SDG 2: Zero Hunger">
              SDG 2
            </span>
            <span className="py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" title="SDG 6: Clean Water">
              SDG 6
            </span>
            <span className="py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="SDG 12: Responsible Consumption">
              SDG 12
            </span>
            <span className="py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20" title="SDG 14: Life Below Water">
              SDG 14
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
