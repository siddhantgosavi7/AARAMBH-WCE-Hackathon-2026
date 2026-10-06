import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface CreatePondModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreatePondModal: React.FC<CreatePondModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('tilapia');
  const [fishCount, setFishCount] = useState(5000);
  const [avgWeightG, setAvgWeightG] = useState(150.0);
  const [areaHa, setAreaHa] = useState(0.5);
  const [survivalRate, setSurvivalRate] = useState(0.90);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      species,
      fish_count: Number(fishCount),
      avg_weight_g: Number(avgWeightG),
      area_ha: Number(areaHa),
      survival_rate: Number(survivalRate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <span>Stock New Pond Enclosure</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pond Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nursery Tank Delta"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
              >
                <option value="tilapia">Nile Tilapia</option>
                <option value="rohu">Rohu / Carp</option>
                <option value="shrimp">Whiteleg Shrimp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pond Area (Hectares)</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                required
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Count</label>
              <input
                type="number"
                min="10"
                required
                value={fishCount}
                onChange={(e) => setFishCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Avg Weight (g)</label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                required
                value={avgWeightG}
                onChange={(e) => setAvgWeightG(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Survival Rate (0.0 to 1.0)</label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="1.0"
              required
              value={survivalRate}
              onChange={(e) => setSurvivalRate(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Initialize Pond
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
