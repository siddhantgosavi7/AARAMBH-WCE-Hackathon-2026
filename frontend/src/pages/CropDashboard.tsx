import React, { useEffect, useState } from 'react';
import {
  BarChart3, CloudRain, LayoutDashboard, Leaf,
  LogOut, Sprout, TrendingUp, Wheat,
  Plus, ChevronRight, Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { CropAnalysis, FarmInput } from '../types';
import { useAuth } from '../context/AuthContext';

type AnalysisTab = 'overview' | 'weather' | 'health' | 'yield' | 'market';

const money = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const analysisNav: { id: AnalysisTab; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',      hint: 'Today at a glance',      icon: LayoutDashboard },
  { id: 'weather',   label: 'Weather',        hint: 'Next 6-day forecast',     icon: CloudRain },
  { id: 'health',    label: 'Crop Health',    hint: 'Satellite NDVI',          icon: Leaf },
  { id: 'yield',     label: 'Yield Estimate', hint: 'How it was calculated',   icon: Wheat },
  { id: 'market',    label: 'Market Advice',  hint: 'When & where to sell',    icon: TrendingUp },
];

// ── Root component ─────────────────────────────────────────────────────────
export const CropDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [analysis, setAnalysis] = useState<CropAnalysis | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tab, setTab]           = useState<AnalysisTab>('overview');

  useEffect(() => {
    if (!user) return;
    api.getLatestAnalysis(user.token)
      .then(setAnalysis)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  // ── Loading splash ──
  if (loading) return (
    <div className="min-h-screen bg-[#071513] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-emerald-300">
        <Loader2 className="w-9 h-9 animate-spin" />
        <p className="text-sm font-medium">Loading your farm analysis…</p>
      </div>
    </div>
  );

  // ── Two-column shell ──
  return (
    <div className="flex h-screen overflow-hidden bg-[#060f0d]">
      {/* ── Sidebar ── */}
      <aside className="w-64 xl:w-72 shrink-0 flex flex-col bg-[#091b18] border-r border-emerald-900/40 overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-emerald-900/40 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 grid place-items-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-white leading-tight">KisanMitra</p>
            <p className="text-[11px] text-emerald-400">Farm decisions, made simple</p>
          </div>
        </div>



        {/* Nav — only shown when an analysis result is loaded */}
        {analysis && (
          <nav className="flex-1 p-3 space-y-1 mt-2" aria-label="Analysis sections">
            {analysisNav.map(({ id, label, hint, icon: Icon }) => (
              <SidebarNavButton
                key={id}
                id={`nav-${id}`}
                label={label}
                hint={hint}
                Icon={Icon}
                active={tab === id}
                onClick={() => setTab(id)}
              />
            ))}
          </nav>
        )}
        {/* Spacer when no analysis yet */}
        {!analysis && <div className="flex-1" />}

        {/* New analysis button */}
        {analysis && (
          <div className="p-3 shrink-0 border-t border-emerald-900/40">
            <button
              onClick={() => setAnalysis(null)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-700/50 text-sm text-slate-300 hover:border-emerald-400 hover:text-white transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Analyze another field
            </button>
          </div>
        )}

        {/* User chip */}
        <div className="p-3 shrink-0 border-t border-emerald-900/40">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#071513] border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 grid place-items-center text-emerald-400 font-bold text-xs shrink-0">
              {(user.full_name ?? user.username).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.full_name ?? user.username}</p>
              <p className="text-[11px] text-emerald-500">Farmer</p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 xl:px-8 py-4 border-b border-emerald-900/30 bg-[#07110f]">
          <div>
            <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.18em]">
              {analysis ? 'Farm Analysis' : 'Get Started'}
            </p>
            <h1 className="text-xl xl:text-2xl font-extrabold text-white leading-tight mt-0.5">
              {analysis
                ? `${analysis.farm.name} — ${analysis.farm.crop}`
                : 'Tell us about your field'}
            </h1>
          </div>
          {error && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-800/30 rounded-lg px-3 py-1.5 max-w-xs truncate">
              {error}
            </p>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors ml-4"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-8">
          {analysis
            ? <AnalysisView data={analysis} tab={tab} />
            : <FarmForm token={user.token} onDone={(a) => { setAnalysis(a); setTab('overview'); setError(null); }} />
          }
        </div>
      </div>
    </div>
  );
};

// ── Sidebar nav button (used inside AnalysisView via context) ──────────────
const SidebarNavButton: React.FC<{
  id: string; label: string; hint: string;
  Icon: React.ElementType; active: boolean; onClick: () => void;
}> = ({ id, label, hint, Icon, active, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group
      ${active
        ? 'bg-emerald-500 text-slate-950'
        : 'text-slate-300 hover:bg-emerald-950/60 hover:text-white'}`}
  >
    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
    <span className="flex-1 min-w-0">
      <span className="block font-bold text-sm leading-tight">{label}</span>
      <span className={`block text-[11px] leading-tight mt-0.5 ${active ? 'text-emerald-950/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
        {hint}
      </span>
    </span>
    {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
  </button>
);

// ── Farm input form ────────────────────────────────────────────────────────
const FIELD_DEFS: [string, keyof FarmInput, string][] = [
  ['Farm name',               'farm_name',   'text'],
  ['Field name',              'field_name',  'text'],
  ['Location (district)',     'location',    'text'],
  ['Farm area (acres)',       'area_acres',  'number'],
  ['Sowing date',             'sowing_date', 'date'],
  ['Storage available (days)','storage_days','number'],
];

const FarmForm: React.FC<{ token: string; onDone: (v: CropAnalysis) => void }> = ({ token, onDone }) => {
  const [form, setForm] = useState<FarmInput>({
    farm_name: 'Patil Family Farm', field_name: 'North Field',
    location: 'Kolhapur, Maharashtra', crop: 'wheat',
    area_acres: 5, sowing_date: '2026-07-01', storage_days: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const set = (k: keyof FarmInput, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { onDone(await api.analyzeFarm(form, token)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <div className="farm-card-emerald rounded-2xl p-6 xl:p-8">
        <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.18em]">Start an analysis</p>
        <h2 className="text-2xl xl:text-3xl font-extrabold mt-2">Tell us about your field</h2>
        <p className="text-slate-300 mt-2 text-sm leading-relaxed">
          We combine your inputs with sample historical yield & market data, plus live weather when available.
        </p>

        <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4">
          {FIELD_DEFS.map(([label, key, type]) => (
            <label key={key} className="flex flex-col gap-1.5 text-sm text-slate-300">
              <span className="font-semibold text-xs text-slate-400 uppercase tracking-wide">{label}</span>
              <input
                required
                type={type}
                value={form[key] as string | number}
                onChange={(e) => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full rounded-xl bg-[#071310] border border-emerald-900/60 px-4 py-3 text-white text-sm
                           focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </label>
          ))}

          <label className="flex flex-col gap-1.5 text-sm text-slate-300">
            <span className="font-semibold text-xs text-slate-400 uppercase tracking-wide">Crop</span>
            <select
              value={form.crop}
              onChange={(e) => set('crop', e.target.value)}
              className="w-full rounded-xl bg-[#071310] border border-emerald-900/60 px-4 py-3 text-white text-sm
                         focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
            >
              <option value="wheat">Wheat</option>
              <option value="soybean">Soybean</option>
            </select>
          </label>

          <div className="sm:col-span-2 flex flex-col gap-3">
            {error && (
              <p className="text-rose-300 text-sm bg-rose-950/40 border border-rose-800/30 rounded-xl px-4 py-2">{error}</p>
            )}
            <button
              id="analyze-btn"
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60
                         text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all duration-150 w-fit"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching weather & calculating…</> : 'Analyse my farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Analysis view — content only, nav lives in the outer sidebar ──────────
const AnalysisView: React.FC<{ data: CropAnalysis; tab: AnalysisTab }> = ({ data, tab }) => (
  <div className="space-y-5">
    {/* Section heading */}
    <div>
      <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.18em]">
        {analysisNav.find((n) => n.id === tab)?.hint}
      </p>
      <h2 className="text-2xl xl:text-3xl font-extrabold text-white mt-1">
        {TAB_TITLES[tab]}
      </h2>
    </div>
    <TabContent tab={tab} data={data} />
  </div>
);

const TAB_TITLES: Record<AnalysisTab, string> = {
  overview: 'What you need to know today',
  weather:  'Weather for your field',
  health:   'Crop health',
  yield:    'Expected crop yield',
  market:   'Market & selling advice',
};

// ── Tab content panels ─────────────────────────────────────────────────────
const TabContent: React.FC<{ tab: AnalysisTab; data: CropAnalysis }> = ({ tab, data }) => {
  if (tab === 'overview') return <OverviewTab data={data} />;
  if (tab === 'weather')  return <WeatherTab  data={data} />;
  if (tab === 'health')   return <HealthTab />;
  if (tab === 'yield')    return <YieldTab    data={data} />;
  return <MarketTab data={data} />;
};

const OverviewTab: React.FC<{ data: CropAnalysis }> = ({ data }) => (
  <div className="space-y-4">
    <div className="farm-card-emerald rounded-2xl p-6">
      <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">Recommended action</p>
      <p className="text-3xl xl:text-4xl font-extrabold mt-2 tracking-tight">{data.recommendation.decision}</p>
      <p className="text-slate-200 mt-3 leading-relaxed max-w-2xl">{data.recommendation.reason}</p>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard icon={Wheat} label="Expected production"
        value={`${data.yield_prediction.expected_production_tonnes} t`}
        note={`${data.yield_prediction.low_production_tonnes}–${data.yield_prediction.high_production_tonnes} t range`} />
      <StatCard icon={TrendingUp} label="Current price"
        value={`${money(data.market.current_price_inr_per_quintal)} / q`}
        note={data.market.market} />
      <StatCard icon={CloudRain} label="Weather data"
        value={data.weather.status === 'live' ? 'Live' : 'Unavailable'}
        note={data.weather.status === 'live' ? `via ${data.weather.source}` : 'Estimate used no weather data'} />
    </div>
    <div className="farm-card rounded-2xl p-5">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data transparency</p>
      <p className="text-sm text-slate-300 leading-relaxed">{data.data_mode}</p>
    </div>
  </div>
);

const WeatherTab: React.FC<{ data: CropAnalysis }> = ({ data }) => {
  if (data.weather.status !== 'live') return (
    <EmptyState icon={CloudRain} title="Weather is not available"
      text={data.weather.error ?? 'Try analysing the field again later.'} />
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-emerald-300 font-medium">
        Live forecast · {data.weather.source}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {data.weather.forecast.slice(0, 6).map((day) => (
          <div key={day.date} className="farm-card rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-white">{day.date}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{day.condition}</p>
            <p className="text-3xl font-extrabold text-amber-200 mt-3">{day.high_c}°</p>
            <p className="text-sm text-cyan-300 mt-1">{day.rain_mm} mm</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{day.humidity_pct}% humidity</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HealthTab: React.FC = () => (
  <EmptyState icon={Leaf} title="Satellite crop health not connected"
    text="This prototype does not show a crop-health score until a satellite provider and field boundary are configured. No satellite values are used in your yield estimate." />
);

const YieldTab: React.FC<{ data: CropAnalysis }> = ({ data }) => {
  const yp = data.yield_prediction;
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wheat}    label="Yield per hectare"     value={`${yp.yield_per_hectare} t/ha`}    note={`${yp.confidence_pct}% confidence`} />
        <StatCard icon={BarChart3} label="Expected production"  value={`${yp.expected_production_tonnes} t`} note={`${data.farm.area_acres} acres`} />
        <StatCard icon={Wheat}    label="Low estimate"          value={`${yp.low_production_tonnes} t`}   note="Pessimistic scenario" />
        <StatCard icon={Wheat}    label="High estimate"         value={`${yp.high_production_tonnes} t`}  note="Optimistic scenario" />
      </div>
      <div className="farm-card rounded-2xl p-6">
        <h3 className="font-bold text-white">How this estimate was made</h3>
        <p className="text-slate-300 mt-2 text-sm leading-relaxed">{yp.method}</p>
        <ul className="mt-4 space-y-1.5">
          {yp.inputs_used.map((inp) => (
            <li key={inp} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-emerald-400 mt-0.5 shrink-0">•</span>{inp}
            </li>
          ))}
        </ul>
        <p className="text-xs text-amber-300/80 mt-5 leading-relaxed border-t border-slate-800 pt-4">
          ⚠ {yp.limitations}
        </p>
      </div>
    </div>
  );
};

const MarketTab: React.FC<{ data: CropAnalysis }> = ({ data }) => {
  const { market, recommendation: rec } = data;
  return (
    <div className="space-y-4">
      <div className="farm-card-emerald rounded-2xl p-6">
        <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">Selling recommendation</p>
        <p className="text-4xl font-extrabold mt-2 tracking-tight">{rec.decision}</p>
        <p className="text-emerald-100 text-lg mt-4 leading-relaxed max-w-2xl">{rec.explanation}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Current market price"
          value={`${money(market.current_price_inr_per_quintal)} / q`}
          note={market.market} />
        <StatCard icon={BarChart3} label="Recent average"
          value={`${money(market.recent_average_inr_per_quintal)} / q`}
          note={`${market.trend_pct >= 0 ? '+' : ''}${market.trend_pct}% overall trend`} />
        <StatCard icon={Wheat} label="Expected gross value"
          value={money(rec.estimated_gross_value_inr)}
          note="Before transport & costs" />
      </div>
      <div className="farm-card rounded-2xl p-5">
        <h3 className="font-bold text-white">Price history</h3>
        {/* Bar chart */}
        <div className="mt-4 flex items-end gap-1.5 h-28">
          {market.history.map((price, i) => {
            const max = Math.max(...market.history);
            const min = Math.min(...market.history);
            const pct = max === min ? 60 : 20 + ((price - min) / (max - min)) * 80;
            const isLast = i === market.history.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${isLast ? 'bg-emerald-400' : 'bg-emerald-800/60'}`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[9px] text-slate-600 font-mono">{price}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-3">{market.source} · Sample data — not a live mandi feed.</p>
      </div>
    </div>
  );
};

// ── Shared UI atoms ────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; note: string }> = ({
  icon: Icon, label, value, note,
}) => (
  <div className="farm-card rounded-2xl p-5 flex flex-col gap-1">
    <Icon className="w-5 h-5 text-emerald-400 mb-1" />
    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
    <p className="text-xl xl:text-2xl font-extrabold text-white leading-tight">{value}</p>
    <p className="text-xs text-slate-500">{note}</p>
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType; title: string; text: string }> = ({
  icon: Icon, title, text,
}) => (
  <div className="farm-card rounded-2xl p-8 flex flex-col items-start gap-3 max-w-2xl">
    <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-800/30 grid place-items-center">
      <Icon className="w-6 h-6 text-emerald-500" />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
  </div>
);
