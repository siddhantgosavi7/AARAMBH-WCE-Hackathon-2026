import React from 'react';
import { Plus, Upload, Sun, CheckCircle2, Menu } from 'lucide-react';

interface TopHeaderProps {
  currentTab: string;
  onOpenCreateModal: () => void;
  onUploadCsv: (file: File) => void;
  onToggleMobileSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenCreateModal,
  onUploadCsv,
  onToggleMobileSidebar,
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Pond Enclosures & Water Telemetry';
      case 'pond-detail':
        return 'Pond Diagnostic & Bioenergetic Plan';
      case 'schedule':
        return 'Circadian Feeding Timeline';
      case 'alerts':
        return 'Water Quality Risk Safeguards';
      case 'reports':
        return 'Sustainability Dividends & Farm ROI';
      case 'simulator':
        return 'What-If Feeding Simulator';
      default:
        return 'Aquaculture Management';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCsv(e.target.files[0]);
    }
  };

  return (
    <header className="h-16 border-b border-emerald-900/40 bg-[#091b18]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-[#0e2722] text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight">{getTitle()}</h1>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Farm Telemetry Active</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Daylight Feeding Window (06:30 – 18:00)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* CSV Import */}
        <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0e2722] hover:bg-[#13352e] text-slate-200 border border-emerald-800/50 transition-colors cursor-pointer shadow-sm">
          <Upload className="w-3.5 h-3.5 text-teal-400" />
          <span>Upload CSV Data</span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Add Pond Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Stock New Pond</span>
        </button>
      </div>
    </header>
  );
};
