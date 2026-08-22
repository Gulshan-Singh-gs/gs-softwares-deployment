import React, { useEffect, useState } from 'react';
import { Shield, Cpu, Zap, CheckCircle2, HardDrive, ArrowRight, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

interface PWALoadingScreenProps {
  onComplete: () => void;
  forceShow?: boolean;
}

interface DiagnosticItem {
  id: string;
  label: string;
  sublabel: string;
  status: 'pending' | 'running' | 'done' | 'warning';
  icon: React.ElementType;
}

export function PWALoadingScreen({ onComplete, forceShow = false }: PWALoadingScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isCrossIsolated, setIsCrossIsolated] = useState<boolean>(false);

  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    {
      id: 'sw',
      label: 'Service Worker & Offline Cache',
      sublabel: 'Caching core WebAssembly binaries & assets',
      status: 'running',
      icon: HardDrive,
    },
    {
      id: 'wasm',
      label: 'WebAssembly & SharedArrayBuffer',
      sublabel: 'Pre-warming multi-threaded C++ runtime',
      status: 'pending',
      icon: Cpu,
    },
    {
      id: 'gpu',
      label: 'Hardware Acceleration & Web Workers',
      sublabel: 'Spawning background processing workers',
      status: 'pending',
      icon: Zap,
    },
    {
      id: 'sandbox',
      label: 'Client-Side Private Storage',
      sublabel: 'Initializing isolated Origin Private File System',
      status: 'pending',
      icon: Shield,
    },
  ]);

  useEffect(() => {
    // Check Cross-Origin Isolation status (COOP/COEP headers for SharedArrayBuffer)
    if (typeof window !== 'undefined') {
      setIsCrossIsolated(!!window.crossOriginIsolated);
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 12;

      if (currentProgress >= 25 && currentProgress < 50) {
        setCurrentStepIndex(1);
        setDiagnostics((prev) =>
          prev.map((item, idx) =>
            idx === 0
              ? { ...item, status: 'done' }
              : idx === 1
              ? { ...item, status: 'running' }
              : item
          )
        );
      } else if (currentProgress >= 50 && currentProgress < 75) {
        setCurrentStepIndex(2);
        setDiagnostics((prev) =>
          prev.map((item, idx) =>
            idx === 1
              ? { ...item, status: 'done' }
              : idx === 2
              ? { ...item, status: 'running' }
              : item
          )
        );
      } else if (currentProgress >= 75 && currentProgress < 100) {
        setCurrentStepIndex(3);
        setDiagnostics((prev) =>
          prev.map((item, idx) =>
            idx === 2
              ? { ...item, status: 'done' }
              : idx === 3
              ? { ...item, status: 'running' }
              : item
          )
        );
      } else if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDiagnostics((prev) =>
          prev.map((item) => ({ ...item, status: 'done' }))
        );

        // Auto transition after brief completion pause
        setTimeout(() => {
          handleFinish();
        }, 400);
      }

      setProgress(currentProgress);
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const handleFinish = () => {
    setIsExiting(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gs_pwa_loaded_session', 'true');
    }
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 selection:bg-indigo-500/30 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: 'var(--bg-main, #0f172a)',
        color: 'var(--text-main, #f8fafc)',
      }}
    >
      {/* Background ambient glowing radial blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Main Glass Card */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 shadow-2xl relative border border-slate-500/20 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-500/15 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">GS Softwares Suite</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-indigo-500 font-semibold mt-0.5">
                100% Client-Side WebAssembly Architecture
              </p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 transition-colors border border-slate-500/20"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-indigo-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Initializing Local Sandboxes...
            </span>
            <span className="font-mono font-bold text-sm">{progress}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-3 rounded-full bg-slate-500/15 overflow-hidden p-0.5 border border-slate-500/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-300 shadow-md shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Diagnostic Steps List */}
        <div className="space-y-2.5 pt-1">
          {diagnostics.map((item) => {
            const Icon = item.icon;
            const isDone = item.status === 'done';
            const isRunning = item.status === 'running';

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-100'
                    : isRunning
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'bg-slate-500/5 border-slate-500/10 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : isRunning
                        ? 'bg-indigo-500/20 text-indigo-500 animate-pulse'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] opacity-70 font-medium">{item.sublabel}</div>
                  </div>
                </div>

                <div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {isRunning && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />}
                  {item.status === 'pending' && <span className="w-2 h-2 rounded-full bg-slate-400/40 inline-block"></span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* PWA Hardware System Badges */}
        <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="p-2 rounded-xl border border-slate-500/20 bg-slate-500/5">
            <div className="opacity-60 text-[10px] uppercase font-bold">COOP/COEP</div>
            <div className={`font-semibold mt-0.5 flex items-center justify-center gap-1 ${isCrossIsolated ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isCrossIsolated ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Isolated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Standard</span>
                </>
              )}
            </div>
          </div>

          <div className="p-2 rounded-xl border border-slate-500/20 bg-slate-500/5">
            <div className="opacity-60 text-[10px] uppercase font-bold">WASM Engine</div>
            <div className="font-semibold text-indigo-500 mt-0.5 flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>v2.0 Active</span>
            </div>
          </div>

          <div className="p-2 rounded-xl border border-slate-500/20 bg-slate-500/5">
            <div className="opacity-60 text-[10px] uppercase font-bold">Privacy</div>
            <div className="font-semibold text-emerald-500 mt-0.5 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              <span>0 Server Logs</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={progress < 100}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              progress === 100
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/30 cursor-pointer scale-102'
                : 'bg-slate-500/20 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{progress === 100 ? 'Launch GS Suite' : 'Loading Sandbox Components...'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
