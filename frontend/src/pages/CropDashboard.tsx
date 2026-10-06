import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { AlertTriangle, BarChart3, CloudRain, Leaf, MapPin, Sprout, TrendingUp, Wheat } from 'lucide-react';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const CropDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ['crop-dashboard'], queryFn: api.getCropDashboard });

  if (isLoading) return <div className="p-10 text-emerald-100">Loading farm intelligence…</div>;
  if (isError || !data) return <div className="p-10 text-rose-300">Could not load the crop analytics dashboard.</div>;

  const field = data.selected_field;
  const chartMax = Math.max(...field.satellite.series);

  return (
    <main className="min-h-screen bg-[#071513] text-slate-100 p-4 sm:p-7">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 grid place-items-center shadow-lg shadow-emerald-950"><Sprout /></div>
            <div><p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.18em]">Crop yield & market analytics</p><h1 className="text-2xl font-extrabold text-white">{data.farm.name}</h1><p className="text-sm text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{data.farm.location}</p></div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-xs text-amber-100 max-w-xl"><span className="font-bold text-amber-300">Demo data: </span>{data.data_mode}</div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Fields monitored', value: String(data.summary.fields), icon: Wheat, color: 'text-emerald-300' },
            { label: 'Expected harvest', value: `${data.summary.expected_harvest_tonnes} t`, icon: BarChart3, color: 'text-cyan-300' },
            { label: 'Estimated portfolio', value: rupees(data.summary.portfolio_value_inr), icon: TrendingUp, color: 'text-amber-300' },
            { label: 'Weather risks', value: String(data.summary.weather_risks), icon: AlertTriangle, color: 'text-rose-300' },
          ].map(({ label, value, icon: MetricIcon, color }) => {
            return <div key={label} className="farm-card rounded-2xl p-4"><MetricIcon className={`w-5 h-5 ${color} mb-3`} /><p className="text-xs text-slate-400">{label}</p><p className="text-xl font-bold text-white mt-1">{value}</p></div>;
          })}
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 farm-card-emerald rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Selected field</p><h2 className="text-2xl font-extrabold text-white mt-1">{field.name} · {field.crop}</h2><p className="text-sm text-slate-300 mt-1">{field.variety} · {field.area_hectares} ha · {field.crop_stage}</p></div><div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3"><p className="text-xs text-emerald-200">Harvest window</p><p className="font-bold text-white text-sm mt-1">{field.harvest_window}</p></div></div>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-[#081d18] p-4 border border-emerald-900/70"><p className="text-xs text-slate-400">Predicted harvest</p><p className="text-3xl font-extrabold text-white mt-1">{field.yield.estimate_tonnes} <span className="text-sm font-normal">tonnes</span></p><p className="text-xs text-emerald-300 mt-1">{field.yield.low_tonnes}–{field.yield.high_tonnes} t range</p></div>
              <div className="rounded-xl bg-[#081d18] p-4 border border-emerald-900/70"><p className="text-xs text-slate-400">Yield per hectare</p><p className="text-3xl font-extrabold text-white mt-1">{field.yield.per_hectare}</p><p className="text-xs text-slate-400 mt-1">tonnes / ha</p></div>
              <div className="rounded-xl bg-[#081d18] p-4 border border-emerald-900/70"><p className="text-xs text-slate-400">Estimate confidence</p><p className="text-3xl font-extrabold text-white mt-1">{field.yield.confidence_pct}%</p><div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${field.yield.confidence_pct}%` }} /></div></div>
            </div>
          </div>
          <aside className="farm-card rounded-2xl p-5 border border-cyan-500/25"><div className="flex items-center gap-2 text-cyan-300"><Leaf className="w-5 h-5" /><h2 className="font-bold">Satellite crop health</h2></div><p className="text-sm text-slate-400 mt-2">{field.satellite.indicator}: <span className="text-white font-bold">{field.satellite.current}</span> · <span className="text-emerald-300">+{field.satellite.change_pct}%</span></p><div className="h-24 flex items-end gap-2 mt-4">{field.satellite.series.map((value, index) => <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-emerald-600 to-cyan-300" style={{ height: `${(value / chartMax) * 100}%` }} title={`Observation ${index + 1}: ${value}`} />)}</div><p className="text-xs text-emerald-300 mt-3">{field.satellite.status}</p></aside>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="farm-card rounded-2xl p-5"><div className="flex gap-2 items-center"><CloudRain className="w-5 h-5 text-cyan-300" /><h2 className="font-bold">Local weather outlook</h2></div><div className="grid grid-cols-4 gap-2 mt-4">{data.weather.forecast.map((day) => <div key={day.day} className="text-center rounded-lg bg-[#0a201b] py-3"><p className="text-xs font-bold">{day.day}</p><p className="text-[10px] text-slate-400 mt-1">{day.condition}</p><p className="text-sm mt-2 text-amber-200">{day.high_c}°</p><p className="text-[10px] text-cyan-300">{day.rain_mm} mm</p></div>)}</div><p className="mt-4 text-xs leading-relaxed text-amber-200 border-l-2 border-amber-400 pl-3">{data.weather.risk}</p></div>
          <div className="lg:col-span-2 farm-card rounded-2xl p-5"><div className="flex items-center justify-between"><div className="flex gap-2 items-center"><TrendingUp className="w-5 h-5 text-amber-300" /><h2 className="font-bold">Soybean mandi comparison</h2></div><span className="text-xs text-slate-400">Quoted price / quintal</span></div><div className="overflow-x-auto mt-4"><table className="w-full text-sm"><thead className="text-left text-xs text-slate-400 border-b border-slate-700"><tr><th className="pb-3">Market</th><th className="pb-3 text-right">Price</th><th className="pb-3 text-right">Trend</th><th className="pb-3 text-right">Distance</th><th className="pb-3 text-right">Est. gross value</th></tr></thead><tbody>{data.markets.map((market) => <tr className="border-b border-slate-800/70" key={market.market}><td className="py-3 font-semibold text-white">{market.market}</td><td className="py-3 text-right">{rupees(market.price)}</td><td className="py-3 text-right text-emerald-300">+{market.change_pct}%</td><td className="py-3 text-right text-slate-300">{market.distance_km} km</td><td className="py-3 text-right text-amber-200">{rupees(market.gross_value_inr)}</td></tr>)}</tbody></table></div></div>
        </section>

        <section className="rounded-2xl p-5 sm:p-6 border border-emerald-400/35 bg-gradient-to-r from-emerald-950 to-[#0a251c]"><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Selling recommendation</p><h2 className="text-xl font-extrabold text-white mt-1">{data.recommendation.title}</h2><p className="text-emerald-100 font-semibold mt-3">{data.recommendation.action}</p><p className="text-sm text-slate-300 mt-2 max-w-4xl">{data.recommendation.why}</p><div className="grid sm:grid-cols-3 gap-3 mt-5 text-sm"><div><p className="text-slate-400">Suggested market</p><p className="font-bold">{data.recommendation.best_market}</p></div><div><p className="text-slate-400">Current quoted price</p><p className="font-bold">{rupees(data.recommendation.best_price_inr)} / q</p></div><div><p className="text-slate-400">Estimated gross value</p><p className="font-bold">{rupees(data.recommendation.estimated_value_inr)}</p></div></div><p className="text-xs text-slate-400 mt-5">{data.recommendation.assumptions}</p></section>
      </div>
    </main>
  );
};
