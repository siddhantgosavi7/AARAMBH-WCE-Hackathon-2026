import React from 'react';
import { SavingsReport } from '../types';
import { DollarSign, Leaf, Droplets, TrendingDown, Award, Globe, ShieldCheck } from 'lucide-react';

interface ReportsViewProps {
  report: SavingsReport | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        Loading environmental dividends and financial ledger...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20 radial-glow">
        <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1.5">
          <Award className="w-4 h-4" />
          <span>ESG & Bioenergetic ROI Accounting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sustainability & Economic Dividends</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Quantifying the tangible economic savings and nutrient discharge mitigation delivered by dynamically matching feed
          rations to limnological metabolic capacity. Aligned with UN SDGs 2, 6, 12, and 14.
        </p>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Saved */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2">
            <span>Direct Cost Savings</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            ₹{report.total_cost_saved_inr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Derived from <strong className="text-slate-200 font-mono">{report.total_feed_saved_kg.toFixed(1)} kg</strong> of avoided uneaten feed.
          </p>
        </div>

        {/* Nitrogen Discharge Avoided */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 mb-2">
            <span>Nitrogen Discharge Avoided</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            {report.nitrogen_avoided_kg.toFixed(2)} <span className="text-sm font-normal text-slate-400">kg N</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Elemental Kjeldahl nitrogen kept out of local water tables.
          </p>
        </div>

        {/* FCR Reduction */}
        <div className="glass-panel rounded-2xl p-5 border border-teal-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-400 mb-2">
            <span>Optimized FCR Benchmark</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {report.average_fcr.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Slashed from rigid baseline of <strong className="text-slate-300 line-through font-mono">{report.baseline_fcr.toFixed(2)}</strong> (21% efficiency gain).
          </p>
        </div>

        {/* Pollution Risk Index */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-2">
            <span>Mean Pollution Risk Score</span>
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            {report.pollution_risk_score.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Composite index of organic sediment load and nocturnal hypoxia risk.
          </p>
        </div>
      </div>

      {/* Per Pond Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">Pond-by-Pond Performance Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Pond Enclosure</th>
                <th className="pb-3 text-right">Feed Saved</th>
                <th className="pb-3 text-right">Cost Saved</th>
                <th className="pb-3 text-right">Pollution Risk Score</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {report.ponds_summary.map((p) => (
                <tr key={p.pond_id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-sans font-semibold text-white">{p.pond_name}</td>
                  <td className="py-3 text-right text-emerald-400">{p.feed_saved_kg.toFixed(1)} kg</td>
                  <td className="py-3 text-right text-white">₹{p.cost_saved_inr.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        p.current_risk_score > 50
                          ? 'bg-rose-500/20 text-rose-300'
                          : p.current_risk_score > 30
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {p.current_risk_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="py-3 text-center font-sans">
                    <span className="text-[11px] font-semibold text-cyan-300">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UN Sustainable Development Goals Impact Matrix */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/20">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-3">
          <Globe className="w-4 h-4" />
          <span>Global Alignment</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-6">United Nations Sustainable Development Goals Impact</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30">
            <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-xs">SDG 2</span>
              <span>Zero Hunger (Target 2.4)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Optimizes aquatic protein productivity per unit grain feed input, strengthening food system resilience.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30">
            <div className="flex items-center space-x-2 font-bold text-cyan-400 text-sm mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-xs">SDG 6</span>
              <span>Clean Water & Sanitation (Target 6.3)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Prevents organic sludge accumulation, bacterial oxygen depletion, and toxic unionized ammonia leaching.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
            <div className="flex items-center space-x-2 font-bold text-emerald-400 text-sm mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-xs">SDG 12</span>
              <span>Responsible Consumption (Target 12.2)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Eliminates the ~25% aquaculture feed waste generated by blind static feeding tables.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-500/30">
            <div className="flex items-center space-x-2 font-bold text-blue-400 text-sm mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-xs">SDG 14</span>
              <span>Life Below Water (Target 14.1)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Stops nitrogen and phosphorus eutrophication runoff, preventing coastal dead zones and preserving aquatic biodiversity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
