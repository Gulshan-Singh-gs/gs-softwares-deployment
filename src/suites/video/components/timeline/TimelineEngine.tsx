// src/suites/video/components/timeline/TimelineEngine.tsx
import React, { useRef } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Scissors, Trash2, ZoomIn, ZoomOut, Magnet, Plus } from 'lucide-react';

export const TimelineEngine: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const duration = useVideoStore((s) => s.duration);
  const currentTime = useVideoStore((s) => s.currentTime);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);
  const tracks = useVideoStore((s) => s.tracks);
  const clips = useVideoStore((s) => s.clips);
  const selectedClipId = useVideoStore((s) => s.selectedClipId);
  const selectClip = useVideoStore((s) => s.selectClip);
  const cutAtPlayhead = useVideoStore((s) => s.cutAtPlayhead);
  const deleteSelectedClip = useVideoStore((s) => s.deleteSelectedClip);
  const moveClip = useVideoStore((s) => s.moveClip);

  // Playhead scrubbing handler
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    setCurrentTime(newTime);
  };

  return (
    <div className="w-full h-full bg-[#0A0C10] flex flex-col border-t border-white/[0.08] select-none text-zinc-300">
      {/* 1. Timeline Header / Transport Tools */}
      <div className="h-9 px-3 bg-[#0E1015] border-b border-white/[0.06] flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={cutAtPlayhead}
            className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] font-medium transition-colors"
            title="Razor Blade Cut at Playhead (C)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Split (C)</span>
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
          <span className="text-[10px] font-mono text-zinc-500">MAGNETIC SNAPPING ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span>{duration.toFixed(1)}s total</span>
        </div>
      </div>

      {/* 2. Tracks & Timeline Grid Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers (Left sidebar) */}
        <div className="w-36 bg-[#0B0D12] border-r border-white/[0.06] flex flex-col divide-y divide-white/[0.04] shrink-0 text-[10px] font-mono text-zinc-400">
          {tracks.map((t) => (
            <div key={t.id} className="h-14 px-3 flex items-center justify-between">
              <span className="font-semibold text-zinc-300">{t.label}</span>
              <span className="text-[9px] px-1 rounded bg-white/5 uppercase">{t.type}</span>
            </div>
          ))}
        </div>

        {/* Multi-Track Sequencer Viewport */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 relative bg-[#07080B] overflow-x-auto divide-y divide-white/[0.04] cursor-crosshair"
        >
          {/* Playhead Vertical Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="w-3 h-3 bg-red-500 rotate-45 -translate-y-1.5 shadow-md" />
          </div>

          {/* Timecode Ruler / Ticks */}
          <div className="absolute top-0 inset-x-0 h-3 border-b border-white/[0.04] pointer-events-none flex justify-between px-2 text-[8px] font-mono text-zinc-600">
            <span>00:00</span>
            <span>00:05</span>
            <span>00:10</span>
            <span>00:15</span>
          </div>

          {/* Render Tracks & Placed Clips */}
          {tracks.map((t) => {
            const trackClips = clips.filter((c) => c.trackId === t.id);
            return (
              <div key={t.id} className="h-14 relative w-full bg-white/[0.01]">
                {trackClips.map((clip) => {
                  const leftPct = (clip.startTime / duration) * 100;
                  const widthPct = (clip.duration / duration) * 100;
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClip(clip.id);
                      }}
                      className={`absolute top-1 bottom-1 rounded-md p-1.5 text-xs font-semibold cursor-pointer overflow-hidden transition-all shadow-md flex flex-col justify-between ${
                        isSelected
                          ? 'ring-2 ring-white shadow-cyan-500/20 brightness-110 z-20'
                          : 'opacity-90 hover:opacity-100 z-10'
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: clip.color || '#0891b2'
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-white/90 truncate">
                        <span className="font-bold truncate">{clip.name}</span>
                        {clip.aiVariantTag && (
                          <span className="ml-1 px-1 py-0.2 rounded bg-black/40 text-[8px] font-mono text-cyan-200">
                            AI
                          </span>
                        )}
                      </div>

                      {/* Mock audio waveform if audio track */}
                      {t.type === 'audio' && (
                        <div className="h-2 flex items-end gap-0.5 opacity-60">
                          {[30, 70, 45, 90, 60, 85, 40, 75, 50, 95].map((h, i) => (
                            <span key={i} className="w-1 bg-white rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] text-white/70 font-mono">
                        {clip.duration.toFixed(1)}s
                      </span>
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
