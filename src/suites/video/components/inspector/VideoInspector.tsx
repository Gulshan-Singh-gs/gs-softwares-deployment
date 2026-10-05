// src/suites/video/components/inspector/VideoInspector.tsx
import React, { useState } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { VIDEO_DOMAINS, VIDEO_CAPABILITIES } from '../../registry/videoTaxonomy';
import {
  Sparkles,
  Check,
  X,
  Sliders,
  Scissors,
  Maximize2,
  Film,
  Download,
  Clock,
  Layers,
  Palette,
  Volume2,
  CheckCircle2
} from 'lucide-react';

export const VideoInspector: React.FC = () => {
  const activeDomain = useVideoStore((s) => s.activeDomain);
  const activeToolId = useVideoStore((s) => s.activeToolId);
  const setTool = useVideoStore((s) => s.setTool);
  const selectedClipId = useVideoStore((s) => s.selectedClipId);
  const clips = useVideoStore((s) => s.clips);
  const generateAIVariant = useVideoStore((s) => s.generateAIVariant);
  const variants = useVideoStore((s) => s.variants);
  const activeVariantId = useVideoStore((s) => s.activeVariantId);
  const acceptVariant = useVideoStore((s) => s.acceptVariant);
  const rejectVariant = useVideoStore((s) => s.rejectVariant);

  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Video Trimmer & Cut parameters
  const [trimIn, setTrimIn] = useState<number>(0.0);
  const [trimOut, setTrimOut] = useState<number>(5.5);

  // Aspect ratio / Framer
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Transcoder / Export settings
  const [targetCodec, setTargetCodec] = useState<'h264' | 'vp9' | 'av1' | 'gif'>('h264');
  const [targetFps, setTargetFps] = useState<number>(30);
  const [targetBitrateMb, setTargetBitrateMb] = useState<number>(8);

  // Color Grading parameters
  const [exposure, setExposure] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(10);
  const [saturation, setSaturation] = useState<number>(15);

  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const currentDomainMeta = VIDEO_DOMAINS.find((d) => d.id === activeDomain);
  const domainCapabilities = VIDEO_CAPABILITIES.filter((c) => c.domain === activeDomain);

  /* Render domain-specific contextual controls */
  const renderContextualControls = () => {
    switch (activeDomain) {
      /* 1. TIMELINE & TRIMMING */
      case 'timeline':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Clip Precision Trimming
              </label>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Trim In Point:</span>
                    <span className="font-mono text-cyan-400">{trimIn.toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.05"
                    value={trimIn}
                    onChange={(e) => setTrimIn(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Trim Out Point:</span>
                    <span className="font-mono text-cyan-400">{trimOut.toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.05"
                    value={trimOut}
                    onChange={(e) => setTrimOut(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Applied precise non-destructive trim: [${trimIn.toFixed(2)}s - ${trimOut.toFixed(2)}s]`)}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Apply Razor Cut</span>
            </button>
          </div>
        );

      /* 2. CANVAS & COMPOSITION / SOCIAL REPURPOSE */
      case 'canvas':
      case 'social':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Target Canvas Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '16:9', label: '16:9', desc: 'Landscape TV/Web' },
                  { id: '9:16', label: '9:16', desc: 'Shorts/Reels' },
                  { id: '1:1', label: '1:1', desc: 'Square Post' }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id as any)}
                    className={`p-2 rounded-lg text-center text-xs transition-all border ${
                      aspectRatio === r.id
                        ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-[9px] text-zinc-500">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Smart Centering</span>
              <p className="text-zinc-300">
                Automatic focal point alignment maintains subject visibility in {aspectRatio} viewports.
              </p>
            </div>
          </div>
        );

      /* 3. COLOR GRADING */
      case 'color':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">3-Way Color Balance</span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Exposure</span>
                  <span className="font-mono text-cyan-400">{exposure > 0 ? `+${exposure}` : exposure}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={exposure}
                  onChange={(e) => setExposure(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Contrast</span>
                  <span className="font-mono text-cyan-400">+{contrast}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Saturation</span>
                  <span className="font-mono text-cyan-400">+{saturation}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      /* 4. EXPORT & TRANSCODING */
      case 'export':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Codec Profile</label>
              <select
                value={targetCodec}
                onChange={(e) => setTargetCodec(e.target.value as any)}
                className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-lg p-2.5 outline-none focus:border-cyan-400/50"
              >
                <option value="h264">H.264 / MP4 (Universal Compatible)</option>
                <option value="vp9">VP9 / WebM (High Density)</option>
                <option value="av1">AV1 (Next-Gen Open Standard)</option>
                <option value="gif">Animated GIF (Optimized Palette)</option>
              </select>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Framerate:</span>
                <span className="font-mono text-cyan-400">{targetFps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Bitrate:</span>
                <span className="font-mono text-cyan-400">{targetBitrateMb} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">WebCodecs Muxer:</span>
                <span className="text-emerald-400 font-semibold">Client Hardware</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Export initiated: ${targetCodec.toUpperCase()} @ ${targetFps} FPS via local WebCodecs.`)}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rendered File</span>
            </button>
          </div>
        );

      /* 5. AI VIDEO DOMAINS (STRICTLY CONTEXTUAL) */
      case 'ai_generation':
      case 'ai_avatar':
      case 'ai_story':
      case 'ai_intelligence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">AI Command Interface</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">Non-Destructive</span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Extend shot by 3 seconds, add golden hour warm rim light, isolate speaker dialogue..."
                rows={3}
                className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-xl p-2.5 outline-none focus:border-cyan-400/50 resize-none font-sans"
              />
              <button
                onClick={() => {
                  if (aiPrompt.trim()) generateAIVariant(aiPrompt, activeToolId);
                }}
                disabled={!selectedClip || !aiPrompt.trim()}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize AI Variant</span>
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  AI Variant Branches ({variants.length})
                </span>
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-xs space-y-2"
                  >
                    <p className="text-zinc-200 font-medium">{v.prompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptVariant(v.id)}
                        className="flex-1 py-1 bg-emerald-600 rounded text-white text-[11px] font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectVariant(v.id)}
                        className="flex-1 py-1 bg-white/10 rounded text-zinc-300 text-[11px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* 6. DEFAULT MEDIA POOL & AUDIO */
      default:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Clip Telemetry</span>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duration:</span>
                <span className="font-mono text-white">{selectedClip?.duration || 0}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Framerate:</span>
                <span className="font-mono text-white">30 FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Resolution:</span>
                <span className="font-mono text-white">1920x1080</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-full h-full bg-[#0D0F14] border-l border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* Header */}
      <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Video Inspector</span>
          <h2 className="text-xs font-semibold text-white truncate">{currentDomainMeta?.name || 'Properties'}</h2>
        </div>
        {selectedClip && (
          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">
            {selectedClip.name}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Domain Tool Selection */}
        {domainCapabilities.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Capabilities</label>
            <div className="grid grid-cols-1 gap-1.5">
              {domainCapabilities.map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setTool(cap.id)}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    activeToolId === cap.id
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                      : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="font-semibold text-white">{cap.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{cap.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contextual Domain Controls */}
        <div className="pt-2 border-t border-white/[0.06]">
          {renderContextualControls()}
        </div>
      </div>
    </aside>
  );
};
