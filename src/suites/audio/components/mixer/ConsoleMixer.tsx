// src/suites/audio/components/mixer/ConsoleMixer.tsx
import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { Volume2, VolumeX, Radio } from 'lucide-react';

export const ConsoleMixer: React.FC = () => {
  const tracks = useAudioStore((s) => s.tracks);
  const updateTrackVolume = useAudioStore((s) => s.updateTrackVolume);
  const updateTrackPan = useAudioStore((s) => s.updateTrackPan);
  const toggleTrackMute = useAudioStore((s) => s.toggleTrackMute);
  const toggleTrackSolo = useAudioStore((s) => s.toggleTrackSolo);

  return (
    <div className="w-full h-full bg-[#080A0E] border-t border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* Mixer Header */}
      <div className="h-8 px-4 bg-[#0C0E14] border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono shrink-0">
        <span className="text-pink-400 font-bold uppercase tracking-wider">Console Mixer Strips ({tracks.length})</span>
        <span className="text-zinc-500">REAL-TIME WEBAUDIO ROUTING</span>
      </div>

      {/* Channel Strips Row */}
      <div className="flex-1 overflow-x-auto p-3 flex gap-3 items-stretch">
        {tracks.map((t) => (
          <div
            key={t.id}
            className={`w-32 rounded-lg border p-2.5 flex flex-col justify-between shrink-0 transition-all ${
              t.type === 'master'
                ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            {/* Track Label */}
            <div className="border-b border-white/[0.04] pb-1.5 mb-2">
              <span className="text-xs font-semibold text-white block truncate">{t.name}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">{t.type} BUS</span>
            </div>

            {/* Mute & Solo Buttons */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              <button
                onClick={() => toggleTrackMute(t.id)}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  t.muted ? 'bg-red-500 text-white' : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                MUTE
              </button>
              <button
                onClick={() => toggleTrackSolo(t.id)}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  t.soloed ? 'bg-amber-500 text-black' : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                SOLO
              </button>
            </div>

            {/* Fader & Meter simulation */}
            <div className="flex-1 flex items-center justify-center gap-3 py-2">
              <div className="flex flex-col items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.01"
                  value={t.volume}
                  onChange={(e) => updateTrackVolume(t.id, parseFloat(e.target.value))}
                  className="w-24 -rotate-90 origin-center accent-pink-500 cursor-pointer h-1.5 bg-zinc-800 rounded"
                />
              </div>

              {/* Peak Meter Bar Simulation */}
              <div className="w-2.5 h-24 bg-zinc-900 rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-white/5">
                <div
                  className="w-full rounded-full transition-all"
                  style={{
                    height: `${Math.min(100, Math.round(t.volume * 60))}%`,
                    backgroundColor: t.volume > 1.0 ? '#ef4444' : '#10b981'
                  }}
                />
              </div>
            </div>

            {/* Pan Slider */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                <span>PAN</span>
                <span>{t.pan === 0 ? 'C' : t.pan > 0 ? `R${Math.round(t.pan * 100)}` : `L${Math.round(-t.pan * 100)}`}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={t.pan}
                onChange={(e) => updateTrackPan(t.id, parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/10 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
