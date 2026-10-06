import React from 'react';
import { Waves, Bell, Calendar, BarChart3, Sliders, RefreshCw, Activity } from 'lucide-react';
import { SimulationStatus } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadAlertsCount: number;
  simStatus?: SimulationStatus;
  onScenarioChange?: (scenario: string) => void;
  onManualTick?: () => void;
  isTicking?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  unreadAlertsCount,
  simStatus,
  onScenarioChange,
  onManualTick,
  isTicking,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & SDG Badges */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                <Waves className="w-5 h-5 font-black" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  AquaFeed
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-1.5 uppercase tracking-widest hidden sm:inline">
                  Optimizer
                </span>
              </div>
            </button>

            {/* UN SDG Badges */}
            <div className="hidden lg:flex items-center space-x-1.5 pl-4 border-l border-slate-800 text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20" title="SDG 2: Zero Hunger">
                SDG 2
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" title="SDG 6: Clean Water">
                SDG 6
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="SDG 12: Responsible Consumption">
                SDG 12
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20" title="SDG 14: Life Below Water">
                SDG 14
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'schedule'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => setCurrentTab('alerts')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'alerts'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'reports'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setCurrentTab('simulator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'simulator'
                  ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/20'
                  : 'text-teal-400 hover:text-teal-200 hover:bg-teal-950/40'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">What-If</span>
              <span>Simulator</span>
            </button>
          </nav>

          {/* Telemetry Simulator Controls in Header */}
          <div className="hidden xl:flex items-center space-x-2.5 pl-3 border-l border-slate-800">
            {simStatus && (
              <div className="flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1">
                <span className={`w-2 h-2 rounded-full ${simStatus.is_running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-slate-400 font-mono">Stream:</span>
                <select
                  value={simStatus.current_scenario || 'normal'}
                  onChange={(e) => onScenarioChange && onScenarioChange(e.target.value)}
                  className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="normal" className="bg-slate-900 text-white">Normal Diurnal</option>
                  <option value="heat_wave" className="bg-slate-900 text-white">Heat Wave (34°C+)</option>
                  <option value="algal_bloom" className="bg-slate-900 text-white">Algal Bloom</option>
                  <option value="do_crash" className="bg-slate-900 text-white">DO Crash (&lt;2.5 mg/L)</option>
                </select>
              </div>
            )}

            {onManualTick && (
              <button
                onClick={onManualTick}
                disabled={isTicking}
                title="Force generate live sensor reading across ponds"
                className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isTicking ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
