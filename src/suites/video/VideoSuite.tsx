// src/suites/video/VideoSuite.tsx
import React, { useState, useEffect } from 'react';
import { VideoViewer } from './components/viewer/VideoViewer';
import { TimelineEngine } from './components/timeline/TimelineEngine';
import { VideoInspector } from './components/inspector/VideoInspector';
import { useVideoStore } from './store/videoStore';
import { VIDEO_DOMAINS } from './registry/videoTaxonomy';
import {
  Film,
  Scissors,
  Maximize2,
  FastForward,
  Wand2,
  SunMedium,
  Volume2,
  Type,
  Activity,
  Sparkles,
  UserCheck,
  ScanEye,
  Share2,
  Radio,
  Layers,
  Download,
  Video,
  Undo2,
  Redo2,
  Sliders,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  Scissors,
  Maximize2,
  FastForward,
  Wand2,
  SunMedium,
  Volume2,
  Type,
  Activity,
  Sparkles,
  UserCheck,
  Film,
  ScanEye,
  Share2,
  Radio,
  Layers,
  Download
};

export const VideoSuite: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeDomain = useVideoStore((s) => s.activeDomain);
  const setDomain = useVideoStore((s) => s.setDomain);
  const undo = useVideoStore((s) => s.undo);
  const redo = useVideoStore((s) => s.redo);
  const undoCount = useVideoStore((s) => s.undoStack.length);
  const redoCount = useVideoStore((s) => s.redoStack.length);
  const statusMessage = useVideoStore((s) => s.statusMessage);
  const togglePlay = useVideoStore((s) => s.togglePlay);
  const cutAtPlayhead = useVideoStore((s) => s.cutAtPlayhead);
  const loadDemoProject = useVideoStore((s) => s.loadDemoProject);
  const title = useVideoStore((s) => s.title);

  // Keyboard Shortcuts (Space, C, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        cutAtPlayhead();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
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
  }, [togglePlay, cutAtPlayhead, undo, redo]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP APPLICATION BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Video NLE Studio</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{title}</span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
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
            onClick={loadDemoProject}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.08] flex items-center gap-1 transition-colors"
            title="Restore Demo Sequence"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Demo Project</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => alert('Local WebCodecs Hardware Export initiated')}
            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium text-xs hover:bg-purple-500 transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Sequence</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tool Rail (Desktop ≥ 1200px) */}
        <nav
          className="hidden md:flex w-[74px] bg-[#0A0C10] border-r border-white/[0.06] flex-col items-center py-2 overflow-y-auto space-y-1 z-10 shrink-0 scrollbar-none"
          aria-label="Video Tool Domains"
        >
          {VIDEO_DOMAINS.map((domain) => {
            const Icon = ICON_MAP[domain.iconName] || Film;
            const isActive = activeDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setDomain(domain.id)}
                className={`w-13 h-13 rounded-xl flex flex-col items-center justify-center gap-1 transition-all p-1.5 ${
                  isActive
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-400/30 shadow-sm'
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

        {/* Center Section: Video Viewer (Top) + Multi-track Timeline (Bottom) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Half: Video Viewer Canvas */}
          <div className="h-[55%] md:h-[58%] w-full relative">
            <VideoViewer />
          </div>

          {/* Bottom Half: Professional Multi-track Timeline */}
          <div className="h-[45%] md:h-[42%] w-full relative">
            <TimelineEngine />
          </div>

          {/* Mobile Orbital / Floating Quick Actions Ring */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0E1017]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-30">
            {VIDEO_DOMAINS.slice(0, 5).map((dom) => {
              const Icon = ICON_MAP[dom.iconName] || Film;
              const isActive = activeDomain === dom.id;
              return (
                <button
                  key={dom.id}
                  onClick={() => {
                    setDomain(dom.id);
                    setMobileDrawerOpen(true);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-purple-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
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

        {/* Right AI & Properties Inspector (Desktop ≥ 1200px) */}
        <div className="hidden lg:block w-[310px] h-full z-10 shrink-0">
          <VideoInspector />
        </div>

        {/* Mobile Contextual Bottom-Sheet (< 768px) */}
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
              <VideoInspector />
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <footer className="h-10 bg-[#08090D] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LOCAL BROWSER NLE ENGINE
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 truncate max-w-sm">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">1920 × 1080 @ 30 FPS</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-purple-400">NON-DESTRUCTIVE AI</span>
        </div>
      </footer>
    </div>
  );
};
export default VideoSuite;
