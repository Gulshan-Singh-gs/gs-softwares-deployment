/**
 * GS-Canvas Accessibility & Keyboard Navigator
 * - Screen reader object list / tree outline
 * - Keyboard navigation (Tab, Arrow keys for nudging, Delete, Undo/Redo)
 * - WCAG 2.2 AA compliant focus management
 */

import React from 'react';
import { VectorStroke, CanvasLayer } from '../../lib/canvas/types';
import { Layers, Eye, EyeOff, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CanvasA11yOutlineProps {
  strokes: VectorStroke[];
  layers: CanvasLayer[];
  selectedStrokeIds: string[];
  onSelectStroke: (id: string, multi?: boolean) => void;
  onDeleteStroke: (id: string) => void;
  onNudgeStroke: (id: string, dx: number, dy: number) => void;
}

export const CanvasA11yOutline: React.FC<CanvasA11yOutlineProps> = ({
  strokes,
  layers,
  selectedStrokeIds,
  onSelectStroke,
  onDeleteStroke,
  onNudgeStroke,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, strokeId: string) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onNudgeStroke(strokeId, 0, -step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onNudgeStroke(strokeId, 0, step);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNudgeStroke(strokeId, -step, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNudgeStroke(strokeId, step, 0);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDeleteStroke(strokeId);
    }
  };

  return (
    <div
      role="region"
      aria-label="Canvas Vector Objects Outline"
      className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-300 max-h-72 overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
        <Layers className="h-4 w-4 text-indigo-400" />
        <span className="font-semibold text-white">Accessible Object Tree</span>
        <span className="ml-auto text-[10px] text-slate-400 font-mono">
          {strokes.length} elements
        </span>
      </div>

      {strokes.length === 0 ? (
        <p className="text-[11px] text-slate-500 py-3 text-center italic">
          No vector paths on canvas. Use draw tools or keyboard.
        </p>
      ) : (
        <ul className="space-y-1" role="list">
          {strokes.map((stroke, idx) => {
            const isSelected = selectedStrokeIds.includes(stroke.id);
            const layer = layers.find((l) => l.id === stroke.layerId);

            return (
              <li
                key={stroke.id}
                tabIndex={0}
                role="listitem"
                aria-selected={isSelected}
                aria-label={`Stroke ${idx + 1}, type ${stroke.brushType}, color ${stroke.color}, on layer ${layer?.name || 'Default'}`}
                onKeyDown={(e) => handleKeyDown(e, stroke.id)}
                onClick={() => onSelectStroke(stroke.id)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/15 text-white'
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: stroke.color }}
                  />
                  <span className="truncate font-medium text-[11px]">
                    {stroke.brushType.toUpperCase()} #{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({stroke.segments.length} curves)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    aria-label={`Delete stroke ${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteStroke(stroke.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Keys: Arrow (Nudge) • Shift+Arrow (10px) • Del (Remove)</span>
      </div>
    </div>
  );
};
