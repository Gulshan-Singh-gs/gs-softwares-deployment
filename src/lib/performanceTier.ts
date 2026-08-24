/**
 * Performance Tier Engine & Hardware Capability Prober for GS Softwares
 * Supports: 🟢 Eco (Low), 🟡 Balanced (Medium), 🔴 Performance (High)
 */

export type PerformanceTier = 'eco' | 'balanced' | 'performance';

export interface DeviceSpecs {
  cpuCores: number;
  deviceMemoryGB: number | null;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasWebGPU: boolean;
  isBatterySaver: boolean;
  batteryLevel?: number;
  prefersReducedMotion: boolean;
  gpuRenderer?: string;
  hasSharedArrayBuffer: boolean;
  hasOffscreenCanvas: boolean;
  hasAudioWorklet: boolean;
}

export interface TierConfig {
  tier: PerformanceTier;
  label: string;
  badgeColor: string;
  workerCount: number;
  gpuAcceleration: 'disabled' | 'auto' | 'forced_webgpu';
  aiModelsAllowed: boolean;
  aiModelTier: 'none' | 'lightweight' | 'full';
  videoEncodingPreset: 'fast_1pass' | 'medium_1pass' | 'slow_2pass';
  imageCompressionQuality: number; // 0-100
  imageMultiPass: boolean;
  vectorCanvasRenderer: 'canvas2d' | 'webgl' | 'webgl_highdpi';
  audioProcessingMode: 'mono_basic' | 'stereo_basic' | 'stereo_full_spectral';
  memoryBudgetMB: number;
  batchConcurrency: number;
  animationMode: 'reduced' | 'standard' | 'full';
  previewQuality: 'low' | 'standard' | 'high';
  autosaveIntervalSec: number;
  modelPrefetchStrategy: 'never' | 'on_open' | 'on_load';
}

export interface ManualOverrides {
  enabled: boolean;
  customTier?: PerformanceTier;
  customWorkerCount?: number;
  customGpuAcceleration?: 'disabled' | 'auto' | 'forced_webgpu';
  customMemoryBudgetMB?: number;
  customCacheSizeMB?: number;
  customAnimationMode?: 'reduced' | 'standard' | 'full';
  customBatchConcurrency?: number;
}

export interface StoredPerformanceSettings {
  version: number;
  tier: PerformanceTier;
  isAutoDetected: boolean;
  overrides: ManualOverrides;
  benchmarkScore?: number;
  lastBenchmarkTimestamp?: number;
  hasShownInitialToast?: boolean;
}

const STORAGE_KEY = 'gs_perf_settings_v1';

// Base Configuration Matrix per Tier
export const TIER_CONFIG_MATRIX: Record<PerformanceTier, TierConfig> = {
  eco: {
    tier: 'eco',
    label: 'Eco / Low',
    badgeColor: 'emerald',
    workerCount: 1,
    gpuAcceleration: 'disabled',
    aiModelsAllowed: false,
    aiModelTier: 'none',
    videoEncodingPreset: 'fast_1pass',
    imageCompressionQuality: 75,
    imageMultiPass: false,
    vectorCanvasRenderer: 'canvas2d',
    audioProcessingMode: 'mono_basic',
    memoryBudgetMB: 256,
    batchConcurrency: 1,
    animationMode: 'reduced',
    previewQuality: 'low',
    autosaveIntervalSec: 30,
    modelPrefetchStrategy: 'never',
  },
  balanced: {
    tier: 'balanced',
    label: 'Balanced / Medium',
    badgeColor: 'amber',
    workerCount: 3,
    gpuAcceleration: 'auto',
    aiModelsAllowed: true,
    aiModelTier: 'lightweight',
    videoEncodingPreset: 'medium_1pass',
    imageCompressionQuality: 85,
    imageMultiPass: false,
    vectorCanvasRenderer: 'webgl',
    audioProcessingMode: 'stereo_basic',
    memoryBudgetMB: 512,
    batchConcurrency: 3,
    animationMode: 'standard',
    previewQuality: 'standard',
    autosaveIntervalSec: 10,
    modelPrefetchStrategy: 'on_open',
  },
  performance: {
    tier: 'performance',
    label: 'Performance / High',
    badgeColor: 'rose',
    workerCount: typeof navigator !== 'undefined' ? Math.max(4, navigator.hardwareConcurrency || 4) : 4,
    gpuAcceleration: 'forced_webgpu',
    aiModelsAllowed: true,
    aiModelTier: 'full',
    videoEncodingPreset: 'slow_2pass',
    imageCompressionQuality: 95,
    imageMultiPass: true,
    vectorCanvasRenderer: 'webgl_highdpi',
    audioProcessingMode: 'stereo_full_spectral',
    memoryBudgetMB: 1024,
    batchConcurrency: 6,
    animationMode: 'full',
    previewQuality: 'high',
    autosaveIntervalSec: 5,
    modelPrefetchStrategy: 'on_load',
  },
};

