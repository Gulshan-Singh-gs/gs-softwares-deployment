import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  PerformanceTier,
  TierConfig,
  DeviceSpecs,
  ManualOverrides,
  StoredPerformanceSettings,
  TIER_CONFIG_MATRIX,
  detectDeviceSpecs,
  runSyntheticBenchmark,
  calculateRecommendedTier,
  initializePerformanceSettings,
  savePerformanceSettings,
  resolveEffectiveTierConfig,
} from '../lib/performanceTier';
import {
  SettingsState,
  SettingKey,
  SettingValue,
} from '../lib/settings/types';
import {
  loadStoredSettings,
  persistSettings,
  getDefaultSettingsState,
  resolveSetting,
  exportSettingsToJSON,
  validateAndImportSettings,
} from '../lib/settings/store';

interface PerformanceContextType {
  // Performance Tier state
  tier: PerformanceTier;
  config: TierConfig;
  specs: DeviceSpecs | null;
  isAutoDetected: boolean;
  overrides: ManualOverrides;
  benchmarkScore?: number;
  isBenchmarking: boolean;
  setTier: (tier: PerformanceTier, manual?: boolean) => void;
  setOverrides: (newOverrides: Partial<ManualOverrides>) => void;
  runBenchmark: () => Promise<{ score: number; durationMs: number; recommendedTier: PerformanceTier }>;
  resetToAutoDetect: () => void;

