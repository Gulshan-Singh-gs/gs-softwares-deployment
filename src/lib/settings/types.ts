/**
 * GS Softwares Settings Core Types
 * Master Schema Contract v1.0 (Decisive)
 */

import { PerformanceTier, DeviceSpecs } from '../performanceTier';

export type SettingCategory =
  | 'performance'
  | 'appearance'
  | 'general'
  | 'privacy'
  | 'files'
  | 'advanced'
  | 'tools'
  | 'shortcuts'
  | 'data'
  | 'about';

export type SettingRendererType =
  | 'tier-selector'
  | 'enum'
  | 'boolean'
  | 'number'
  | 'color'
  | 'string'
  | 'secret'
  | 'suite-defaults'
  | 'action'
  | 'computed'
  | 'readonly';

export interface SettingOption<T = string | number> {
  value: T;
  label: string;
  desc?: string;
  icon?: string;
}

export interface SettingDefinition<T = any> {
  key: string;
  category: SettingCategory;
  label: string;
  description: string;
  type: SettingRendererType;
  default: T;
  tierAware?: boolean;
  autoDetect?: boolean;
  options?: SettingOption<any>[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  warning?: string;
  dependsOn?: string; // e.g. "!perf.autoDetect" or "perf.autoDetect === false"
  placeholder?: string;
  actionId?: 'export' | 'import' | 'resetDefaults' | 'clearHistory' | 'clearAll' | 'clearCache' | 'runBenchmark';
  computedId?: 'storageUsage' | 'diagnostics' | 'tierStatus';
  suiteId?: string;
  url?: string;
  badge?: string;
  inheritsKey?: string;
}

export interface SuiteDefaultGroup {
  suiteId: string;
  suiteName: string;
  icon: string;
  settings: SettingDefinition[];
}

export interface SettingsState {
  // 1. Performance
  'perf.tier': PerformanceTier;
  'perf.autoDetect': boolean;
  'perf.workerCountOverride'?: number;
  'perf.gpuOverride'?: 'disabled' | 'webgl' | 'webgpu';
  'perf.memoryOverrideMB'?: number;
  'perf.cacheSizeMB': number;

  // 2. Appearance
  'appearance.theme': 'light' | 'dark' | 'system';
  'appearance.accent': string;
  'appearance.depth': number; // 0–100 slider, default 50
  'appearance.fontSize': number; // 12–24 px, default 16
  'appearance.compact': boolean;
  'appearance.highContrast': boolean;

  // 3. General
  'general.language': string;
  'general.startupPage': 'home' | 'lastTool' | 'allTools' | 'pixels' | 'canvas' | 'pdf' | 'video' | 'audio' | 'text';
  'general.saveDestination': 'download' | 'fsAccess' | 'opfs';
  'general.fileNaming': string;
  'general.autosaveSec': number;

  // 4. Privacy & Security
  'privacy.historyRetention': number; // 7, 14, 30, 90 days
  'privacy.clipboardClearSec': number; // 0, 10, 30, 60
  'privacy.vaultPassword'?: string;
  'privacy.showZeroUploadBadge': boolean;
  'privacy.noTelemetry': boolean;

  // 5. File Handling
  'files.image.format': 'webp' | 'jpg' | 'png' | 'avif';
  'files.image.quality': number;
  'files.audio.format': 'opus' | 'mp3' | 'wav' | 'flac';
  'files.preserveMetadata': boolean;
  'files.overwriteBehavior': 'rename' | 'overwrite' | 'ask';
  'files.largeFileWarnMB': number;

  // 6. Advanced
  'advanced.prefetchModels': 'never' | 'onToolOpen' | 'onAppLoad';
  'advanced.largeFileWarningMB': number;
  'advanced.developerMode': boolean;
  'advanced.experimentalFeatures': boolean;

  // 7. Tool Defaults (12 Suites)
  // Image Suite
  'tools.image.format'?: 'webp' | 'jpg' | 'png' | 'avif';
  'tools.image.quality'?: number;
  'tools.image.editorMode'?: 'simple' | 'advanced';
  'tools.image.bgRemoverModel'?: 'auto' | 'lightweight' | 'full';

  // Vector Suite
  'tools.vector.renderer'?: 'auto' | 'canvas2d' | 'webgl';
  'tools.vector.antiAliasing'?: boolean;
  'tools.vector.highDpi'?: boolean;

  // PDF Suite
  'tools.pdf.dpi'?: number;
  'tools.pdf.autoOcr'?: boolean;
  'tools.pdf.compressionLevel'?: 'low' | 'medium' | 'high';

  // Video Suite
  'tools.video.crf'?: number;
  'tools.video.preset'?: 'ultrafast' | 'fast' | 'medium' | 'slow';
  'tools.video.twoPass'?: boolean;

  // Audio Suite
  'tools.audio.sampleRate'?: number;
  'tools.audio.noiseReduction'?: boolean;
  'tools.audio.normalizeLoudness'?: boolean;

  // Text Suite
  'tools.text.diffMode'?: 'unified' | 'split';
  'tools.text.tabSize'?: number;
  'tools.text.wordWrap'?: boolean;

  // Archive Suite
  'tools.archive.compressionLevel'?: number;
  'tools.archive.defaultFormat'?: 'zip' | 'tar' | 'gz';

  // QR Suite
  'tools.qr.errorCorrection'?: 'L' | 'M' | 'Q' | 'H';
  'tools.qr.margin'?: number;

  // Spreadsheet Suite
  'tools.spreadsheet.delimiter'?: ',' | ';' | '\t';
  'tools.spreadsheet.autoParseDates'?: boolean;

  // E-book Suite
  'tools.ebook.format'?: 'epub' | 'mobi' | 'pdf';
  'tools.ebook.fontSize'?: number;

  // Presentation Suite
  'tools.presentation.aspectRatio'?: '16:9' | '4:3';
  'tools.presentation.transition'?: 'fade' | 'slide' | 'none';

  // Security Suite
  'tools.security.hashAlgorithm'?: 'SHA-256' | 'SHA-512' | 'MD5';
  'tools.security.keyLength'?: number;

  // 8. Shortcuts
  'shortcuts.bindings': Record<string, string>;

  // Catch-all index
  [key: string]: any;
}

export type SettingKey = keyof SettingsState | string;
export type SettingValue<K extends SettingKey = SettingKey> = K extends keyof SettingsState
  ? SettingsState[K]
  : any;
