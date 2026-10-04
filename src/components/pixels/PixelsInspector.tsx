import React, { useState } from 'react';
import {
  Sliders,
  Crop,
  Layers,
  RotateCw,
  Scissors,
  Stamp,
  ShieldAlert,
  Palette,
  FileCheck,
  Code,
  Maximize2,
  Eraser,
  Sparkle,
  Contrast,
  Grid as GridIcon,
  SplitSquareVertical,
  Columns,
  Archive,
  Filter,
  Pipette,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  PixelCapability,
  AdjustmentsState,
  PixelAsset,
  ExtractedColorItem
} from './types';
import { CAPABILITIES } from './PixelsToolRail';
import { downloadBlob, formatBytes } from '../../lib/fileUtils';
import confetti from 'canvas-confetti';

interface PixelsInspectorProps {
  capability: PixelCapability;
  config: AdjustmentsState;
  onChangeConfig: <K extends keyof AdjustmentsState>(key: K, value: AdjustmentsState[K]) => void;
  onResetAdjustments: () => void;
  asset: PixelAsset | null;
  allAssets: PixelAsset[];
  // Advanced tool states & callbacks
  detailedColors: ExtractedColorItem[];
  pickedColor: string | null;
  onPickEyedropper: () => void;
  onExportPaletteImage: () => void;
  onCropPreset: (preset: string) => void;
  // Trigger actions
  onApplySettingsToAll: () => void;
  onRunVectorize: () => void;
  vectorSvgResult: string;
  onRunGridSlice: () => void;
  gridSlices: Array<{ filename: string; blob: Blob; url: string }>;
  onRunDiff: () => void;
  diffMismatchPct: number | null;
  diffResultUrl: string | null;
  onRunStitch: () => void;
  stitchResultUrl: string | null;
  onDownloadZip: () => void;
  showToast: (msg: string) => void;
}

