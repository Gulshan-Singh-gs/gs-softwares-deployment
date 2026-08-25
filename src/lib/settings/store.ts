/**
 * GS Softwares Settings Store & Precedence Resolution Engine
 * Master Contract v1.0 (Decisive)
 * Implements cascading precedence (Tool → Suite → Global → Schema default) and Section 7 Export/Import.
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

  // Extract from 12 suite default groups
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
        const storedData = parsed.settings || parsed.data || parsed;
        return {
          ...defaults,
          ...storedData,
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
      gsSettingsVersion: SETTINGS_VERSION,
      exportedAt: new Date().toISOString(),
      tier: state['perf.tier'] || 'balanced',
      settings: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

/**
 * Section 5: Precedence Resolution Engine
 * Resolution order: Tool → Suite → Global → Schema default
 */
export function resolveSetting(
  state: SettingsState,
  key: string,
  toolId?: string,
  tierConfig?: TierConfig
): any {
  // 1. Tool-level override (e.g., "tools.pixels.quality" or "tools.image.quality")
  if (toolId) {
    const toolKey = `tools.${toolId}.${key}`;
    if (state[toolKey] !== undefined && state[toolKey] !== null) {
      return state[toolKey];
    }
    // Also check direct key if passed as tools.xxx
    if (key.startsWith('tools.') && state[key] !== undefined && state[key] !== null) {
      return state[key];
    }
  }

  // 2. Suite-level override (e.g., "tools.image.quality")
  const suite = toolId ? toolId.split('.')[0] : undefined;
  if (suite) {
    const suiteKey = `tools.${suite}.${key}`;
    if (state[suiteKey] !== undefined && state[suiteKey] !== null) {
      return state[suiteKey];
    }
    const filesKey = `files.${suite}.${key}`;
    if (state[filesKey] !== undefined && state[filesKey] !== null) {
      return state[filesKey];
    }
  }

  // 3. Global override (e.g., "files.image.format" or "general.autosaveSec")
  if (state[key] !== undefined && state[key] !== null) {
    return state[key];
  }
  const generalKey = `general.${key}`;
  if (state[generalKey] !== undefined && state[generalKey] !== null) {
    return state[generalKey];
  }

  // 4. Performance tier-derived computed properties
  if (tierConfig) {
    if (key === 'workerCount' || key === 'perf.workerCount') {
      return state['perf.autoDetect'] !== false && state['perf.workerCountOverride']
        ? state['perf.workerCountOverride']
        : tierConfig.workerCount;
    }
    if (key === 'gpu' || key === 'gpuAcceleration' || key === 'perf.gpuAcceleration') {
      return state['perf.autoDetect'] !== false && state['perf.gpuOverride']
        ? state['perf.gpuOverride']
        : tierConfig.gpuAcceleration;
    }
    if (key === 'memoryCeilingMB' || key === 'perf.memoryCeilingMB') {
      return state['perf.autoDetect'] !== false && state['perf.memoryOverrideMB']
        ? state['perf.memoryOverrideMB']
        : tierConfig.memoryBudgetMB;
    }
    if (key === 'aiModels' || key === 'perf.aiModels') {
      return tierConfig.aiModelTier;
    }
    if (key === 'batchConcurrency' || key === 'perf.batchConcurrency') {
      return tierConfig.batchConcurrency;
    }
    if (key === 'previewQuality' || key === 'perf.previewQuality') {
      return tierConfig.previewQuality;
    }
    if (key === 'encodingPreset' || key === 'perf.encodingPreset') {
      return tierConfig.videoEncodingPreset;
    }
    if (key === 'animationLevel' || key === 'perf.animationLevel') {
      return tierConfig.animationMode;
    }
    if (key === 'modelPrefetch' || key === 'perf.modelPrefetch') {
      return tierConfig.modelPrefetchStrategy;
    }
  }

  // 5. Schema default lookup
  const schemaDef = SETTINGS_SCHEMA.find((s) => s.key === key);
  if (schemaDef && schemaDef.default !== undefined) {
    return schemaDef.default;
  }

  for (const group of SUITE_DEFAULT_GROUPS) {
    const subDef = group.settings.find((s) => s.key === key);
    if (subDef && subDef.default !== undefined) {
      return subDef.default;
    }
  }

  return undefined;
}

/**
 * Section 7: Export Specification
 * Exports non-default overrides only, excluding secrets and readonly properties.
 */
export function exportSettingsToJSON(state: SettingsState, tier: PerformanceTier): string {
  const defaults = getDefaultSettingsState();
  const overrides: Record<string, any> = {};

  for (const [k, v] of Object.entries(state)) {
    // Exclude secrets (e.g. passwords) and action/computed fields
    if (k.includes('vaultPassword') || k.includes('Password') || v === undefined || v === null) {
      continue;
    }
    // Only include non-default overrides to keep payload clean
    if (defaults[k] !== v) {
      overrides[k] = v;
    }
  }

  const exportPayload = {
    gsSettingsVersion: SETTINGS_VERSION,
    exportedAt: new Date().toISOString(),
    tier,
    settings: overrides,
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Section 7: Import Validation Specification
 * Atomic validation against schema constraints with summary reporting.
 */
export function validateAndImportSettings(
  jsonString: string,
  currentState: SettingsState
): { success: boolean; state?: SettingsState; importedCount?: number; ignoredCount?: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Malformed JSON payload.' };
    }

    if (parsed.gsSettingsVersion !== undefined && parsed.gsSettingsVersion > SETTINGS_VERSION) {
      return { success: false, error: `Incompatible backup version (v${parsed.gsSettingsVersion}). Current app supports v${SETTINGS_VERSION}.` };
    }

    const importedSettings = parsed.settings || parsed.data || parsed;
    if (!importedSettings || typeof importedSettings !== 'object') {
      return { success: false, error: 'Missing settings dictionary in configuration backup.' };
    }

    let importedCount = 0;
    let ignoredCount = 0;
    const validatedOverrides: Record<string, any> = {};

    // Collect all valid keys across master schema and 12 suite groups
    const validKeysMap = new Map<string, any>();
    for (const def of SETTINGS_SCHEMA) {
      validKeysMap.set(def.key, def);
    }
    for (const group of SUITE_DEFAULT_GROUPS) {
      for (const def of group.settings) {
        validKeysMap.set(def.key, def);
      }
    }

    for (const [key, value] of Object.entries(importedSettings)) {
      if (validKeysMap.has(key)) {
        // Never import secrets or readonly values
        if (key.includes('vaultPassword') || key.includes('noTelemetry') || key.includes('proofLink')) {
          ignoredCount++;
          continue;
        }
        validatedOverrides[key] = value;
        importedCount++;
      } else {
        ignoredCount++;
      }
    }

    const mergedState: SettingsState = {
      ...currentState,
      ...validatedOverrides,
    };

    if (parsed.tier && ['eco', 'balanced', 'performance'].includes(parsed.tier)) {
      mergedState['perf.tier'] = parsed.tier;
    }

    return {
      success: true,
      state: mergedState,
      importedCount,
      ignoredCount,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to parse JSON backup file.' };
  }
}
