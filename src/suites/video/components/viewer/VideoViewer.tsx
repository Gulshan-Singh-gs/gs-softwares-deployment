// src/suites/video/components/viewer/VideoViewer.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Play, Pause, SkipBack, SkipForward, Maximize2, SplitSquareVertical, Eye, Sparkles } from 'lucide-react';

export const VideoViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTime = useVideoStore((s) => s.currentTime);
  const isPlaying = useVideoStore((s) => s.isPlaying);
  const togglePlay = useVideoStore((s) => s.togglePlay);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);
  const clips = useVideoStore((s) => s.clips);
  const mediaPool = useVideoStore((s) => s.mediaPool);
  const selectedClipId = useVideoStore((s) => s.selectedClipId);
  const isComparing = useVideoStore((s) => s.isComparing);
  const compareVariantUrl = useVideoStore((s) => s.compareVariantUrl);
  const duration = useVideoStore((s) => s.duration);

  const [splitPos, setSplitPos] = useState<number>(50);

  // Find active video clip on the top-most visible track at the playhead
  const activeClip = clips
    .filter((c) => c.type === 'video' && currentTime >= c.startTime && currentTime <= c.startTime + c.duration)
    .sort((a, b) => (b.trackId > a.trackId ? 1 : -1))[0];

  const activeAsset = activeClip ? mediaPool.find((m) => m.id === activeClip.assetId) : null;
  const currentImageUrl = activeAsset?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop';

  // Format timecode hh:mm:ss:ff
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#07080A] flex flex-col items-center justify-between overflow-hidden select-none"
    >
      {/* Top Viewer HUD */}
      <div className="w-full h-10 px-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white font-semibold">{activeClip ? activeClip.name : 'Sequence Preview'}</span>
          {activeClip?.aiVariantTag && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px]">
              AI: {activeClip.aiVariantTag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-mono text-xs">{formatTimecode(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span>{formatTimecode(duration)}</span>
        </div>
      </div>

      {/* Main 16:9 Canvas Viewport */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2">
        <div className="relative aspect-video max-w-full max-h-full bg-black rounded-lg overflow-hidden shadow-2xl border border-white/[0.08] flex items-center justify-center">
          {/* Base Track Layer */}
          <img
            src={currentImageUrl}
            alt="Sequence Frame"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              filter: activeClip?.colorGrading
                ? `contrast(${100 + activeClip.colorGrading.contrast}%) saturate(${100 + activeClip.colorGrading.saturation}%)`
                : undefined
            }}
          />

          {/* AI Comparison Overlay Split */}
          {isComparing && compareVariantUrl && (
            <>
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`
                }}
              >
                <img
                  src={compareVariantUrl}
                  alt="AI Variant"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Draggable Divider */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startPos = splitPos;
                  const onMove = (ev: MouseEvent) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const width = rect?.width || 800;
                    const delta = ((ev.clientX - startX) / width) * 100;
                    setSplitPos(Math.max(2, Math.min(98, startPos + delta)));
                  };
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              >
                <div className="w-6 h-6 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center shadow-lg">
                  VS
                </div>
              </div>
            </>
          )}

          {/* Active Text Title Overlay (V2 Track) */}
          {clips.some((c) => c.type === 'text' && currentTime >= c.startTime && currentTime <= c.startTime + c.duration) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
              <h1 className="text-xl md:text-3xl font-black text-white tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] border-b-2 border-cyan-400 pb-1">
                MODERN SPACES
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Floating Transport Bar */}
      <div className="h-11 px-4 w-full bg-[#090A0E] border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Return to start (Home)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={`p-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400" />}
          </button>
          <button
            onClick={() => setCurrentTime(duration)}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Go to end"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {compareVariantUrl && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Comparing AI Variant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