export const PixelsInspector: React.FC<PixelsInspectorProps> = ({
  capability,
  config,
  onChangeConfig,
  onResetAdjustments,
  asset,
  allAssets,
  detailedColors,
  pickedColor,
  onPickEyedropper,
  onExportPaletteImage,
  onCropPreset,
  onApplySettingsToAll,
  onRunVectorize,
  vectorSvgResult,
  onRunGridSlice,
  gridSlices,
  onRunDiff,
  diffMismatchPct,
  diffResultUrl,
  onRunStitch,
  stitchResultUrl,
  onDownloadZip,
  showToast,
}) => {
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [paletteMenuOpen, setPaletteMenuOpen] = useState<boolean>(false);

  const activeMeta = CAPABILITIES.find((c) => c.id === capability) || CAPABILITIES[0];

  return (
    <aside
      aria-label="Inspector controls"
      className="w-80 lg:w-96 backdrop-blur-xl bg-slate-900/30 border-l border-slate-500/20 flex flex-col h-full overflow-hidden select-none z-20 shrink-0"
    >
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-500/20 bg-slate-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <activeMeta.icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {activeMeta.name}
            </h2>
            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
              {activeMeta.tagline}
            </p>
          </div>
        </div>

        {allAssets.length > 1 && (
          <button
            onClick={onApplySettingsToAll}
            className="p-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
            title="Apply these parameters to all loaded assets"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inspector Body (Scrollable controls) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        
        {/* ======================================================== */}
        {/* 1. ADJUST & TONE */}
        {/* ======================================================== */}
        {capability === 'adjust' && (
          <div className="space-y-4">
            {/* Search Filter Controls */}
            <div className="relative">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search sliders (warmth, tone, contrast...)"
                className="w-full px-3 py-1.5 pl-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500"
              />
              <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              {filterSearch && (
                <button
                  onClick={() => setFilterSearch('')}
                  className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Slider Groups */}
            <div className="space-y-3">
              {/* Exposure / Brightness */}
              {(!filterSearch || 'brightness exposure'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Brightness</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={config.brightness}
                    onChange={(e) => onChangeConfig('brightness', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Contrast */}
              {(!filterSearch || 'contrast'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contrast</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={config.contrast}
                    onChange={(e) => onChangeConfig('contrast', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Saturation */}
              {(!filterSearch || 'saturation'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saturation</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={config.saturation}
                    onChange={(e) => onChangeConfig('saturation', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Warmth / Color Temp */}
              {(!filterSearch || 'warmth temperature'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warmth</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.warmth > 0 ? `+${config.warmth}` : config.warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={config.warmth}
                    onChange={(e) => onChangeConfig('warmth', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Tint */}
              {(!filterSearch || 'tint magenta green'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tint (Magenta / Green)</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.tint > 0 ? `+${config.tint}` : config.tint}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={config.tint}
                    onChange={(e) => onChangeConfig('tint', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Blue Tone */}
              {(!filterSearch || 'blue tone sky'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blue Tone Boost</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.blueTone > 0 ? `+${config.blueTone}` : config.blueTone}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={config.blueTone}
                    onChange={(e) => onChangeConfig('blueTone', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Skin Tone */}
              {(!filterSearch || 'skin tone warmth'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skin Tone Balance</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.skinTone > 0 ? `+${config.skinTone}` : config.skinTone}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={config.skinTone}
                    onChange={(e) => onChangeConfig('skinTone', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Straighten Angle */}
              {(!filterSearch || 'straighten horizon'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Straighten Horizon</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.straighten}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={config.straighten}
                    onChange={(e) => onChangeConfig('straighten', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Blur */}
              {(!filterSearch || 'blur soften'.includes(filterSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soft Focus / Blur</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.blur}
                    onChange={(e) => onChangeConfig('blur', Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Quick Presets Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Filter Presets</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onChangeConfig('grayscale', !config.grayscale)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    config.grayscale ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  B&W
                </button>
                <button
                  onClick={() => onChangeConfig('sepia', !config.sepia)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    config.sepia ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => onChangeConfig('invert', !config.invert)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    config.invert ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Invert
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetAdjustments}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Adjustments</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. CROP & FRAME */}
        {/* ======================================================== */}
        {capability === 'crop' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Aspect Ratio Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'free', label: 'Free' },
                  { id: '16:9', label: '16:9' },
                  { id: '9:16', label: '9:16' },
                  { id: '1:1', label: '1:1' },
                  { id: '4:3', label: '4:3' },
                  { id: '3:2', label: '3:2' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onCropPreset(preset.id)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      config.cropAspect === preset.id
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Crop Frame Bounds</label>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Width</span>
                  <span className="text-cyan-400 font-bold font-mono">{Math.round(config.cropW)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.cropW}
                  onChange={(e) => {
                    onChangeConfig('cropAspect', 'custom');
                    onChangeConfig('cropW', Number(e.target.value));
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Height</span>
                  <span className="text-cyan-400 font-bold font-mono">{Math.round(config.cropH)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.cropH}
                  onChange={(e) => {
                    onChangeConfig('cropAspect', 'custom');
                    onChangeConfig('cropH', Number(e.target.value));
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Offset X</span>
                  <span className="text-cyan-400 font-bold font-mono">{Math.round(config.cropX)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - config.cropW)}
                  value={config.cropX}
                  onChange={(e) => onChangeConfig('cropX', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Offset Y</span>
                  <span className="text-cyan-400 font-bold font-mono">{Math.round(config.cropY)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - config.cropH)}
                  value={config.cropY}
                  onChange={(e) => onChangeConfig('cropY', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  onChangeConfig('cropAspect', 'free');
                  onChangeConfig('cropX', 0);
                  onChangeConfig('cropY', 0);
                  onChangeConfig('cropW', 100);
                  onChangeConfig('cropH', 100);
                }}
                className="w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 transition-all"
              >
                Reset Crop Frame
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. RESIZE & SCALE */}
        {/* ======================================================== */}
        {capability === 'resize' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Target Width (px)</label>
                <input
                  type="number"
                  value={config.targetWidth}
                  onChange={(e) => onChangeConfig('targetWidth', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Target Height (px)</label>
                <input
                  type="number"
                  value={config.targetHeight}
                  onChange={(e) => onChangeConfig('targetHeight', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Relative Scale Ratio</span>
                <span className="text-cyan-400 font-mono font-bold">{config.scale}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={config.scale}
                onChange={(e) => onChangeConfig('scale', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ROTATE & FLIP */}
        {/* ======================================================== */}
        {capability === 'rotate' && (
          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-300">Angle Orientation</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => onChangeConfig('rotation', deg)}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    config.rotation === deg
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onChangeConfig('flipX', !config.flipX)}
                className={`py-1.5 rounded-lg text-xs font-bold border ${
                  config.flipX ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Flip Horiz ↔
              </button>
              <button
                onClick={() => onChangeConfig('flipY', !config.flipY)}
                className={`py-1.5 rounded-lg text-xs font-bold border ${
                  config.flipY ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Flip Vert ↕
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. AI BACKGROUND REMOVAL */}
        {/* ======================================================== */}
        {capability === 'bgremove' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Edge Tolerance</span>
                <span className="text-cyan-400 font-mono font-bold">{config.bgTolerance}</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={config.bgTolerance}
                onChange={(e) => onChangeConfig('bgTolerance', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed">
              🔒 100% on-device edge segmentation. Exports as transparent PNG without leaving your browser.
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. WATERMARK */}
        {/* ======================================================== */}
        {capability === 'watermark' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Watermark Text</label>
              <input
                type="text"
                value={config.watermarkText}
                onChange={(e) => onChangeConfig('watermarkText', e.target.value)}
                placeholder="e.g. © 2026 GS Softwares"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'center', label: 'Center' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'tile', label: 'Diagonal Tile' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onChangeConfig('watermarkPos', p.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold border ${
                      config.watermarkPos === p.id
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Opacity</span>
                <span className="text-cyan-400 font-mono font-bold">{config.watermarkOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={config.watermarkOpacity}
                onChange={(e) => onChangeConfig('watermarkOpacity', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. PRIVACY & EXIF */}
        {/* ======================================================== */}
        {capability === 'privacy' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>EXIF Sanitizer Status</span>
              </div>
              <div className="text-[11px] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Geolocation:</span>
                  <span className="text-emerald-400 font-semibold">Auto-Stripped</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera / Lens Model:</span>
                  <span className="text-emerald-400 font-semibold">Cleaned</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Creation Timestamps:</span>
                  <span className="text-emerald-400 font-semibold">Sanitized</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Visual Redaction Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeConfig('blurMode', 'pixelate')}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    config.blurMode === 'pixelate' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Mosaic Pixelate
                </button>
                <button
                  onClick={() => onChangeConfig('blurMode', 'blackout')}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    config.blurMode === 'blackout' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Solid Blackout
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Redaction Box Size</span>
                <span className="text-cyan-400 font-mono font-bold">{config.blurAreaSize}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={config.blurAreaSize}
                onChange={(e) => onChangeConfig('blurAreaSize', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. COLOR SPECTRUM / PALETTE */}
        {/* ======================================================== */}
        {capability === 'palette' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Colors Extracted ({detailedColors.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onPickEyedropper}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                >
                  <Pipette className="w-3 h-3" />
                  <span>Eyedropper</span>
                </button>
                <button
                  onClick={onExportPaletteImage}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto no-scrollbar p-1">
              {detailedColors.slice(0, 24).map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigator.clipboard.writeText(c.hex);
                    showToast(`Copied ${c.hex}!`);
                  }}
                  className="group relative flex flex-col items-center gap-1 cursor-pointer"
                  title={`${c.name} (${c.percentage}%) - Click to copy HEX`}
                >
                  <div
                    className="w-full h-8 rounded-lg border border-white/10 group-hover:scale-105 transition-transform shadow"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-300">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>

            {/* Export Tokens */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const text = detailedColors.map((c) => c.hex).join(', ');
                  navigator.clipboard.writeText(text);
                  showToast('Copied all HEX codes!');
                }}
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3 text-cyan-400" />
                <span>Copy HEX List</span>
              </button>
              <button
                onClick={() => {
                  const cssStr = detailedColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
                  navigator.clipboard.writeText(`:root {\n${cssStr}\n}`);
                  showToast('Copied CSS Variables!');
                }}
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1"
              >
                <Code className="w-3 h-3 text-amber-400" />
                <span>Copy CSS Vars</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. COMPRESS & CONVERT */}
        {/* ======================================================== */}
        {capability === 'convert' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WebP' },
                  { id: 'image/jpeg', label: 'JPEG' },
                  { id: 'image/png', label: 'PNG' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => onChangeConfig('format', fmt.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold border ${
                      config.format === fmt.id
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {config.format !== 'image/png' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Quality</span>
                  <span className="text-cyan-400 font-bold font-mono">{config.quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.quality}
                  onChange={(e) => onChangeConfig('quality', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 10. VECTORIZE */}
        {/* ======================================================== */}
        {capability === 'vectorize' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Luminance Cutoff</span>
                <span className="text-cyan-400 font-mono font-bold">{config.vectorThreshold}</span>
              </div>
              <input
                type="range"
                min="32"
                max="224"
                value={config.vectorThreshold}
                onChange={(e) => onChangeConfig('vectorThreshold', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              onClick={onRunVectorize}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Trace to SVG Path</span>
            </button>

            {vectorSvgResult && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold text-xs">SVG Tracing Ready!</span>
                <button
                  onClick={() => {
                    const blob = new Blob([vectorSvgResult], { type: 'image/svg+xml' });
                    downloadBlob(blob, `${asset?.name.replace(/\.[^/.]+$/, '') || 'vector'}.svg`);
                  }}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .SVG</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 11. SMART UPSCALE */}
        {/* ======================================================== */}
        {capability === 'upscale' && (
          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-300">Magnification Scale</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeConfig('upscaleFactor', 2)}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  config.upscaleFactor === 2
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                2x Super Res
              </button>
              <button
                onClick={() => onChangeConfig('upscaleFactor', 4)}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  config.upscaleFactor === 4
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                4x Ultra Scale
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 12. OBJECT INPAINT */}
        {/* ======================================================== */}
        {capability === 'inpaint' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Diffusion Patch Size</span>
                <span className="text-cyan-400 font-mono font-bold">{config.inpaintBoxSize}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={config.inpaintBoxSize}
                onChange={(e) => onChangeConfig('inpaintBoxSize', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
              Synthesizes surrounding pixel gradients with harmonic diffusion to erase timestamps, tourists, or sensor dust.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* 13. RETRO DITHER */}
        {/* ======================================================== */}
        {capability === 'dither' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Error Diffusion</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeConfig('ditherAlgorithm', 'floyd-steinberg')}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    config.ditherAlgorithm === 'floyd-steinberg' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Floyd-Steinberg
                </button>
                <button
                  onClick={() => onChangeConfig('ditherAlgorithm', 'bayer')}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    config.ditherAlgorithm === 'bayer' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Bayer Matrix
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[11px] text-slate-400">Palette Scheme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['1bit', 'gameboy', 'sepia', 'cmyk'] as const).map((pal) => (
                  <button
                    key={pal}
                    onClick={() => onChangeConfig('ditherPalette', pal)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize border ${
                      config.ditherPalette === pal ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {pal === '1bit' ? '1-Bit Mono' : pal === 'gameboy' ? 'Game Boy' : pal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 14. GRID SLICER */}
        {/* ======================================================== */}
        {capability === 'grid' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.gridRows}
                  onChange={(e) => onChangeConfig('gridRows', Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.gridCols}
                  onChange={(e) => onChangeConfig('gridCols', Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={onRunGridSlice}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
            >
              <GridIcon className="w-3.5 h-3.5" />
              <span>Slice Image ({config.gridRows}x{config.gridCols})</span>
            </button>

            {gridSlices.length > 0 && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold text-xs">{gridSlices.length} Tiles Sliced!</span>
                <button
                  onClick={async () => {
                    const JSZip = (await import('jszip')).default;
                    const zip = new JSZip();
                    for (const s of gridSlices) zip.file(s.filename, s.blob);
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    downloadBlob(zipBlob, `Slices_${asset?.name.replace(/\.[^/.]+$/, '')}.zip`);
                  }}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download ZIP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 15. VISUAL REGRESSION DIFF */}
        {/* ======================================================== */}
        {capability === 'diff' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Diff Threshold</span>
                <span className="text-cyan-400 font-mono font-bold">{Math.round(config.diffThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.01"
                value={config.diffThreshold}
                onChange={(e) => onChangeConfig('diffThreshold', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {allAssets.length >= 2 ? (
              <button
                onClick={onRunDiff}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Compare Asset 1 vs 2</span>
              </button>
            ) : (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Upload at least 2 images to run regression diff.
              </p>
            )}

            {diffMismatchPct !== null && (
              <div className="p-3 bg-fuchsia-950/20 rounded-xl border border-fuchsia-500/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Mismatch:</span>
                  <span className="font-bold text-fuchsia-400 font-mono">{diffMismatchPct}%</span>
                </div>
                {diffResultUrl && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = diffResultUrl;
                      a.download = `Diff-${asset?.name || 'result'}.png`;
                      a.click();
                    }}
                    className="w-full py-1.5 rounded-lg bg-fuchsia-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Diff Mask</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 16. PANORAMA & STITCH */}
        {/* ======================================================== */}
        {capability === 'stitch' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Orientation</label>
              <div className="grid grid-cols-3 gap-2">
                {(['horizontal', 'vertical', 'grid2x2'] as const).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => onChangeConfig('stitchOrientation', orient)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize border ${
                      config.stitchOrientation === orient ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {orient === 'grid2x2' ? '2x2' : orient}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Border Margin</span>
                <span className="text-cyan-400 font-mono font-bold">{config.stitchSpacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={config.stitchSpacing}
                onChange={(e) => onChangeConfig('stitchSpacing', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {allAssets.length >= 2 ? (
              <button
                onClick={onRunStitch}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Stitch {allAssets.length} Images</span>
              </button>
            ) : (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Load 2 or more images to assemble a panorama.
              </p>
            )}

            {stitchResultUrl && (
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = stitchResultUrl;
                  a.download = `Stitch-${Date.now()}.png`;
                  a.click();
                }}
                className="w-full py-1.5 rounded-lg bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Collage</span>
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 17. BATCH STUDIO */}
        {/* ======================================================== */}
        {capability === 'batch' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white">Batch Queue ({allAssets.length})</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Applies current format, quality, and adjustments across all {allAssets.length} images concurrently.
              </p>
            </div>

            <button
              onClick={onApplySettingsToAll}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Process All {allAssets.length} Images</span>
            </button>

            <button
              onClick={onDownloadZip}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export All as ZIP</span>
            </button>
          </div>
        )}

      </div>
    </aside>
  );
};
