import React, { useState, useEffect } from 'react';
import { subscribeToasts, PlatformEvent } from '../lib/feedbackRouter';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastItem extends PlatformEvent {
  id: string;
  timestamp: number;
}

export const GlobalToastRegion: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToasts((event) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = { ...event, id, timestamp: Date.now() };

      setToasts((prev) => [...prev.slice(-4), item]); // Keep max 5 in viewport

      // Auto dismiss after 4.5s
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4500);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', marginInlineStart: 'env(safe-area-inset-left, 0px)' }}
      className="fixed inset-inline-start-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icon =
          toast.level === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toast.level === 'error' ? (
            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : toast.level === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-sky-400 shrink-0" />
          );

        const borderColor =
          toast.level === 'success'
            ? 'border-emerald-500/30'
            : toast.level === 'error'
            ? 'border-rose-500/30'
            : toast.level === 'warning'
            ? 'border-amber-500/30'
            : 'border-sky-500/30';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border ${borderColor} bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-white tracking-tight">{toast.title}</h5>
              {toast.detail && <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{toast.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
