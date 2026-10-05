// src/suites/audio/store/audioStore.ts
import { create } from 'zustand';
import {
  AudioProjectState,
  AudioTrackItem,
  AudioClipItem,
  AudioTakeItem,
  TranscriptWord,
  AIAudioVariant,
  AudioSuiteDomain
} from './types';

// Bundled high-production demo tracks (Dialogue, Podcast speaker, Ambient music bed, Foley)
export const DEMO_TRACKS: AudioTrackItem[] = [
  { id: 'tr-v1', name: 'Host Dialogue (Vocal)', type: 'mono', volume: 0.95, pan: 0, muted: false, soloed: false, recordArmed: false, color: '#06b6d4' },
  { id: 'tr-v2', name: 'Guest Interviewee', type: 'mono', volume: 0.90, pan: 0.1, muted: false, soloed: false, recordArmed: false, color: '#a855f7' },
  { id: 'tr-m1', name: 'Cinematic Score Bed', type: 'stereo', volume: 0.70, pan: 0, muted: false, soloed: false, recordArmed: false, color: '#f59e0b' },
  { id: 'tr-master', name: 'Master Stereo Output', type: 'master', volume: 1.0, pan: 0, muted: false, soloed: false, recordArmed: false, color: '#10b981' }
];

export const DEMO_CLIPS: AudioClipItem[] = [
  {
    id: 'clip-v1',
    trackId: 'tr-v1',
    name: 'Host Intro & Briefing.wav',
    startTime: 0,
    duration: 8.5,
    trimIn: 0,
    trimOut: 8.5,
    waveform: [20, 35, 65, 85, 90, 75, 40, 60, 80, 95, 70, 45, 30, 65, 80, 50, 20],
    color: '#06b6d4',
    gain: 0,
    fadeIn: 0.2,
    fadeOut: 0.4
  },
  {
    id: 'clip-v2',
    trackId: 'tr-v2',
    name: 'Guest Response.wav',
    startTime: 8.0,
    duration: 9.0,
    trimIn: 0,
    trimOut: 9.0,
    waveform: [15, 40, 70, 60, 85, 90, 75, 55, 65, 80, 70, 40, 30, 25, 40, 60, 30],
    color: '#a855f7',
    gain: 0.5,
    fadeIn: 0.3,
    fadeOut: 0.5
  },
  {
    id: 'clip-m1',
    trackId: 'tr-m1',
    name: 'Ambient Warm Pad Bed.mp3',
    startTime: 0,
    duration: 22.0,
    trimIn: 0,
    trimOut: 22.0,
    waveform: [30, 45, 50, 55, 60, 58, 55, 52, 55, 58, 62, 60, 55, 50, 48, 45, 40],
    color: '#f59e0b',
    gain: -3.0,
    fadeIn: 1.5,
    fadeOut: 2.0
  }
];

export const DEMO_TAKES: AudioTakeItem[] = [
  {
    id: 'take-1',
    trackId: 'tr-v1',
    name: 'Take 1 · Raw Mic In',
    timestamp: Date.now() - 3600000,
    duration: 8.5,
    waveform: [20, 35, 65, 85, 90, 75, 40, 60],
    isSelected: true
  },
  {
    id: 'take-2',
    trackId: 'tr-v1',
    name: 'Take 2 · Alternate Articulation',
    timestamp: Date.now() - 1800000,
    duration: 8.2,
    waveform: [18, 30, 60, 80, 92, 70, 38, 55],
    isSelected: false
  }
];

export const DEMO_TRANSCRIPT: TranscriptWord[] = [
  { id: 'w-1', word: 'Welcome', startTime: 0.2, endTime: 0.8, speaker: 'Host', confidence: 0.98 },
  { id: 'w-2', word: 'to', startTime: 0.9, endTime: 1.1, speaker: 'Host', confidence: 0.99 },
  { id: 'w-3', word: 'the', startTime: 1.2, endTime: 1.4, speaker: 'Host', confidence: 0.99 },
  { id: 'w-4', word: 'GS', startTime: 1.5, endTime: 1.8, speaker: 'Host', confidence: 0.97 },
  { id: 'w-5', word: 'Audio', startTime: 1.9, endTime: 2.4, speaker: 'Host', confidence: 0.99 },
  { id: 'w-6', word: 'Studio', startTime: 2.5, endTime: 3.1, speaker: 'Host', confidence: 0.98 },
  { id: 'w-7', word: 'operating', startTime: 3.3, endTime: 3.9, speaker: 'Host', confidence: 0.96 },
  { id: 'w-8', word: 'system.', startTime: 4.0, endTime: 4.8, speaker: 'Host', confidence: 0.99 },
  { id: 'w-9', word: 'Everything', startTime: 5.2, endTime: 5.9, speaker: 'Host', confidence: 0.98 },
  { id: 'w-10', word: 'runs', startTime: 6.0, endTime: 6.4, speaker: 'Host', confidence: 0.97 },
  { id: 'w-11', word: '100%', startTime: 6.5, endTime: 7.2, speaker: 'Host', confidence: 0.99 },
  { id: 'w-12', word: 'client-side.', startTime: 7.3, endTime: 8.2, speaker: 'Host', confidence: 0.99 },
  { id: 'w-13', word: 'That', startTime: 8.4, endTime: 8.8, speaker: 'Guest', confidence: 0.98 },
  { id: 'w-14', word: 'is', startTime: 8.9, endTime: 9.1, speaker: 'Guest', confidence: 0.99 },
  { id: 'w-15', word: 'revolutionary', startTime: 9.2, endTime: 10.2, speaker: 'Guest', confidence: 0.96 },
  { id: 'w-16', word: 'for', startTime: 10.3, endTime: 10.5, speaker: 'Guest', confidence: 0.99 },
  { id: 'w-17', word: 'privacy!', startTime: 10.6, endTime: 11.5, speaker: 'Guest', confidence: 0.98 }
];

