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

  // Schema-Driven Settings Store
  settings: SettingsState;
  getSetting: <K extends SettingKey>(key: K) => SettingValue<K>;
  setSetting: <K extends SettingKey>(key: K, value: SettingValue<K>) => void;
  resolve: (toolId: string, param: string) => any;
  exportSettings: () => string;
  importSettings: (json: string) => Promise<{ success: boolean; error?: string }>;
  resetDefaults: () => Promise<void>;
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
  importSettings: async () => ({ success: true }),
  resetDefaults: async () => {},
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

      // Sync settings state with loaded tier
      setSettingsState((prev) => {
        const next = { ...prev, 'perf.tier': perfSettings.tier, 'perf.override': perfSettings.overrides.enabled };
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
        const next = { ...prev, 'perf.tier': newTier, 'perf.override': manual ? true : prev['perf.override'] };
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
      const updated: ManualOverrides = { ...overrides, ...partial };
      setOverridesState(updated);
      persistPerf(tier, isAutoDetected, updated, benchmarkScore);

      setSettingsState((prev) => {
        const next = {
          ...prev,
          'perf.override': updated.enabled,
          ...(updated.customWorkerCount && { 'perf.workers': updated.customWorkerCount }),
          ...(updated.customGpuAcceleration && { 'perf.gpu': updated.customGpuAcceleration }),
          ...(updated.customMemoryBudgetMB && { 'perf.memoryCeilingMB': updated.customMemoryBudgetMB }),
        };
        persistSettings(next);
        return next;
      });
    },
    [overrides, tier, isAutoDetected, benchmarkScore, persistPerf]
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
        'perf.override': false,
        'perf.workers': TIER_CONFIG_MATRIX[recTier].workerCount,
        'perf.gpu': TIER_CONFIG_MATRIX[recTier].gpuAcceleration,
        'perf.memoryCeilingMB': TIER_CONFIG_MATRIX[recTier].memoryBudgetMB,
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

  // Schema-Driven Generic Get & Set
  const getSetting = useCallback(
    <K extends SettingKey>(key: K): SettingValue<K> => {
      return settings[key];
    },
    [settings]
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
      } else if (key === 'perf.override') {
        setOverrides({ enabled: Boolean(value) });
      } else if (key === 'perf.workers') {
        setOverrides({ customWorkerCount: Number(value) });
      } else if (key === 'perf.gpu') {
        setOverrides({ customGpuAcceleration: value });
      } else if (key === 'perf.memoryCeilingMB') {
        setOverrides({ customMemoryBudgetMB: Number(value) });
      } else if (key === 'appearance.theme') {
        const themeValue = String(value);
        if (themeValue === 'light' || themeValue === 'semi' || themeValue === 'dark') {
          const classes = ['theme-light', 'theme-semi', 'theme-dark'];
          document.documentElement.classList.remove(...classes);
          document.body.classList.remove(...classes);
          document.documentElement.classList.add(`theme-${themeValue}`);
          document.body.classList.add(`theme-${themeValue}`);
          localStorage.setItem('gs_theme_mode', themeValue);
        }
      }
    },
    [setTier, setOverrides]
  );

  const resolve = useCallback(
    (toolId: string, param: string) => {
      const activeConfig = resolveEffectiveTierConfig(tier, overrides, specs || defaultSpecs);
      return resolveSetting(settings, toolId, param, activeConfig);
    },
    [settings, tier, overrides, specs]
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
          setTier(res.state['perf.tier'], Boolean(res.state['perf.override']));
        }
        return { success: true };
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
      // Wipe localStorage
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
