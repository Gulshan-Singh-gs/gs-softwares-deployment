import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Columns,
  Sparkles,
  Crop as CropIcon,
  ShieldCheck,
  SplitSquareVertical
} from 'lucide-react';
import { PixelAsset, AdjustmentsState } from './types';

interface PixelsCanvasProps {
  asset: PixelAsset | null;
  processedUrl?: string;
  config: AdjustmentsState;
  onUpdateCrop: (crop: { cropX: number; cropY: number; cropW: number; cropH: number }) => void;
  isCropActive: boolean;
  filterStyle: React.CSSProperties;
  transformStyle: React.CSSProperties;
}

export type ViewMode = 'processed' | 'original' | 'split' | 'overlay';

export const PixelsCanvas: React.FC<PixelsCanvasProps> = ({
  asset,
  processedUrl,
  config,
  onUpdateCrop,
  isCropActive,
  filterStyle,
  transformStyle
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<ViewMode>('processed');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage (0 - 100)
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & view on new asset
  useEffect(() => {
    setZoom(100);
  }, [asset?.id]);

  // Handle Split slider drag
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  if (!asset) {
    return null;
  }

  const effectiveProcessed = processedUrl || asset.previewUrl;
  const originalUrl = asset.previewUrl;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative select-none">
      {/* Canvas Top Micro-Toolbar */}
      <div className="h-10 px-4 border-b border-slate-500/20 backdrop-blur-xl bg-slate-900/30 flex items-center justify-between text-xs z-10 shrink-0">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-xl border border-slate-500/20 shadow-sm">
          <button
            onClick={() => setViewMode('processed')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              viewMode === 'processed' ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Processed
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              viewMode === 'original' ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'split' ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Interactive Split Comparison Slider"
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
        </div>

        {/* Center: File metadata tag */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="font-mono text-cyan-400 font-semibold">{asset.width} × {asset.height} px</span>
          <span className="opacity-40">•</span>
          <span className="truncate max-w-[160px] opacity-80">{asset.name}</span>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 hover:bg-slate-800"
            title="Reset to 100%"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(400, z + 25))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Fit to Screen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleSplitMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={() => setIsDraggingSplit(false)}
        onTouchEnd={() => setIsDraggingSplit(false)}
        className="flex-1 relative overflow-auto flex items-center justify-center p-4 sm:p-8 checkered-bg"
      >
        <div
          className="relative transition-transform duration-75 max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
        >
          {/* STANDARD VIEW: Processed or Original */}
          {viewMode === 'processed' && (
            <img
              src={effectiveProcessed}
              alt="Workspace canvas"
              className="max-w-full max-h-[72vh] object-contain select-none pointer-events-none"
              style={{
                ...filterStyle,
                ...transformStyle
              }}
            />
          )}

          {viewMode === 'original' && (
            <img
              src={originalUrl}
              alt="Original canvas"
              className="max-w-full max-h-[72vh] object-contain select-none pointer-events-none"
            />
          )}

          {/* SPLIT VIEW WITH INTERACTIVE DRAGGABLE DIVIDER */}
          {viewMode === 'split' && (
            <div className="relative max-h-[72vh] flex items-center justify-center select-none overflow-hidden">
              {/* Background Layer: Processed Result */}
              <img
                src={effectiveProcessed}
                alt="Processed view"
                className="max-w-full max-h-[72vh] object-contain pointer-events-none"
                style={{
                  ...filterStyle,
                  ...transformStyle
                }}
              />

              {/* Foreground Layer (Left Side): Original Clipped */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`
                }}
              >
                <img
                  src={originalUrl}
                  alt="Original view clipped"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Divider Line & Handle */}
              <div
                onMouseDown={() => setIsDraggingSplit(true)}
                onTouchStart={() => setIsDraggingSplit(true)}
                style={{ left: `${splitPos}%` }}
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20 flex items-center justify-center hover:bg-cyan-300 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white -translate-x-[0.5px]">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Split Labels */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-white/10 pointer-events-none">
                Original (Before)
              </div>
              <div className="absolute top-3 right-3 bg-cyan-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30 pointer-events-none">
                Processed (After)
              </div>
            </div>
          )}

          {/* CROP OVERLAY RECTANGLE (if Crop is currently active) */}
          {isCropActive && viewMode === 'processed' && (
            <div
              className="absolute pointer-events-none border-2 border-dashed border-cyan-400 bg-cyan-500/10 transition-all z-20"
              style={{
                left: `${config.cropX}%`,
                top: `${config.cropY}%`,
                width: `${config.cropW}%`,
                height: `${config.cropH}%`
              }}
            >
              <div className="absolute -top-6 left-0 bg-cyan-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                Crop: {Math.round(config.cropW)}% × {Math.round(config.cropH)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
