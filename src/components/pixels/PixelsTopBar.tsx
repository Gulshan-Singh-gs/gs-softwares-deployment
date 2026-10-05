import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Trash2,
  Plus,
  X,
  FileImage,
  Search,
  Sparkles,
  Archive,
  Clipboard,
  MoreHorizontal
} from 'lucide-react';
import { PixelAsset } from './types';

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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

  return (
    <header
      aria-label="Workstation toolbar"
      className="h-12 px-2 sm:px-4 flex items-center justify-between text-xs z-30 shrink-0 gap-1.5 sm:gap-2 select-none border-b border-slate-500/20 backdrop-blur-xl bg-slate-900/40 relative overflow-hidden"
    >
      {/* Left: Brand Identity & Asset Tabs Rail */}
      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
        {/* Workspace Brand Title */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1.5 border-r border-slate-500/20">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-[11px] sm:text-xs">PIXELS</span>
        </div>

        {/* Multi-Asset Tabs Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedId;
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl cursor-pointer transition-all border shrink-0 max-w-[120px] sm:max-w-[160px] min-h-[36px] sm:min-h-0 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm font-semibold'
                    : 'bg-slate-900/40 border-slate-500/20 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={asset.name}
              >
                <FileImage className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate text-[11px] leading-none">{asset.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseAsset(asset.id);
                  }}
                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity min-w-[20px] min-h-[20px] flex items-center justify-center"
                  title="Close asset"
                  aria-label={`Close asset ${asset.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add / Import Button */}
          <button
            onClick={onOpenFiles}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-500/20 text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold transition-colors shrink-0 shadow-sm min-h-[36px] sm:min-h-0"
            title="Import additional images"
            aria-label="Import images"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>
        </div>
      </div>

      {/* Right: Tiered Actions Cluster (Primary <=4 visible, Secondary md+, Overflow More) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900/60 rounded-xl p-0.5 border border-slate-500/20 shadow-sm">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export Current (Primary: Always visible) */}
        <button
          onClick={onDownloadCurrent}
          disabled={assets.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-30 text-white text-[11px] font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer min-h-[36px] sm:min-h-0"
          title="Export current processed image"
          aria-label="Export Image"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Export</span>
        </button>

        {/* Secondary: Paste from Clipboard (Visible md+) */}
        <button
          onClick={onPasteClipboard}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-500/20 text-slate-200 text-[11px] font-semibold transition-colors shadow-sm"
          title="Paste from clipboard (Ctrl+V)"
        >
          <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Paste</span>
        </button>

        {/* Secondary: Export All ZIP (Visible md+) */}
        {assets.length > 1 && (
          <button
            onClick={onDownloadZip}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Export all images in ZIP"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>ZIP</span>
          </button>
        )}

        {/* Overflow Menu ("More" Button) */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white transition-all min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title="More actions"
            aria-label="More actions"
            aria-haspopup="true"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="w-4 h-4 text-cyan-400" />
          </button>

          {moreOpen && (
            <div
              role="menu"
              aria-label="More workstation actions"
              className="absolute right-0 top-full mt-1.5 w-48 neu-flat rounded-2xl p-1.5 shadow-2xl border border-slate-500/20 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider border-b border-slate-500/15 mb-1">
                More Actions
              </div>

              <button
                role="menuitem"
                onClick={() => {
                  onPasteClipboard();
                  setMoreOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-500/15 transition-all min-h-[44px]"
              >
                <Clipboard className="w-4 h-4 text-cyan-400" />
                <span>Paste from Clipboard</span>
              </button>

              {assets.length > 1 && (
                <button
                  role="menuitem"
                  onClick={() => {
                    onDownloadZip();
                    setMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/15 transition-all min-h-[44px]"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              )}

              {onOpenCommandPalette && (
                <button
                  role="menuitem"
                  onClick={() => {
                    onOpenCommandPalette();
                    setMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-500/15 transition-all min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>Command Palette</span>
                  </div>
                  <kbd className="text-[9px] font-mono opacity-50 neu-inset px-1 py-0.5 rounded">⌘K</kbd>
                </button>
              )}

              {assets.length > 0 && (
                <button
                  role="menuitem"
                  onClick={() => {
                    onClearAll();
                    setMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-all min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Workspace</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
