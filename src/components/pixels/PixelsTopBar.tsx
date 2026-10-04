import React, { useRef } from 'react';
import {
  Undo2,
  Redo2,
  Upload,
  Download,
  Trash2,
  Plus,
  X,
  FileImage,
  Search,
  Sparkles,
  Archive,
  Clipboard
} from 'lucide-react';
import { PixelAsset } from './types';
import { formatBytes } from '../../lib/fileUtils';

interface PixelsTopBarProps {
  assets: PixelAsset[];
  selectedId: string | null;
  onSelectAsset: (id: string) => void;
  onCloseAsset: (id: string) => void;
  onOpenFiles: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDownloadCurrent: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  onOpenCommandPalette?: () => void;
  onPasteClipboard: () => void;
}

export const PixelsTopBar: React.FC<PixelsTopBarProps> = ({
  assets,
  selectedId,
  onSelectAsset,
  onCloseAsset,
  onOpenFiles,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDownloadCurrent,
  onDownloadZip,
  onClearAll,
  onOpenCommandPalette,
  onPasteClipboard,
}) => {
  return (
    <header
      aria-label="Workstation toolbar"
      className="h-12 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-slate-300 z-30 shrink-0 gap-2 select-none"
    >
      {/* Left: Brand Identity & Asset Tabs */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        {/* Workspace Brand Title */}
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-800">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:inline">GS-PIXELS</span>
        </div>

        {/* Multi-Asset Tabs Rail */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedId;
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-all border shrink-0 max-w-[150px] ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={asset.name}
              >
                <FileImage className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate text-[11px] font-medium leading-none">{asset.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseAsset(asset.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                  title="Close asset"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add / Import Button */}
          <button
            onClick={onOpenFiles}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold transition-colors shrink-0"
            title="Import additional images"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open</span>
          </button>
        </div>
      </div>

      {/* Right: Actions, Undo/Redo & Quick Export */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Paste from Clipboard */}
        <button
          onClick={onPasteClipboard}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium transition-colors"
          title="Paste from clipboard (Ctrl+V)"
        >
          <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Paste</span>
        </button>

        {/* Global Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
            title="Command Palette (Ctrl+K)"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>Cmds</span>
            <kbd className="text-[9px] bg-slate-950 px-1 rounded border border-slate-800 font-mono">⌘K</kbd>
          </button>
        )}

        {/* Export Current */}
        <button
          onClick={onDownloadCurrent}
          disabled={assets.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white text-[11px] font-bold shadow transition-all cursor-pointer"
          title="Export current processed image"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Export All ZIP */}
        {assets.length > 1 && (
          <button
            onClick={onDownloadZip}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition-all cursor-pointer"
            title="Export all images in ZIP"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>ZIP</span>
          </button>
        )}

        {/* Clear All */}
        {assets.length > 0 && (
          <button
            onClick={onClearAll}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Clear workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
