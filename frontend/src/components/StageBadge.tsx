import React from 'react';

interface StageBadgeProps {
  stage: string;
}

const STAGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  fry: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-500/40' },
  fingerling: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-500/40' },
  juvenile: { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  grower: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  finisher: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/40' },
};

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const norm = stage.toLowerCase().trim();
  const style = STAGE_STYLES[norm] || {
    bg: 'bg-slate-900/60',
    text: 'text-slate-300',
    border: 'border-slate-600/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} shadow-sm backdrop-blur-sm`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
      {stage}
    </span>
  );
};
