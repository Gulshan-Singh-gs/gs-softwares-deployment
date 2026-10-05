import React, { useEffect } from 'react';
import { Zap, Sliders, X, CheckCircle2 } from 'lucide-react';
import { usePerformanceTier } from '../../context/PerformanceContext';

export const PerformanceToast: React.FC = () => {
  const { showToast, toastMessage, dismissToast, setIsSettingsOpen, tier } = usePerformanceTier();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showToast, dismissToast]);

  if (!showToast || !toastMessage) return null;

  const tierColors = {
    eco: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    balanced: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    performance: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
  };

  return (
    <div
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      className="fixed right-4 sm:right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className={`neu-flat backdrop-blur-xl border p-4 rounded-2xl shadow-2xl flex items-start gap-3 bg-gradient-to-r ${tierColors[tier]}`}>
        <div className="p-2 rounded-xl neu-inset shrink-0 mt-0.5">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-extrabold tracking-tight">Adaptive Optimization</span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed font-medium">
            {toastMessage}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                dismissToast();
                setIsSettingsOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              Settings
            </button>
            <button
              onClick={dismissToast}
              className="px-2 py-1 rounded-lg text-[11px] font-medium opacity-60 hover:opacity-100 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-lg opacity-60 hover:opacity-100 neu-btn transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
