import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Cpu,
  Palette,
  Globe,
  Shield,
  Folder,
  Zap,
  Wrench,
  Keyboard,
  Database,
  Info,
  Sliders,
} from 'lucide-react';
import { useSettings } from '../../context/PerformanceContext';
import { SETTING_CATEGORIES, SETTINGS_SCHEMA } from '../../lib/settings/schema';
import { SettingCategory, SettingDefinition } from '../../lib/settings/types';
import { SettingControlRenderer } from './SettingControlRenderer';
import { getWorkspaceFilesByApp, clearWorkspaceAppFiles } from '../../lib/db';
import { PerformanceTier } from '../../lib/performanceTier';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICON_MAP: Record<SettingCategory, React.ComponentType<{ className?: string }>> = {
  performance: Cpu,
  appearance: Palette,
  general: Globe,
  privacy: Shield,
  files: Folder,
  advanced: Zap,
  tools: Wrench,
  shortcuts: Keyboard,
  data: Database,
  about: Info,
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    tier,
    config,
    specs,
    setTier,
    exportSettings,
    importSettings,
    resetDefaults,
    clearAllData,
  } = useSettings();

  const [activeCategory, setActiveCategory] = useState<SettingCategory>('performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageBreakdown, setStorageBreakdown] = useState<Record<string, { count: number; totalBytes: number }>>({});
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Dialog & Feedback states
  const [warningTier, setWarningTier] = useState<PerformanceTier | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmWipeStep, setConfirmWipeStep] = useState<0 | 1 | 2>(0);
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStorageMetrics = async () => {
    setLoadingStorage(true);
    const apps: Array<'pdf' | 'pixels' | 'audio' | 'video' | 'text' | 'canvas'> = [
      'pixels',
      'canvas',
      'pdf',
      'video',
      'audio',
      'text',
    ];
    const metrics: Record<string, { count: number; totalBytes: number }> = {};
    for (const app of apps) {
      try {
        const files = await getWorkspaceFilesByApp(app);
        const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
        metrics[app] = { count: files.length, totalBytes };
      } catch (e) {
        metrics[app] = { count: 0, totalBytes: 0 };
      }
    }
    setStorageBreakdown(metrics);
    setLoadingStorage(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadStorageMetrics();
    }
  }, [isOpen]);

  // Filter settings by active category or search query
  const filteredSettings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return SETTINGS_SCHEMA.filter((s) => s.category === activeCategory);
    }
    return SETTINGS_SCHEMA.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  // Actions handlers
  const handleTriggerAction = async (actionId: string) => {
    if (actionId === 'exportSettings') {
      const json = exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `gs-settings-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (actionId === 'importSettings') {
      fileInputRef.current?.click();
    } else if (actionId === 'resetDefaults') {
      setConfirmResetOpen(true);
    } else if (actionId === 'clearAll') {
      setConfirmWipeStep(1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importSettings(text);
      if (res.success) {
        setImportFeedback({ success: true, message: 'Settings successfully restored from backup!' });
      } else {
        setImportFeedback({ success: false, message: res.error || 'Failed to parse configuration backup.' });
      }
    } catch (err: any) {
      setImportFeedback({ success: false, message: 'Error reading JSON backup file.' });
    }
    setTimeout(() => setImportFeedback(null), 5000);
    e.target.value = '';
  };

  const handleClearAppStorage = async (app: 'pdf' | 'pixels' | 'audio' | 'video' | 'text' | 'canvas') => {
    await clearWorkspaceAppFiles(app);
    await loadStorageMetrics();
  };

  const handleConfirmReset = async () => {
    await resetDefaults();
    setConfirmResetOpen(false);
    await loadStorageMetrics();
  };

  const handleConfirmWipe = async () => {
    await clearAllData();
    setConfirmWipeStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="neu-flat w-full max-w-5xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-500/20">
        
        {/* Hidden File Upload for JSON Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,application/json"
          className="hidden"
        />

        {/* ── TOP HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 border-b border-slate-500/20 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                GS Settings &amp; Engine
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  tier === 'eco'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : tier === 'balanced'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {config.label.split(' / ')[0]}
                </span>
              </h2>
              <p className="text-[11px] opacity-60 font-medium">Schema-driven offline configuration engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Fuzzy Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-xl text-xs neu-inset bg-transparent border border-slate-500/20 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 opacity-60 hover:opacity-100 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl neu-btn opacity-70 hover:opacity-100 transition-all shrink-0"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── IMPORT FEEDBACK BANNER ── */}
        {importFeedback && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            importFeedback.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {importFeedback.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {importFeedback.message}
          </div>
        )}

        {/* ── MAIN WORKSPACE AREA (2-Column Layout) ── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT SIDEBAR: Categories Nav */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-500/20 p-2 md:p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1 scrollbar-none bg-slate-500/5">
            {SETTING_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat.id] || Sliders;
              const isActive = !searchQuery && activeCategory === cat.id;
              const settingCount = SETTINGS_SCHEMA.filter((s) => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:whitespace-normal text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:bg-slate-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {cat.badge ? (
                    <span className="hidden md:inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-white/20 text-white shrink-0">
                      {cat.badge}
                    </span>
                  ) : (
                    <span className="hidden md:inline-block text-[10px] opacity-60 font-normal shrink-0">
                      {settingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT CONTENT PANEL: Controls Auto-Generated from Schema */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Category Header */}
            {!searchQuery && (
              <div className="pb-2 border-b border-slate-500/10">
                <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wide">
                  {SETTING_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h3>
                <p className="text-xs opacity-60 font-medium">
                  {SETTING_CATEGORIES.find((c) => c.id === activeCategory)?.description}
                </p>
              </div>
            )}

            {/* Search Results Header */}
            {searchQuery && (
              <div className="pb-2 border-b border-slate-500/10 flex items-center justify-between">
                <p className="text-xs font-bold opacity-80">
                  Search results for: <span className="text-cyan-400">"{searchQuery}"</span>
                </p>
                <span className="text-xs opacity-60 font-mono">({filteredSettings.length} matched)</span>
              </div>
            )}

            {/* Settings Render Loop */}
            {filteredSettings.length === 0 ? (
              <div className="neu-inset p-8 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold opacity-80">No matching configuration options found.</p>
                <p className="text-[11px] opacity-60">Try searching for keywords like "workers", "theme", "quality", or "export".</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSettings.map((def) => (
                  <SettingControlRenderer
                    key={def.key}
                    definition={def}
                    storageBreakdown={storageBreakdown}
                    onClearAppStorage={handleClearAppStorage}
                    onTriggerAction={handleTriggerAction}
                    onOpenWarningModal={(targetTier) => setWarningTier(targetTier)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="px-6 py-3.5 border-t border-slate-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-500/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerAction('resetDefaults')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold neu-btn opacity-70 hover:opacity-100 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={() => handleTriggerAction('exportSettings')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold neu-btn text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={() => handleTriggerAction('importSettings')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold neu-btn text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all ml-auto"
          >
            Done
          </button>
        </div>

      </div>

      {/* ── MODAL: MANUAL OVERRIDE WARNING ── */}
      {warningTier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="neu-flat max-w-md w-full p-6 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-2xl neu-inset">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold">Device Capability Warning</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed font-medium">
              Your device reports fewer than 6 cores or limited available memory. Forcing <strong>🔴 Performance Mode</strong> unlocks 2-pass video transcoding, unthrottled WebGPU, and deep neural models, which may cause browser tab slowdowns. We recommend <strong>🟡 Balanced Mode</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setWarningTier(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold opacity-70 hover:opacity-100 transition-all"
              >
                Keep Recommended
              </button>
              <button
                onClick={() => {
                  setTier('performance', true);
                  setWarningTier(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
              >
                Override Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESET DEFAULTS CONFIRMATION ── */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="neu-flat max-w-md w-full p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-2xl neu-inset">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold">Reset to Factory Defaults?</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed font-medium">
              This will reset all your theme preferences, tool presets, and custom hardware tier overrides back to schema defaults and re-run auto-detection. Your saved project files in IndexedDB will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold opacity-70 hover:opacity-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DOUBLE-CONFIRMATION DATA PURGE ── */}
      {confirmWipeStep > 0 && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="neu-flat max-w-md w-full p-6 rounded-3xl border border-rose-500 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 rounded-2xl neu-inset">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold">
                {confirmWipeStep === 1 ? '⚠️ Purge All Workspace Data?' : '🚨 FINAL CONFIRMATION: Permanent Erasure'}
              </h3>
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-medium">
              {confirmWipeStep === 1
                ? 'This will permanently wipe all IndexedDB workspace files across Pixels, Canvas, PDF, Video, Audio, and Text, flush cache storage, and erase all local settings.'
                : 'Are you absolutely certain? This operation cannot be undone. All project drafts will be immediately and irrevocably destroyed.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWipeStep(0)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold opacity-70 hover:opacity-100 transition-all"
              >
                Abort
              </button>
              {confirmWipeStep === 1 ? (
                <button
                  onClick={() => setConfirmWipeStep(2)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
                >
                  I Understand, Continue
                </button>
              ) : (
                <button
                  onClick={handleConfirmWipe}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white shadow-lg transition-all font-mono"
                >
                  PERMANENTLY WIPE EVERYTHING
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
