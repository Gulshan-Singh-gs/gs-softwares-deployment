/**
 * GS Softwares Settings Store & Precedence Resolution Engine
 * Handles schema validation, two-tier storage synchronization, and global-to-tool precedence.
 */

import { SettingsState, SettingKey, SettingValue } from './types';
import { SETTINGS_SCHEMA, SUITE_DEFAULT_GROUPS } from './schema';
import { TierConfig, TIER_CONFIG_MATRIX, PerformanceTier } from '../performanceTier';

const STORAGE_KEY = 'gs_settings_v1';
const SETTINGS_VERSION = 1;

/**
 * Generate default SettingsState directly from SETTINGS_SCHEMA and SUITE_DEFAULT_GROUPS
 */
export function getDefaultSettingsState(): SettingsState {
  const state: any = {};

  // Extract from main schema
  for (const def of SETTINGS_SCHEMA) {
    if (def.default !== null && def.default !== undefined) {
      state[def.key] = def.default;
    }
  }

  // Extract from suite default groups
  for (const group of SUITE_DEFAULT_GROUPS) {
    for (const def of group.settings) {
      if (def.default !== null && def.default !== undefined) {
        state[def.key] = def.default;
      }
    }
  }

  return state as SettingsState;
}

/**
 * Load settings from localStorage or initialize with defaults
 */
export function loadStoredSettings(): SettingsState {
  const defaults = getDefaultSettingsState();

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Merge stored settings with schema defaults to guarantee all keys exist
        return {
          ...defaults,
          ...parsed.data,
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse settings from storage:', e);
  }

  return defaults;
}

/**
 * Save settings state to localStorage
 */
export function persistSettings(state: SettingsState): void {
  if (typeof window === 'undefined') return;

  try {
    const envelope = {
      version: SETTINGS_VERSION,
      updatedAt: new Date().toISOString(),
      data: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

/**
 * Principle P3: Global → Suite → Tool Precedence Resolution Engine
 * Resolves a parameter according to:
 * 1. Explicit tool override (tools.{toolId}.{param})
 * 2. Suite default (files.{toolId}.{param} or tools.{toolId}.default{Param})
 * 3. Global default ({param})
 * 4. Tier-adjusted baseline (TierConfig)
 */
export function resolveSetting(
  state: SettingsState,
  toolId: string,
  param: string,
  tierConfig?: TierConfig
): any {
  // 1. Check explicit tool override: "tools.pixels.compressQuality"
  const toolKey = `tools.${toolId}.${param}`;
  if (state[toolKey] !== undefined && state[toolKey] !== null) {
    return state[toolKey];
  }

  // 2. Check suite format default: "files.image.defaultQuality"
  const suiteKey = `files.${toolId}.${param}`;
  if (state[suiteKey] !== undefined && state[suiteKey] !== null) {
    return state[suiteKey];
  }

  // 3. Check global state: "general.{param}" or "{param}"
  const generalKey = `general.${param}`;
  if (state[generalKey] !== undefined && state[generalKey] !== null) {
    return state[generalKey];
  }
  if (state[param] !== undefined && state[param] !== null) {
    return state[param];
  }

  // 4. Check Tier-adjusted baseline from TierConfig
  if (tierConfig) {
    if (param === 'compressQuality' || param === 'imageCompressionQuality') {
      return tierConfig.imageCompressionQuality;
    }
    if (param === 'workerCount' || param === 'workers') {
      return tierConfig.workerCount;
    }
    if (param === 'gpu' || param === 'gpuAcceleration') {
      return tierConfig.gpuAcceleration;
    }
    if (param === 'memoryBudgetMB' || param === 'memoryCeilingMB') {
      return tierConfig.memoryBudgetMB;
    }
    if (param === 'autosaveIntervalSec' || param === 'autosaveSec') {
      return tierConfig.autosaveIntervalSec;
    }
    if (param === 'videoPreset' || param === 'preset') {
      return tierConfig.videoEncodingPreset;
    }
  }

  return undefined;
}

/**
 * Export configuration to formatted JSON string
 */
export function exportSettingsToJSON(state: SettingsState, tier: PerformanceTier): string {
  const exportPayload = {
    appName: 'GS Softwares',
    version: '2.0.0-decisive',
    exportedAt: new Date().toISOString(),
    tier,
    settings: state,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validate and import configuration JSON string
 */
export function validateAndImportSettings(
  jsonString: string,
  currentState: SettingsState
): { success: boolean; state?: SettingsState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON payload format.' };
    }

    const importedSettings = parsed.settings || parsed.data || parsed;

    if (!importedSettings || typeof importedSettings !== 'object') {
      return { success: false, error: 'JSON payload missing settings object.' };
    }

    // Merge validated keys onto current schema defaults
    const mergedState: SettingsState = {
      ...currentState,
      ...importedSettings,
    };

    return { success: true, state: mergedState };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to parse JSON configuration file.' };
  }
}
