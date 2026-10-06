import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BarChart3, CloudRain, LayoutDashboard, Leaf, LogOut, MapPin, Sprout, TrendingUp, Wheat } from 'lucide-react';

type Tab = 'overview' | 'field' | 'health' | 'weather' | 'market' | 'advice';
const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const navItems = [
  { id: 'overview', label: 'Overview', hint: 'Today at a glance', icon: LayoutDashboard },
  { id: 'field', label: 'My Field', hint: 'Crop and yield', icon: Wheat },
  { id: 'health', label: 'Crop Health', hint: 'Satellite view', icon: Leaf },
  { id: 'weather', label: 'Weather', hint: 'Next 4 days', icon: CloudRain },
  { id: 'market', label: 'Market Prices', hint: 'Compare mandis', icon: TrendingUp },
  { id: 'advice', label: 'Selling Advice', hint: 'What to do next', icon: BarChart3 },
] as const;

interface DashboardProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const CropDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { data, isLoading, isError } = useQuery({ queryKey: ['crop-dashboard'], queryFn: api.getCropDashboard });

  if (isLoading) return <div className="p-10 text-emerald-100">Loading farm information…</div>;
  if (isError || !data) return <div className="p-10 text-rose-300">Could not load farm information.</div>;

  return (
    <div className="min-h-screen bg-[#071513] text-slate-100 flex flex-col lg:flex-row">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0 p-4 sm:p-7">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.16em]">{navItems.find((item) => item.id === activeTab)?.hint}</p><h1 className="text-2xl font-extrabold text-white">{data.farm.name}</h1><p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{data.farm.location}</p></div>
            <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 px-3 py-2 text-xs text-amber-100">Demo data for hackathon presentation</div>
          </header>
          <DashboardContent activeTab={activeTab} onTabChange={setActiveTab} data={data} />
        </div>
      </main>
    </div>
  );
};

