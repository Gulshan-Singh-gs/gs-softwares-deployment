import React, { useState, useEffect } from 'react';
import {
  Music,
  Mic,
  Scissors,
  Radio,
  Sparkles,
  Disc,
  Layers,
  Activity,
  Zap,
  HelpCircle,
  Keyboard,
  Share2,
  Download,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AudioPlayerPillar, PlayerTrack } from '../components/audio/AudioPlayerPillar';
import { AudioRecorderPillar } from '../components/audio/AudioRecorderPillar';
import { AudioEditorPillar } from '../components/audio/AudioEditorPillar';
import { saveWorkspaceFile, getWorkspaceFilesByApp } from '../lib/db';
import { generateStudioDemoTrack, audioBufferToWavBlob } from '../lib/audioEngine';

export type PillarTab = 'player' | 'recorder' | 'editor';

export const AudioApp: React.FC = () => {
  // Active Three Pillar Tab
  const [activePillar, setActivePillar] = useState<PillarTab>('player');

  // Shared Data across Pillars (Triad Loop)
  const [sharedPlayerTracks, setSharedPlayerTracks] = useState<PlayerTrack[]>([]);
  const [editorTargetTake, setEditorTargetTake] = useState<{ name: string; blob: Blob } | null>(null);
  
  // Recent Takes Shelf (Persisted)
  const [recentTakes, setRecentTakes] = useState<
    { id: string; name: string; duration: number; timestamp: number; blob: Blob }[]
  >([]);

  // Shortcuts Modal
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Initialize and load saved takes from IndexedDB
  useEffect(() => {
    const restoreTakes = async () => {
      try {
        const stored = await getWorkspaceFilesByApp('audio');
        if (stored && stored.length > 0) {
          const restored: { id: string; name: string; duration: number; timestamp: number; blob: Blob }[] = [];
          for (const rec of stored) {
            try {
              if (rec && rec.data) {
                const blob = new Blob([rec.data], { type: rec.type || 'audio/wav' });
                restored.push({
                  id: rec.id,
                  name: rec.name || 'Audio Take',
                  duration: (rec.metadata?.duration as number) || 15,
                  timestamp: rec.timestamp || Date.now(),
                  blob,
                });
              }
            } catch (err) {
              console.warn('Skipping unreadable take record:', err);
            }
          }
          setRecentTakes(restored);
        }
      } catch (e) {
        console.warn('Restore error:', e);
      }
    };
    restoreTakes();
  }, []);

  // TRIAD LOOP HANDOFF HANDLERS:

  // 1. Recorder / Player ➔ Editor
  const handleSendToEditor = (take: { name: string; blob: Blob }) => {
    setEditorTargetTake(take);
    setActivePillar('editor');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  // 2. Recorder / Editor ➔ Player Library
  const handleSendToPlayer = (track: { name: string; blob: Blob; duration: number }) => {
    const url = URL.createObjectURL(track.blob);
    const newTrack: PlayerTrack = {
      id: `track_${Date.now()}`,
      name: track.name.replace(/\.[^/.]+$/, ''),
      artist: 'Master Production',
      album: 'GS Audio Studio',
      duration: track.duration,
      url,
      blob: track.blob,
      size: track.blob.size,
      addedAt: Date.now(),
      favorite: true,
      playlist: 'master',
      coverColor: 'from-pink-500 via-rose-500 to-indigo-600',
    };

    setSharedPlayerTracks((prev) => [newTrack, ...prev]);

    // Save to IndexedDB
    track.blob.arrayBuffer().then((buf) => {
      saveWorkspaceFile({
        id: newTrack.id,
        app: 'audio',
        name: track.name,
        type: track.blob.type || 'audio/wav',
        size: track.blob.size,
        data: buf,
        metadata: { duration: track.duration },
        timestamp: Date.now(),
      });
    });

    setRecentTakes((prev) => [
      {
        id: newTrack.id,
        name: track.name,
        duration: track.duration,
        timestamp: Date.now(),
        blob: track.blob,
      },
      ...prev,
    ]);

    setActivePillar('player');
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header & The Three Pillars Switcher */}
      <div className="neu-card p-6 md:p-8 rounded-3xl border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-pink-600 to-rose-600 flex items-center justify-center shadow-xl shadow-cyan-600/20 neu-flat text-white">
              <Music className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  GS-Audio Studio
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full neu-inset text-cyan-300 border border-cyan-500/30">
                  The Three Pillars
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Client-Side Web Audio • Zero Uploads • Music Player · Voice Recorder · Audacity-Class Editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-btn text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Shortcuts</span>
            </button>
          </div>
        </div>

        {/* The Three Pillars Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'player',
              title: '🎧 Music Player',
              subtitle: 'Hi-Fi Local Player · 10-Band EQ · ReplayGain · Synced Lyrics',
              color: 'from-cyan-600 to-indigo-600',
            },
            {
              id: 'recorder',
              title: '🎙 Voice Recorder',
              subtitle: 'Voice & Ambient Capture · Live Waveform & Meters · Crash-Safe',
              color: 'from-rose-600 to-pink-600',
            },
            {
              id: 'editor',
              title: '🎚 Audio Editor',
              subtitle: 'Audacity-Class Multitrack · LUFS Normalization · Deep Undo',
              color: 'from-pink-600 to-purple-600',
            },
          ].map((tab) => {
            const isSelected = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePillar(tab.id as any)}
                className={`p-4 rounded-3xl text-left transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-xl shadow-cyan-600/20 scale-102`
                    : 'neu-card text-slate-400 hover:text-slate-200'
                }`}
              >
                <p className="text-sm font-black tracking-tight">{tab.title}</p>
                <p className="text-[11px] opacity-80 mt-1 leading-snug">{tab.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* THE TRIAD LOOP QUICK DASHBOARD (Recent Takes Shelf) */}
      {recentTakes.length > 0 && (
        <div className="neu-card p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>The Triad Loop • Recent Takes</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{recentTakes.length} takes indexed</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-glow">
            {recentTakes.map((take) => (
              <div
                key={take.id}
                className="flex items-center gap-3 p-3 rounded-2xl neu-inset shrink-0 hover:border-cyan-500/40 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-pink-600 flex items-center justify-center text-white shrink-0">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white max-w-[120px] truncate">{take.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{formatTime(take.duration)}</p>
                </div>
                <button
                  onClick={() => handleSendToEditor({ name: take.name, blob: take.blob })}
                  className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white text-[10px] font-bold transition-all"
                >
                  Edit ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE PILLAR VIEWPORT */}
      {activePillar === 'player' && (
        <AudioPlayerPillar
          onSendToEditor={handleSendToEditor}
          sharedTracks={sharedPlayerTracks}
        />
      )}

      {activePillar === 'recorder' && (
        <AudioRecorderPillar
          onSendToEditor={handleSendToEditor}
          onSendToPlayer={handleSendToPlayer}
        />
      )}

      {activePillar === 'editor' && (
        <AudioEditorPillar
          initialTake={editorTargetTake}
          onSendToPlayer={handleSendToPlayer}
        />
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="neu-card p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl relative border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <span>GS-Audio Studio Keyboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'Space', desc: 'Play / Pause transport' },
                  { key: 'Ctrl + Z', desc: 'Undo last edit action' },
                  { key: 'Ctrl + Y', desc: 'Redo last edit action' },
                  { key: 'Ctrl + T', desc: 'Trim to selected in/out range' },
                  { key: 'Ctrl + X', desc: 'Cut selection into clipboard' },
                  { key: 'Ctrl + C', desc: 'Copy selection to clipboard' },
                  { key: 'Ctrl + V', desc: 'Paste clipboard at playhead' },
                  { key: 'S', desc: 'Split track at playhead position' },
                  { key: 'I', desc: 'Set selection In marker' },
                  { key: 'O', desc: 'Set selection Out marker' },
                  { key: 'L', desc: 'Toggle region looping' },
                  { key: '[ / ]', desc: 'Zoom timeline canvas in/out' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl neu-inset flex justify-between items-center">
                    <kbd className="px-2 py-0.5 rounded bg-slate-900 font-mono text-cyan-400 font-bold text-[11px] border border-slate-800">
                      {s.key}
                    </kbd>
                    <span className="text-slate-300 text-[11px]">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioApp;
