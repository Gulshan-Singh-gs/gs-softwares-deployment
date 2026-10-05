// src/suites/hash/HashSuite.tsx
import React, { useRef } from 'react';
import { useHashStore } from './store/hashStore';
import { HASH_DOMAINS } from './registry/hashTaxonomy';
import { TextHashStudio } from './components/text/TextHashStudio';
import { FileHashStudio } from './components/file/FileHashStudio';
import { HmacStudio } from './components/hmac/HmacStudio';
import { BatchHashStudio } from './components/batch/BatchHashStudio';
import { HashInspector } from './components/inspector/HashInspector';
import { HashDetailsInspector } from './components/inspector/HashDetailsInspector';
import {
  Hash,
  Type,
  FileCode,
  Layers,
  CheckCircle2,
  Key,
  Sliders,
  Files,
  FileSpreadsheet,
  Search,
  Binary,
  History,
  Shield,
  Upload,
  Cpu
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  FileCode,
  Layers,
  CheckCircle2,
  Key,
  Sliders,
  Files,
  FileSpreadsheet,
  Search,
  Binary,
  History
};

export const HashSuite: React.FC = () => {
  const activeDomain = useHashStore((s) => s.activeDomain);
  const setDomain = useHashStore((s) => s.setDomain);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setSelectedFile = useHashStore((s) => s.setSelectedFile);

  const handleGlobalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setDomain('file');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION & BRAND BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Hash className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Hash Suite</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">Cryptographic Checksum &amp; Verification</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleGlobalFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open File</span>
          </button>

          <span className="text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded font-mono hidden md:inline">
            100% Client-Side
          </span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Domain Navigation Rail */}
        <aside className="w-[240px] bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-2">
              Hash Domains
            </div>
            <div className="space-y-1">
              {HASH_DOMAINS.map((domain) => {
                const IconComponent = ICON_MAP[domain.icon] || Hash;
                const isActive = activeDomain === domain.id;

                return (
                  <button
                    key={domain.id}
                    onClick={() => setDomain(domain.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-zinc-500'}`} />
                    <span className="truncate flex-1">{domain.label}</span>
                    {domain.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 border border-white/10">
                        {domain.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Workspace Stage */}
        <main className="flex-1 flex flex-col bg-[#07080A] overflow-hidden">
          {activeDomain === 'text' && <TextHashStudio />}
          {activeDomain === 'file' && <FileHashStudio />}
          {activeDomain === 'multi' && <TextHashStudio />}
          {activeDomain === 'verify' && <FileHashStudio />}
          {activeDomain === 'hmac' && <HmacStudio />}
          {activeDomain === 'checksum' && <TextHashStudio />}
          {activeDomain === 'batch' && <BatchHashStudio />}
          {activeDomain === 'manifest' && <BatchHashStudio />}
          {activeDomain === 'inspector' && <HashInspector />}
          {activeDomain === 'encoding' && <TextHashStudio />}
          {activeDomain === 'history' && <TextHashStudio />}
        </main>

        {/* Right Details Inspector Panel */}
        <HashDetailsInspector />
      </div>

      {/* 3. STATUS BAR */}
      <footer className="h-[28px] bg-[#0A0C12] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Shield className="w-3 h-3" /> Zero Server Upload
          </span>
          <span className="hidden sm:inline">· Web Crypto API NIST FIPS 180-4 compliant</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Active Domain: {activeDomain.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};
