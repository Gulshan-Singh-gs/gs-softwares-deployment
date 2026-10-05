// src/suites/video/store/videoStore.ts
import { create } from 'zustand';
import {
  VideoProjectState,
  MediaAsset,
  TrackItem,
  ClipItem,
  AIVideoVariant,
  VideoSuiteDomain
} from './types';

// Bundled high-production demo media assets (Architecture, Cinematic landscape, dialogue audio, music)
export const DEMO_MEDIA_POOL: MediaAsset[] = [
  {
    id: 'demo-asset-v1',
    name: 'Architectural Aerial (4K).mp4',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    type: 'video',
    duration: 12.5,
    width: 1920,
    height: 1080,
    isDemo: true
  },
  {
    id: 'demo-asset-v2',
    name: 'Modern Glass Facade.mp4',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    type: 'video',
    duration: 8.0,
    width: 1920,
    height: 1080,
    isDemo: true
  },
  {
    id: 'demo-asset-a1',
    name: 'Cinematic Ambient Score.mp3',
    url: '',
    type: 'audio',
    duration: 20.0,
    waveform: [15, 30, 45, 70, 85, 60, 40, 55, 80, 95, 70, 45, 30, 25, 40, 65, 80, 50, 30],
    isDemo: true
  }
];

const INITIAL_TRACKS: TrackItem[] = [
  { id: 'v2', label: 'V2 Overlay & Titles', type: 'video', muted: false, locked: false, visible: true },
  { id: 'v1', label: 'V1 Primary Story', type: 'video', muted: false, locked: false, visible: true },
  { id: 'a1', label: 'A1 Dialogue / Ambience', type: 'audio', muted: false, locked: false, visible: true },
  { id: 'a2', label: 'A2 Music Bed', type: 'audio', muted: false, locked: false, visible: true },
];

const INITIAL_CLIPS: ClipItem[] = [
  {
    id: 'clip-1',
    assetId: 'demo-asset-v1',
    name: 'Aerial Establishing Shot',
    trackId: 'v1',
    startTime: 0,
    duration: 5.5,
    trimIn: 0,
    trimOut: 5.5,
    type: 'video',
    color: '#06b6d4',
    transform: { scale: 100, rotation: 0, opacity: 100, x: 0, y: 0 },
    colorGrading: { exposure: 0, contrast: 10, saturation: 15, temperature: 0 }
  },
  {
    id: 'clip-2',
    assetId: 'demo-asset-v2',
    name: 'Glass Reflection Dolly',
    trackId: 'v1',
    startTime: 5.5,
    duration: 6.0,
    trimIn: 0,
    trimOut: 6.0,
    type: 'video',
    color: '#3b82f6',
    transform: { scale: 100, rotation: 0, opacity: 100, x: 0, y: 0 },
    colorGrading: { exposure: 5, contrast: 5, saturation: 5, temperature: -5 }
  },
  {
    id: 'clip-title',
    assetId: 'text-asset-1',
    name: 'Main Title: MODERN SPACES',
    trackId: 'v2',
    startTime: 1.0,
    duration: 3.5,
    trimIn: 0,
    trimOut: 3.5,
    type: 'text',
    color: '#a855f7',
    transform: { scale: 100, rotation: 0, opacity: 90, x: 0, y: 0 }
  },
  {
    id: 'clip-audio',
    assetId: 'demo-asset-a1',
    name: 'Cinematic Ambient Score',
    trackId: 'a2',
    startTime: 0,
    duration: 11.5,
    trimIn: 0,
    trimOut: 11.5,
    type: 'audio',
    color: '#10b981',
    audioProperties: { volume: 80, pan: 0, mute: false }
  }
];

