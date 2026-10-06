import React, { useState, useMemo } from 'react';
import { Sliders, Droplets, Thermometer, ShieldAlert, Sparkles, CheckCircle2, AlertOctagon } from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const [species, setSpecies] = useState<'tilapia' | 'rohu' | 'shrimp'>('tilapia');
  const [temperature, setTemperature] = useState<number>(28.5);
  const [dissolvedOxygen, setDissolvedOxygen] = useState<number>(5.5);
  const [biomassKg, setBiomassKg] = useState<number>(800.0);
  const [avgWeightG, setAvgWeightG] = useState<number>(180.0);

  // Pure mathematical simulation client-side mirroring backend logic for sub-millisecond responsiveness!
  const calculation = useMemo(() => {
    // 1. Stage & Base Rate
    let stage = 'grower';
    let baseRate = 2.5;
    let criticalHalt = 3.0;
    let stressDO = 5.0;
    let minLethal = 12.0;
    let optLow = 27.0;
    let optHigh = 31.0;
    let maxLethal = 38.0;

    if (species === 'tilapia') {
      criticalHalt = 3.0;
      stressDO = 5.0;
      minLethal = 12.0;
      optLow = 27.0;
      optHigh = 31.0;
      maxLethal = 38.0;
      if (avgWeightG < 1.0) {
        stage = 'fry';
        baseRate = 15.0;
      } else if (avgWeightG < 20.0) {
        stage = 'fingerling';
        baseRate = 8.0;
      } else if (avgWeightG < 100.0) {
        stage = 'juvenile';
        baseRate = 4.5;
      } else if (avgWeightG < 400.0) {
        stage = 'grower';
        baseRate = 2.5;
      } else {
        stage = 'finisher';
        baseRate = 1.8;
      }
    } else if (species === 'rohu') {
      criticalHalt = 3.2;
      stressDO = 5.0;
      minLethal = 14.0;
      optLow = 26.0;
      optHigh = 30.0;
      maxLethal = 36.0;
      if (avgWeightG < 1.0) {
        stage = 'fry';
        baseRate = 12.0;
      } else if (avgWeightG < 25.0) {
        stage = 'fingerling';
        baseRate = 6.5;
      } else if (avgWeightG < 150.0) {
        stage = 'juvenile';
        baseRate = 3.5;
      } else if (avgWeightG < 600.0) {
        stage = 'grower';
        baseRate = 2.2;
      } else {
        stage = 'finisher';
        baseRate = 1.5;
      }
    } else {
      // shrimp
      criticalHalt = 3.5;
      stressDO = 5.0;
      minLethal = 16.0;
      optLow = 28.0;
      optHigh = 32.0;
      maxLethal = 35.0;
      if (avgWeightG < 0.5) {
        stage = 'fry';
        baseRate = 18.0;
      } else if (avgWeightG < 5.0) {
        stage = 'fingerling';
        baseRate = 7.0;
      } else if (avgWeightG < 18.0) {
        stage = 'juvenile';
        baseRate = 3.8;
      } else {
        stage = 'grower';
        baseRate = 2.5;
      }
    }

    // 2. Temp Factor
    let tempFactor = 1.0;
    if (temperature <= minLethal || temperature >= maxLethal) {
      tempFactor = 0.0;
    } else if (temperature >= optLow && temperature <= optHigh) {
      tempFactor = 1.0;
    } else if (temperature > optHigh) {
      const span = maxLethal - optHigh;
      const ratio = (temperature - optHigh) / span;
      tempFactor = Math.cos(0.5 * Math.PI * ratio) ** 2;
    } else {
      const span = optLow - minLethal;
      const ratio = (optLow - temperature) / span;
      tempFactor = Math.cos(0.5 * Math.PI * ratio) ** 2;
    }
    tempFactor = Math.max(0, Math.min(1, tempFactor));

    // 3. DO Factor
    let doFactor = 1.0;
    if (dissolvedOxygen < criticalHalt) {
      doFactor = 0.0;
    } else if (dissolvedOxygen >= stressDO) {
      doFactor = 1.0;
    } else {
      doFactor = (dissolvedOxygen - criticalHalt) / (stressDO - criticalHalt);
    }
    doFactor = Math.max(0, Math.min(1, doFactor));

    // 4. Combined Feed
    const unadjustedKg = biomassKg * (baseRate / 100.0);
    const combinedFactor = tempFactor * doFactor;
    const adjustedKg = doFactor === 0 || tempFactor === 0 ? 0.0 : unadjustedKg * combinedFactor;

    // 5. Status Rationale
    let status = 'OPTIMAL';
    let statusClass = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    let rationale = `Optimal metabolic envelope for ${species} (${temperature.toFixed(1)}°C, ${dissolvedOxygen.toFixed(1)} mg/L). 100% nominal feed permitted.`;

    if (doFactor === 0.0) {
      status = 'CRITICAL HYPOXIA — FEEDING HALTED';
      statusClass = 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse';
      rationale = `DO is ${dissolvedOxygen.toFixed(1)} mg/L (< ${criticalHalt.toFixed(1)} mg/L). Fish cannot oxygenate ingested pellets; feeding is strictly set to 0.0 kg to prevent catastrophic fish mortality.`;
    } else if (tempFactor === 0.0) {
      status = 'LETHAL THERMAL EXTREME — FEEDING HALTED';
      statusClass = 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse';
      rationale = `Water temperature (${temperature.toFixed(1)}°C) is outside viable biological limits (${minLethal}°C – ${maxLethal}°C). Feeding stopped.`;
    } else if (combinedFactor < 1.0) {
      status = 'ENVIRONMENTAL THROTTLE ACTIVE';
      statusClass = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      rationale = `Suboptimal conditions: DO factor is ${(doFactor * 100).toFixed(0)}%, Thermal factor is ${(tempFactor * 100).toFixed(0)}%. Ration curtailed by ${((1 - combinedFactor) * 100).toFixed(0)}% to match metabolic capacity.`;
    }

    return {
      stage,
      baseRate,
      criticalHalt,
      stressDO,
      tempFactor,
      doFactor,
      unadjustedKg,
      adjustedKg,
      savedKg: Math.max(0, unadjustedKg - adjustedKg),
      status,
      statusClass,
      rationale,
    };
  }, [species, temperature, dissolvedOxygen, biomassKg, avgWeightG]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-teal-500/30 radial-glow">
        <div className="flex items-center space-x-2 text-teal-400 font-mono text-xs uppercase tracking-widest mb-1.5">
          <Sliders className="w-4 h-4" />
          <span>Interactive Decision Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">What-If Limnological Simulator</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Drag temperature and dissolved oxygen sliders in real-time to observe how the bioenergetic model dynamically
          adapts daily feed rations and prevents mortality during hypoxia crashes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
            Environmental & Cohort Parameters
          </h2>

          {/* Species Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Species</label>
            <div className="grid grid-cols-3 gap-2">
              {(['tilapia', 'rohu', 'shrimp'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecies(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                    species === s
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Dissolved Oxygen Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Dissolved Oxygen (DO)</span>
              </span>
              <span className="font-mono font-bold text-base text-cyan-300">
                {dissolvedOxygen.toFixed(1)} <span className="text-xs text-slate-400 font-normal">mg/L</span>
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="9.0"
              step="0.1"
              value={dissolvedOxygen}
              onChange={(e) => setDissolvedOxygen(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className="text-rose-400">1.0 mg/L (Deadly)</span>
              <span className="text-amber-400">{calculation.criticalHalt} mg/L (Cut-off)</span>
              <span className="text-emerald-400">5.0+ mg/L (Optimal)</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>Water Temperature</span>
              </span>
              <span className="font-mono font-bold text-base text-amber-300">
                {temperature.toFixed(1)} <span className="text-xs text-slate-400 font-normal">°C</span>
              </span>
            </div>
            <input
              type="range"
              min="10.0"
              max="40.0"
              step="0.2"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10°C (Cold)</span>
              <span className="text-emerald-400">28°C (Optimal)</span>
              <span className="text-rose-400">38°C (Lethal)</span>
            </div>
          </div>

          {/* Cohort Biomass & Avg Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Active Biomass (kg)</label>
              <input
                type="number"
                step="50"
                value={biomassKg}
                onChange={(e) => setBiomassKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Mean Body Wt (g)</label>
              <input
                type="number"
                step="5"
                value={avgWeightG}
                onChange={(e) => setAvgWeightG(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Real-time Bioenergetic Response Output (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Real-Time Bioenergetic Response
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${calculation.statusClass}`}>
                {calculation.status}
              </span>
            </div>

            {/* Big Feed Output Card */}
            <div className="my-6 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 text-center relative overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Optimized Daily Feed Recommendation
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight my-2">
                {calculation.adjustedKg.toFixed(2)}{' '}
                <span className="text-xl sm:text-2xl font-medium text-slate-400">kg/day</span>
              </div>

              <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 mt-4">
                <span>
                  Static Baseline:{' '}
                  <strong className="text-slate-300 font-mono line-through">
                    {calculation.unadjustedKg.toFixed(2)} kg
                  </strong>
                </span>
                <span>
                  Avoided Feed:{' '}
                  <strong className="text-emerald-400 font-mono font-bold">
                    {calculation.savedKg.toFixed(2)} kg
                  </strong>
                </span>
              </div>
            </div>

            {/* Modulator Factor Bars */}
            <div className="space-y-4">
              {/* Temperature Factor Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Thermal Modulator f_T(T)</span>
                  <span className="font-mono text-white">{(calculation.tempFactor * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${calculation.tempFactor * 100}%` }}
                  />
                </div>
              </div>

              {/* DO Factor Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-cyan-400">Dissolved Oxygen Modulator f_DO(DO)</span>
                  <span className="font-mono text-white">{(calculation.doFactor * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${calculation.doFactor * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rationale explanation box */}
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
            <strong className="text-cyan-300 font-semibold block mb-1">Instant Model Audit:</strong>
            {calculation.rationale}
          </div>
        </div>
      </div>
    </div>
  );
};
