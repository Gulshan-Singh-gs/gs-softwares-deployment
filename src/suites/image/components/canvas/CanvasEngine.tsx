// src/suites/image/components/canvas/CanvasEngine.tsx
import React, { useRef, useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Upload, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

export const CanvasEngine: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = useImageStore((s) => s.activeImage);
  const originalImage = useImageStore((s) => s.originalImage);
  const isDemo = useImageStore((s) => s.isDemo);
  const zoom = useImageStore((s) => s.zoom);
  const pan = useImageStore((s) => s.pan);
  const isComparing = useImageStore((s) => s.isComparing);
  const splitPosition = useImageStore((s) => s.splitPosition);
  const setSplitPosition = useImageStore((s) => s.setSplitPosition);
  const loadImage = useImageStore((s) => s.loadImage);
  const restoreDemoImage = useImageStore((s) => s.restoreDemoImage);
  const resetView = useImageStore((s) => s.resetView);
  const setZoom = useImageStore((s) => s.setZoom);

  // Bind full desktop & mobile gesture system
  useCanvasGestures(containerRef);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        loadImage(url, false, { width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        loadImage(url, false, { width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative w-full h-full select-none overflow-hidden bg-[#07080A] flex items-center justify-center cursor-grab active:cursor-grabbing outline-none"
      tabIndex={0}
      aria-label="Interactive AI Workspace Canvas"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Subtle Transparency Checkerboard Underlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(45deg, #14171F 25%, transparent 25%), 
                            linear-gradient(-45deg, #14171F 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #14171F 75%), 
                            linear-gradient(-45deg, transparent 75%, #14171F 75%)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
        }}
      />

      {/* Floating Canvas Quick View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#0F1117]/80 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-2xl non-canvas-control">
        <button
          onClick={() => setZoom((z) => z * 1.15)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => z * 0.85)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset to Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Transform Container */}
      <div
        className="relative transition-transform duration-75 ease-out shadow-2xl rounded-sm will-change-transform"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Underlying Reference Layer (For Before/After Comparison) */}
        {isComparing && (originalImage || activeImage) && (
          <img
            src={originalImage || activeImage}
            alt="Reference base"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none filter contrast-90 brightness-95"
            draggable={false}
          />
        )}

        {/* Active Visual Render */}
        <div
          className="relative overflow-hidden"
          style={{
            clipPath: isComparing
              ? `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`
              : undefined
          }}
        >
          <img
            src={activeImage}
            alt="Primary workspace image"
            className="max-w-[85vw] max-h-[75vh] md:max-h-[82vh] object-contain block pointer-events-none rounded"
            draggable={false}
          />
        </div>

        {/* Before / After Draggable Split Bar */}
        {isComparing && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 cursor-ew-resize flex items-center justify-center non-canvas-control"
            style={{ left: `${splitPosition}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startPos = splitPosition;
              const onMove = (ev: MouseEvent) => {
                const rect = containerRef.current?.getBoundingClientRect();
                const width = rect ? rect.width : 1000;
                const delta = ((ev.clientX - startX) / width) * 100;
                setSplitPosition(Math.max(2, Math.min(98, startPos + delta)));
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div className="w-7 h-7 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center shadow-lg border border-black/20">
              VS
            </div>
          </div>
        )}

        {/* Demo Mode Floating Overlay Prompt */}
        {isDemo && (
          <div className="absolute top-4 left-4 z-20 pointer-events-auto bg-[#0E1017]/90 backdrop-blur-md border border-cyan-500/20 px-3.5 py-2.5 rounded-xl shadow-2xl text-left max-w-xs non-canvas-control">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-xs font-semibold text-white tracking-wide">Interactive Demo Asset</p>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              Experiment with tools freely. The image is never empty.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Import Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Center Quick Import Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-[#0F1117]/85 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-2xl non-canvas-control">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Replace Image</span>
        </button>
        <span className="w-px h-3 bg-white/15" />
        <span className="text-[11px] text-zinc-500">Drag & Drop · Paste (Ctrl+V)</span>
        {!isDemo && (
          <>
            <span className="w-px h-3 bg-white/15" />
            <button
              onClick={restoreDemoImage}
              className="text-[11px] text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Restore Demo
            </button>
          </>
        )}
      </div>
    </div>
  );
};