/**
 * Probe client device hardware capabilities
 */
export async function detectDeviceSpecs(): Promise<DeviceSpecs> {
  if (typeof window === 'undefined') {
    return {
      cpuCores: 4,
      deviceMemoryGB: 4,
      hasWebGL: true,
      hasWebGL2: true,
      hasWebGPU: false,
      isBatterySaver: false,
      prefersReducedMotion: false,
      hasSharedArrayBuffer: false,
      hasOffscreenCanvas: false,
      hasAudioWorklet: false,
    };
  }

  const cpuCores = navigator.hardwareConcurrency || 2;
  const deviceMemoryGB = (navigator as any).deviceMemory || null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL & WebGL2 probing
  let hasWebGL = false;
  let hasWebGL2 = false;
  let gpuRenderer = 'Unknown / Software';

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      hasWebGL2 = true;
      hasWebGL = true;
      const dbg = gl2.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        gpuRenderer = gl2.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
      }
    } else {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        hasWebGL = true;
        const dbg = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          gpuRenderer = (gl as any).getParameter(dbg.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
        }
      }
    }
  } catch (e) {
    console.warn('WebGL probe failed:', e);
  }

  // WebGPU probing
  let hasWebGPU = false;
  try {
    if ('gpu' in navigator && (navigator as any).gpu) {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
      }
    }
  } catch (e) {
    // WebGPU not supported or blocked
  }

  // Battery status probing
  let isBatterySaver = false;
  let batteryLevel: number | undefined = undefined;
  try {
    if ('getBattery' in navigator && typeof (navigator as any).getBattery === 'function') {
      const battery = await (navigator as any).getBattery();
      batteryLevel = battery.level;
      // If not charging and battery is below 20%, consider battery saving active
      if (!battery.charging && battery.level <= 0.20) {
        isBatterySaver = true;
      }
    }
  } catch (e) {
    // Battery API ignored
  }

  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
  const hasAudioWorklet = typeof window !== 'undefined' && 'AudioWorklet' in window;

  return {
    cpuCores,
    deviceMemoryGB,
    hasWebGL,
    hasWebGL2,
    hasWebGPU,
    isBatterySaver,
    batteryLevel,
    prefersReducedMotion,
    gpuRenderer,
    hasSharedArrayBuffer,
    hasOffscreenCanvas,
    hasAudioWorklet,
  };
}

/**
 * Fast synthetic benchmark to evaluate browser CPU & Canvas throughput (takes ~120ms)
 * Returns a score between 10 (very slow) and 100+ (high-end)
 */
export async function runSyntheticBenchmark(): Promise<{ score: number; durationMs: number }> {
  const start = performance.now();
  
  // Test 1: Mathematical computation & Array throughput (500,000 ops)
  let sum = 0;
  const arr = new Float64Array(200000);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.sin(i) * Math.cos(i) + Math.sqrt(i + 1);
    sum += arr[i];
  }

  // Test 2: Canvas 2D image pixel manipulation
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.createImageData(300, 300);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = (i * 7) % 255;
          data[i + 1] = (i * 13) % 255;
          data[i + 2] = (i * 29) % 255;
          data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        // Alpha blend filter
        ctx.fillStyle = 'rgba(255, 0, 128, 0.5)';
        ctx.fillRect(0, 0, 300, 300);
      }
    } catch (e) {
      // ignore
    }
  }

  const durationMs = performance.now() - start;
  // Baseline: Fast machines complete in ~15-40ms (Score: ~80-120), Slow devices in >180ms (Score: <40)
  const calculatedScore = Math.max(10, Math.min(150, Math.round(1200 / (durationMs + 5))));

  return {
    score: calculatedScore,
    durationMs: Math.round(durationMs),
  };
}