export const useAudioStore = create<AudioProjectState & {
  // Transport controls
  togglePlay: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  seekDelta: (deltaSec: number) => void;
  toggleLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleRecording: () => void;

  // Domain & Triad Pillar Mode
  setDomain: (domain: AudioSuiteDomain) => void;
  setTool: (toolId: string) => void;
  setPillarMode: (mode: AudioProjectState['activePillarMode']) => void;

  // Track & Clip editing
  selectClip: (id: string | null) => void;
  selectTrack: (id: string | null) => void;
  splitClipAtPlayhead: () => void;
  deleteSelectedClip: () => void;
  updateTrackVolume: (trackId: string, vol: number) => void;
  updateTrackPan: (trackId: string, pan: number) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;

  // Universal Parameter Controls
  setUniversalParam: (key: keyof AudioProjectState['universalParams'], val: number) => void;

  // Transcript-based editing
  deleteTranscriptWord: (wordId: string) => void;
  setActiveTranscriptWord: (wordId: string | null) => void;

  // AI & Non-destructive Variants
  synthesizeAiAudio: (prompt: string, toolId: string) => void;
  acceptAiVariant: (id: string) => void;
  rejectAiVariant: (id: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // Demo Project Restoration
  loadDemoProject: () => void;
}>((set, get) => ({
  id: 'proj-demo-podcast-master',
  title: 'Next-Gen Applied Audio Studio (Master Session)',
  sampleRate: 48000,
  tempo: 120,
  timeSignature: '4/4',
  duration: 22.0,
  currentTime: 2.5,

  isPlaying: false,
  isLooping: false,
  loopRegion: null,
  playbackRate: 1.0,
  isRecording: false,
  monitoringEnabled: true,

  activeDomain: 'player',
  activeToolId: 'player.scrub',
  activePillarMode: 'edit',

  tracks: [...DEMO_TRACKS],
  clips: [...DEMO_CLIPS],
  takes: [...DEMO_TAKES],
  selectedClipId: 'clip-v1',
  selectedTrackId: 'tr-v1',

  transcript: [...DEMO_TRANSCRIPT],
  activeTranscriptWordId: null,

  aiVariants: [],
  activeVariantId: null,
  isAiProcessing: false,

  universalParams: {
    amount: 75,
    strength: 70,
    intensity: 65,
    threshold: 50,
    decay: 40,
    smoothing: 80
  },

  undoStack: [],
  redoStack: [],
  statusMessage: 'Ready · Real-time Web Audio Worklet Engine Active',

  togglePlay: () => {
    set((s) => ({
      isPlaying: !s.isPlaying,
      statusMessage: !s.isPlaying ? 'Playback Running @ 48kHz' : 'Playback Paused'
    }));
  },

  stop: () => {
    set({ isPlaying: false, currentTime: 0, statusMessage: 'Playback Stopped · Playhead at 00:00' });
  },

  setCurrentTime: (time) => {
    const { duration, transcript } = get();
    const clamped = Math.max(0, Math.min(duration, time));
    // Find active word at playhead
    const currentWord = transcript.find((w) => clamped >= w.startTime && clamped <= w.endTime);
    set({
      currentTime: clamped,
      activeTranscriptWordId: currentWord ? currentWord.id : null
    });
  },

  seekDelta: (deltaSec) => {
    const { currentTime, duration } = get();
    const target = Math.max(0, Math.min(duration, currentTime + deltaSec));
    get().setCurrentTime(target);
  },

  toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),
  setPlaybackRate: (rate) => set({ playbackRate: Math.max(0.5, Math.min(2.0, rate)) }),

  toggleRecording: () => {
    set((s) => {
      const nextRec = !s.isRecording;
      return {
        isRecording: nextRec,
        statusMessage: nextRec ? 'RECORDING TO NON-DESTRUCTIVE TAKE BUFFER' : 'Recording Stopped · Added to Takes Shelf'
      };
    });
  },

  setDomain: (domain) => {
    set({
      activeDomain: domain,
      statusMessage: `Domain Switched to: ${domain.toUpperCase()}`
    });
  },

  setTool: (toolId) => {
    set({
      activeToolId: toolId,
      statusMessage: `Active Tool: ${toolId}`
    });
  },

  setPillarMode: (mode) => set({ activePillarMode: mode }),

  selectClip: (id) => set({ selectedClipId: id }),
  selectTrack: (id) => set({ selectedTrackId: id }),

  splitClipAtPlayhead: () => {
    const { currentTime, clips, selectedClipId, tracks } = get();
    const target = clips.find(
      (c) => (selectedClipId ? c.id === selectedClipId : true) && currentTime > c.startTime && currentTime < c.startTime + c.duration
    );
    if (!target) return;

    const splitOffset = currentTime - target.startTime;
    const clipA: AudioClipItem = {
      ...target,
      duration: splitOffset,
      trimOut: target.trimIn + splitOffset
    };
    const clipB: AudioClipItem = {
      ...target,
      id: `clip-${Date.now()}`,
      startTime: currentTime,
      duration: target.duration - splitOffset,
      trimIn: target.trimIn + splitOffset
    };

    set((s) => ({
      undoStack: [...s.undoStack, { tracks: s.tracks, clips: s.clips }],
      clips: s.clips.map((c) => (c.id === target.id ? clipA : c)).concat(clipB),
      selectedClipId: clipB.id,
      statusMessage: `Non-destructive split at ${currentTime.toFixed(2)}s`
    }));
  },

  deleteSelectedClip: () => {
    const { selectedClipId, clips, tracks } = get();
    if (!selectedClipId) return;
    set((s) => ({
      undoStack: [...s.undoStack, { tracks: s.tracks, clips: s.clips }],
      clips: s.clips.filter((c) => c.id !== selectedClipId),
      selectedClipId: null,
      statusMessage: 'Clip deleted from timeline'
    }));
  },

  updateTrackVolume: (trackId, vol) => {
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, volume: vol } : t))
    }));
  },

  updateTrackPan: (trackId, pan) => {
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t))
    }));
  },

  toggleTrackMute: (trackId) => {
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    }));
  },

  toggleTrackSolo: (trackId) => {
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, soloed: !t.soloed } : t))
    }));
  },

  setUniversalParam: (key, val) => {
    set((s) => ({
      universalParams: { ...s.universalParams, [key]: val }
    }));
  },

  deleteTranscriptWord: (wordId) => {
    const { transcript, clips, tracks } = get();
    const targetWord = transcript.find((w) => w.id === wordId);
    if (!targetWord) return;

    set((s) => ({
      undoStack: [...s.undoStack, { tracks: s.tracks, clips: s.clips }],
      transcript: s.transcript.filter((w) => w.id !== wordId),
      statusMessage: `Word "${targetWord.word}" removed (Bidirectional Audio Edit)`
    }));
  },

  setActiveTranscriptWord: (wordId) => set({ activeTranscriptWordId: wordId }),

  synthesizeAiAudio: (prompt, toolId) => {
    set({ isAiProcessing: true, statusMessage: 'Synthesizing neural audio variant...' });
    setTimeout(() => {
      const newVar: AIAudioVariant = {
        id: `var-${Date.now()}`,
        prompt,
        toolId,
        timestamp: Date.now(),
        description: `Transform: "${prompt.slice(0, 40)}..."`,
        status: 'preview'
      };
      set((s) => ({
        aiVariants: [newVar, ...s.aiVariants],
        activeVariantId: newVar.id,
        isAiProcessing: false,
        statusMessage: 'AI Audio Variant Ready for Audition'
      }));
    }, 700);
  },

  acceptAiVariant: (id) => {
    set((s) => ({
      aiVariants: s.aiVariants.map((v) => (v.id === id ? { ...v, status: 'accepted' as const } : v)),
      activeVariantId: null,
      statusMessage: 'AI variation committed into sequence'
    }));
  },

  rejectAiVariant: (id) => {
    set((s) => ({
      aiVariants: s.aiVariants.map((v) => (v.id === id ? { ...v, status: 'rejected' as const } : v)),
      activeVariantId: null,
      statusMessage: 'AI variation dismissed'
    }));
  },

  undo: () => {
    const { undoStack, redoStack, tracks, clips } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, { tracks, clips }],
      tracks: prev.tracks,
      clips: prev.clips,
      statusMessage: 'Undo applied'
    });
  },

  redo: () => {
    const { undoStack, redoStack, tracks, clips } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, { tracks, clips }],
      tracks: next.tracks,
      clips: next.clips,
      statusMessage: 'Redo applied'
    });
  },

  loadDemoProject: () => {
    set({
      tracks: [...DEMO_TRACKS],
      clips: [...DEMO_CLIPS],
      takes: [...DEMO_TAKES],
      transcript: [...DEMO_TRANSCRIPT],
      duration: 22.0,
      currentTime: 2.5,
      undoStack: [],
      redoStack: [],
      aiVariants: [],
      statusMessage: 'Demo Master Podcast Session Restored'
    });
  }
}));
