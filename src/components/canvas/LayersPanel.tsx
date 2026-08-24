import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  X,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CanvasLayer, VectorStroke, BlendMode } from '../../lib/canvas/types';

interface LayersPanelProps {
  layers: CanvasLayer[];
  strokes: VectorStroke[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onUpdateLayer: (layer: CanvasLayer) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
  onClose: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  strokes,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onUpdateLayer,
  onReorderLayer,
  onClose
}) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleStartRename = (layer: CanvasLayer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleSaveRename = (layer: CanvasLayer) => {
    if (editingName.trim()) {
      onUpdateLayer({ ...layer, name: editingName.trim() });
    }
    setEditingLayerId(null);
  };

  const getLayerStrokeCount = (layerId: string) => {
    return strokes.filter(s => s.layerId === layerId).length;
  };

  return (
    <div className="fixed top-20 right-8 z-30 w-80 max-h-[80vh] flex flex-col neu-card rounded-3xl p-5 shadow-2xl backdrop-blur-xl border border-slate-700/40 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Layers</h3>
            <p className="text-[10px] text-slate-400 font-mono">{layers.length} layers • {strokes.length} vectors</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddLayer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
            title="Create New Layer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer List (Top layer is rendered first in stack) */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 scrollbar-glow">
        {[...layers].reverse().map((layer, reverseIndex) => {
          const actualIndex = layers.length - 1 - reverseIndex;
          const isActive = layer.id === activeLayerId;
          const strokeCount = getLayerStrokeCount(layer.id);

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`p-3 rounded-2xl transition-all cursor-pointer space-y-2 border ${
                isActive
                  ? 'neu-card ring-2 ring-cyan-500/60 border-cyan-500/40 shadow-lg'
                  : 'neu-inset opacity-80 hover:opacity-100 border-transparent'
              }`}
            >
              {/* Layer Title & Main Toggles */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Visibility Eye */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onUpdateLayer({ ...layer, visible: !layer.visible });
                    }}
                    className={`p-1.5 rounded-lg neu-btn ${
                      layer.visible ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onUpdateLayer({ ...layer, locked: !layer.locked });
                    }}
                    className={`p-1.5 rounded-lg neu-btn ${
                      layer.locked ? 'text-amber-400' : 'text-slate-500'
                    }`}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Layer Name (Editable on double-click or click) */}
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(layer)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveRename(layer);
                        if (e.key === 'Escape') setEditingLayerId(null);
                      }}
                      autoFocus
                      className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-cyan-500 text-white w-full"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => handleStartRename(layer)}
                      className="text-xs font-bold text-white truncate hover:underline"
                      title="Double click to rename"
                    >
                      {layer.name}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {strokeCount} obj
                </span>
              </div>

              {/* Layer Properties (Opacity & Actions when Active) */}
              {isActive && (
                <div className="pt-2 border-t border-slate-700/30 space-y-2" onClick={e => e.stopPropagation()}>
                  {/* Opacity Slider */}
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold">
                    <span>Opacity: {Math.round(layer.opacity * 100)}%</span>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={layer.opacity}
                      onChange={e => onUpdateLayer({ ...layer, opacity: Number(e.target.value) })}
                      className="w-28 accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Layer Quick Actions (Reorder, Duplicate, Delete) */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        onClick={() => {
                          if (actualIndex < layers.length - 1) {
                            onReorderLayer(actualIndex, actualIndex + 1);
                          }
                        }}
                        disabled={actualIndex >= layers.length - 1}
                        className="p-1 rounded-lg neu-btn text-slate-300 disabled:opacity-30"
                        title="Move Layer Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => {
                          if (actualIndex > 0) {
                            onReorderLayer(actualIndex, actualIndex - 1);
                          }
                        }}
                        disabled={actualIndex <= 0}
                        className="p-1 rounded-lg neu-btn text-slate-300 disabled:opacity-30"
                        title="Move Layer Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Duplicate Layer */}
                      <button
                        onClick={() => onDuplicateLayer(layer.id)}
                        className="p-1 rounded-lg neu-btn text-slate-300 hover:text-white"
                        title="Duplicate Layer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Layer (if more than 1) */}
                      {layers.length > 1 && (
                        <button
                          onClick={() => onDeleteLayer(layer.id)}
                          className="p-1 rounded-lg neu-btn text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
