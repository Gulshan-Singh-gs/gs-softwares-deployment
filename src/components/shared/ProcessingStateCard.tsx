import React from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  X,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { formatBytes } from '../../lib/fileUtils';

export type ProcessingStatus = 'idle' | 'validating' | 'processing' | 'completed' | 'error';

interface ProcessingStateCardProps {
  status: ProcessingStatus;
  progress?: number;
  fileName?: string;
  originalSize?: number;
  outputSize?: number;
  statusMessage?: string;
  errorMessage?: string;
  onDownload?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  downloadLabel?: string;
}

export const ProcessingStateCard: React.FC<ProcessingStateCardProps> = ({
  status,
  progress = 0,
  fileName,
  originalSize,
  outputSize,
  statusMessage,
  errorMessage,
  onDownload,
  onReset,
  onCancel,
  downloadLabel = 'Download Output'
}) => {
  if (status === 'idle') return null;

  const savingsPercent = originalSize && outputSize && originalSize > outputSize
    ? Math.round(((originalSize - outputSize) / originalSize) * 100)
    : null;

  return (
    <div className="w-full neu-card rounded-2xl p-5 border border-slate-700/50 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            status === 'completed'
              ? 'bg-emerald-500/15 text-emerald-400'
              : status === 'error'
              ? 'bg-rose-500/15 text-rose-400'
              : 'bg-cyan-500/15 text-cyan-400'
          }`}>
            {status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
            {status === 'error' && <AlertCircle className="w-5 h-5" />}
            {(status === 'validating' || status === 'processing') && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm tracking-tight truncate">
              {fileName || 'File Processing'}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {statusMessage || (
                status === 'validating'
                  ? 'Validating file format locally...'
                  : status === 'processing'
                  ? `Processing on-device (${Math.round(progress)}%)...`
                  : status === 'completed'
                  ? 'Finished successfully'
                  : 'An error occurred during processing'
              )}
            </p>
          </div>
        </div>

        {onCancel && (status === 'processing' || status === 'validating') && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white neu-btn text-xs font-semibold"
            title="Cancel Operation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar during active work */}
      {(status === 'processing' || status === 'validating') && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Progress</span>
            <span className="font-mono text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Size comparison on completed */}
      {status === 'completed' && (originalSize || outputSize) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          {originalSize && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Original</span>
              <span className="font-mono font-semibold text-slate-300">{formatBytes(originalSize)}</span>
            </div>
          )}
          {outputSize && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Optimized</span>
              <span className="font-mono font-bold text-emerald-400">{formatBytes(outputSize)}</span>
            </div>
          )}
          {savingsPercent !== null && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Savings</span>
              <span className="font-mono font-bold text-cyan-400">{savingsPercent}% Smaller</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {status === 'completed' && onDownload && (
          <button
            onClick={onDownload}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadLabel}</span>
          </button>
        )}

        {status === 'completed' && onReset && (
          <button
            onClick={onReset}
            className="py-2.5 px-4 rounded-xl neu-btn text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Process Another</span>
          </button>
        )}

        {status === 'error' && onReset && (
          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 rounded-xl neu-btn text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
