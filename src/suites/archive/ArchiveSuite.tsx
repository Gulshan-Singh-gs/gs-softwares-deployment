// src/suites/archive/ArchiveSuite.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useArchiveStore } from './store/archiveStore';
import { ARCHIVE_DOMAINS } from './registry/archiveTaxonomy';
import { ArchiveExplorer } from './components/explorer/ArchiveExplorer';
import { ArchiveInspector } from './components/inspector/ArchiveInspector';
import { ArchivePreviewModal } from './components/preview/ArchivePreviewModal';
import { formatBytes } from '../../lib/fileUtils';
import {
  Folder,
  Archive,
  FolderOutput,
  Minimize2,
  Repeat,
  ShieldLock,
  CheckCircle2,
  Layers,
  Search,
  Eye,
  BarChart2,
  ListOrdered,
  History,
  Sliders,
  Download,
  FolderPlus,
  Upload,
  RefreshCw,
  Sparkles,
  Shield,
  FileCheck
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder,
  Archive,
  FolderOutput,
  Minimize2,
  Repeat,
  ShieldLock,
  CheckCircle2,
  Layers,
  Search,
  Eye,
  BarChart2,
  ListOrdered,
  History,
  Sliders,
  Download
};

export const ArchiveSuite: React.FC = () => {
  const archiveInputRef = useRef<HTMLInputElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeDomain = useArchiveStore((s) => s.activeDomain);
  const setDomain = useArchiveStore((s) => s.setDomain);
  const archiveName = useArchiveStore((s) => s.archiveName);
  const items = useArchiveStore((s) => s.items);
  const metadata = useArchiveStore((s) => s.archiveMetadata);
  const statusMessage = useArchiveStore((s) => s.statusMessage);
  const isProcessing = useArchiveStore((s) => s.isProcessing);
  const progressPercent = useArchiveStore((s) => s.progressPercent);

  const loadArchiveFile = useArchiveStore((s) => s.loadArchiveFile);
  const loadDemoArchive = useArchiveStore((s) => s.loadDemoArchive);
  const createNewArchive = useArchiveStore((s) => s.createNewArchive);
  const exportCompiledArchive = useArchiveStore((s) => s.exportCompiledArchive);

  // Auto-load bundled demo archive if workspace is fresh/empty
  useEffect(() => {
    if (items.length === 0) {
      loadDemoArchive();
    }
  }, []);

  const handleOpenArchiveFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadArchiveFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION & BRAND BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Archive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Archive Suite</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{archiveName}</span>
          </div>
        </div>

        {/* Global Toolbar Commands */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={archiveInputRef}
            onChange={handleOpenArchiveFile}
            accept=".zip,.tar,.gz,.tgz,.bz2,.xz,.7z"
            className="hidden"
          />

          <button
            onClick={() => archiveInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
            title="Open existing ZIP / TAR file"
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>

          <button
            onClick={() => createNewArchive('New_Package.zip')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
            title="Create clean empty archive"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={loadDemoArchive}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            title="Reload Demo Archive"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Demo</span>
          </button>

          <button
            onClick={exportCompiledArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            title="Download compiled ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 xl:hidden"
            title="Toggle Controls Drawer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TAXONOMY RAIL (15 DOMAINS) */}
        <nav className="w-48 bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 select-none hidden lg:flex">
          <div className="h-9 px-3 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>Capabilities</span>
            <span>15 DOMAINS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {ARCHIVE_DOMAINS.map((domain) => {
              const IconComp = ICON_MAP[domain.iconName] || Archive;
              const isActive = activeDomain === domain.id;

              return (
                <button
                  key={domain.id}
                  onClick={() => setDomain(domain.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                  title={domain.description}
                >
                  <IconComp
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
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
              <span className="font-semibold uppercase tracking-wider">Zero Upload Active</span>
            </div>
            <p className="text-[9px] text-zinc-600 mt-0.5">
              100% In-Memory. No server calls.
            </p>
          </div>
        </nav>

        {/* CENTER PANE: ARCHIVE EXPLORER */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ArchiveExplorer />
        </main>

        {/* RIGHT PANE: DESKTOP INSPECTOR */}
        <div className="hidden xl:block shrink-0 h-full">
          <ArchiveInspector />
        </div>

        {/* MOBILE SLIDE-OVER INSPECTOR */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 flex justify-end xl:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-80 h-full bg-[#0C0E14] shadow-2xl relative">
              <ArchiveInspector />
            </div>
            <div
              className="flex-1 h-full"
              onClick={() => setMobileDrawerOpen(false)}
            />
          </div>
        )}
      </div>

      {/* 3. BOTTOM APPLICATION STATUS BAR */}
      <footer className="h-7 bg-[#090A0E] border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="text-zinc-300 truncate max-w-xs">{statusMessage}</span>
          </div>
          {isProcessing && progressPercent > 0 && (
            <span className="text-amber-400 font-bold">{progressPercent}%</span>
          )}
        </div>

        <div className="flex items-center gap-4 hidden sm:flex">
          <span>{items.length} items</span>
          <span>{formatBytes(metadata.uncompressedSize)}</span>
          <span className="text-amber-400">Savings: {metadata.compressionRatio}%</span>
          <span className="text-zinc-600">ZIP / Deflate</span>
        </div>
      </footer>

      {/* 4. MODAL FILE PREVIEW */}
      <ArchivePreviewModal />
    </div>
  );
};