const Sidebar: React.FC<DashboardProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  return (
    <aside className="lg:w-72 lg:min-h-screen bg-[#091b18] border-b lg:border-b-0 lg:border-r border-emerald-900/50 shrink-0 flex flex-col">
      <div className="p-5 lg:p-6 border-b border-emerald-900/50 flex lg:block items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 grid place-items-center"><Sprout className="w-6 h-6" /></div>
        <div><p className="font-extrabold text-white leading-tight">KisanMitra</p><p className="text-[11px] text-emerald-300">Farm decisions, made simple</p></div>
      </div>
      <nav className="p-3 flex lg:block overflow-x-auto gap-1 lg:space-y-1 flex-1" aria-label="Farm information">
        {navItems.map(({ id, label, hint, icon: Icon }) => {
          const active = id === activeTab;
          return <button key={id} onClick={() => onTabChange(id)} className={`min-w-32 lg:w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${active ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-emerald-950/60'}`}>
            <Icon className="w-5 h-5 shrink-0" /><span><span className="block font-bold text-sm">{label}</span><span className={`block text-[11px] ${active ? 'text-emerald-950/80' : 'text-slate-400'}`}>{hint}</span></span>
          </button>;
        })}
      </nav>
      {/* User + logout */}
      <div className="hidden lg:block p-4 border-t border-emerald-900/40">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 grid place-items-center text-emerald-400 font-bold text-xs">
            {(user?.full_name ?? user?.username ?? 'F').split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.full_name ?? user?.username}</p>
            <p className="text-[11px] text-emerald-400">Farmer</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors" title="Sign out" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

const DashboardContent: React.FC<DashboardProps & { data: Awaited<ReturnType<typeof api.getCropDashboard>> }> = ({ activeTab, onTabChange, data }) => {
  const field = data.selected_field;
  const chartMax = Math.max(...field.satellite.series);

  if (activeTab === 'overview') return <section className="space-y-5">
    <div className="farm-card-emerald rounded-2xl p-5 sm:p-7"><p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Your next step</p><h2 className="text-2xl font-extrabold mt-2">Check drainage before Thursday’s rain.</h2><p className="text-slate-300 mt-2">Your soybean field is healthy and expected to harvest in {field.harvest_window}. One weather risk needs attention.</p><button onClick={() => onTabChange('weather')} className="mt-5 bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold">View weather advice</button></div>
    <div className="grid sm:grid-cols-3 gap-4"><SummaryCard label="Expected harvest" value={`${field.yield.estimate_tonnes} tonnes`} /><SummaryCard label="Best nearby market" value={data.recommendation.best_market} /><SummaryCard label="Quoted price" value={`${rupees(data.recommendation.best_price_inr)} / q`} /></div>
    <button onClick={() => onTabChange('advice')} className="w-full text-left farm-card rounded-2xl p-5 hover:border-emerald-400"><p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Selling advice</p><p className="font-bold text-white mt-2">{data.recommendation.action}</p><p className="text-sm text-slate-400 mt-1">Tap to read the full advice.</p></button>
  </section>;

  if (activeTab === 'field') return <section className="space-y-5"><PageTitle title="My Field" description="Your crop and harvest estimate." /><div className="farm-card-emerald rounded-2xl p-6"><div className="flex flex-col sm:flex-row sm:justify-between gap-4"><div><h2 className="text-2xl font-extrabold">{field.name}</h2><p className="text-slate-300 mt-1">{field.crop} · {field.variety} · {field.area_hectares} hectares</p><p className="text-emerald-300 text-sm mt-2">Current stage: {field.crop_stage}</p></div><div className="rounded-xl bg-[#081d18] px-4 py-3"><p className="text-xs text-slate-400">Harvest window</p><p className="font-bold mt-1">{field.harvest_window}</p></div></div></div><div className="grid sm:grid-cols-3 gap-4"><SummaryCard label="Expected harvest" value={`${field.yield.estimate_tonnes} tonnes`} note={`${field.yield.low_tonnes}–${field.yield.high_tonnes} tonne range`} /><SummaryCard label="Yield per hectare" value={`${field.yield.per_hectare} t/ha`} /><SummaryCard label="Confidence" value={`${field.yield.confidence_pct}%`} /></div><div className="farm-card rounded-2xl p-5"><h3 className="font-bold">Why this estimate?</h3><ul className="mt-3 space-y-2 text-sm text-slate-300">{field.yield.drivers.map((driver) => <li key={driver}>• {driver}</li>)}</ul></div></section>;

  if (activeTab === 'health') return <section className="space-y-5"><PageTitle title="Crop Health" description="Satellite observations show how your crop canopy is growing." /><div className="farm-card rounded-2xl p-6"><p className="text-sm text-slate-400">NDVI today</p><p className="text-4xl font-extrabold mt-1">{field.satellite.current} <span className="text-lg text-emerald-300">+{field.satellite.change_pct}%</span></p><div className="h-52 flex items-end gap-3 mt-8">{field.satellite.series.map((value, index) => <div key={index} className="flex-1 text-center"><div className="rounded-t bg-gradient-to-t from-emerald-600 to-cyan-300" style={{ height: `${(value / chartMax) * 100}%` }} /><span className="text-[10px] text-slate-500">Week {index + 1}</span></div>)}</div><p className="mt-5 text-emerald-300 font-semibold">{field.satellite.status}</p></div></section>;

  if (activeTab === 'weather') return <section className="space-y-5"><PageTitle title="Weather" description="Plan field work around this local forecast." /><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{data.weather.forecast.map((day) => <div key={day.day} className="farm-card rounded-2xl p-4 text-center"><p className="font-bold">{day.day}</p><p className="text-xs text-slate-400 mt-2">{day.condition}</p><p className="text-2xl text-amber-200 mt-3">{day.high_c}°</p><p className="text-sm text-cyan-300">{day.rain_mm} mm rain</p></div>)}</div><div className="farm-card-amber rounded-2xl p-5"><p className="font-bold text-amber-200">What you should do</p><p className="mt-2 text-slate-200">{data.weather.risk}</p></div></section>;

  if (activeTab === 'market') return <section className="space-y-5"><PageTitle title="Market Prices" description="Compare nearby mandi prices before selling." /><div className="farm-card rounded-2xl p-5 overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead className="text-left text-xs text-slate-400 border-b border-slate-700"><tr><th className="pb-3">Market</th><th className="pb-3 text-right">Price / q</th><th className="pb-3 text-right">Trend</th><th className="pb-3 text-right">Distance</th><th className="pb-3 text-right">Gross value</th></tr></thead><tbody>{data.markets.map((market) => <tr key={market.market} className="border-b border-slate-800"><td className="py-4 font-bold">{market.market}</td><td className="py-4 text-right">{rupees(market.price)}</td><td className="py-4 text-right text-emerald-300">+{market.change_pct}%</td><td className="py-4 text-right">{market.distance_km} km</td><td className="py-4 text-right text-amber-200">{rupees(market.gross_value_inr)}</td></tr>)}</tbody></table></div></section>;

  return <section className="space-y-5"><PageTitle title="Selling Advice" description="A simple recommendation based on your expected harvest and market prices." /><div className="farm-card-emerald rounded-2xl p-6"><p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Recommended action</p><h2 className="text-2xl font-extrabold mt-2">{data.recommendation.title}</h2><p className="text-lg font-semibold text-emerald-100 mt-5">{data.recommendation.action}</p><p className="text-slate-300 mt-3">{data.recommendation.why}</p><div className="grid sm:grid-cols-3 gap-4 mt-6"><SummaryCard label="Suggested market" value={data.recommendation.best_market} /><SummaryCard label="Current price" value={`${rupees(data.recommendation.best_price_inr)} / q`} /><SummaryCard label="Expected value" value={rupees(data.recommendation.estimated_value_inr)} /></div><p className="text-xs text-slate-400 mt-6">{data.recommendation.assumptions}</p></div></section>;
};

const PageTitle: React.FC<{ title: string; description: string }> = ({ title, description }) => <div><h2 className="text-2xl font-extrabold">{title}</h2><p className="text-slate-400 mt-1">{description}</p></div>;
const SummaryCard: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => <div className="farm-card rounded-2xl p-5"><p className="text-xs text-slate-400">{label}</p><p className="text-xl font-extrabold text-white mt-2">{value}</p>{note && <p className="text-xs text-emerald-300 mt-2">{note}</p>}</div>;
