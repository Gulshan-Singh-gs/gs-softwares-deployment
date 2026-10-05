// src/suites/audio/AudioSuite.tsx
import React, { useState, useEffect } from 'react';
import { AudioWorkspaceCanvas } from './components/workspace/AudioWorkspaceCanvas';
import { ConsoleMixer } from './components/mixer/ConsoleMixer';
import { AudioInspector } from './components/inspector/AudioInspector';
import { useAudioStore } from './store/audioStore';
import { AUDIO_DOMAINS } from './registry/audioTaxonomy';
import {
  PlayCircle,
  Mic,
  Activity,
  Layers,
  Sliders,
  Radio,
  Volume2,
  Sparkles,
  ShieldAlert,
  ScanLine,
  UserCheck,
  RadioTower,
  Music,
  Wand2,
  Bot,
  FileText,
  Edit3,
  ScanEye,
  Zap,
  FolderKanban,
  BarChart2,
  Copy,
  Download,
  Boxes,
  Play,
  Pause,
  Square,
  Undo2,
  Redo2,
  RotateCcw,
  X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  PlayCircle,
  Mic,
  Activity,
  Layers,
  Sliders,
  Radio,
  Volume2,
  Sparkles,
  ShieldAlert,
  ScanLine,
  UserCheck,
  RadioTower,
  Music,
  Wand2,
  Bot,
  FileText,
  Edit3,
  ScanEye,
  Zap,
  FolderKanban,
  BarChart2,
  Copy,
  Download,
  Boxes
};

export const AudioSuite: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showConsoleMixer, setShowConsoleMixer] = useState(false);

  const activeDomain = useAudioStore((s) => s.activeDomain);
  const setDomain = useAudioStore((s) => s.setDomain);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const stop = useAudioStore((s) => s.stop);
  const isRecording = useAudioStore((s) => s.isRecording);
  const toggleRecording = useAudioStore((s) => s.toggleRecording);
  const undo = useAudioStore((s) => s.undo);
  const redo = useAudioStore((s) => s.redo);
  const undoCount = useAudioStore((s) => s.undoStack.length);
  const redoCount = useAudioStore((s) => s.redoStack.length);
  const statusMessage = useAudioStore((s) => s.statusMessage);
  const loadDemoProject = useAudioStore((s) => s.loadDemoProject);
  const title = useAudioStore((s) => s.title);

  // Global Keyboard Shortcuts (Space, R, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggleRecording();
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
  }, [togglePlay, toggleRecording, undo, redo]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP APPLICATION BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
            <Music className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Audio Studio (DAW)</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{title}</span>
          </div>
        </div>

        {/* Global Transport & Controls */}
        <div className="flex items-center gap-2">
          {/* Record button */}
          <button
            onClick={toggleRecording}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              isRecording
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-white/[0.04] border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Record Take (R)"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRecording ? 'RECORDING' : 'Record'}</span>
          </button>

          {/* Play / Pause button */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md shadow-pink-600/20"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={stop}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="Stop Playback"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Toggle Mixer Drawer */}
          <button
            onClick={() => setShowConsoleMixer((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1 ${
              showConsoleMixer
                ? 'bg-pink-500/15 border-pink-400/30 text-pink-300'
                : 'bg-white/[0.04] border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Console Mixer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mixer</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Undo / Redo */}
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

          {/* Restore Demo */}
          <button
            onClick={loadDemoProject}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-zinc-400 hover:text-pink-300 hover:bg-white/[0.08] flex items-center gap-1 transition-colors"
            title="Restore Master Session Demo"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Demo Session</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Export */}
          <button
            onClick={() => alert('Zero-Loss 24-bit Broadcast WAV Render Initiated · Zero Network Footprint')}
            className="px-3 py-1.5 rounded-lg bg-pink-600 text-white font-medium text-xs hover:bg-pink-500 transition-all flex items-center gap-1.5 shadow-md shadow-pink-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export WAV</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tool Rail (24 Domains) */}
        <nav
          className="hidden md:flex w-[74px] bg-[#0A0C10] border-r border-white/[0.06] flex-col items-center py-2 overflow-y-auto space-y-1 z-10 shrink-0 scrollbar-none"
          aria-label="Audio Tool Domains"
        >
          {AUDIO_DOMAINS.map((domain) => {
            const Icon = ICON_MAP[domain.iconName] || Music;
            const isActive = activeDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setDomain(domain.id)}
                className={`w-13 h-13 rounded-xl flex flex-col items-center justify-center gap-1 transition-all p-1.5 ${
                  isActive
                    ? 'bg-pink-500/15 text-pink-300 border border-pink-400/30 shadow-sm'
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

        {/* Center: Multitrack Waveform Canvas & Optional Mixer */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className={`${showConsoleMixer ? 'h-[62%]' : 'h-full'} w-full relative transition-all duration-200`}>
            <AudioWorkspaceCanvas />
          </div>

          {showConsoleMixer && (
            <div className="h-[38%] w-full relative border-t border-white/10">
              <ConsoleMixer />
            </div>
          )}

          {/* Mobile Dock Ring (< 768px) */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0E1017]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-30">
            {AUDIO_DOMAINS.slice(0, 5).map((dom) => {
              const Icon = ICON_MAP[dom.iconName] || Music;
              const isActive = activeDomain === dom.id;
              return (
                <button
                  key={dom.id}
                  onClick={() => {
                    setDomain(dom.id);
                    setMobileDrawerOpen(true);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-pink-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
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
          <AudioInspector />
        </div>

        {/* Mobile Contextual Drawer */}
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
              <AudioInspector />
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <footer className="h-10 bg-[#08090D] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AUDIO WORKLET ENGINE (0ms JITTER)
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 truncate max-w-sm">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">48,000 Hz · 32-bit Float</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-pink-400">TRIAD AUDIO LOOP</span>
        </div>
      </footer>
    </div>
  );
};

export default AudioSuite;
