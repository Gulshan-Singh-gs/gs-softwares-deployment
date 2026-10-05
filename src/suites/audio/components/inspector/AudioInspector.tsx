// src/suites/audio/components/inspector/AudioInspector.tsx
import React, { useState } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { AUDIO_DOMAINS, AUDIO_CAPABILITIES } from '../../registry/audioTaxonomy';
import {
  Sparkles,
  Check,
  X,
  Volume2,
  Mic,
  Activity,
  ShieldCheck,
  Radio,
  Sliders,
  Scissors,
  Download,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const AudioInspector: React.FC = () => {
  const activeDomain = useAudioStore((s) => s.activeDomain);
  const activeToolId = useAudioStore((s) => s.activeToolId);
  const setTool = useAudioStore((s) => s.setTool);
  const synthesizeAiAudio = useAudioStore((s) => s.synthesizeAiAudio);
  const aiVariants = useAudioStore((s) => s.aiVariants);
  const activeVariantId = useAudioStore((s) => s.activeVariantId);
  const acceptAiVariant = useAudioStore((s) => s.acceptAiVariant);
  const rejectAiVariant = useAudioStore((s) => s.rejectAiVariant);
  const isAiProcessing = useAudioStore((s) => s.isAiProcessing);
  const selectedClipId = useAudioStore((s) => s.selectedClipId);
  const clips = useAudioStore((s) => s.clips);

  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Dynamics & Compressor parameters
  const [targetLufs, setTargetLufs] = useState<number>(-14); // Spotify/YouTube standard
  const [compressorThresholdDb, setCompressorThresholdDb] = useState<number>(-24);
  const [compressorRatio, setCompressorRatio] = useState<number>(4);

  // Equalizer parameters
  const [bassGainDb, setBassGainDb] = useState<number>(0);
  const [midGainDb, setMidGainDb] = useState<number>(0);
  const [trebleGainDb, setTrebleGainDb] = useState<number>(0);

  // Noise reduction & gating
  const [noiseGateDb, setNoiseGateDb] = useState<number>(-45);
  const [deEsserIntensity, setDeEsserIntensity] = useState<number>(50);

  // Export parameters
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3' | 'flac' | 'aac'>('wav');
  const [exportSampleRate, setExportSampleRate] = useState<48000 | 44100>(48000);

  const currentDomainMeta = AUDIO_DOMAINS.find((d) => d.id === activeDomain);
  const domainCapabilities = AUDIO_CAPABILITIES.filter((c) => c.domain === activeDomain);
  const selectedClip = clips.find((c) => c.id === selectedClipId);

  /* Render domain-specific contextual controls */
  const renderContextualControls = () => {
    switch (activeDomain) {
      /* 1. EQUALIZER */
      case 'equalizer':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                3-Band Biquad Filter Bank
              </span>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Low Shelf (100 Hz):</span>
                  <span className="font-mono text-pink-400">{bassGainDb > 0 ? `+${bassGainDb}` : bassGainDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={bassGainDb}
                  onChange={(e) => setBassGainDb(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Peaking Mid (1.5 kHz):</span>
                  <span className="font-mono text-pink-400">{midGainDb > 0 ? `+${midGainDb}` : midGainDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={midGainDb}
                  onChange={(e) => setMidGainDb(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">High Shelf (8 kHz):</span>
                  <span className="font-mono text-pink-400">{trebleGainDb > 0 ? `+${trebleGainDb}` : trebleGainDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={trebleGainDb}
                  onChange={(e) => setTrebleGainDb(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      /* 2. DYNAMICS & COMPRESSION / LOUDNESS */
      case 'dynamics':
      case 'visualization':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                ITU-R BS.1770 Loudness Target
              </span>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Integrated LUFS Target:</span>
                  <span className="font-mono text-pink-400">{targetLufs} LUFS</span>
                </div>
                <input
                  type="range"
                  min="-23"
                  max="-9"
                  value={targetLufs}
                  onChange={(e) => setTargetLufs(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-zinc-500">-14 LUFS is the standard for YouTube &amp; Spotify.</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Threshold:</span>
                  <span className="font-mono text-pink-400">{compressorThresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="0"
                  value={compressorThresholdDb}
                  onChange={(e) => setCompressorThresholdDb(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => alert(`Loudness normalized to ${targetLufs} LUFS non-destructively.`)}
              className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Apply Loudness Leveling</span>
            </button>
          </div>
        );

      /* 3. RESTORATION & NOISE GATING */
      case 'noise_restoration':
      case 'voice':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Acoustic Cleaners
              </span>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Noise Gate Threshold:</span>
                  <span className="font-mono text-pink-400">{noiseGateDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="-20"
                  value={noiseGateDb}
                  onChange={(e) => setNoiseGateDb(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">De-Esser Sensitivity:</span>
                  <span className="font-mono text-pink-400">{deEsserIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deEsserIntensity}
                  onChange={(e) => setDeEsserIntensity(Number(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      /* 4. EXPORT & MASTERING */
      case 'export':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Master Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'wav', label: 'WAV', desc: 'Lossless 24-bit PCM' },
                  { id: 'flac', label: 'FLAC', desc: 'Compressed Lossless' },
                  { id: 'mp3', label: 'MP3', desc: '320kbps CBR' },
                  { id: 'aac', label: 'AAC', desc: 'Web Audio standard' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setExportFormat(f.id as any)}
                    className={`p-2 rounded-lg text-left text-xs transition-all border ${
                      exportFormat === f.id
                        ? 'bg-pink-500/15 border-pink-400/40 text-pink-300'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="font-semibold">{f.label}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert(`Mastering export initiated: ${exportFormat.toUpperCase()} @ ${exportSampleRate}Hz.`)}
              className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rendered Master</span>
            </button>
          </div>
        );

      /* 5. AI AUDIO GENERATION & TRANSCRIPTION (STRICTLY CONTEXTUAL) */
      case 'ai_generation':
      case 'ai_voice':
      case 'ai_transcription':
      case 'ai_intelligence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">AI Speech &amp; Music Intent</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                  Non-Destructive
                </span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Isolate dialogue from background city noise, remove room reverberation, level host speech to -16 LUFS..."
                rows={3}
                className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-400/50 resize-none font-sans"
              />
              <button
                onClick={() => {
                  if (aiPrompt.trim()) synthesizeAiAudio(aiPrompt, activeToolId);
                }}
                disabled={!aiPrompt.trim() || isAiProcessing}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-xs hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiProcessing ? 'Synthesizing...' : 'Synthesize AI Variation'}</span>
              </button>
            </div>

            {activeVariantId && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                  <span>PROPOSED VARIATION</span>
                  <span className="text-amber-400">READY</span>
                </div>
                <p className="text-xs text-white font-medium">
                  {aiVariants.find((v) => v.id === activeVariantId)?.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => acceptAiVariant(activeVariantId)}
                    className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => rejectAiVariant(activeVariantId)}
                    className="flex-1 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      /* 6. DEFAULT WAVEFORM / PLAYER / RECORDER */
      default:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Track Telemetry</span>
              <div className="flex justify-between">
                <span className="text-zinc-400">Sample Rate:</span>
                <span className="font-mono text-white">48,000 Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Bit Depth:</span>
                <span className="font-mono text-white">24-bit Float</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Selected Clip:</span>
                <span className="font-mono text-pink-400 truncate max-w-[150px]">
                  {selectedClip?.name || 'Master Bus'}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-full h-full bg-[#0D0F14] border-l border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* 1. Header */}
      <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">Audio DSP Inspector</span>
          <h2 className="text-xs font-semibold text-white truncate">{currentDomainMeta?.name || 'Parameters'}</h2>
        </div>
        {selectedClip && (
          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">
            {selectedClip.name}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 2. Domain Tools & Capabilities */}
        {domainCapabilities.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {currentDomainMeta?.shortLabel} Processors
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {domainCapabilities.map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setTool(cap.id)}
                  className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                    activeToolId === cap.id
                      ? 'bg-pink-500/15 border-pink-400/40 text-pink-300'
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

        {/* 3. Contextual Domain Controls */}
        <div className="pt-2 border-t border-white/[0.06]">
          {renderContextualControls()}
        </div>
      </div>
    </aside>
  );
};
