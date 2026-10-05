import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';
import { AdContainer } from './ads/AdContainer';

interface ProcessingModalProps {
  isOpen: boolean;
  title?: string;
  progressPercent?: number;
  stageMessage?: string;
  onCancel?: () => void;
}

/**
 * Processing Modal with Dwell-Time Monetization Slot
 * Displays when a client-side Web Worker / WASM task takes >2.5 seconds.
 * Keeps user informed about zero-upload status while maximizing ad viewability.
 */
export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  title = 'Processing Local File...',
  progressPercent = 0,
  stageMessage = 'Crunching calculations in device memory to protect your privacy...',
  onCancel
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // Slight debounce so quick sub-second jobs don't flash
      timer = setTimeout(() => setVisible(true), 150);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl neu-card border border-cyan-500/30 bg-slate-950/95 shadow-2xl text-center space-y-6">
        {/* Header Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% On-Device Processing</span>
          </div>

          <h3 id="processing-modal-title" className="text-xl sm:text-2xl font-black text-slate-100 flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>{title}</span>
          </h3>

          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {stageMessage}
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-2">
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-cyan-500/30"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> WebAssembly Engine
            </span>
            <span className="font-bold text-cyan-400">{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* Dwell-Time Monetization Slot */}
        <div className="pt-1">
          <AdContainer slotType="processing-modal" />
        </div>

        {/* Cancel Action (if abortable) */}
        {onCancel && (
          <div className="pt-2">
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors"
            >
              Cancel Operation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