export const useVideoStore = create<VideoProjectState>((set, get) => ({
  id: 'proj-demo-1',
  title: 'Cinematic Architecture Sequence',
  aspectRatio: '16:9',
  fps: 30,
  duration: 15.0,

  currentTime: 2.2,
  isPlaying: false,
  zoom: 1,

  mediaPool: [...DEMO_MEDIA_POOL],
  tracks: [...INITIAL_TRACKS],
  clips: [...INITIAL_CLIPS],
  selectedClipId: 'clip-1',

  activeDomain: 'timeline',
  activeToolId: 'timeline.cut',

  variants: [],
  activeVariantId: null,

  isRecording: false,
  recordingMode: 'screen_cam',

  isComparing: false,
  compareVariantUrl: null,

  undoStack: [],
  redoStack: [],

  universalParams: {
    amount: 50,
    strength: 75,
    intensity: 60,
    opacity: 100,
    speed: 100,
    smoothing: 40,
    creativity: 35,
    preservation: 85,
  },

  statusMessage: 'Ready · Experiment with NLE & AI tools',

  loadDemoProject: () => {
    set({
      id: 'proj-demo-1',
      title: 'Cinematic Architecture Sequence',
      currentTime: 0,
      isPlaying: false,
      mediaPool: [...DEMO_MEDIA_POOL],
      tracks: [...INITIAL_TRACKS],
      clips: [...INITIAL_CLIPS],
      selectedClipId: 'clip-1',
      variants: [],
      activeVariantId: null,
      undoStack: [],
      redoStack: [],
      statusMessage: 'Restored Demo Project'
    });
  },

  importMedia: (asset) => {
    set((s) => ({
      mediaPool: [asset, ...s.mediaPool],
      statusMessage: `Imported: ${asset.name}`
    }));
  },

  setCurrentTime: (time) => {
    const { duration } = get();
    set({ currentTime: Math.max(0, Math.min(duration, time)) });
  },

  togglePlay: () => {
    set((s) => ({ isPlaying: !s.isPlaying }));
  },

  pause: () => set({ isPlaying: false }),

  selectClip: (id) => set({ selectedClipId: id }),

  setDomain: (domain, defaultToolId) => set({
    activeDomain: domain,
    activeToolId: defaultToolId ?? `${domain}.default`,
    statusMessage: `Domain: ${domain.toUpperCase()}`
  }),

  setTool: (toolId) => set({ activeToolId: toolId }),

  setUniversalParam: (key, value) => set((s) => ({
    universalParams: { ...s.universalParams, [key]: value }
  })),

  cutAtPlayhead: () => {
    const { clips, currentTime, selectedClipId, tracks } = get();
    const targetClip = clips.find((c) =>
      c.id === selectedClipId && currentTime > c.startTime && currentTime < c.startTime + c.duration
    ) || clips.find((c) => currentTime > c.startTime && currentTime < c.startTime + c.duration);

    if (!targetClip) return;

    // Snapshot for Undo
    set((s) => ({
      undoStack: [...s.undoStack, { clips: s.clips, tracks: s.tracks }],
      redoStack: []
    }));

    const splitOffset = currentTime - targetClip.startTime;
    const clipA: ClipItem = {
      ...targetClip,
      duration: splitOffset,
      trimOut: targetClip.trimIn + splitOffset
    };

    const clipB: ClipItem = {
      ...targetClip,
      id: `clip-${Date.now()}`,
      name: `${targetClip.name} (Split)`,
      startTime: currentTime,
      duration: targetClip.duration - splitOffset,
      trimIn: targetClip.trimIn + splitOffset
    };

    set({
      clips: clips.map((c) => (c.id === targetClip.id ? clipA : c)).concat(clipB),
      selectedClipId: clipB.id,
      statusMessage: `Split clip: ${targetClip.name}`
    });
  },

  deleteSelectedClip: () => {
    const { clips, selectedClipId, tracks } = get();
    if (!selectedClipId) return;

    set((s) => ({
      undoStack: [...s.undoStack, { clips: s.clips, tracks: s.tracks }],
      redoStack: [],
      clips: s.clips.filter((c) => c.id !== selectedClipId),
      selectedClipId: null,
      statusMessage: 'Clip deleted'
    }));
  },

  moveClip: (clipId, newStartTime, newTrackId) => {
    const { clips, tracks } = get();
    set((s) => ({
      undoStack: [...s.undoStack, { clips: s.clips, tracks: s.tracks }],
      redoStack: [],
      clips: s.clips.map((c) => {
        if (c.id !== clipId) return c;
        return {
          ...c,
          startTime: Math.max(0, newStartTime),
          trackId: newTrackId ?? c.trackId
        };
      })
    }));
  },

  trimClip: (clipId, newTrimIn, newTrimOut) => {
    set((s) => ({
      clips: s.clips.map((c) => {
        if (c.id !== clipId) return c;
        const newDuration = Math.max(0.2, newTrimOut - newTrimIn);
        return {
          ...c,
          trimIn: newTrimIn,
          trimOut: newTrimOut,
          duration: newDuration
        };
      })
    }));
  },

  generateAIVariant: (prompt, toolId) => {
    const { selectedClipId, clips, universalParams } = get();
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip) return;

    set({ statusMessage: `Synthesizing neural video variant for ${clip.name}...` });

    setTimeout(() => {
      const newVariant: AIVideoVariant = {
        id: `vidvar-${Date.now()}`,
        sourceClipId: clip.id,
        prompt,
        toolId,
        timestamp: Date.now(),
        previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        parameters: { ...universalParams },
        status: 'preview'
      };

      set((s) => ({
        variants: [newVariant, ...s.variants],
        activeVariantId: newVariant.id,
        compareVariantUrl: newVariant.previewUrl,
        isComparing: true,
        statusMessage: 'AI Video Variant synthesized · Compare before committing'
      }));
    }, 850);
  },

  acceptVariant: (variantId) => {
    const { variants, clips, tracks } = get();
    const selectedVariant = variants.find((v) => v.id === variantId);
    if (!selectedVariant) return;

    set((s) => ({
      undoStack: [...s.undoStack, { clips: s.clips, tracks: s.tracks }],
      redoStack: [],
      clips: s.clips.map((c) => {
        if (c.id !== selectedVariant.sourceClipId) return c;
        return {
          ...c,
          name: `${c.name} (AI Variant)`,
          aiVariantTag: selectedVariant.toolId
        };
      }),
      variants: s.variants.map((v) => (v.id === variantId ? { ...v, status: 'accepted' as const } : v)),
      isComparing: false,
      statusMessage: 'Committed AI variant into timeline'
    }));
  },

  rejectVariant: (variantId) => {
    set((s) => ({
      variants: s.variants.filter((v) => v.id !== variantId),
      isComparing: false,
      activeVariantId: null,
      compareVariantUrl: null,
      statusMessage: 'Discarded AI variant'
    }));
  },

  undo: () => {
    const { undoStack, clips, tracks, redoStack } = get();
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [{ clips, tracks }, ...redoStack],
      clips: prev.clips,
      tracks: prev.tracks,
      statusMessage: 'Undo previous operation'
    });
  },

  redo: () => {
    const { redoStack, clips, tracks, undoStack } = get();
    if (!redoStack.length) return;
    const next = redoStack[0];
    set({
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, { clips, tracks }],
      clips: next.clips,
      tracks: next.tracks,
      statusMessage: 'Redo operation'
    });
  }
}));
