import React from 'react';
import {
  ToolMode,
  BrushType,
  VectorStroke
} from '../../lib/canvas/types';
import {
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  MousePointer,
  RotateCw,
  Palette,
  Eye,
  Check
} from 'lucide-react';

interface FloatingPropertyBarProps {
  currentTool: ToolMode;
  currentBrush: BrushType;
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  selectedStrokes: VectorStroke[];
  onWidthChange: (width: number) => void;
  onOpacityChange: (opacity: number) => void;
  onColorChange: (color: string) => void;
  onOpenColorPicker: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onToggleNodeEdit: () => void;
  isNodeEditMode: boolean;
}

const QUICK_COLORS = [
  '#000000',
  '#ffffff',
  '#06b6d4',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#64748b'
];

const PRESET_WIDTHS = [2, 4, 8, 16, 28, 48];

export const FloatingPropertyBar: React.FC<FloatingPropertyBarProps> = ({
  currentTool,
  currentBrush,
  currentColor,
  currentWidth,
  currentOpacity,
  selectedStrokes,
  onWidthChange,
  onOpacityChange,
  onColorChange,
  onOpenColorPicker,
  onDeleteSelected,
  onDuplicateSelected,
  onToggleNodeEdit,
  isNodeEditMode
}) => {
  const hasSelection = selectedStrokes.length > 0;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[95vw] overflow-x-auto p-2 rounded-2xl canvas-studio-panel shadow-2xl backdrop-blur-xl border border-slate-700/60">
      {/* SELECTION CONTEXTUAL ACTIONS */}
      {hasSelection ? (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-cyan-400 px-2 py-1 rounded-lg canvas-studio-inset whitespace-nowrap">
            {selectedStrokes.length} selected
          </span>

          {/* Node Edit Toggle Button */}
          <button
            onClick={onToggleNodeEdit}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isNodeEditMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'canvas-studio-btn text-slate-300 hover:text-white'
            }`}
            title="Edit Bézier Nodes (Reshape Path)"
          >
            <MousePointer className="w-3.5 h-3.5 text-purple-400" />
            <span>{isNodeEditMode ? 'Exit Nodes' : 'Edit Nodes'}</span>
          </button>

          {/* Duplicate Button */}
          <button
            onClick={onDuplicateSelected}
            className="p-1.5 rounded-xl canvas-studio-btn text-slate-300 hover:text-white"
            title="Duplicate Stroke(s)"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={onDeleteSelected}
            className="p-1.5 rounded-xl canvas-studio-btn text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
            title="Delete Stroke(s)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-500/20" />
        </div>
      ) : null}

      {/* COLOR PICKER & QUICK SWATCHES */}
      {currentTool !== 'eraser' && (
        <div className="flex items-center gap-1.5">
          {/* Main Color Pill Trigger */}
          <button
            onClick={onOpenColorPicker}
            className="flex items-center gap-1.5 p-1 rounded-xl canvas-studio-inset hover:scale-105 transition-transform"
            title="Open HSL Color Wheel & Pro Marker Palettes"
          >
            <div
              className="w-6 h-6 rounded-lg shadow-inner border border-white/20"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-[10px] font-mono font-bold px-1 text-slate-300 uppercase">
              {currentColor}
            </span>
          </button>

          {/* Quick Palette Circles */}
          <div className="hidden sm:flex items-center gap-1">
            {QUICK_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border transition-all ${
                  currentColor.toLowerCase() === c.toLowerCase()
                    ? 'scale-120 ring-2 ring-cyan-400 border-white'
                    : 'border-slate-700/60 hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-slate-500/20 mx-1" />
        </div>
      )}

      {/* STROKE WIDTH SLIDER & PRESETS */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300">
          <span className="opacity-70 text-[10px]">Width:</span>
          <span className="font-mono text-cyan-400 font-bold min-w-[28px] text-right">
            {currentWidth}px
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="64"
          value={currentWidth}
          onChange={e => onWidthChange(Number(e.target.value))}
          className="w-20 sm:w-28 accent-cyan-500 cursor-pointer"
        />

        {/* Width preset chips */}
        <div className="hidden md:flex items-center gap-1">
          {PRESET_WIDTHS.map(w => (
            <button
              key={w}
              onClick={() => onWidthChange(w)}
              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                currentWidth === w
                  ? 'bg-cyan-500 text-white shadow'
                  : 'canvas-studio-inset text-slate-400 hover:text-white'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* OPACITY SLIDER */}
      {currentTool !== 'eraser' && (
        <>
          <div className="w-px h-5 bg-slate-500/20 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">Opacity:</span>
            <span className="font-mono text-cyan-400 font-bold text-[11px] min-w-[32px]">
              {Math.round(currentOpacity * 100)}%
            </span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={currentOpacity}
              onChange={e => onOpacityChange(Number(e.target.value))}
              className="w-16 sm:w-20 accent-pink-500 cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
};
