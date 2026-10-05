// src/suites/audio/components/workspace/AudioWorkspaceCanvas.tsx
import React, { useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';
import {
  Scissors,
  Trash2,
  Volume2,
  Mic,
  Activity,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
  Share2,
  FileText
} from 'lucide-react';

export const AudioWorkspaceCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const duration = useAudioStore((s) => s.duration);
  const currentTime = useAudioStore((s) => s.currentTime);
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const tracks = useAudioStore((s) => s.tracks);
  const clips = useAudioStore((s) => s.clips);
  const selectedClipId = useAudioStore((s) => s.selectedClipId);
  const selectClip = useAudioStore((s) => s.selectClip);
  const splitClipAtPlayhead = useAudioStore((s) => s.splitClipAtPlayhead);
  const deleteSelectedClip = useAudioStore((s) => s.deleteSelectedClip);
  const transcript = useAudioStore((s) => s.transcript);
  const activeTranscriptWordId = useAudioStore((s) => s.activeTranscriptWordId);
  const deleteTranscriptWord = useAudioStore((s) => s.deleteTranscriptWord);
  const activePillarMode = useAudioStore((s) => s.activePillarMode);

  // Timeline click scrubbing
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    setCurrentTime(newTime);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090D] select-none text-zinc-300 overflow-hidden">
      {/* 1. TOP TRANSPORT & MODE BAR */}
      <div className="h-10 px-4 bg-[#0B0D14] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={splitClipAtPlayhead}
            className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
            title="Razor Blade Cut at Playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split (S)</span>
          </button>
          <button
            onClick={deleteSelectedClip}
            disabled={!selectedClipId}
            className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 disabled:opacity-30 transition-colors"
            title="Delete Selected Clip (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] text-zinc-500 hidden sm:inline">SAMPLE-ACCURATE ENGINE (48kHz)</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-pink-400 font-mono font-semibold">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* 2. BIDIRECTIONAL TRANSCRIPT BAR (Speech-to-Timeline Sync) */}
      <div className="h-12 px-4 bg-[#090B10] border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 shrink-0 pr-2 border-r border-white/10">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">TRANSCRIPT:</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-sans">
          {transcript.map((tw) => {
            const isActive = tw.id === activeTranscriptWordId;
            return (
              <span
                key={tw.id}
                onClick={() => setCurrentTime(tw.startTime)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  deleteTranscriptWord(tw.id);
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold shadow-sm'
                    : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/[0.05]'
                }`}
                title={`${tw.speaker}: ${tw.startTime.toFixed(1)}s (Right-click to delete word & slice audio)`}
              >
                {tw.word}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. MULTITRACK TIMELINE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers (Left sidebar) */}
        <div className="w-40 bg-[#0B0D13] border-r border-white/[0.06] flex flex-col divide-y divide-white/[0.04] shrink-0 text-xs font-mono">
          {tracks.map((t) => (
            <div key={t.id} className="h-16 px-3 flex flex-col justify-center gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 truncate">{t.name}</span>
                <span className="text-[9px] px-1 rounded bg-white/5 uppercase text-zinc-400">{t.type}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>VOL: {Math.round(t.volume * 100)}%</span>
                <span>PAN: {t.pan === 0 ? 'C' : t.pan > 0 ? `R${Math.round(t.pan * 100)}` : `L${Math.round(-t.pan * 100)}`}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tracks Sequencer Canvas */}
        <div
          ref={containerRef}
          onClick={handleTimelineClick}
          className="flex-1 relative bg-[#06080C] overflow-x-auto divide-y divide-white/[0.04] cursor-crosshair"
        >
          {/* Playhead vertical marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-pink-500 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="w-3 h-3 bg-pink-500 rotate-45 -translate-y-1.5 shadow-lg" />
          </div>

          {/* Render Tracks & Waveform Clips */}
          {tracks.map((t) => {
            const trackClips = clips.filter((c) => c.trackId === t.id);
            return (
              <div key={t.id} className="h-16 relative w-full bg-white/[0.01]">
                {trackClips.map((clip) => {
                  const leftPct = (clip.startTime / duration) * 100;
                  const widthPct = (clip.duration / duration) * 100;
                  const isSelected = clip.id === selectedClipId;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClip(clip.id);
                      }}
                      className={`absolute top-1 bottom-1 rounded-md border overflow-hidden cursor-pointer flex flex-col justify-between p-1.5 transition-all ${
                        isSelected
                          ? 'border-pink-400 bg-pink-500/25 ring-1 ring-pink-400/40 shadow-lg'
                          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`
                      }}
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-300">
                        <span className="font-semibold truncate">{clip.name}</span>
                        <span>{clip.duration.toFixed(1)}s</span>
                      </div>

                      {/* Interactive Visual Waveform Bars */}
                      <div className="h-6 flex items-center gap-0.5 pointer-events-none px-1">
                        {clip.waveform.map((amp, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full transition-all"
                            style={{
                              height: `${Math.max(15, amp)}%`,
                              backgroundColor: isSelected ? '#f43f5e' : clip.color || '#38bdf8',
                              opacity: 0.85
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
