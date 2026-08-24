import React, { useState } from 'react';
import {
  PenTool,
  Highlighter,
  Pencil,
  Eraser,
  MousePointer,
  Hand,
  Shapes,
  Maximize2,
  Sparkles,
  Layers,
  Palette,
  Undo2,
  Redo2,
  Camera,
  Image as ImageIcon,
  Menu
} from 'lucide-react';
import { ToolMode, BrushType } from '../../lib/canvas/types';

interface RadialToolMenuProps {
  currentTool: ToolMode;
  currentBrush: BrushType;
  smartShapeEnabled: boolean;
  leftHanded?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSelectTool: (tool: ToolMode, brush?: BrushType) => void;
  onToggleSmartShape: () => void;
  onOpenLayers: () => void;
  onOpenPalette: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSnapshot?: () => void;
  onUploadImage?: () => void;
}

export const RadialToolMenu: React.FC<RadialToolMenuProps> = ({
  currentTool,
  currentBrush,
  smartShapeEnabled,
  leftHanded = false,
  canUndo,
  canRedo,
  onSelectTool,
  onToggleSmartShape,
  onOpenLayers,
  onOpenPalette,
  onUndo,
  onRedo,
  onSnapshot,
  onUploadImage
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const tools = [
    {
      id: 'pen',
      label: 'Pen',
      icon: PenTool,
      shortcut: 'P',
      action: () => {
        onSelectTool('draw', 'pen');
        setIsOpen(false);
      },
      isActive: currentTool === 'draw' && currentBrush === 'pen',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'marker',
      label: 'Marker',
      icon: Highlighter,
      shortcut: 'M',
      action: () => {
        onSelectTool('draw', 'marker');
        setIsOpen(false);
      },
      isActive: currentTool === 'draw' && currentBrush === 'marker',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'pencil',
      label: 'Pencil',
      icon: Pencil,
      shortcut: 'B',
      action: () => {
        onSelectTool('draw', 'pencil');
        setIsOpen(false);
      },
      isActive: currentTool === 'draw' && currentBrush === 'pencil',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: Eraser,
      shortcut: 'E',
      action: () => {
        onSelectTool('eraser', 'eraser');
        setIsOpen(false);
      },
      isActive: currentTool === 'eraser',
      color: 'from-red-500 to-rose-700'
    },
    {
      id: 'select',
      label: 'Select / Nodes',
      icon: MousePointer,
      shortcut: 'V',
      action: () => {
        onSelectTool('select');
        setIsOpen(false);
      },
      isActive: currentTool === 'select' || currentTool === 'node-edit',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'pan',
      label: 'Pan Canvas',
      icon: Hand,
      shortcut: 'H / Space',
      action: () => {
        onSelectTool('pan');
        setIsOpen(false);
      },
      isActive: currentTool === 'pan',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  // Calculate Radial Positions
  const radius = 100;
  const totalTools = tools.length;
  // Arc angles: from -120deg to 120deg or full circle
  const startAngle = leftHanded ? -30 : -150;
  const endAngle = leftHanded ? 150 : 30;
  const angleStep = (endAngle - startAngle) / (totalTools - 1);

  return (
    <div
      className={`fixed z-30 bottom-8 ${
        leftHanded ? 'left-8' : 'right-8'
      } flex flex-col items-center select-none`}
    >
      {/* Radial Items Container */}
      <div className="relative">
        {isOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {tools.map((t, idx) => {
              const angleDeg = startAngle + idx * angleStep;
              const angleRad = (angleDeg * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              const Icon = t.icon;

              return (
                <div
                  key={t.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transition: `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.03}s, opacity 0.2s ease`
                  }}
                  className="absolute pointer-events-auto"
                >
                  <button
                    onClick={t.action}
                    className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all hover:scale-115 active:scale-95 group relative ${
                      t.isActive
                        ? `bg-gradient-to-tr ${t.color} text-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-black shadow-cyan-500/50`
                        : 'bg-slate-900/95 hover:bg-slate-800 border-2 border-slate-600/80 hover:border-cyan-400 text-slate-100 hover:text-white shadow-black/80'
                    }`}
                    title={`${t.label} (${t.shortcut})`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                    {/* Tooltip Badge */}
                    <span className="absolute -top-8 px-2 py-0.5 rounded-lg bg-slate-900 text-cyan-300 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-slate-600">
                      {t.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Central Radial Trigger FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-15 h-15 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 group cursor-pointer ${
            isOpen
              ? 'bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black rotate-45 scale-105 border-2 border-white/80 shadow-cyan-500/40'
              : 'bg-slate-900/95 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 border-2 border-cyan-500/60 hover:border-cyan-400 shadow-xl shadow-cyan-950/50 hover:scale-105 active:scale-95'
          }`}
          title="Toggle Radial Tool Menu"
        >
          {isOpen ? (
            <span className="text-3xl font-black leading-none select-none text-slate-950">＋</span>
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <PenTool className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[8px] uppercase tracking-wider font-black text-cyan-400">Tools</span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Auxiliary Quick Bar (Undo, Redo, Palette, Layers, Smart Shape) */}
      <div className="mt-3 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-2xl p-1.5 rounded-2xl shadow-2xl border-2 border-slate-700/80">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-xl text-xs transition-all ${
            canUndo
              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-600/70 shadow-sm cursor-pointer'
              : 'bg-slate-950/50 text-slate-600 border border-slate-800/40 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4 stroke-[2.2]" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-xl text-xs transition-all ${
            canRedo
              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-600/70 shadow-sm cursor-pointer'
              : 'bg-slate-950/50 text-slate-600 border border-slate-800/40 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="w-px h-5 bg-slate-600/50 mx-0.5" />

        {/* Smart Shape Toggle */}
        <button
          onClick={onToggleSmartShape}
          className={`p-2 rounded-xl text-xs transition-all ${
            smartShapeEnabled
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-400/50'
              : 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-600/70'
          }`}
          title="Toggle Smart Shapes (Hold 400ms to Snap)"
        >
          <Shapes className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Color Palette Popover Trigger */}
        <button
          onClick={onOpenPalette}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-600/70 text-xs transition-all shadow-sm cursor-pointer"
          title="Color & Marker Palettes"
        >
          <Palette className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Layers Stack Trigger */}
        <button
          onClick={onOpenLayers}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-600/70 text-xs transition-all shadow-sm cursor-pointer"
          title="Manage Layers"
        >
          <Layers className="w-4 h-4 stroke-[2.2]" />
        </button>

        {onUploadImage && (
          <button
            onClick={onUploadImage}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-600/70 text-xs transition-all shadow-sm cursor-pointer"
            title="Upload File / Image onto Canvas"
          >
            <ImageIcon className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}

        {onSnapshot && (
          <button
            onClick={onSnapshot}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white text-xs border border-cyan-500/50 transition-all shadow-md cursor-pointer"
            title="Take Snapshot / Share Studio"
          >
            <Camera className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}
      </div>
    </div>
  );
};
