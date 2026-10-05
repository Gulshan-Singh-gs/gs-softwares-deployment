// src/suites/video/registry/videoTaxonomy.ts
import { VideoToolCapability, VideoSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: VideoSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const VIDEO_DOMAINS: DomainMeta[] = [
  { id: 'media', name: 'Media Pool', shortLabel: 'Media', iconName: 'Video', description: 'Import, capture, bins, proxies, duplicate detection' },
  { id: 'timeline', name: 'Edit Timeline', shortLabel: 'Edit', iconName: 'Scissors', description: 'Nonlinear multi-track editing, ripple, roll, slip, slide' },
  { id: 'canvas', name: 'Canvas & Comp', shortLabel: 'Canvas', iconName: 'Maximize2', description: 'Transforms, crop, anchor point, blend modes, picture-in-picture' },
  { id: 'transitions', name: 'Transitions', shortLabel: 'Trans', iconName: 'FastForward', description: 'Dissolves, wipes, whip-pan, light leak, beat-synced' },
  { id: 'effects', name: 'Visual VFX', shortLabel: 'VFX', iconName: 'Wand2', description: 'Chroma key, rotoscope, blur, bloom, planar motion tracking' },
  { id: 'color', name: 'Color Grading', shortLabel: 'Color', iconName: 'SunMedium', description: 'Lift/gamma/gain wheels, 3D LUTs, curves, HDR, auto shot matching' },
  { id: 'audio', name: 'Audio Studio', shortLabel: 'Audio', iconName: 'Volume2', description: '10-band EQ, compressor, voice isolation, stem separation' },
  { id: 'text', name: 'Titles & Captions', shortLabel: 'Text', iconName: 'Type', description: 'Kinetic typography, auto-transcription, karaoke animated subtitles' },
  { id: 'motion', name: 'Motion Graphics', shortLabel: 'Motion', iconName: 'Activity', description: 'Keyframes, easing curves, particle systems, motion paths' },
  { id: 'ai_generation', name: 'AI Video Gen', shortLabel: 'Gen AI', iconName: 'Sparkles', description: 'Text-to-video, image-to-video, scene extension, generative fill' },
  { id: 'ai_avatar', name: 'AI Avatar', shortLabel: 'Avatar', iconName: 'UserCheck', description: 'Script-driven presenter, lip-sync, talking head, voice clone' },
  { id: 'ai_story', name: 'AI Storyboard', shortLabel: 'Story', iconName: 'Film', description: 'Script generation, visual shot list, rough cut assembly' },
  { id: 'ai_intelligence', name: 'Media Intelligence', shortLabel: 'Intel', iconName: 'ScanEye', description: 'Semantic search, shot detection, face recognition, best-take' },
  { id: 'social', name: 'Social Repurpose', shortLabel: 'Social', iconName: 'Share2', description: 'Auto 9:16 vertical reframe, hook extractor, auto-shorts generator' },
  { id: 'recording', name: 'Recording Studio', shortLabel: 'Record', iconName: 'Radio', description: 'Camera, screen, mic, teleprompter, multi-stream recording' },
  { id: 'library', name: 'Asset Library', shortLabel: 'Library', iconName: 'Layers', description: 'Stock footage, sound fx, motion presets, LUT bundles' },
  { id: 'export', name: 'Export & Delivery', shortLabel: 'Export', iconName: 'Download', description: 'Hardware-accelerated MP4, WebM, ProRes, platform presets' },
];

export const VIDEO_CAPABILITIES: VideoToolCapability[] = [
  // 1. MEDIA
  { id: 'media.import', name: 'Media Import', domain: 'media', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Client-side file picker & OPFS persistent staging' },
  { id: 'media.capture', name: 'Recording Capture', domain: 'media', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'MediaStream API camera/screen/audio recording' },
  { id: 'media.proxy', name: 'Proxy Generation', domain: 'media', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'WASM/WebCodecs lightweight 540p editing proxy' },

  // 2. TIMELINE / EDIT
  { id: 'timeline.cut', name: 'Razor Blade & Split', domain: 'timeline', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant non-destructive temporal clip division' },
  { id: 'timeline.ripple', name: 'Ripple & Roll Trim', domain: 'timeline', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Magnetic gap closing and adjacent edge sliding' },
  { id: 'timeline.speed', name: 'Speed & Freeze Frame', domain: 'timeline', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'PlaybackRate adjustment and single frame freeze' },

  // 3. CANVAS / COMPOSITION
  { id: 'canvas.transform', name: 'Geometric Transform', domain: 'canvas', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'CSS/WebGL matrix translation, rotation, scale' },
  { id: 'canvas.pip', name: 'Picture in Picture', domain: 'canvas', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Multi-layer composite canvas alignment' },

  // 4. TRANSITIONS
  { id: 'transitions.cross_dissolve', name: 'Cross Dissolve', domain: 'transitions', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Linear alpha blend between adjacent clips' },
  { id: 'transitions.whip_pan', name: 'Whip Pan Motion Blur', domain: 'transitions', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Directional blur shader transition' },

  // 5. EFFECTS / VFX
  { id: 'effects.chroma_key', name: 'Green Screen Chroma Key', domain: 'effects', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Real-time WebGL/WebGPU green spill suppression' },
  { id: 'effects.ai_rotoscope', name: 'AI Smart Rotoscoping', domain: 'effects', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Subject segmentation mask generation' },

  // 6. COLOR
  { id: 'color.wheels', name: '3-Way Color Wheels', domain: 'color', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Lift, gamma, gain balance via fragment shaders' },
  { id: 'color.lut', name: '3D LUT Grading (.cube)', domain: 'color', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Client-side 3D color lookup table parsing' },

  // 7. AUDIO
  { id: 'audio.eq', name: 'Parametric Equalizer', domain: 'audio', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Web Audio BiquadFilterNode frequency sculpting' },
  { id: 'audio.isolation', name: 'Voice Isolation & Denoise', domain: 'audio', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Neural speech separation & noise gating' },

  // 8. TEXT / TITLES / CAPTIONS
  { id: 'text.captions', name: 'Auto Speech Captions', domain: 'text', executionClass: 'CLASS_D_HYBRID', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Local Whisper WASM transcription with word timestamps' },
  { id: 'text.kinetic', name: 'Kinetic Motion Titles', domain: 'text', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Dynamic SVG/HTML5 animated text presets' },

  // 9. MOTION GRAPHICS
  { id: 'motion.keyframes', name: 'Bézier Keyframe Graph', domain: 'motion', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Temporal interpolation with cubic-bezier easing' },

  // 10. AI VIDEO GENERATION
  { id: 'ai_gen.text_to_video', name: 'Text → Video Diffusion', domain: 'ai_generation', executionClass: 'CLASS_C_AI_REMOTE', browserFeasible: false, localComputeFeasible: false, serverRequired: true, description: 'Generative video synthesis from prompt' },
  { id: 'ai_gen.extend_shot', name: 'Generative Shot Extension', domain: 'ai_generation', executionClass: 'CLASS_C_AI_REMOTE', browserFeasible: false, localComputeFeasible: false, serverRequired: true, description: 'Extrapolate head/tail frames with motion consistency' },

  // 11. AI AVATAR
  { id: 'avatar.presenter', name: 'AI Talking Head Presenter', domain: 'ai_avatar', executionClass: 'CLASS_C_AI_REMOTE', browserFeasible: false, localComputeFeasible: false, serverRequired: true, description: 'Audio-driven photorealistic facial animation' },

  // 12. AI STORY
  { id: 'story.rough_cut', name: 'Automated Rough Cut', domain: 'ai_story', executionClass: 'CLASS_D_HYBRID', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Heuristic alignment of takes against voice script' },

  // 13. AI INTELLIGENCE
  { id: 'intel.scene_detect', name: 'Shot / Scene Cut Detector', domain: 'ai_intelligence', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Histogram delta analysis across keyframes' },

  // 14. SOCIAL REPURPOSE
  { id: 'social.auto_reframe', name: 'Smart 9:16 Face Reframe', domain: 'social', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Face-tracking focal viewport panning' },

  // 15. RECORDING STUDIO
  { id: 'recording.screen_cam', name: 'Picture-in-Picture Studio', domain: 'recording', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Simultaneous canvas compositing of display + camera' },

  // 16. LIBRARY
  { id: 'library.sound_fx', name: 'Curated Audio SFX & Whooshes', domain: 'library', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-latency browser audio playback' },

  // 17. EXPORT / DELIVERY
  { id: 'export.webcodecs', name: 'Fast WebCodecs / MP4 Render', domain: 'export', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Hardware-accelerated client-side video muxing' }
];
