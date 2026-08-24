/**
 * GS Softwares Settings Core Types
 * Defines the complete type system for the Schema-Driven Settings Architecture
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
  | 'computed';

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
  options?: SettingOption<any>[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  warning?: string;
  dependsOn?: string; // e.g. "perf.override"
  placeholder?: string;
  actionId?: 'exportSettings' | 'importSettings' | 'resetDefaults' | 'clearAll' | 'clearCache' | 'runBenchmark';
  computedId?: 'storageUsage' | 'diagnostics' | 'tierStatus';
  suiteId?: string; // For tools category
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
  'perf.override': boolean;
  'perf.workers': number;
  'perf.gpu': 'disabled' | 'auto' | 'forced_webgpu';
  'perf.memoryCeilingMB': number;
  'perf.cacheSizeMB': number;

  // 2. Appearance
  'appearance.theme': 'light' | 'semi' | 'dark' | 'system';
  'appearance.accentColor': string;
  'appearance.neuDepth': number; // 0 - 100
  'appearance.fontSize': number; // 12 - 24
  'appearance.compactMode': boolean;
  'appearance.motion': 'full' | 'standard' | 'reduced' | 'none';

  // 3. General
  'general.language': string;
  'general.startupPage': 'home' | 'pixels' | 'canvas' | 'pdf' | 'video' | 'audio' | 'text';
  'general.saveDestination': 'download' | 'fsAccess' | 'opfs';
  'general.fileNamingTemplate': string;
  'general.autosaveSec': number;

  // 4. Privacy & Security
  'privacy.historyRetentionDays': number; // 0, 7, 14, 30, 90
  'privacy.vaultMasterPassword'?: string;
  'privacy.clipboardAutoClearSec': number; // 0, 15, 30, 60
  'privacy.showZeroUploadBadge': boolean;
  'privacy.telemetryOptIn': boolean;

  // 5. Files
  'files.image.defaultFormat': 'webp' | 'png' | 'jpg' | 'avif';
  'files.image.defaultQuality': number;
  'files.audio.defaultFormat': 'opus' | 'mp3' | 'wav' | 'flac';
  'files.preserveMetadata': boolean;
  'files.overwriteBehavior': 'rename' | 'overwrite' | 'ask';

  // 6. Advanced
  'advanced.prefetchModels': 'never' | 'on_open' | 'on_load';
  'advanced.largeFileWarningMB': number;
  'advanced.developerMode': boolean;
  'advanced.experimentalFeatures': boolean;

  // 7. Tool Defaults (Suite specific)
  'tools.pixels.compressQuality': number;
  'tools.pixels.resizeMode': 'fit' | 'fill' | 'stretch';
  'tools.pixels.stripExif': boolean;

  'tools.canvas.renderer': 'auto' | 'canvas2d' | 'webgl';
  'tools.canvas.antiAliasing': boolean;
  'tools.canvas.highDpi': boolean;

  'tools.pdf.dpi': number;
  'tools.pdf.autoOcr': boolean;
  'tools.pdf.compressionLevel': 'low' | 'medium' | 'high';

  'tools.video.crf': number;
  'tools.video.preset': 'ultrafast' | 'fast' | 'medium' | 'slow';
  'tools.video.twoPass': boolean;

  'tools.audio.sampleRate': number;
  'tools.audio.noiseReduction': boolean;
  'tools.audio.normalizeLoudness': boolean;

  'tools.text.diffMode': 'unified' | 'split';
  'tools.text.tabSize': number;
  'tools.text.wordWrap': boolean;

  // 8. Shortcuts
  'shortcuts.bindings': Record<string, string>;

  // Catch-all index for dynamic keys
  [key: string]: any;
}

export type SettingKey = keyof SettingsState | string;
export type SettingValue<K extends SettingKey = SettingKey> = K extends keyof SettingsState
  ? SettingsState[K]
  : any;
