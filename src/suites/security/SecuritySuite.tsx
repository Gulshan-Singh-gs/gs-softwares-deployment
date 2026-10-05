// src/suites/security/SecuritySuite.tsx
import React, { useEffect, useRef } from 'react';
import { useSecurityStore } from './store/securityStore';
import { SECURITY_DOMAINS } from './registry/securityTaxonomy';
import { FileInspectorView } from './components/inspect/FileInspectorView';
import { HexViewer } from './components/hex/HexViewer';
import { CipherStudio } from './components/cipher/CipherStudio';
import { PasswordStudio } from './components/password/PasswordStudio';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { SecurityInspector } from './components/inspector/SecurityInspector';
import {
  ShieldCheck,
  Search,
  Binary,
  Hash,
  GitCompare,
  Lock,
  Unlock,
  FolderLock,
  ShieldOff,
  KeyRound,
  Upload,
  Sparkles,
  Shield
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Binary,
  Hash,
  GitCompare,
  Lock,
  Unlock,
  FolderLock,
  ShieldOff,
  KeyRound,
  ShieldCheck
};

export const SecuritySuite: React.FC = () => {
  const activeDomain = useSecurityStore((s) => s.activeDomain);
  const setDomain = useSecurityStore((s) => s.setDomain);
  const activeFile = useSecurityStore((s) => s.activeFile);
  const loadFile = useSecurityStore((s) => s.loadFile);
  const loadDemoBufferSet = useSecurityStore((s) => s.loadDemoBufferSet);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize demo test document if buffer is empty
  useEffect(() => {
    if (!activeFile) {
      loadDemoBufferSet();
    }
  }, []);

  const handleGlobalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION & BRAND BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Security Suite</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">
              {activeFile?.name || 'Local File Security & Cryptography Engine'}
            </span>
          </div>
        </div>

        {/* Global Toolbar Commands */}
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

          <button
            onClick={() => loadDemoBufferSet()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Demo File</span>
          </button>

          <span className="text-[10px] text-emerald-400/90 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded font-mono hidden md:inline">
            Zero-Upload Air-Gapped
          </span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Security Domain Navigation Rail */}
        <aside className="w-[240px] bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-2">
              Security Domains
            </div>
            <div className="space-y-1">
              {SECURITY_DOMAINS.map((domain) => {
                const IconComponent = ICON_MAP[domain.icon] || ShieldCheck;
                const isActive = activeDomain === domain.id;

                return (
                  <button
                    key={domain.id}
                    onClick={() => setDomain(domain.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
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
          {activeDomain === 'inspect' && <FileInspectorView />}
          {activeDomain === 'hex' && <HexViewer />}
          {activeDomain === 'hash' && <FileInspectorView />}
          {activeDomain === 'compare' && <FileInspectorView />}
          {activeDomain === 'encrypt' && <CipherStudio mode="encrypt" />}
          {activeDomain === 'decrypt' && <CipherStudio mode="decrypt" />}
          {activeDomain === 'container' && <CipherStudio mode="encrypt" />}
          {activeDomain === 'privacy' && <FileInspectorView />}
          {activeDomain === 'password' && <PasswordStudio />}
          {activeDomain === 'audit' && <AuditLogViewer />}
        </main>

        {/* Right Security Inspector Panel */}
        <SecurityInspector />
      </div>

      {/* 3. STATUS BAR */}
      <footer className="h-[28px] bg-[#0A0C12] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Shield className="w-3 h-3" /> NIST FIPS &amp; WebCrypto Standard
          </span>
          <span className="hidden sm:inline">· 100% Client-Side In-Memory Execution</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Active Domain: {activeDomain.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};
