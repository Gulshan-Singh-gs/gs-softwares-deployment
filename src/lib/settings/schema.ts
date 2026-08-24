/**
 * GS Softwares Settings Declarations Schema
 * Single source of truth for all configurable properties across the entire PWA suite.
 */

import { SettingCategory, SettingDefinition, SuiteDefaultGroup } from './types';

export const SETTING_CATEGORIES: Array<{
  id: SettingCategory;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}> = [
  { id: 'performance', label: 'Performance', icon: 'Cpu', badge: 'Primary', description: 'Adaptive compute tier, workers, GPU acceleration, and hardware allocation' },
  { id: 'appearance', label: 'Appearance', icon: 'Palette', description: 'Neumorphic themes, accent colors, depth, typography, and motion effects' },
  { id: 'general', label: 'General', icon: 'Globe', description: 'Language, startup preferences, download destinations, and autosave timers' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'Shield', description: 'Zero-upload proof, clipboard auto-clear, vault password, and retention' },
  { id: 'files', label: 'File Handling', icon: 'Folder', description: 'Default image/audio formats, quality defaults, metadata preservation' },
  { id: 'advanced', label: 'Advanced', icon: 'Zap', description: 'Model prefetching, file size threshold warnings, and experimental features' },
  { id: 'tools', label: 'Tool Defaults', icon: 'Wrench', description: 'Per-suite parameter baselines for Pixels, Canvas, PDF, Video, Audio, & Text' },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'Keyboard', description: 'Global keyboard shortcuts and workflow navigation hotkeys' },
  { id: 'data', label: 'Data & Storage', icon: 'Database', description: 'IndexedDB workspace quota, JSON backup export, import, and data purge' },
  { id: 'about', label: 'About & Diagnostics', icon: 'Info', description: 'PWA system specifications, licenses, zero-upload attestation, and logs' },
];

