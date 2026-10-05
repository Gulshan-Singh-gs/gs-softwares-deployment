// src/suites/video/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // WebCodecs, WebAudio, OffscreenCanvas
  | 'CLASS_B_LOCAL_COMPUTE'        // WASM / WebGPU / Workers
  | 'CLASS_C_AI_REMOTE'            // Heavy AI Diffusion/LLM
  | 'CLASS_D_HYBRID';              // Local editor + AI assist

export type VideoSuiteDomain =
  | 'media'
  | 'timeline'
  | 'canvas'
  | 'transitions'
  | 'effects'
  | 'color'
  | 'audio'
  | 'text'
  | 'motion'
  | 'ai_generation'
  | 'ai_avatar'
  | 'ai_story'
  | 'ai_intelligence'
  | 'social'
  | 'recording'
  | 'library'
  | 'export';

export interface VideoToolCapability {
  id: string;
  name: string;
  domain: VideoSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  duration: number; // in seconds
  width?: number;
  height?: number;
  waveform?: number[];
  isDemo?: boolean;
}

export interface ClipItem {
  id: string;
  assetId: string;
  name: string;
  trackId: string;
  startTime: number; // position on timeline in seconds
  duration: number;  // duration on timeline in seconds
  trimIn: number;    // start offset in original asset
  trimOut: number;   // end offset in original asset
  type: 'video' | 'audio' | 'text' | 'adjustment';
  color?: string;
  // Non-destructive transform parameters
  transform?: {
    scale: number;
    rotation: number;
    opacity: number;
    x: number;
    y: number;
  };
  // Non-destructive Color parameters
  colorGrading?: {
    exposure: number;
    contrast: number;
    saturation: number;
    temperature: number;
  };
  // Non-destructive Audio parameters
  audioProperties?: {
    volume: number;
    pan: number;
    mute: boolean;
  };
  // AI variant tag if generated
  aiVariantTag?: string;
}

export interface TrackItem {
  id: string;
  label: string;
  type: 'video' | 'audio';
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

export interface AIVideoVariant {
  id: string;
  sourceClipId: string;
  prompt: string;
  toolId: string;
  timestamp: number;
  previewUrl: string;
  parameters: Record<string, number | string>;
  status: 'preview' | 'accepted' | 'rejected';
}

export interface VideoProjectState {
  // Project metadata
  id: string;
  title: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  fps: number;
  duration: number; // total sequence length

  // Playback engine
  currentTime: number;
  isPlaying: boolean;
  zoom: number; // timeline zoom factor

  // Core NLE Structure
  mediaPool: MediaAsset[];
  tracks: TrackItem[];
  clips: ClipItem[];
  selectedClipId: string | null;

  // Active Tool Domain
  activeDomain: VideoSuiteDomain;
  activeToolId: string;

  // Non-destructive AI branching & variants
  variants: AIVideoVariant[];
  activeVariantId: string | null;

  // Recording Studio
  isRecording: boolean;
  recordingMode: 'camera' | 'screen' | 'mic' | 'screen_cam';

  // Compare mode (2-finger hold or toggle)
  isComparing: boolean;
  compareVariantUrl: string | null;

  // History Stack
  undoStack: Array<{ clips: ClipItem[]; tracks: TrackItem[] }>;
  redoStack: Array<{ clips: ClipItem[]; tracks: TrackItem[] }>;

  // Universal Sliders (No slider graveyard)
  universalParams: {
    amount: number;
    strength: number;
    intensity: number;
    opacity: number;
    speed: number;
    smoothing: number;
    creativity: number;
    preservation: number;
  };

  // Status & Feedback
  statusMessage: string;

  // Actions
  loadDemoProject: () => void;
  importMedia: (asset: MediaAsset) => void;
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  pause: () => void;
  selectClip: (id: string | null) => void;
  setDomain: (domain: VideoSuiteDomain, defaultToolId?: string) => void;
  setTool: (toolId: string) => void;
  setUniversalParam: (key: string, value: number) => void;

  // NLE Timeline Actions
  cutAtPlayhead: () => void;
  deleteSelectedClip: () => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  trimClip: (clipId: string, newTrimIn: number, newTrimOut: number) => void;

  // AI Operation Lifecycle
  generateAIVariant: (prompt: string, toolId: string) => void;
  acceptVariant: (variantId: string) => void;
  rejectVariant: (variantId: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}
