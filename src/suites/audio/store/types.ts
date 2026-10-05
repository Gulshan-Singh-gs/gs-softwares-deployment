// src/suites/audio/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Web Audio API, AudioWorklet, MediaRecorder, Canvas
  | 'CLASS_B_LOCAL_COMPUTE'        // WASM DSP, WebGPU, Local Workers
  | 'CLASS_C_AI_REMOTE'            // Heavy generative audio, text-to-music, voice cloning
  | 'CLASS_D_HYBRID';              // Local editor + AI assist (transcription, cleanup, mastering)

export type AudioSuiteDomain =
  | 'player'
  | 'recorder'
  | 'waveform'
  | 'multitrack'
  | 'mixer'
  | 'equalizer'
  | 'dynamics'
  | 'effects'
  | 'noise_restoration'
  | 'spectral'
  | 'voice'
  | 'podcast'
  | 'music'
  | 'ai_generation'
  | 'ai_voice'
  | 'ai_transcription'
  | 'transcript_editor'
  | 'ai_intelligence'
  | 'automation'
  | 'library'
  | 'visualization'
  | 'takes'
  | 'export'
  | 'batch';

export interface AudioToolCapability {
  id: string;
  name: string;
  domain: AudioSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export interface AudioTrackItem {
  id: string;
  name: string;
  type: 'mono' | 'stereo' | 'bus' | 'master';
  volume: number; // 0 to 1.5 (default 1.0)
  pan: number;    // -1 (Left) to +1 (Right)
  muted: boolean;
  soloed: boolean;
  recordArmed: boolean;
  color: string;
}

export interface AudioClipItem {
  id: string;
  trackId: string;
  name: string;
  startTime: number;  // Timeline start offset in seconds
  duration: number;   // Duration in seconds
  trimIn: number;     // Asset trim start
  trimOut: number;    // Asset trim end
  waveform: number[]; // Peak amplitudes for visual canvas
  color: string;
  gain: number;       // Clip gain in dB
  fadeIn: number;     // In seconds
  fadeOut: number;    // In seconds
}

export interface AudioTakeItem {
  id: string;
  trackId: string;
  name: string;
  timestamp: number;
  duration: number;
  waveform: number[];
  isSelected: boolean;
}

export interface TranscriptWord {
  id: string;
  word: string;
  startTime: number;
  endTime: number;
  speaker: string;
  confidence: number;
}

export interface AIAudioVariant {
  id: string;
  prompt: string;
  toolId: string;
  timestamp: number;
  description: string;
  status: 'preview' | 'accepted' | 'rejected';
}

export interface AudioProjectState {
  // Project metadata
  id: string;
  title: string;
  sampleRate: 44100 | 48000 | 96000;
  tempo: number; // BPM (default 120)
  timeSignature: '4/4' | '3/4' | '6/8';
  duration: number; // Total sequence length in seconds
  currentTime: number; // Playhead position in seconds

  // Playback & Transport engine
  isPlaying: boolean;
  isLooping: boolean;
  loopRegion: { start: number; end: number } | null;
  playbackRate: number; // 0.5 to 2.0
  isRecording: boolean;
  monitoringEnabled: boolean;

  // Active Domain & View Modes
  activeDomain: AudioSuiteDomain;
  activeToolId: string;
  activePillarMode: 'play' | 'record' | 'edit' | 'mix';

  // Triad Data & Arrangement
  tracks: AudioTrackItem[];
  clips: AudioClipItem[];
  takes: AudioTakeItem[];
  selectedClipId: string | null;
  selectedTrackId: string | null;

  // Synchronized Transcript & Diarization
  transcript: TranscriptWord[];
  activeTranscriptWordId: string | null;

  // AI & Non-Destructive Variants
  aiVariants: AIAudioVariant[];
  activeVariantId: string | null;
  isAiProcessing: boolean;

  // Standardized Universal Parameters
  universalParams: {
    amount: number;       // 0-100
    strength: number;     // 0-100
    intensity: number;    // 0-100
    threshold: number;    // 0-100
    decay: number;        // 0-100
    smoothing: number;    // 0-100
  };

  // History & Undo/Redo
  undoStack: Array<{ tracks: AudioTrackItem[]; clips: AudioClipItem[] }>;
  redoStack: Array<{ tracks: AudioTrackItem[]; clips: AudioClipItem[] }>;

  // Status feedback
  statusMessage: string;
}