  // Schema-Driven Settings Store (Master Contract v1.0)
  settings: SettingsState;
  getSetting: <K extends SettingKey>(key: K, toolId?: string) => SettingValue<K>;
  setSetting: <K extends SettingKey>(key: K, value: SettingValue<K>) => void;
  resolve: (key: string, toolId?: string) => any;
  exportSettings: () => string;
  importSettings: (json: string) => Promise<{ success: boolean; importedCount?: number; ignoredCount?: number; error?: string }>;
  resetDefaults: () => Promise<void>;
  clearHistory: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Toast & Modal Controls
  showToast: boolean;
  toastMessage: string | null;
  dismissToast: () => void;
  clearStorageCache: () => Promise<void>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const defaultSpecs: DeviceSpecs = {
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

const initialDefaultSettings = getDefaultSettingsState();

const PerformanceContext = createContext<PerformanceContextType>({
  tier: 'balanced',
  config: TIER_CONFIG_MATRIX.balanced,
  specs: defaultSpecs,
  isAutoDetected: true,
  overrides: { enabled: false },
  benchmarkScore: undefined,
  isBenchmarking: false,
  setTier: () => {},
  setOverrides: () => {},
  runBenchmark: async () => ({ score: 50, durationMs: 25, recommendedTier: 'balanced' }),
  resetToAutoDetect: () => {},
  settings: initialDefaultSettings,
  getSetting: (key) => initialDefaultSettings[key],
  setSetting: () => {},
  resolve: () => undefined,
  exportSettings: () => '',
  importSettings: async () => ({ success: true, importedCount: 0, ignoredCount: 0 }),
  resetDefaults: async () => {},
  clearHistory: async () => {},
  clearAllData: async () => {},
  showToast: false,
  toastMessage: null,
  dismissToast: () => {},
  clearStorageCache: async () => {},
  isSettingsOpen: false,
  setIsSettingsOpen: () => {},
});

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<PerformanceTier>('balanced');
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  const [overrides, setOverridesState] = useState<ManualOverrides>({ enabled: false });
  const [benchmarkScore, setBenchmarkScore] = useState<number | undefined>(undefined);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Schema-Driven Settings State
  const [settings, setSettingsState] = useState<SettingsState>(() => loadStoredSettings());

  // Initialize hardware and load saved preference
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { settings: perfSettings, specs: detectedSpecs, isFirstLaunch } = await initializePerformanceSettings();
      if (!mounted) return;

      setSpecs(detectedSpecs);
      setTierState(perfSettings.tier);
      setIsAutoDetected(perfSettings.isAutoDetected);
      setOverridesState(perfSettings.overrides);
      setBenchmarkScore(perfSettings.benchmarkScore);

      // Sync settings state with loaded tier & auto-detect state
      setSettingsState((prev) => {
        const next = {
          ...prev,
          'perf.tier': perfSettings.tier,
          'perf.autoDetect': perfSettings.isAutoDetected,
        };
        persistSettings(next);
        return next;
      });

      // Trigger first-launch advisory toast
      if (isFirstLaunch || !perfSettings.hasShownInitialToast) {
        const tierName = TIER_CONFIG_MATRIX[perfSettings.tier].label.split(' / ')[0];
        setToastMessage(`Optimized for your device (${tierName}). Change anytime in Settings.`);
        setShowToast(true);
        savePerformanceSettings({ ...perfSettings, hasShownInitialToast: true });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync Appearance CSS attributes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Accent color
    if (settings['appearance.accent']) {
      root.style.setProperty('--accent-primary', settings['appearance.accent']);
    }

    // 2. High Contrast
    if (settings['appearance.highContrast']) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Compact mode
    if (settings['appearance.compact']) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // 4. Text Size Preset (Small / Medium / Large)
    const textSize = settings['appearance.textSize'] || 'medium';
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${textSize}`);
    
    if (textSize === 'small') {
      root.style.fontSize = '14px';
      root.style.setProperty('--base-font-size', '14px');
    } else if (textSize === 'large') {
      root.style.fontSize = '18px';
      root.style.setProperty('--base-font-size', '18px');
    } else {
      root.style.fontSize = '16px';
      root.style.setProperty('--base-font-size', '16px');
    }
  }, [settings]);

  // Update localStorage when performance state updates
  const persistPerf = useCallback(
    (newTier: PerformanceTier, newAuto: boolean, newOverrides: ManualOverrides, newScore?: number) => {
      const stored: StoredPerformanceSettings = {
        version: 1,
        tier: newTier,
        isAutoDetected: newAuto,
        overrides: newOverrides,
        benchmarkScore: newScore !== undefined ? newScore : benchmarkScore,
        lastBenchmarkTimestamp: Date.now(),
        hasShownInitialToast: true,
      };
      savePerformanceSettings(stored);
    },
    [benchmarkScore]
  );

  const setTier = useCallback(
    (newTier: PerformanceTier, manual = true) => {
      setTierState(newTier);
      setSettingsState((prev) => {
        const next = {
          ...prev,
          'perf.tier': newTier,
          'perf.autoDetect': manual ? false : prev['perf.autoDetect'],
        };
        persistSettings(next);
        return next;
      });

      if (manual) {
        setIsAutoDetected(false);
        persistPerf(newTier, false, overrides, benchmarkScore);
      } else {
        persistPerf(newTier, isAutoDetected, overrides, benchmarkScore);
      }
    },
    [isAutoDetected, overrides, benchmarkScore, persistPerf]
  );

  const setOverrides = useCallback(
    (partial: Partial<ManualOverrides>) => {
      setOverridesState((prevOverrides) => {
        const updated: ManualOverrides = { ...prevOverrides, enabled: true, ...partial };
        setIsAutoDetected(false);
        persistPerf(tier, false, updated, benchmarkScore);

        setSettingsState((prev) => {
          const next = {
            ...prev,
            'perf.autoDetect': false,
            ...(updated.customWorkerCount !== undefined && { 'perf.workerCountOverride': updated.customWorkerCount }),
            ...(updated.customGpuAcceleration !== undefined && { 'perf.gpuOverride': updated.customGpuAcceleration as any }),
            ...(updated.customMemoryBudgetMB !== undefined && { 'perf.memoryOverrideMB': updated.customMemoryBudgetMB }),
          };
          persistSettings(next);
          return next;
        });

        return updated;
      });
    },
    [tier, benchmarkScore, persistPerf]
  );

  const resetToAutoDetect = useCallback(async () => {
    const activeSpecs = specs || (await detectDeviceSpecs());
    const recTier = calculateRecommendedTier(activeSpecs, benchmarkScore);
    setTierState(recTier);
    setIsAutoDetected(true);
    const cleanOverrides: ManualOverrides = { enabled: false };
    setOverridesState(cleanOverrides);
    persistPerf(recTier, true, cleanOverrides, benchmarkScore);

    setSettingsState((prev) => {
      const next = {
        ...prev,
        'perf.tier': recTier,
        'perf.autoDetect': true,
        'perf.workerCountOverride': TIER_CONFIG_MATRIX[recTier].workerCount,
        'perf.gpuOverride': TIER_CONFIG_MATRIX[recTier].gpuAcceleration as any,
        'perf.memoryOverrideMB': TIER_CONFIG_MATRIX[recTier].memoryBudgetMB,
      };
      persistSettings(next);
      return next;
    });

    const tierName = TIER_CONFIG_MATRIX[recTier].label.split(' / ')[0];
    setToastMessage(`Auto-detected optimal tier: ${tierName}`);
    setShowToast(true);
  }, [specs, benchmarkScore, persistPerf]);

  const runBenchmark = useCallback(async () => {
    setIsBenchmarking(true);
    try {
      const activeSpecs = await detectDeviceSpecs();
      setSpecs(activeSpecs);
      const res = await runSyntheticBenchmark();
      setBenchmarkScore(res.score);
      const recTier = calculateRecommendedTier(activeSpecs, res.score);

      if (isAutoDetected) {
        setTierState(recTier);
        persistPerf(recTier, true, overrides, res.score);
        setSettingsState((prev) => {
          const next = { ...prev, 'perf.tier': recTier };
          persistSettings(next);
          return next;
        });
      } else {
        persistPerf(tier, false, overrides, res.score);
      }

      return {
        score: res.score,
        durationMs: res.durationMs,
        recommendedTier: recTier,
      };
    } finally {
      setIsBenchmarking(false);
    }
  }, [isAutoDetected, overrides, tier, persistPerf]);

  // Section 5: Cascading Precedence Resolver
  const getSetting = useCallback(
    <K extends SettingKey>(key: K, toolId?: string): SettingValue<K> => {
      const activeConfig = resolveEffectiveTierConfig(tier, overrides, specs || defaultSpecs);
      return resolveSetting(settings, String(key), toolId, activeConfig);
    },
    [settings, tier, overrides, specs]
  );

  const resolve = useCallback(
    (key: string, toolId?: string) => {
      return getSetting(key as any, toolId);
    },
    [getSetting]
  );

  const setSetting = useCallback(
    <K extends SettingKey>(key: K, value: SettingValue<K>) => {
      setSettingsState((prev) => {
        const next = { ...prev, [key]: value };
        persistSettings(next);
        return next;
      });

      // Synchronize performance tier if perf keys change
      if (key === 'perf.tier') {
        setTier(value as PerformanceTier, true);
      } else if (key === 'perf.autoDetect') {
        const isAuto = Boolean(value);
        setIsAutoDetected(isAuto);
        setOverrides({ enabled: !isAuto });
      } else if (key === 'perf.workerCountOverride') {
        setOverrides({ customWorkerCount: Number(value) });
      } else if (key === 'perf.gpuOverride') {
        setOverrides({ customGpuAcceleration: value });
      } else if (key === 'perf.memoryOverrideMB') {
        setOverrides({ customMemoryBudgetMB: Number(value) });
      } else if (key === 'appearance.theme') {
        const themeValue = String(value);
        if (themeValue === 'light' || themeValue === 'dark') {
          const classes = ['theme-light', 'theme-semi', 'theme-dark'];
          document.documentElement.classList.remove(...classes);
          document.body.classList.remove(...classes);
          document.documentElement.classList.add(`theme-${themeValue}`);
          document.body.classList.add(`theme-${themeValue}`);
          localStorage.setItem('gs_theme_mode', themeValue);
        } else if (themeValue === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          const classes = ['theme-light', 'theme-semi', 'theme-dark'];
          document.documentElement.classList.remove(...classes);
          document.body.classList.remove(...classes);
          document.documentElement.classList.add(`theme-${systemTheme}`);
          document.body.classList.add(`theme-${systemTheme}`);
          localStorage.setItem('gs_theme_mode', 'system');
        }
      }
    },
    [setTier, setOverrides]
  );

  const exportSettings = useCallback(() => {
    return exportSettingsToJSON(settings, tier);
  }, [settings, tier]);

  const importSettings = useCallback(
    async (jsonString: string) => {
      const res = validateAndImportSettings(jsonString, settings);
      if (res.success && res.state) {
        setSettingsState(res.state);
        persistSettings(res.state);
        if (res.state['perf.tier']) {
          setTier(res.state['perf.tier'], !res.state['perf.autoDetect']);
        }
        return {
          success: true,
          importedCount: res.importedCount,
          ignoredCount: res.ignoredCount,
        };
      }
      return { success: false, error: res.error };
    },
    [settings, setTier]
  );

  const resetDefaults = useCallback(async () => {
    const defaults = getDefaultSettingsState();
    setSettingsState(defaults);
    persistSettings(defaults);
    await resetToAutoDetect();
  }, [resetToAutoDetect]);

  const clearHistory = useCallback(async () => {
    try {
      if (typeof indexedDB !== 'undefined') {
        // Clear history store if present in IndexedDB
        const req = indexedDB.open('GS_Softwares_DB');
        req.onsuccess = () => {
          const db = req.result;
          if (db.objectStoreNames.contains('history')) {
            const tx = db.transaction('history', 'readwrite');
            tx.objectStore('history').clear();
          }
        };
      }
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      // Clear all IndexedDB databases
      if (typeof indexedDB !== 'undefined' && 'databases' in indexedDB) {
        const dbs = await (indexedDB as any).databases();
        for (const dbInfo of dbs) {
          if (dbInfo.name) {
            indexedDB.deleteDatabase(dbInfo.name);
          }
        }
      }
      // Clear cache storage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Wipe localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Re-initialize defaults
      const defaults = getDefaultSettingsState();
      setSettingsState(defaults);
      persistSettings(defaults);
      await resetToAutoDetect();
    } catch (e) {
      console.error('Failed to wipe all data:', e);
    }
  }, [resetToAutoDetect]);

  const clearStorageCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      const keysToKeep = ['gs_theme_mode', 'gs_perf_settings_v1', 'gs_settings_v1', 'gs_pwa_loaded_session'];
      const allKeys = Object.keys(localStorage);
      for (const k of allKeys) {
        if (!keysToKeep.includes(k)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
  }, []);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const config = resolveEffectiveTierConfig(tier, overrides, specs || defaultSpecs);

  return (
    <PerformanceContext.Provider
      value={{
        tier,
        config,
        specs,
        isAutoDetected,
        overrides,
        benchmarkScore,
        isBenchmarking,
        setTier,
        setOverrides,
        runBenchmark,
        resetToAutoDetect,
        settings,
        getSetting,
        setSetting,
        resolve,
        exportSettings,
        importSettings,
        resetDefaults,
        clearHistory,
        clearAllData,
        showToast,
        toastMessage,
        dismissToast,
        clearStorageCache,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceTier = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceTier must be used within a PerformanceProvider');
  }
  return context;
};

export const useSettings = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('useSettings must be used within a PerformanceProvider');
  }
  return context;
};
