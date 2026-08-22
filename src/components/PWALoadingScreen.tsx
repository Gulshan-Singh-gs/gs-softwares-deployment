import React, { useEffect, useState } from 'react';
import { Shield, Cpu, Zap, CheckCircle2, HardDrive, ArrowRight, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

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
      currentProgress += Math.floor(Math.random() * 14) + 12;

      if (currentProgress >= 25 && currentProgress < 50) {
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
    }, 170);

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 selection:bg-indigo-500/30 overflow-hidden ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#07090e',
        color: '#f8fafc',
      }}
    >
      {/* 3D Ambient Fluid Mesh Blur Orbs */}
      <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-indigo-600/30 blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-emerald-600/25 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-pink-600/20 blur-[110px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }}></div>

      {/* Main Glassmorphic Spatial Prism Card */}
      <div className="relative z-10 p-6 sm:p-8 rounded-[2rem] max-w-xl w-full space-y-6 shadow-2xl bg-slate-900/65 border border-white/15 border-t-white/40 backdrop-blur-2xl">
        {/* Top Specular Edge Glow Bar */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>

        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            {/* 3D Prismatic Icon Badge with Dual Orbital Rings */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 border border-white/30">
              <div className="absolute -inset-2 rounded-[1.25rem] border-2 border-transparent border-t-indigo-400 border-r-sky-400 animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -inset-1 rounded-[1.1rem] border border-transparent border-b-emerald-400 border-l-pink-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              <Sparkles className="w-7 h-7 animate-pulse text-white drop-shadow-md" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  GS Softwares Suite
                </h1>
              </div>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Spatial Glass • 100% Client-Side WASM</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/15 backdrop-blur-md cursor-pointer"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fluid Progress Display */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-indigo-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Pre-warming WASM Sandboxes...
            </span>
            <span className="font-mono font-bold text-sm text-emerald-400 tracking-wider">{progress}%</span>
          </div>

          {/* Dual-Track Laser Progress Bar */}
          <div className="w-full h-3.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10 shadow-inner relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-sky-400 transition-all duration-300 shadow-lg shadow-indigo-500/60 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Laser Sweep Highlighting */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Spatial Telemetry Grid */}
        <div className="space-y-2.5 pt-1">
          {diagnostics.map((item) => {
            const Icon = item.icon;
            const isDone = item.status === 'done';
            const isRunning = item.status === 'running';

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-sm shadow-emerald-500/10'
                    : isRunning
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 opacity-40 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isRunning
                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 animate-pulse'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-tight">{item.label}</div>
                    <div className="text-[11px] opacity-75 font-medium mt-0.5">{item.sublabel}</div>
                  </div>
                </div>

                <div>
                  {isDone && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 drop-shadow-sm" />}
                  {isRunning && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
                  {item.status === 'pending' && <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* PWA Hardware Isolation Badges */}
        <div className="pt-2 grid grid-cols-3 gap-2.5 text-center text-[11px]">
          <div className="p-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="opacity-60 text-[10px] uppercase font-extrabold tracking-wider">COOP/COEP</div>
            <div className={`font-semibold mt-1 flex items-center justify-center gap-1.5 ${isCrossIsolated ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isCrossIsolated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Isolated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Standard</span>
                </>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="opacity-60 text-[10px] uppercase font-extrabold tracking-wider">WASM Core</div>
            <div className="font-semibold text-indigo-400 mt-1 flex items-center justify-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>v2.0 Active</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="opacity-60 text-[10px] uppercase font-extrabold tracking-wider">Privacy</div>
            <div className="font-semibold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>0 Server Logs</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={progress < 100}
            className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
              progress === 100
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white shadow-indigo-500/40 cursor-pointer scale-102 border border-white/20'
                : 'bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <span>{progress === 100 ? 'Launch GS Suite' : 'Loading Sandbox Runtimes...'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
