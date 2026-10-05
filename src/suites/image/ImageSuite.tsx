// src/suites/image/ImageSuite.tsx
import React, { useState, useEffect } from 'react';
import { CanvasEngine } from './components/canvas/CanvasEngine';
import { DynamicInspector } from './components/inspector/DynamicInspector';
import { useImageStore } from './store/imageStore';
import { TOOL_CATEGORIES } from './registry/toolTaxonomy';
import { useHaptics } from './hooks/useHaptics';
import {
  Sparkles,
  Wand2,
  Zap,
  Layers,
  Smile,
  UserCheck,
  Shirt,
  Package,
  LayoutGrid,
  Type,
  Palette,
  ScanEye,
  Cpu,
  Undo2,
  Redo2,
  Sliders,
  X,
  Shield,
  Download,
  Info
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Wand2,
  Zap,
  Layers,
  Smile,
  UserCheck,
  Shirt,
  Package,
  LayoutGrid,
  Type,
  Palette,
  ScanEye,
  Cpu
};

export const ImageSuite: React.FC = () => {
  const { triggerHaptic } = useHaptics();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeCategory = useImageStore((s) => s.activeCategory);
  const setCategory = useImageStore((s) => s.setCategory);
  const zoom = useImageStore((s) => s.zoom);
  const resetView = useImageStore((s) => s.resetView);
  const undo = useImageStore((s) => s.undo);
  const redo = useImageStore((s) => s.redo);
  const undoCount = useImageStore((s) => s.undoStack.length);
  const redoCount = useImageStore((s) => s.redoStack.length);
  const statusMessage = useImageStore((s) => s.statusMessage);
  const activeImage = useImageStore((s) => s.activeImage);
  const imageDimensions = useImageStore((s) => s.imageDimensions);

  // Keyboard accelerators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === '0') {
        resetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, resetView]);

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = activeImage;
    a.download = `gs-pixels-${Date.now()}.png`;
    a.click();
    triggerHaptic('success');
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP BAR (52-60px Desktop) */}
      <header className="h-[52px] bg-[#0C0E13] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Pixels Studio</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">Image as the Workspace</span>
          </div>
        </div>

        {/* View, History, and Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { undo(); triggerHaptic('light'); }}
            disabled={undoCount === 0}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 text-zinc-400 hover:text-white transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { redo(); triggerHaptic('light'); }}
            disabled={redoCount === 0}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 text-zinc-400 hover:text-white transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={resetView}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-zinc-300 hover:bg-white/[0.08] transition-colors"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-medium hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-ZONE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tool Rail (72-88px Desktop) */}
        <nav
          className="hidden md:flex w-[76px] bg-[#0A0C10] border-r border-white/[0.06] flex-col items-center py-2.5 overflow-y-auto space-y-1 z-10 shrink-0 scrollbar-none"
          aria-label="Tool Categories"
        >
          {TOOL_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Sparkles;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  triggerHaptic('light');
                }}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
                title={cat.description}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium tracking-tight">{cat.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Center Canvas (Maximum Viewport on Desktop; 65-75% on Mobile) */}
        <main className="flex-1 h-full relative overflow-hidden">
          <CanvasEngine />

          {/* Mobile Orbital / Floating Quick Actions Ring */}
          <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0E1017]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-30">
            {TOOL_CATEGORIES.slice(0, 5).map((cat) => {
              const Icon = ICON_MAP[cat.iconName] || Sparkles;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setMobileDrawerOpen(true);
                    triggerHaptic('light');
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-cyan-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                  title={cat.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <button
              onClick={() => {
                setMobileDrawerOpen((prev) => !prev);
                triggerHaptic('light');
              }}
              className="w-10 h-10 rounded-full bg-white/[0.08] text-white flex items-center justify-center border border-white/10"
              title="Toggle Parameters"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right AI & Tool Inspector (280-360px on Desktop) */}
        <div className="hidden lg:block w-[320px] h-full z-10 shrink-0">
          <DynamicInspector />
        </div>

        {/* Mobile Contextual Bottom-Sheet */}
        {mobileDrawerOpen && (
          <div className="lg:hidden absolute inset-x-0 bottom-0 max-h-[70vh] bg-[#0E1017] border-t border-white/10 rounded-t-2xl z-40 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="p-3.5 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0E1017]/95 backdrop-blur-md z-10">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                {activeCategory} Parameters
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <DynamicInspector />
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM STATUS BAR (44-52px Desktop) */}
      <footer className="h-11 bg-[#090A0E] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ZERO-UPLOAD CLIENT PWA
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 truncate max-w-xs">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            {imageDimensions.width} × {imageDimensions.height} px
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-cyan-400/80">OPFS / WORKERS ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};
export default ImageSuite;
