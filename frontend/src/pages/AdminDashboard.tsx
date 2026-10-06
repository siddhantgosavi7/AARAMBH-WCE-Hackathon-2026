import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Settings, Bell, LogOut,
  Sprout, TrendingUp, Droplets, Wind, AlertTriangle,
  CheckCircle, Activity, Database, ChevronRight,
  MapPin, Shield, BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AdminTab = 'overview' | 'farmers' | 'system' | 'alerts';

const DEMO_FARMERS = [
  { id: 1, name: 'Ramesh Patil', farm: 'Patil Family Farm', location: 'Wardha, Maharashtra', fields: 3, status: 'active', yield: '41.8 t' },
  { id: 2, name: 'Sunita Deshmukh', farm: 'Deshmukh Agro', location: 'Nagpur, Maharashtra', fields: 2, status: 'active', yield: '28.4 t' },
  { id: 3, name: 'Manoj Kumar', farm: 'Green Valley Farm', location: 'Amravati, Maharashtra', fields: 5, status: 'inactive', yield: '—' },
  { id: 4, name: 'Priya Waghmare', farm: 'Waghmare Sheti', location: 'Yavatmal, Maharashtra', fields: 1, status: 'active', yield: '12.1 t' },
];

const DEMO_ALERTS = [
  { id: 1, type: 'warning', farm: 'Deshmukh Agro', msg: 'Heavy rain forecast Thursday — drainage risk', time: '2h ago' },
  { id: 2, type: 'info', farm: 'Patil Family Farm', msg: 'Harvest window opens in 19 days', time: '4h ago' },
  { id: 3, type: 'error', farm: 'Green Valley Farm', msg: 'Sensor offline — no data received for 48h', time: '1d ago' },
  { id: 4, type: 'success', farm: 'Waghmare Sheti', msg: 'Crop health improved — NDVI +8.3% this week', time: '1d ago' },
];

const adminNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'farmers', label: 'Farmers', icon: Users },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'system', label: 'System', icon: Settings },
] as const;

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-[#07100f] text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-72 lg:min-h-screen bg-[#0a1512] border-b lg:border-b-0 lg:border-r border-emerald-900/40 shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-5 lg:p-6 border-b border-emerald-900/40 flex lg:block items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 grid place-items-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-white leading-tight">KisanMitra</p>
            <p className="text-[11px] text-amber-400">Admin Control Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 flex lg:block overflow-x-auto gap-1 lg:space-y-1 flex-1" aria-label="Admin navigation">
          {adminNavItems.map(({ id, label, icon: Icon }) => {
            const active = id === activeTab;
            return (
              <button
                key={id}
                id={`admin-nav-${id}`}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`min-w-32 lg:w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                  ${active
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-emerald-950/50 hover:text-white border border-transparent'}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-sm">{label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User badge */}
        <div className="hidden lg:block p-4 border-t border-emerald-900/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/20">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 grid place-items-center">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name ?? user?.username}</p>
              <p className="text-[11px] text-amber-400">Administrator</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors" title="Log out" aria-label="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-7">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.16em]">Admin Panel</p>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                {adminNavItems.find((i) => i.id === activeTab)?.label}
              </h1>
            </div>
            <button
              onClick={logout}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-950/30 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </header>

          <div className="mb-5 rounded-xl border border-amber-500/25 bg-amber-950/25 p-3 text-sm text-amber-100">
            Demo administrator view: farmer counts, alerts, and crop-health figures on this screen are sample data and are not connected to the analysis database.
          </div>

          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'farmers' && <AdminFarmers />}
          {activeTab === 'alerts' && <AdminAlerts />}
          {activeTab === 'system' && <AdminSystem />}
        </div>
      </main>
    </div>
  );
};

// ── Overview ───────────────────────────────────────────────────────────────
const AdminOverview: React.FC = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Farmers', value: '4', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Active Fields', value: '11', icon: MapPin, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
        { label: 'Harvest this month', value: '82.3 t', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { label: 'Open Alerts', value: '3', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`rounded-2xl p-5 border ${bg} bg-[#0d201c]/60`}>
          <div className={`w-9 h-9 rounded-xl grid place-items-center mb-3 ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
      ))}
    </div>

    {/* System health */}
    <div className="rounded-2xl bg-[#0d201c]/60 border border-emerald-900/30 p-6">
      <h2 className="font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-400" /> System Health
      </h2>
      <div className="space-y-3">
        {[
          { label: 'API Server', status: 'Online', ok: true },
          { label: 'Database', status: 'Connected', ok: true },
          { label: 'Scheduler', status: 'Running', ok: true },
          { label: 'Sensor Simulator', status: 'Active', ok: true },
        ].map(({ label, status, ok }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-sm text-slate-300">{label}</span>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Mini charts row */}
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { label: 'Avg NDVI (all farms)', value: '0.68', sub: '+4.2% this week', icon: Sprout },
        { label: 'Avg Rain forecast', value: '31 mm', sub: 'Next 4 days', icon: Droplets },
        { label: 'Avg Temperature', value: '29°C', sub: 'Regional avg', icon: Wind },
      ].map(({ label, value, sub, icon: Icon }) => (
        <div key={label} className="rounded-2xl bg-[#0d201c]/60 border border-emerald-900/30 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
              <p className="text-xs text-emerald-300 mt-1">{sub}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
              <Icon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Farmers ────────────────────────────────────────────────────────────────
const AdminFarmers: React.FC = () => (
  <div className="space-y-5">
    <div className="rounded-2xl bg-[#0d201c]/60 border border-emerald-900/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
              <th className="px-5 py-4">Farmer</th>
              <th className="px-5 py-4">Farm / Location</th>
              <th className="px-5 py-4 text-center">Fields</th>
              <th className="px-5 py-4 text-right">Est. Yield</th>
              <th className="px-5 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_FARMERS.map((f) => (
              <tr key={f.id} className="border-b border-slate-800/60 hover:bg-emerald-950/20 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 grid place-items-center text-emerald-400 font-bold text-xs">
                      {f.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-white">{f.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium">{f.farm}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{f.location}</p>
                </td>
                <td className="px-5 py-4 text-center text-slate-300">{f.fields}</td>
                <td className="px-5 py-4 text-right font-bold text-amber-300">{f.yield}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                    ${f.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="rounded-xl bg-amber-950/20 border border-amber-800/20 p-4 text-xs text-amber-200">
      Demo data — real user management (invite, deactivate, role reassignment) is in the Phase 2 roadmap.
    </div>
  </div>
);

// ── Alerts ─────────────────────────────────────────────────────────────────
const AdminAlerts: React.FC = () => {
  const iconMap = {
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
    error: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25' },
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
    info: { icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/25' },
  };

  return (
    <div className="space-y-3">
      {DEMO_ALERTS.map((a) => {
        const { icon: Icon, color, bg } = iconMap[a.type as keyof typeof iconMap];
        return (
          <div key={a.id} className={`rounded-2xl border p-5 ${bg} flex items-start gap-4`}>
            <div className={`w-9 h-9 rounded-xl ${bg} grid place-items-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold uppercase tracking-wider ${color}`}>{a.type}</p>
              <p className="font-semibold text-white mt-1">{a.msg}</p>
              <p className="text-xs text-slate-400 mt-1">{a.farm} · {a.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── System ─────────────────────────────────────────────────────────────────
const AdminSystem: React.FC = () => (
  <div className="space-y-5">
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { label: 'Backend Version', value: '1.0.0', icon: BarChart2 },
        { label: 'Database', value: 'SQLite (Dev)', icon: Database },
        { label: 'Auth Method', value: 'JWT / HS256', icon: Shield },
        { label: 'Environment', value: 'Development', icon: Settings },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl bg-[#0d201c]/60 border border-emerald-900/30 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="font-bold text-white mt-0.5">{value}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="rounded-2xl bg-[#0d201c]/60 border border-emerald-900/30 p-6">
      <h2 className="font-bold mb-3">Demo Credentials</h2>
      <div className="space-y-2 text-sm font-mono">
        <div className="flex gap-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/20">
          <span className="text-emerald-300">Farmer</span>
          <span className="text-slate-300">username: <strong>farmer</strong> · password: <strong>farmer123</strong></span>
        </div>
        <div className="flex gap-6 p-3 rounded-xl bg-amber-950/30 border border-amber-800/20">
          <span className="text-amber-300">Admin&nbsp;&nbsp;</span>
          <span className="text-slate-300">username: <strong>admin</strong>&nbsp;&nbsp;· password: <strong>admin123</strong></span>
        </div>
      </div>
    </div>
  </div>
);
