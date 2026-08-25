import React, { useState } from 'react';
import {
  SettingDefinition,
  SuiteDefaultGroup,
} from '../../lib/settings/types';
import { SUITE_DEFAULT_GROUPS, DEFAULT_KEYBINDINGS } from '../../lib/settings/schema';
import { useSettings } from '../../context/PerformanceContext';
import {
  Zap,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  Play,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  HardDrive,
  Activity,
  Keyboard,
  Shield,
  AlertTriangle,
  Info,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { PerformanceTier } from '../../lib/performanceTier';

interface SettingControlRendererProps {
  definition: SettingDefinition;
  storageBreakdown?: Record<string, { count: number; totalBytes: number }>;
  onClearAppStorage?: (app: any) => Promise<void>;
  onTriggerAction?: (actionId: string) => void;
  onOpenWarningModal?: (tier: PerformanceTier) => void;
}

export const SettingControlRenderer: React.FC<SettingControlRendererProps> = ({
  definition,
  storageBreakdown,
  onClearAppStorage,
  onTriggerAction,
  onOpenWarningModal,
}) => {
  const {
    getSetting,
    setSetting,
    tier,
    config,
    specs,
    isAutoDetected,
    benchmarkScore,
    isBenchmarking,
    runBenchmark,
    resetToAutoDetect,
  } = useSettings();

  const [revealedSecret, setRevealedSecret] = useState(false);
  const [expandedSuite, setExpandedSuite] = useState<string | null>('image');

  const currentValue = getSetting(definition.key);

  // Check dependencies
  let isDisabled = false;
  if (definition.dependsOn) {
    if (definition.dependsOn === '!perf.autoDetect') {
      isDisabled = Boolean(getSetting('perf.autoDetect'));
    } else if (definition.dependsOn.startsWith('!')) {
      const depKey = definition.dependsOn.slice(1);
      isDisabled = Boolean(getSetting(depKey));
    } else {
      isDisabled = !Boolean(getSetting(definition.dependsOn));
    }
  }

  // Handle tier selection with warning guard
  const handleSelectTier = (newTier: PerformanceTier) => {
    if (newTier === 'performance' && specs && (specs.cpuCores <= 4 || (specs.deviceMemoryGB !== null && specs.deviceMemoryGB <= 4))) {
      if (onOpenWarningModal) {
        onOpenWarningModal('performance');
        return;
      }
    }
    setSetting('perf.tier', newTier);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 1. TIER-SELECTOR RENDERER
  if (definition.type === 'tier-selector') {
    return (
      <div className="space-y-4">
        {/* Status Callout */}
        <div className="neu-inset p-4 rounded-2xl border border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Device Performance Status</span>
              {isAutoDetected && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Auto-Optimized
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 font-medium">
              Currently: <strong className="text-cyan-400 uppercase">{tier}</strong> ({isAutoDetected ? 'auto-detected' : 'custom override'}). Your device: {specs?.cpuCores || 4} cores · {specs?.deviceMemoryGB ? `${specs.deviceMemoryGB} GB RAM` : '4 GB RAM'}
            </p>
            <p className="text-[11px] opacity-70 italic">
              {tier === 'eco' && 'Eco: Fast processing and lower battery use. Best for older devices and laptops.'}
              {tier === 'balanced' && 'Balanced: Recommended for most devices. Smooth performance and high quality.'}
              {tier === 'performance' && 'High Performance: Maximum processing power and highest quality output.'}
            </p>
          </div>
          {!isAutoDetected && (
            <button
              onClick={resetToAutoDetect}
              className="px-3 py-1.5 rounded-xl text-xs font-bold neu-btn text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Auto
            </button>
          )}
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(definition.options || []).map((opt) => {
            const isSelected = tier === opt.value;
            const badgeBorder =
              opt.value === 'eco'
                ? 'border-emerald-500 ring-emerald-500/30 shadow-emerald-500/10'
                : opt.value === 'balanced'
                ? 'border-amber-500 ring-amber-500/30 shadow-amber-500/10'
                : 'border-rose-500 ring-rose-500/30 shadow-rose-500/10';

            const checkColor =
              opt.value === 'eco' ? 'bg-emerald-500' : opt.value === 'balanced' ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={opt.value}
                onClick={() => handleSelectTier(opt.value)}
                className={`cursor-pointer p-4 rounded-2xl transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? `neu-flat ${badgeBorder} ring-2 shadow-lg`
                    : 'neu-inset opacity-75 hover:opacity-100 border-slate-500/20'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${checkColor} text-white flex items-center justify-center shadow-md`}>
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold mb-1.5">{opt.label}</h4>
                  <p className="text-xs opacity-70 mb-3 leading-relaxed">{opt.desc}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-500/20 text-[11px] opacity-75">
                  <div className="flex justify-between">
                    <span>Workers:</span>
                    <span className="font-bold">
                      {opt.value === 'eco' ? '1–2' : opt.value === 'balanced' ? '3–4' : `Max (${specs?.cpuCores || 4})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU:</span>
                    <span className="font-bold">
                      {opt.value === 'eco' ? 'Disabled' : opt.value === 'balanced' ? 'Auto (GPU)' : 'Forced WebGPU'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthetic Benchmark Action */}
        <div className="neu-card p-4 rounded-2xl border border-slate-500/20 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Re-run Hardware Benchmark
            </h4>
            <p className="text-[11px] opacity-60">Re-evaluates CPU floating-point &amp; Canvas 2D throughput without forcing a tier change</p>
          </div>
          <div className="flex items-center gap-3">
            {benchmarkScore && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300">
                Score: {benchmarkScore}
              </span>
            )}
            <button
              onClick={runBenchmark}
              disabled={isBenchmarking}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold neu-btn text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all shrink-0"
            >
              {isBenchmarking ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  Benchmarking...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Run Benchmark
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. BOOLEAN RENDERER
  if (definition.type === 'boolean') {
    return (
      <div className={`neu-card p-4 rounded-2xl border border-slate-500/20 flex items-center justify-between gap-4 ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="space-y-0.5 flex-1 pr-2">
          <label className="text-xs font-extrabold block cursor-pointer" onClick={() => !isDisabled && setSetting(definition.key, !currentValue)}>
            {definition.label}
          </label>
          <p className="text-[11px] opacity-60 leading-relaxed">{definition.description}</p>
          {definition.warning && currentValue && (
            <p className="text-[10px] text-amber-400 flex items-center gap-1 pt-1 font-medium">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {definition.warning}
            </p>
          )}
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => setSetting(definition.key, e.target.checked)}
            disabled={isDisabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>
    );
  }

  // 3. READONLY RENDERER (Privacy Zero-Upload Attestation & Proof Link)
  if (definition.type === 'readonly') {
    return (
      <div className="neu-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-extrabold text-emerald-400">{definition.label}</h4>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed font-medium">{definition.description}</p>
        </div>

        {definition.url ? (
          <a
            href={definition.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{definition.badge || 'Verify'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            {definition.badge || 'Active'}
          </span>
        )}
      </div>
    );
  }

  // 4. ENUM RENDERER (Radio group for <= 4 options; Select dropdown for > 4 options)
  if (definition.type === 'enum') {
    const opts = definition.options || [];
    const isRadioGroup = opts.length <= 4;

    return (
      <div className={`neu-card p-4 rounded-2xl border border-slate-500/20 space-y-2.5 ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold">{definition.label}</label>
              {definition.inheritsKey && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                  inherits {definition.inheritsKey}
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-60 leading-relaxed">{definition.description}</p>
          </div>
        </div>

        {isRadioGroup ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {opts.map((opt) => {
              const isSelected = String(currentValue ?? definition.default) === String(opt.value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setSetting(definition.key, opt.value)}
                  disabled={isDisabled}
                  className={`p-2 rounded-xl text-xs font-medium text-left transition-all border ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold shadow-md'
                      : 'neu-inset border-slate-500/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <p className="truncate">{opt.label}</p>
                  {opt.desc && <p className="text-[10px] opacity-60 truncate mt-0.5">{opt.desc}</p>}
                </button>
              );
            })}
          </div>
        ) : (
          <select
            value={currentValue ?? definition.default}
            onChange={(e) => {
              const val = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
              setSetting(definition.key, val);
            }}
            disabled={isDisabled}
            className="w-full px-3.5 py-2 rounded-xl text-xs neu-inset bg-transparent border border-slate-500/20 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {opts.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  // 5. NUMBER RENDERER (Slider + Counter)
  if (definition.type === 'number') {
    return (
      <div className={`neu-card p-4 rounded-2xl border border-slate-500/20 space-y-2.5 ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold">{definition.label}</label>
              {definition.inheritsKey && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                  inherits {definition.inheritsKey}
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-60">{definition.description}</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg neu-inset text-cyan-400">
            {currentValue ?? definition.default} {definition.unit || ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] opacity-50 font-mono">{definition.min || 0}</span>
          <input
            type="range"
            min={definition.min || 0}
            max={definition.max || 100}
            step={definition.step || 1}
            value={currentValue ?? definition.default}
            onChange={(e) => setSetting(definition.key, Number(e.target.value))}
            disabled={isDisabled}
            className="flex-1 accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] opacity-50 font-mono">{definition.max || 100}</span>
        </div>
      </div>
    );
  }

  // 6. COLOR RENDERER
  if (definition.type === 'color') {
    return (
      <div className="neu-card p-4 rounded-2xl border border-slate-500/20 space-y-3">
        <div>
          <label className="text-xs font-extrabold">{definition.label}</label>
          <p className="text-[11px] opacity-60">{definition.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(definition.options || []).map((opt) => {
            const isSelected = currentValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSetting(definition.key, opt.value)}
                style={{ backgroundColor: opt.value }}
                className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-md transition-all ${
                  isSelected ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                title={opt.label}
              >
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            );
          })}
          <input
            type="color"
            value={currentValue || '#0066FF'}
            onChange={(e) => setSetting(definition.key, e.target.value)}
            className="w-7 h-7 rounded-xl bg-transparent cursor-pointer border-0"
            title="Custom Hex Picker"
          />
        </div>
      </div>
    );
  }

  // 7. STRING RENDERER
  if (definition.type === 'string') {
    return (
      <div className="neu-card p-4 rounded-2xl border border-slate-500/20 space-y-2">
        <div>
          <label className="text-xs font-extrabold">{definition.label}</label>
          <p className="text-[11px] opacity-60">{definition.description}</p>
        </div>
        <input
          type="text"
          value={currentValue || ''}
          placeholder={definition.placeholder}
          onChange={(e) => setSetting(definition.key, e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl text-xs neu-inset bg-transparent border border-slate-500/20 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>
    );
  }

  // 8. SECRET RENDERER (Encrypted Vault Password)
  if (definition.type === 'secret') {
    return (
      <div className="neu-card p-4 rounded-2xl border border-slate-500/20 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <label className="text-xs font-extrabold">{definition.label}</label>
          </div>
          <p className="text-[11px] opacity-60">{definition.description}</p>
        </div>
        <div className="relative">
          <input
            type={revealedSecret ? 'text' : 'password'}
            value={currentValue || ''}
            placeholder={definition.placeholder}
            onChange={(e) => setSetting(definition.key, e.target.value)}
            className="w-full px-3.5 py-2 pr-10 rounded-xl text-xs neu-inset bg-transparent border border-slate-500/20 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="button"
            onClick={() => setRevealedSecret(!revealedSecret)}
            className="absolute right-2.5 top-2.5 p-0.5 opacity-60 hover:opacity-100"
          >
            {revealedSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  // 9. SUITE-DEFAULTS RENDERER (12 Tool Suites Accordion)
  if (definition.type === 'suite-defaults') {
    return (
      <div className="space-y-3">
        {SUITE_DEFAULT_GROUPS.map((group) => {
          const isExpanded = expandedSuite === group.suiteId;
          return (
            <div key={group.suiteId} className="neu-card rounded-2xl border border-slate-500/20 overflow-hidden">
              <button
                onClick={() => setExpandedSuite(isExpanded ? null : group.suiteId)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-500/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">{group.suiteName}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
              </button>

              {isExpanded && (
                <div className="p-4 pt-2 border-t border-slate-500/10 space-y-3">
                  {group.settings.map((subDef) => (
                    <SettingControlRenderer
                      key={subDef.key}
                      definition={subDef}
                      storageBreakdown={storageBreakdown}
                      onClearAppStorage={onClearAppStorage}
                      onTriggerAction={onTriggerAction}
                      onOpenWarningModal={onOpenWarningModal}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 10. ACTION RENDERER
  if (definition.type === 'action') {
    const isDanger = definition.actionId === 'clearAll' || definition.actionId === 'clearHistory' || definition.actionId === 'resetDefaults';

    return (
      <div className="neu-card p-4 rounded-2xl border border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 flex-1 pr-2">
          <label className="text-xs font-extrabold">{definition.label}</label>
          <p className="text-[11px] opacity-60 leading-relaxed">{definition.description}</p>
        </div>

        <button
          onClick={() => onTriggerAction && definition.actionId && onTriggerAction(definition.actionId)}
          className={`px-4 py-2 rounded-xl text-xs font-bold neu-btn transition-all shrink-0 flex items-center gap-2 ${
            isDanger ? 'text-rose-400 hover:text-rose-300' : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          {definition.actionId === 'export' && <Download className="w-3.5 h-3.5" />}
          {definition.actionId === 'import' && <Upload className="w-3.5 h-3.5" />}
          {definition.actionId === 'resetDefaults' && <RotateCcw className="w-3.5 h-3.5" />}
          {definition.actionId === 'clearHistory' && <Trash2 className="w-3.5 h-3.5" />}
          {definition.actionId === 'clearAll' && <Trash2 className="w-3.5 h-3.5" />}
          {definition.actionId === 'clearCache' && <Zap className="w-3.5 h-3.5" />}
          <span>{definition.label.split(' ')[0]}</span>
        </button>
      </div>
    );
  }

  // 11. COMPUTED RENDERER (Storage Bar, Diagnostics, Shortcuts)
  if (definition.type === 'computed') {
    if (definition.computedId === 'storageUsage') {
      const totalBytes = Object.values(storageBreakdown || {}).reduce((acc, v) => acc + v.totalBytes, 0);

      return (
        <div className="neu-card p-5 rounded-2xl border border-slate-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-extrabold flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                Local Storage Used
              </h4>
              <p className="text-[11px] opacity-60">Storage space used on your device by saved workspace items</p>
            </div>
            <span className="text-xs font-extrabold text-cyan-400">Total: {formatBytes(totalBytes)}</span>
          </div>

          <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden bg-slate-700 flex">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (totalBytes / (500 * 1024 * 1024)) * 100))}%` }}
            />
          </div>

          <div className="divide-y divide-slate-500/10">
            {([
              { id: 'pixels', label: 'Photo Studio' },
              { id: 'canvas', label: 'Drawing Canvas' },
              { id: 'pdf', label: 'PDF Studio' },
              { id: 'video', label: 'Video Studio' },
              { id: 'audio', label: 'Audio Studio' },
              { id: 'text', label: 'Text Editor' },
            ] as const).map((tool) => {
              const data = (storageBreakdown && storageBreakdown[tool.id]) || { count: 0, totalBytes: 0 };
              return (
                <div key={tool.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold">{tool.label}</span>
                    <span className="ml-2 text-[11px] opacity-60">({data.count} items)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold opacity-80">{formatBytes(data.totalBytes)}</span>
                    {data.count > 0 && onClearAppStorage && (
                      <button
                        onClick={() => onClearAppStorage(tool.id)}
                        className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:text-rose-400 transition-colors"
                        title="Delete saved files for this tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (definition.key === 'shortcuts.bindings') {
      return (
        <div className="neu-card p-5 rounded-2xl border border-slate-500/20 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-extrabold">Keyboard Shortcuts</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(DEFAULT_KEYBINDINGS).map(([id, item]) => (
              <div key={id} className="neu-inset p-2.5 rounded-xl flex items-center justify-between">
                <span className="opacity-80">{item.label}</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-black/40 border border-slate-500/30 text-[10px] font-mono font-bold text-cyan-400">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (definition.computedId === 'diagnostics') {
      return (
        <div className="neu-card p-5 rounded-2xl border border-slate-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Device &amp; App Information
              </h4>
              <p className="text-[11px] opacity-60">System information, offline availability, and privacy protection</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Offline Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="neu-inset p-3 rounded-xl flex justify-between items-center">
              <span className="opacity-70">App Version:</span>
              <span className="font-bold font-mono">v2.0.0</span>
            </div>
            <div className="neu-inset p-3 rounded-xl flex justify-between items-center">
              <span className="opacity-70">Processor Cores:</span>
              <span className="font-bold">{specs?.cpuCores || 4} Cores</span>
            </div>
            <div className="neu-inset p-3 rounded-xl flex justify-between items-center">
              <span className="opacity-70">Graphics Acceleration:</span>
              <span className={`font-bold ${specs?.hasWebGPU || specs?.hasWebGL2 ? 'text-emerald-400' : 'opacity-60'}`}>
                {specs?.hasWebGPU ? 'High Speed (WebGPU)' : specs?.hasWebGL2 ? 'Standard (WebGL 2)' : 'Basic'}
              </span>
            </div>
            <div className="neu-inset p-3 rounded-xl flex justify-between items-center">
              <span className="opacity-70">Offline Storage:</span>
              <span className="font-bold text-emerald-400">Ready (Works Offline)</span>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};
