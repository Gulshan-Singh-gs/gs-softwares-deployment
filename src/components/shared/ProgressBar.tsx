import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label = 'Processing local file...',
  color = 'from-cyan-500 to-emerald-400',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="w-full space-y-2 neu-card p-4 rounded-2xl border-slate-800">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-400 font-mono">{clamped}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-200`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