export const SETTINGS_SCHEMA: SettingDefinition[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. 🎯 PERFORMANCE CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'perf.tier',
    category: 'performance',
    label: 'Performance Mode',
    description: 'Dynamically scales Web Workers, GPU pipelines, memory ceilings, and neural models to match your device.',
    type: 'tier-selector',
    default: 'balanced',
    tierAware: true,
    options: [
      { value: 'eco', label: '🟢 Eco', desc: 'Fast + battery-saver. Low memory footprint, algorithmic fallbacks, 1-pass fast presets.' },
      { value: 'balanced', label: '🟡 Balanced', desc: 'Default for most devices. Smooth multitasking, standard quality, lightweight AI models.' },
      { value: 'performance', label: '🔴 Performance', desc: 'Maximum quality. WebGPU compute, unthrottled workers, 2-pass encoding, full AI models.' },
    ],
  },
  {
    key: 'perf.override',
    category: 'performance',
    label: 'Override Auto-Detection',
    description: 'Unlock manual hardware knobs to fine-tune worker thread count, GPU pipeline, and memory budgets.',
    type: 'boolean',
    default: false,
    warning: 'Manually forcing Performance mode on constrained hardware may cause browser tab slowdowns or battery drain.',
  },
  {
    key: 'perf.workers',
    category: 'performance',
    label: 'Worker Thread Count',
    description: 'Number of background Web Workers spawned for concurrent image, audio, and video transformations.',
    type: 'enum',
    default: 4,
    dependsOn: 'perf.override',
    tierAware: true,
    options: [
      { value: 1, label: '1 Worker (Sequential / Minimal RAM)' },
      { value: 2, label: '2 Workers (Low Concurrency)' },
      { value: 4, label: '4 Workers (Balanced Multitasking)' },
      { value: 8, label: '8 Workers (High Parallelism)' },
      { value: 16, label: '16 Workers (Maximum Throughput)' },
    ],
  },
  {
    key: 'perf.gpu',
    category: 'performance',
    label: 'GPU Acceleration Pipeline',
    description: 'Preferred graphical acceleration engine for canvas rendering and filter calculations.',
    type: 'enum',
    default: 'auto',
    dependsOn: 'perf.override',
    tierAware: true,
    options: [
      { value: 'auto', label: 'Auto (Prefer GPU / WebGL 2)' },
      { value: 'forced_webgpu', label: 'Forced WebGPU / High-DPI WebGL 2' },
      { value: 'disabled', label: 'Disabled (Pure Canvas 2D Software Fallback)' },
    ],
  },
  {
    key: 'perf.memoryCeilingMB',
    category: 'performance',
    label: 'Memory Ceiling per Operation',
    description: 'Upper memory allocation boundary before tools trigger disk/IndexedDB streaming fallbacks.',
    type: 'enum',
    default: 512,
    dependsOn: 'perf.override',
    tierAware: true,
    options: [
      { value: 256, label: '256 MB (Eco Safe)' },
      { value: 512, label: '512 MB (Standard)' },
      { value: 1024, label: '1024 MB (1 GB)' },
      { value: 2048, label: '2048 MB (2 GB Max)' },
    ],
  },
  {
    key: 'perf.cacheSizeMB',
    category: 'performance',
    label: 'Cache Allocation Budget',
    description: 'Maximum in-memory disk cache size for transient WASM buffers and intermediate render frames.',
    type: 'enum',
    default: 256,
    options: [
      { value: 64, label: '64 MB' },
      { value: 128, label: '128 MB' },
      { value: 256, label: '256 MB (Recommended)' },
      { value: 512, label: '512 MB' },
      { value: 1024, label: '1024 MB (1 GB)' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. 🎨 APPEARANCE CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'appearance.theme',
    category: 'appearance',
    label: 'Neumorphic Visual Theme',
    description: 'Switch between light, balanced slate semi-dark, and pitch-dark neumorphic surfaces.',
    type: 'enum',
    default: 'dark',
    options: [
      { value: 'light', label: 'Light Mode', desc: 'Off-white soft surface with high-contrast text' },
      { value: 'semi', label: 'Semi-Dark Mode', desc: 'Slate-grey surface with soft shadow gradients' },
      { value: 'dark', label: 'Pitch Dark Mode', desc: 'Deep black background with vivid cyan accents' },
      { value: 'system', label: 'Match System OS', desc: 'Follows your operating system color scheme' },
    ],
  },
  {
    key: 'appearance.accentColor',
    category: 'appearance',
    label: 'Primary Accent Color',
    description: 'Active highlight and action button neon gradient color palette.',
    type: 'color',
    default: '#0891b2',
    options: [
      { value: '#0891b2', label: 'Cyan Teal (Default)' },
      { value: '#3b82f6', label: 'Cobalt Blue' },
      { value: '#8b5cf6', label: 'Electric Purple' },
      { value: '#10b981', label: 'Emerald Mint' },
      { value: '#f59e0b', label: 'Amber Gold' },
      { value: '#f43f5e', label: 'Neon Rose' },
    ],
  },
  {
    key: 'appearance.neuDepth',
    category: 'appearance',
    label: 'Neumorphic Shadow Depth',
    description: 'Adjust the intensity and blur radius of soft inset/outset depth shadows.',
    type: 'number',
    default: 70,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
  },
  {
    key: 'appearance.fontSize',
    category: 'appearance',
    label: 'Base Font Size',
    description: 'Scale the primary UI font size for enhanced legibility.',
    type: 'number',
    default: 16,
    min: 12,
    max: 22,
    step: 1,
    unit: 'px',
  },
  {
    key: 'appearance.compactMode',
    category: 'appearance',
    label: 'Compact Toolbar Density',
    description: 'Reduce padding in studio toolbars and canvas inspectors for maximum workspace area.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'appearance.motion',
    category: 'appearance',
    label: 'Motion & Animation Profile',
    description: 'Control transitions, floating glow effects, and interactive micro-animations.',
    type: 'enum',
    default: 'full',
    options: [
      { value: 'full', label: 'Full Neumorphic Motion (Smooth transitions & glows)' },
      { value: 'standard', label: 'Standard Motion' },
      { value: 'reduced', label: 'Reduced Motion (Instant UI swaps)' },
      { value: 'none', label: 'No Animations' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. 🌐 GENERAL CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'general.language',
    category: 'general',
    label: 'Application Language',
    description: 'Interface display language (i18n ready).',
    type: 'enum',
    default: 'en',
    options: [
      { value: 'en', label: 'English (US / Global)' },
      { value: 'es', label: 'Español (Coming soon)' },
      { value: 'de', label: 'Deutsch (Coming soon)' },
      { value: 'ja', label: '日本語 (Coming soon)' },
      { value: 'hi', label: 'हिन्दी (Coming soon)' },
    ],
  },
  {
    key: 'general.startupPage',
    category: 'general',
    label: 'Default Startup Screen',
    description: 'Initial tool view loaded when opening the GS Softwares suite.',
    type: 'enum',
    default: 'home',
    options: [
      { value: 'home', label: 'Suite Hub (Overview)' },
      { value: 'pixels', label: 'GS-Pixels (Image Studio)' },
      { value: 'canvas', label: 'GS-Canvas (Vector Studio)' },
      { value: 'pdf', label: 'GS-PDF (Document Studio)' },
      { value: 'video', label: 'GS-Video (WASM Video)' },
      { value: 'audio', label: 'GS-Audio (Master Suite)' },
      { value: 'text', label: 'GS-Text (Diff & Code)' },
    ],
  },
  {
    key: 'general.saveDestination',
    category: 'general',
    label: 'File Export Destination',
    description: 'How converted files are handed to the operating system upon completion.',
    type: 'enum',
    default: 'download',
    options: [
      { value: 'download', label: 'Browser Direct Download (Default)' },
      { value: 'fsAccess', label: 'File System Access API (Prompt folder picker)' },
      { value: 'opfs', label: 'Origin Private File System (Sandbox)' },
    ],
  },
  {
    key: 'general.fileNamingTemplate',
    category: 'general',
    label: 'Export File Naming Pattern',
    description: 'Template pattern used when naming generated assets ({tool}, {name}, {date}, {n}).',
    type: 'string',
    default: '{name}_gs_{date}',
    placeholder: 'e.g. {name}_processed_{date}',
  },
  {
    key: 'general.autosaveSec',
    category: 'general',
    label: 'Autosave Snapshot Interval',
    description: 'Frequency at which vector canvases and text drafts are snapshotted to IndexedDB.',
    type: 'number',
    default: 10,
    min: 5,
    max: 120,
    step: 5,
    unit: 's',
  },

  // ─────────────────────────────────────────────────────────────
  // 4. 🔒 PRIVACY & SECURITY CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'privacy.showZeroUploadBadge',
    category: 'privacy',
    label: 'Display 100% Zero-Upload Badge',
    description: 'Show the offline privacy status badge in the header and footer.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'privacy.historyRetentionDays',
    category: 'privacy',
    label: 'Workspace History Auto-Purge',
    description: 'Automatically purge IndexedDB workspace caches older than specified duration.',
    type: 'enum',
    default: 30,
    options: [
      { value: 0, label: 'Immediate Purge (On Tab Close)' },
      { value: 7, label: '7 Days' },
      { value: 14, label: '14 Days' },
      { value: 30, label: '30 Days (Recommended)' },
      { value: 90, label: '90 Days' },
    ],
  },
  {
    key: 'privacy.clipboardAutoClearSec',
    category: 'privacy',
    label: 'Clipboard Auto-Clear Timer',
    description: 'Clear copied tokens, passwords, and sensitive text hashes from memory.',
    type: 'enum',
    default: 30,
    options: [
      { value: 0, label: 'Disabled (Never clear)' },
      { value: 15, label: '15 Seconds' },
      { value: 30, label: '30 Seconds' },
      { value: 60, label: '60 Seconds' },
    ],
  },
  {
    key: 'privacy.vaultMasterPassword',
    category: 'privacy',
    label: 'Encrypted Vault Master Password',
    description: 'Set an optional client-side AES-GCM password to encrypt local IndexedDB backups.',
    type: 'secret',
    default: '',
    placeholder: 'Enter passphrase for client encryption',
  },
  {
    key: 'privacy.telemetryOptIn',
    category: 'privacy',
    label: 'Anonymous Performance Telemetry',
    description: 'Help improve GS Softwares by sending anonymous benchmark scores. Zero file data is ever collected.',
    type: 'boolean',
    default: false,
  },

  // ─────────────────────────────────────────────────────────────
  // 5. 📁 FILE HANDLING CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'files.image.defaultFormat',
    category: 'files',
    label: 'Default Image Export Format',
    description: 'Standard output format when saving compressed images in GS-Pixels.',
    type: 'enum',
    default: 'webp',
    options: [
      { value: 'webp', label: 'WebP (Superior compression & quality)' },
      { value: 'png', label: 'PNG (Lossless with alpha transparency)' },
      { value: 'jpg', label: 'JPEG (Universal compatibility)' },
      { value: 'avif', label: 'AVIF (Next-gen ultra high compression)' },
    ],
  },
  {
    key: 'files.image.defaultQuality',
    category: 'files',
    label: 'Default Image Quality Slider',
    description: 'Initial quality compression ratio.',
    type: 'number',
    default: 85,
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
  },
  {
    key: 'files.audio.defaultFormat',
    category: 'files',
    label: 'Default Audio Export Format',
    description: 'Default format when bouncing audio stems in GS-Audio.',
    type: 'enum',
    default: 'mp3',
    options: [
      { value: 'mp3', label: 'MP3 (192-320 kbps Universal)' },
      { value: 'wav', label: 'WAV (Lossless 24-bit PCM)' },
      { value: 'flac', label: 'FLAC (Lossless compressed)' },
      { value: 'opus', label: 'Opus (Modern low-bitrate web audio)' },
    ],
  },
  {
    key: 'files.preserveMetadata',
    category: 'files',
    label: 'Preserve EXIF / ID3 Metadata',
    description: 'Retain camera EXIF metadata and audio tags on exported files.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'files.overwriteBehavior',
    category: 'files',
    label: 'Duplicate File Collision Action',
    description: 'Behavior when exporting a file that matches an existing workspace item name.',
    type: 'enum',
    default: 'rename',
    options: [
      { value: 'rename', label: 'Auto-Rename (Add _(1) suffix)' },
      { value: 'overwrite', label: 'Overwrite existing item' },
      { value: 'ask', label: 'Prompt user confirmation' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. ⚡ ADVANCED CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'advanced.prefetchModels',
    category: 'advanced',
    label: 'AI & WASM Model Prefetch Strategy',
    description: 'Controls when neural network weights (OCR, Background Removal, RNNoise) are pre-loaded.',
    type: 'enum',
    default: 'on_open',
    options: [
      { value: 'on_open', label: 'On Tool Open (Balanced bandwidth & startup speed)' },
      { value: 'on_load', label: 'On PWA Boot (Fastest tool execution, higher initial network)' },
      { value: 'never', label: 'On-Demand Only (Eco safe, zero background network)' },
    ],
  },
  {
    key: 'advanced.largeFileWarningMB',
    category: 'advanced',
    label: 'Large File Warning Threshold',
    description: 'Display an advisory alert when importing files larger than this size.',
    type: 'number',
    default: 500,
    min: 50,
    max: 2000,
    step: 50,
    unit: 'MB',
  },
  {
    key: 'advanced.developerMode',
    category: 'advanced',
    label: 'Developer Debug Mode',
    description: 'Enable verbose Web Worker console telemetry, frame execution timings, and memory gauges.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'advanced.experimentalFeatures',
    category: 'advanced',
    label: 'Experimental Features Lab',
    description: 'Enable preview tools including AI SVG vectorization and WebGPU video shaders.',
    type: 'boolean',
    default: false,
  },

  // ─────────────────────────────────────────────────────────────
  // 7. 🧰 TOOL DEFAULTS CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'tools.suiteDefaults',
    category: 'tools',
    label: 'Per-Suite Defaults',
    description: 'Configure initial presets and default parameters for individual tools in the GS Softwares suite.',
    type: 'suite-defaults',
    default: {},
  },

  // ─────────────────────────────────────────────────────────────
  // 8. ⌨️ SHORTCUTS CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'shortcuts.bindings',
    category: 'shortcuts',
    label: 'Global Keyboard Bindings',
    description: 'Quickly access suites and invoke primary studio actions using hotkeys.',
    type: 'computed',
    default: {},
    computedId: 'diagnostics',
  },

  // ─────────────────────────────────────────────────────────────
  // 9. 💾 DATA & STORAGE CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'data.storageUsage',
    category: 'data',
    label: 'IndexedDB Workspace Quota',
    description: 'Real-time breakdown of local browser storage consumed by project files.',
    type: 'computed',
    default: null,
    computedId: 'storageUsage',
  },
  {
    key: 'data.exportSettings',
    category: 'data',
    label: 'Export Configuration JSON',
    description: 'Download all preferences, tool defaults, and performance overrides as a JSON file.',
    type: 'action',
    default: null,
    actionId: 'exportSettings',
  },
  {
    key: 'data.importSettings',
    category: 'data',
    label: 'Import Configuration JSON',
    description: 'Restore your saved configuration from a previously exported backup file.',
    type: 'action',
    default: null,
    actionId: 'importSettings',
  },
  {
    key: 'data.resetDefaults',
    category: 'data',
    label: 'Reset All Settings to Factory Defaults',
    description: 'Restores all schema defaults and re-runs hardware auto-detection.',
    type: 'action',
    default: null,
    actionId: 'resetDefaults',
    warning: 'This will reset all your visual themes, tool preferences, and custom tier overrides.',
  },
  {
    key: 'data.clearAll',
    category: 'data',
    label: 'Purge All Workspace Data & Storage',
    description: 'Completely wipes all IndexedDB projects, cached assets, and local preferences.',
    type: 'action',
    default: null,
    actionId: 'clearAll',
    warning: 'Destructive action. Double confirmation required. All unsaved workspace files will be permanently erased.',
  },

  // ─────────────────────────────────────────────────────────────
  // 10. ℹ️ ABOUT & DIAGNOSTICS CATEGORY
  // ─────────────────────────────────────────────────────────────
  {
    key: 'about.diagnostics',
    category: 'about',
    label: 'System Diagnostic Telemetry',
    description: 'Examine detailed hardware capabilities, WebGL extensions, and WebGPU support.',
    type: 'computed',
    default: null,
    computedId: 'diagnostics',
  },
];

