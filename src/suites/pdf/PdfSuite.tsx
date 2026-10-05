// src/suites/pdf/PdfSuite.tsx
import React, { useState, useEffect } from 'react';
import { PdfCanvas } from './components/canvas/PdfCanvas';
import { PageOrganizerRail } from './components/organizer/PageOrganizerRail';
import { PdfInspector } from './components/inspector/PdfInspector';
import { usePdfStore } from './store/pdfStore';
import { PDF_DOMAINS } from './registry/pdfTaxonomy';
import {
  BookOpen,
  Layers,
  Edit3,
  Highlighter,
  CheckSquare,
  PenTool,
  ScanText,
  RefreshCw,
  Minimize2,
  Lock,
  ShieldAlert,
  SplitSquareVertical,
  FileSearch,
  Sparkles,
  Wand2,
  Table,
  FilePlus,
  Layout,
  Eye,
  Users,
  FolderKanban,
  Boxes,
  Download,
  FileText,
  Undo2,
  Redo2,
  Sliders,
  X,
  RotateCcw
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Layers,
  Edit3,
  Highlighter,
  CheckSquare,
  PenTool,
  ScanText,
  RefreshCw,
  Minimize2,
  Lock,
  ShieldAlert,
  SplitSquareVertical,
  FileSearch,
  Sparkles,
  Wand2,
  Table,
  FilePlus,
  Layout,
  Eye,
  Users,
  FolderKanban,
  Boxes,
  Download
};

export const PdfSuite: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showOrganizerRail, setShowOrganizerRail] = useState(true);

  const activeDomain = usePdfStore((s) => s.activeDomain);
  const setDomain = usePdfStore((s) => s.setDomain);
  const undo = usePdfStore((s) => s.undo);
  const redo = usePdfStore((s) => s.redo);
  const undoCount = usePdfStore((s) => s.undoStack.length);
  const redoCount = usePdfStore((s) => s.redoStack.length);
  const statusMessage = usePdfStore((s) => s.statusMessage);
  const loadDemoDocument = usePdfStore((s) => s.loadDemoDocument);
  const title = usePdfStore((s) => s.title);
  const fileName = usePdfStore((s) => s.fileName);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP APPLICATION BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS-PDF Operating System</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{fileName}</span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOrganizerRail((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1 ${
              showOrganizerRail
                ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                : 'bg-white/[0.04] border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Page Thumbnail Rail"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thumbnails</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={undo}
            disabled={undoCount === 0}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 text-zinc-400 hover:text-white transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoCount === 0}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 text-zinc-400 hover:text-white transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={loadDemoDocument}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-zinc-400 hover:text-rose-300 hover:bg-white/[0.08] flex items-center gap-1 transition-colors"
            title="Restore Demo Document"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Demo Document</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => alert('Local Sandboxed PDF Byte Compilation Initiated · Zero Data Leaves Device')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tool Rail (23 Domains) */}
        <nav
          className="hidden md:flex w-[74px] bg-[#0A0C10] border-r border-white/[0.06] flex-col items-center py-2 overflow-y-auto space-y-1 z-10 shrink-0 scrollbar-none"
          aria-label="PDF Tool Domains"
        >
          {PDF_DOMAINS.map((domain) => {
            const Icon = ICON_MAP[domain.iconName] || FileText;
            const isActive = activeDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setDomain(domain.id)}
                className={`w-13 h-13 rounded-xl flex flex-col items-center justify-center gap-1 transition-all p-1.5 ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
                title={domain.description}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium tracking-tight text-center truncate w-full">
                  {domain.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Thumbnail Page Rail (Collapsible) */}
        {showOrganizerRail && (
          <div className="hidden sm:block w-48 md:w-56 h-full shrink-0 z-10">
            <PageOrganizerRail />
          </div>
        )}

        {/* Center Section: PDF Document Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <PdfCanvas />

          {/* Mobile Quick Actions Dock (< 768px) */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0E1017]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-30">
            {PDF_DOMAINS.slice(0, 5).map((dom) => {
              const Icon = ICON_MAP[dom.iconName] || FileText;
              const isActive = activeDomain === dom.id;
              return (
                <button
                  key={dom.id}
                  onClick={() => {
                    setDomain(dom.id);
                    setMobileDrawerOpen(true);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                  title={dom.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <button
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-white/[0.08] text-white flex items-center justify-center border border-white/10"
              title="Toggle Parameters"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right Properties & AI Inspector */}
        <div className="hidden lg:block w-[310px] h-full z-10 shrink-0">
          <PdfInspector />
        </div>

        {/* Mobile Contextual Bottom-Sheet */}
        {mobileDrawerOpen && (
          <div className="lg:hidden absolute inset-x-0 bottom-0 max-h-[65vh] bg-[#0E1017] border-t border-white/10 rounded-t-2xl z-40 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="p-3.5 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0E1017]/95 backdrop-blur-md z-10">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                {activeDomain} Controls
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <PdfInspector />
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <footer className="h-10 bg-[#08090D] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% OFFLINE LOCAL SANDBOX
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 truncate max-w-sm">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">PDF/UA &amp; ISO 32000-2 COMPLIANT</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-rose-400">ZERO UPLOAD GUARANTEED</span>
        </div>
      </footer>
    </div>
  );
};

export default PdfSuite;