/**
 * Score device specs and benchmark result to recommend an optimal tier
 */
export function calculateRecommendedTier(specs: DeviceSpecs, benchmarkScore?: number): PerformanceTier {
  // Rule 1: Battery saver or reduced motion preference forces Eco
  if (specs.isBatterySaver) {
    return 'eco';
  }

  let score = 0;

  // CPU Score
  if (specs.cpuCores >= 8) score += 35;
  else if (specs.cpuCores >= 4) score += 25;
  else if (specs.cpuCores >= 2) score += 10;
  else score += 5;

  // RAM Score
  if (specs.deviceMemoryGB !== null) {
    if (specs.deviceMemoryGB >= 8) score += 35;
    else if (specs.deviceMemoryGB >= 4) score += 25;
    else if (specs.deviceMemoryGB >= 2) score += 10;
    else score += 5;
  } else {
    // Default estimate if deviceMemory is unavailable
    score += 20;
  }

  // GPU Score
  if (specs.hasWebGPU) score += 30;
  else if (specs.hasWebGL2) score += 20;
  else if (specs.hasWebGL) score += 10;

  // Benchmark Score modifier
  if (benchmarkScore !== undefined) {
    if (benchmarkScore >= 80) score += 15;
    else if (benchmarkScore < 40) score -= 20;
  }

  // Tier assignment
  if (score >= 75) {
    return 'performance';
  } else if (score >= 45) {
    return 'balanced';
  } else {
    return 'eco';
  }
}

/**
 * Load settings from localStorage or generate fresh auto-detected state
 */
export async function initializePerformanceSettings(): Promise<{
  settings: StoredPerformanceSettings;
  specs: DeviceSpecs;
  isFirstLaunch: boolean;
}> {
  const specs = await detectDeviceSpecs();
  let stored: StoredPerformanceSettings | null = null;
  let isFirstLaunch = false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse performance settings from storage:', e);
  }

  if (!stored) {
    isFirstLaunch = true;
    const benchmark = await runSyntheticBenchmark();
    const recommendedTier = calculateRecommendedTier(specs, benchmark.score);

    stored = {
      version: 1,
      tier: recommendedTier,
      isAutoDetected: true,
      overrides: { enabled: false },
      benchmarkScore: benchmark.score,
      lastBenchmarkTimestamp: Date.now(),
      hasShownInitialToast: false,
    };

    savePerformanceSettings(stored);
  }

  return { settings: stored, specs, isFirstLaunch };
}

/**
 * Save settings to localStorage
 */
export function savePerformanceSettings(settings: StoredPerformanceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save performance settings to storage:', e);
  }
}

/**
 * Merge base tier config with active manual overrides
 */
export function resolveEffectiveTierConfig(
  tier: PerformanceTier,
  overrides: ManualOverrides,
  specs: DeviceSpecs
): TierConfig {
  const base = { ...TIER_CONFIG_MATRIX[tier] };

  // Adjust max workers dynamically based on actual hardware
  if (tier === 'performance') {
    base.workerCount = Math.max(4, specs.cpuCores);
  }

  if (overrides.enabled) {
    if (overrides.customWorkerCount) {
      base.workerCount = overrides.customWorkerCount;
    }
    if (overrides.customGpuAcceleration) {
      base.gpuAcceleration = overrides.customGpuAcceleration;
    }
    if (overrides.customMemoryBudgetMB) {
      base.memoryBudgetMB = overrides.customMemoryBudgetMB;
    }
    if (overrides.customAnimationMode) {
      base.animationMode = overrides.customAnimationMode;
    }
    if (overrides.customBatchConcurrency) {
      base.batchConcurrency = overrides.customBatchConcurrency;
    }
  }

  return base;
}