// Tool Suite Default Definitions for the 'tools' category accordion
export const SUITE_DEFAULT_GROUPS: SuiteDefaultGroup[] = [
  {
    suiteId: 'pixels',
    suiteName: 'GS-Pixels (Image Studio)',
    icon: 'Image',
    settings: [
      {
        key: 'tools.pixels.compressQuality',
        category: 'tools',
        label: 'Default Compression Quality',
        description: 'Initial JPEG/WebP compression slider percentage.',
        type: 'number',
        default: 85,
        min: 1,
        max: 100,
        unit: '%',
      },
      {
        key: 'tools.pixels.resizeMode',
        category: 'tools',
        label: 'Default Resize Mode',
        description: 'Aspect ratio preservation strategy.',
        type: 'enum',
        default: 'fit',
        options: [
          { value: 'fit', label: 'Fit within boundaries' },
          { value: 'fill', label: 'Crop to fill' },
          { value: 'stretch', label: 'Exact stretch' },
        ],
      },
      {
        key: 'tools.pixels.stripExif',
        category: 'tools',
        label: 'Auto-Strip EXIF Metadata',
        description: 'Remove GPS coordinates and device model tags on save.',
        type: 'boolean',
        default: false,
      },
    ],
  },
  {
    suiteId: 'canvas',
    suiteName: 'GS-Canvas (Vector Studio)',
    icon: 'PenTool',
    settings: [
      {
        key: 'tools.canvas.renderer',
        category: 'tools',
        label: 'Canvas Render Engine',
        description: 'Rendering backend used for vector bezier calculation and zoom rendering.',
        type: 'enum',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto (Prefer WebGL)' },
          { value: 'webgl', label: 'WebGL 2' },
          { value: 'canvas2d', label: 'Canvas 2D Software Fallback' },
        ],
      },
      {
        key: 'tools.canvas.antiAliasing',
        category: 'tools',
        label: 'Anti-Aliasing Smoothing',
        description: 'Sub-pixel vector smoothing for high zoom levels.',
        type: 'boolean',
        default: true,
      },
      {
        key: 'tools.canvas.highDpi',
        category: 'tools',
        label: 'Retina / High-DPI Canvas Buffer',
        description: 'Render at device pixel ratio (2x/3x crispness).',
        type: 'boolean',
        default: true,
      },
    ],
  },
  {
    suiteId: 'pdf',
    suiteName: 'GS-PDF (Document Engine)',
    icon: 'FileText',
    settings: [
      {
        key: 'tools.pdf.dpi',
        category: 'tools',
        label: 'Rasterization Render DPI',
        description: 'Resolution when converting PDF pages into images.',
        type: 'number',
        default: 150,
        min: 72,
        max: 300,
        step: 25,
        unit: 'DPI',
      },
      {
        key: 'tools.pdf.autoOcr',
        category: 'tools',
        label: 'Auto-OCR Scanned Documents',
        description: 'Automatically extract text layer from image-only PDFs using Tesseract.js.',
        type: 'boolean',
        default: false,
      },
    ],
  },
  {
    suiteId: 'video',
    suiteName: 'GS-Video (WASM Transcoder)',
    icon: 'Video',
    settings: [
      {
        key: 'tools.video.crf',
        category: 'tools',
        label: 'Default Constant Rate Factor (CRF)',
        description: 'H.264 / VP9 quality metric (Lower number = higher quality, 18-28 recommended).',
        type: 'number',
        default: 23,
        min: 15,
        max: 35,
        step: 1,
      },
      {
        key: 'tools.video.preset',
        category: 'tools',
        label: 'FFmpeg Transcoding Preset',
        description: 'Tradeoff between conversion speed and output file size.',
        type: 'enum',
        default: 'medium',
        options: [
          { value: 'ultrafast', label: 'Ultrafast (Instant export, larger file)' },
          { value: 'fast', label: 'Fast (Balanced speed)' },
          { value: 'medium', label: 'Medium (Optimal compression)' },
          { value: 'slow', label: 'Slow (Maximum compression)' },
        ],
      },
    ],
  },
  {
    suiteId: 'audio',
    suiteName: 'GS-Audio (Master Suite)',
    icon: 'Music',
    settings: [
      {
        key: 'tools.audio.sampleRate',
        category: 'tools',
        label: 'Default Audio Sample Rate',
        description: 'Internal Web Audio context sample frequency.',
        type: 'enum',
        default: 44100,
        options: [
          { value: 44100, label: '44.1 kHz (CD Quality)' },
          { value: 48000, label: '48.0 kHz (Broadcast / Studio Standard)' },
        ],
      },
      {
        key: 'tools.audio.noiseReduction',
        category: 'tools',
        label: 'Neural Noise Suppression',
        description: 'Apply real-time RNNoise filter on microphone input.',
        type: 'boolean',
        default: true,
      },
    ],
  },
  {
    suiteId: 'text',
    suiteName: 'GS-Text (Code & Diff Studio)',
    icon: 'FileCode',
    settings: [
      {
        key: 'tools.text.diffMode',
        category: 'tools',
        label: 'Default Diff Presentation',
        description: 'Side-by-side split view or unified inline view.',
        type: 'enum',
        default: 'split',
        options: [
          { value: 'split', label: 'Split (Side-by-side comparative)' },
          { value: 'unified', label: 'Unified (Inline stacked diff)' },
        ],
      },
      {
        key: 'tools.text.tabSize',
        category: 'tools',
        label: 'Tab Indentation Size',
        description: 'Number of spaces per indentation level.',
        type: 'number',
        default: 2,
        min: 2,
        max: 8,
        step: 2,
        unit: 'spaces',
      },
    ],
  },
];

export const DEFAULT_KEYBINDINGS: Record<string, { label: string; key: string }> = {
  'nav.home': { label: 'Go to Suite Hub', key: 'Alt + 1' },
  'nav.pixels': { label: 'Open GS-Pixels', key: 'Alt + 2' },
  'nav.canvas': { label: 'Open GS-Canvas', key: 'Alt + 3' },
  'nav.pdf': { label: 'Open GS-PDF', key: 'Alt + 4' },
  'nav.video': { label: 'Open GS-Video', key: 'Alt + 5' },
  'nav.audio': { label: 'Open GS-Audio', key: 'Alt + 6' },
  'nav.text': { label: 'Open GS-Text', key: 'Alt + 7' },
  'app.settings': { label: 'Open Settings Panel', key: 'Alt + S' },
  'app.theme': { label: 'Toggle Light / Dark Theme', key: 'Alt + T' },
};
