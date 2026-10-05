// src/suites/qr/QrSuite.tsx
import React, { useState } from 'react';
import { useQrStore } from './store/qrStore';
import { QR_DOMAINS } from './registry/qrTaxonomy';
import { QrVisualMatrix } from './components/generator/QrVisualMatrix';
import { QrScannerPanel } from './components/scanner/QrScannerPanel';
import { QrInspector } from './components/inspector/QrInspector';
import { LabelStudioCanvas } from './components/label/LabelStudioCanvas';
import { SerialGeneratorPanel } from './components/serial/SerialGeneratorPanel';
import { QualityDiagnosticsPanel } from './components/diagnostics/QualityDiagnosticsPanel';
import {
  Camera,
  QrCode,
  Barcode,
  ScanText,
  ListOrdered,
  History,
  Sliders,
  Shield,
  Download,
  Copy,
  Sparkles,
  FileText,
  CheckCircle2,
  Palette,
  Tag,
  Binary,
  RefreshCw,
  Activity
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  QrCode,
  Camera,
  ScanText,
  CheckCircle2,
  Palette,
  Tag,
  ListOrdered,
  Binary,
  RefreshCw,
  Activity,
  History,
  Download
};

export const QrSuite: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeDomain = useQrStore((s) => s.activeDomain);
  const setDomain = useQrStore((s) => s.setDomain);
  const codeCategory = useQrStore((s) => s.codeCategory);
  const setCodeCategory = useQrStore((s) => s.setCodeCategory);
  const statusMessage = useQrStore((s) => s.statusMessage);
  const history = useQrStore((s) => s.history);
  const clearHistory = useQrStore((s) => s.clearHistory);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Barcode & QR Suite</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">
              12 Domains · Local Symbology · Print Label Studio
            </span>
          </div>
        </div>

        {/* Global Toolbar Mode Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/5 text-xs font-mono">
            <button
              onClick={() => {
                setCodeCategory('qr');
                setDomain('create');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDomain === 'create' && codeCategory === 'qr'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              QR Code
            </button>
            <button
              onClick={() => {
                setCodeCategory('barcode');
                setDomain('create');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDomain === 'create' && codeCategory === 'barcode'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Barcode
            </button>
            <button
              onClick={() => setDomain('label')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDomain === 'label' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Thermal Label
            </button>
            <button
              onClick={() => setDomain('scan')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDomain === 'scan' ? 'bg-sky-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scanner
            </button>
          </div>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 xl:hidden"
            title="Toggle Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TAXONOMY NAVIGATION (12 DOMAINS) */}
        <nav className="w-48 bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 select-none hidden lg:flex">
          <div className="h-9 px-3 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>Capabilities</span>
            <span>12 DOMAINS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {QR_DOMAINS.map((domain) => {
              const IconComp = ICON_MAP[domain.iconName] || QrCode;
              const isActive = activeDomain === domain.id;

              return (
                <button
                  key={domain.id}
                  onClick={() => setDomain(domain.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                  title={domain.description}
                >
                  <IconComp
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-sky-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span className="truncate">{domain.name}</span>
                </button>
              );
            })}
          </div>

          {/* Zero Upload Privacy Badge */}
          <div className="p-3 border-t border-white/[0.04] bg-[#08090E]">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold uppercase tracking-wider">Zero Upload Privacy</span>
            </div>
            <p className="text-[9px] text-zinc-600 mt-0.5">
              100% In-Memory Symbology Engine
            </p>
          </div>
        </nav>

        {/* CENTER VIEWPORT: SWITCHED BY DOMAIN */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeDomain === 'scan' || activeDomain === 'read' ? (
            <QrScannerPanel />
          ) : activeDomain === 'label' ? (
            <LabelStudioCanvas />
          ) : activeDomain === 'serial' ? (
            <SerialGeneratorPanel />
          ) : activeDomain === 'diagnose' || activeDomain === 'validate' ? (
            <QualityDiagnosticsPanel />
          ) : activeDomain === 'history' ? (
            <div className="flex-1 p-6 overflow-y-auto bg-[#08090E]">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Scan & Generation History</h3>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-rose-400 hover:underline font-mono"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-lg bg-[#0E1118] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {record.format}
                        </span>
                        <span className="text-zinc-300 font-mono truncate">{record.content}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <QrVisualMatrix />
          )}
        </main>

        {/* RIGHT INSPECTOR */}
        <div className="hidden xl:block shrink-0 h-full">
          <QrInspector />
        </div>

        {/* MOBILE SLIDE-OVER */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 flex justify-end xl:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-80 h-full bg-[#0C0E14] shadow-2xl relative">
              <QrInspector />
            </div>
            <div className="flex-1 h-full" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}
      </div>

      {/* 3. BOTTOM APPLICATION STATUS BAR */}
      <footer className="h-7 bg-[#090A0E] border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">{statusMessage}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 hidden sm:flex">
          <span>Local Engine Active</span>
          <span className="text-sky-400">Reed-Solomon ECC</span>
          <span className="text-zinc-600">Zero Server Upload</span>
        </div>
      </footer>
    </div>
  );
};
