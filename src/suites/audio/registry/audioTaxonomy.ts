// src/suites/audio/registry/audioTaxonomy.ts
import { AudioToolCapability, AudioSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: AudioSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const AUDIO_DOMAINS: DomainMeta[] = [
  { id: 'player', name: 'Hi-Fi Audio Player', shortLabel: 'Player', iconName: 'PlayCircle', description: 'Interactive waveform player, A/B looping, cue points, and playlist queue' },
  { id: 'recorder', name: 'Studio Recorder', shortLabel: 'Record', iconName: 'Mic', description: 'Zero-latency multi-take recording, countdown, metronome, and punch-in/out' },
  { id: 'waveform', name: 'Waveform Editor', shortLabel: 'Waveform', iconName: 'Activity', description: 'Sample-accurate slicing, razor trim, fades, gain envelopes, and reverse' },
  { id: 'multitrack', name: 'Multitrack DAW', shortLabel: 'Tracks', iconName: 'Layers', description: 'Nonlinear multi-track arrangement, magnetic snapping, grouping, and comping' },
  { id: 'mixer', name: 'Console Mixer', shortLabel: 'Mixer', iconName: 'Sliders', description: 'Channel strips, faders, panning, inserts, aux sends, and master LUFS metering' },
  { id: 'equalizer', name: 'Parametric EQ', shortLabel: 'EQ', iconName: 'Radio', description: '10-band interactive frequency sculpting with live FFT spectrum analyzer' },
  { id: 'dynamics', name: 'Dynamics & Comp', shortLabel: 'Dynamics', iconName: 'Volume2', description: 'Compressor, limiter, noise gate, de-esser, and transient shaper' },
  { id: 'effects', name: 'Effects & Spatial', shortLabel: 'Effects', iconName: 'Sparkles', description: 'Convolution reverb, stereo delay, chorus, flanger, and tube saturation' },
  { id: 'noise_restoration', name: 'Restoration Studio', shortLabel: 'Clean', iconName: 'ShieldAlert', description: 'Hum suppression, de-click, clip repair, and AI voice isolation' },
  { id: 'spectral', name: 'Spectral Editor', shortLabel: 'Spectral', iconName: 'ScanLine', description: '2D Time-frequency spectrogram view with visual brush repair' },
  { id: 'voice', name: 'Voice Studio', shortLabel: 'Voice', iconName: 'UserCheck', description: 'Speech enhancement, de-reverb, sibilance reduction, and voice cleanup' },
  { id: 'podcast', name: 'Podcast Production', shortLabel: 'Podcast', iconName: 'RadioTower', description: 'Multi-speaker alignment, filler word removal, intro/outro music beds' },
  { id: 'music', name: 'Music Production', shortLabel: 'Music', iconName: 'Music', description: 'Beat detection, BPM quantization, chord analysis, and loops' },
  { id: 'ai_generation', name: 'AI Audio Gen', shortLabel: 'Gen AI', iconName: 'Wand2', description: 'Text-to-sound effects, generative ambience, and background scores' },
  { id: 'ai_voice', name: 'AI Voice Cloning', shortLabel: 'AI Voice', iconName: 'Bot', description: 'Authorized voice modeling, multilingual TTS, and prosody controls' },
  { id: 'ai_transcription', name: 'AI Transcription', shortLabel: 'Transcribe', iconName: 'FileText', description: 'Local speech-to-text with word timestamps and speaker diarization' },
  { id: 'transcript_editor', name: 'Transcript Editor', shortLabel: 'DocEdit', iconName: 'Edit3', description: 'Bidirectional editing: text deletion trims audio waveform instantaneously' },
  { id: 'ai_intelligence', name: 'Audio Intelligence', shortLabel: 'Intel', iconName: 'ScanEye', description: 'Semantic speech search, silence detection, and loudness audit' },
  { id: 'automation', name: 'Workflow Automator', shortLabel: 'Auto', iconName: 'Zap', description: 'Chainable audio recipes: Denoise → EQ → Level → Export' },
  { id: 'library', name: 'Media Library', shortLabel: 'Library', iconName: 'FolderKanban', description: 'Project media bins, takes cache, favorite sounds, and ID3 tags' },
  { id: 'visualization', name: 'Meters & Analyzers', shortLabel: 'Meters', iconName: 'BarChart2', description: 'Integrated LUFS loudness, RMS peak, phase correlation, and vectorscope' },
  { id: 'takes', name: 'Take Comping System', shortLabel: 'Takes', iconName: 'Copy', description: 'Multi-take lane auditioning without destructive overwrite' },
  { id: 'export', name: 'Export & Mastering', shortLabel: 'Export', iconName: 'Download', description: 'Broadcast WAV, MP3, FLAC, AAC, with streaming normalization presets' },
  { id: 'batch', name: 'Batch Processor', shortLabel: 'Batch', iconName: 'Boxes', description: 'Multi-file normalization, batch format conversion, and bulk tagging' }
];

export const AUDIO_CAPABILITIES: AudioToolCapability[] = [
  // 1. PLAYER
  { id: 'player.scrub', name: 'Smooth Waveform Scrubbing', domain: 'player', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-latency playhead dragging with sample-accurate AudioBuffer positioning' },
  { id: 'player.ab_loop', name: 'A/B Region Looping', domain: 'player', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Cycle through specific time markers seamlessly' },

  // 2. RECORDER
  { id: 'recorder.capture', name: 'MediaRecorder Audio Capture', domain: 'recorder', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Direct browser microphone stream capture into non-destructive takes' },
  { id: 'recorder.punch', name: 'Punch-In / Punch-Out', domain: 'recorder', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Targeted temporal re-recording over marked timeline spans' },

  // 3. WAVEFORM
  { id: 'waveform.cut', name: 'Non-Destructive Razor Split', domain: 'waveform', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant clip division preserving original buffer references' },
  { id: 'waveform.fades', name: 'Logarithmic Fade In/Out', domain: 'waveform', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Smooth gain curve smoothing preventing audio clicks' },

  // 4. MULTITRACK
  { id: 'multitrack.arrange', name: 'Multitrack Arrangement Engine', domain: 'multitrack', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Multi-channel audio mixing graph with magnetic timeline grid' },

  // 5. MIXER
  { id: 'mixer.faders', name: 'Channel Faders & Master Bus', domain: 'mixer', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'GainNode and StereoPannerNode volume automation routing' },

  // 6. EQUALIZER
  { id: 'equalizer.biquad', name: '10-Band Biquad Filter Bank', domain: 'equalizer', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Real-time Web Audio lowpass, highpass, peaking, and notch filters' },

  // 7. DYNAMICS
  { id: 'dynamics.compressor', name: 'DynamicsCompressorNode', domain: 'dynamics', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Hardware-grade peak compression with threshold, ratio, attack, release' },

  // 8. EFFECTS
  { id: 'effects.spatial', name: 'Stereo Delay & Spatial Reverb', domain: 'effects', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'ConvolverNode acoustic response with feedback delay loops' },

  // 9. NOISE / RESTORATION
  { id: 'noise.denoise', name: 'Spectral Subtraction Denoise', domain: 'noise_restoration', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Local WASM/WebWorker background noise profile removal' },
  { id: 'noise.ai_isolate', name: 'AI Voice Isolation', domain: 'noise_restoration', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Neural stem separation separating vocals from background noise' },

  // 10. SPECTRAL
  { id: 'spectral.visualizer', name: 'Real-time 2D Spectrogram FFT', domain: 'spectral', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'OffscreenCanvas FFT rendering displaying frequencies up to 22kHz' },

  // 11. VOICE STUDIO
  { id: 'voice.leveling', name: 'Automatic Speech Leveler', domain: 'voice', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'RMS dynamic loudness riding for consistent voiceover levels' },

  // 12. PODCAST
  { id: 'podcast.cleanup', name: 'Silence & Filler Word Scrubber', domain: 'podcast', executionClass: 'CLASS_D_HYBRID', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Detect pauses and uh/um fillers directly on the transcript timeline' },

  // 13. MUSIC
  { id: 'music.beat_detect', name: 'Tempo & Beat Grid Estimator', domain: 'music', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Energy onset detection calculating sequence BPM' },

  // 14. AI AUDIO GENERATION
  { id: 'ai_gen.sound_fx', name: 'Generative Foley & Ambience', domain: 'ai_generation', executionClass: 'CLASS_C_AI_REMOTE', browserFeasible: false, localComputeFeasible: false, serverRequired: true, description: 'Prompt-guided cinematic ambient layer synthesis' },

  // 15. AI VOICE
  { id: 'ai_voice.tts', name: 'Neural Voice Synthesis', domain: 'ai_voice', executionClass: 'CLASS_C_AI_REMOTE', browserFeasible: false, localComputeFeasible: false, serverRequired: true, description: 'Natural speech generation with expressive inflection' },

  // 16. AI TRANSCRIPTION
  { id: 'ai_transcribe.whisper', name: 'Local Whisper WASM Transcription', domain: 'ai_transcription', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'On-device speech-to-text with word boundary timing' },

  // 17. TRANSCRIPT-BASED EDITING
  { id: 'transcript_editor.sync', name: 'Bidirectional Waveform ↔ Text Edit', domain: 'transcript_editor', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Delete word tokens to instantly create non-destructive timeline cuts' },

  // 18. AI INTELLIGENCE
  { id: 'intelligence.semantic', name: 'Semantic Audio Search', domain: 'ai_intelligence', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Locate discussions, sound peaks, or musical segments via query' },

  // 19. AUTOMATION
  { id: 'automation.chain', name: 'Chainable Mastering Pipeline', domain: 'automation', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Reusable preset macro: Denoise → 10-Band EQ → Limiter' },

  // 20. LIBRARY
  { id: 'library.manager', name: 'Local Workspace Asset Bins', domain: 'library', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'IndexedDB persistent take management and audio preview queue' },

  // 21. VISUALIZATION
  { id: 'visualization.lufs', name: 'EBU R128 LUFS Meter', domain: 'visualization', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Integrated & momentary loudness monitoring targeting -14 LUFS' },

  // 22. TAKES
  { id: 'takes.comp', name: 'Non-Destructive Take Lanes', domain: 'takes', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Audition and splice best phrases across recording takes' },

  // 23. EXPORT
  { id: 'export.wav', name: 'Zero-Loss 24-bit WAV Render', domain: 'export', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Hardware-accelerated client-side audio rendering and download' },

  // 24. BATCH
  { id: 'batch.normalize', name: 'Batch Loudness Normalizer', domain: 'batch', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Parallel WebWorker normalization across multiple dropped audio files' }
];
