// src/suites/pdf/components/canvas/PdfCanvas.tsx
import React, { useRef, useState } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  Highlighter,
  Type,
  CheckSquare,
  Lock,
  Eye
} from 'lucide-react';

export const PdfCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const pages = usePdfStore((s) => s.pages);
  const currentPage = usePdfStore((s) => s.currentPage);
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage);
  const nextPage = usePdfStore((s) => s.nextPage);
  const prevPage = usePdfStore((s) => s.prevPage);
  const zoom = usePdfStore((s) => s.zoom);
  const zoomIn = usePdfStore((s) => s.zoomIn);
  const zoomOut = usePdfStore((s) => s.zoomOut);
  const rotatePage = usePdfStore((s) => s.rotatePage);
  const nightMode = usePdfStore((s) => s.nightMode);
  const toggleNightMode = usePdfStore((s) => s.toggleNightMode);
  const annotations = usePdfStore((s) => s.annotations);
  const formFields = usePdfStore((s) => s.formFields);
  const updateFormField = usePdfStore((s) => s.updateFormField);
  const activeDomain = usePdfStore((s) => s.activeDomain);
  const activeVariantId = usePdfStore((s) => s.activeVariantId);
  const aiVariants = usePdfStore((s) => s.aiVariants);

  const activePageObj = pages[currentPage] || pages[0];
  const activeVariant = aiVariants.find((v) => v.id === activeVariantId);

  // Filter items for current page
  const pageAnnotations = annotations.filter((a) => a.pageIndex === currentPage);
  const pageFields = formFields.filter((f) => f.pageIndex === currentPage);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col select-none overflow-hidden transition-colors ${
        nightMode ? 'bg-[#060709] text-zinc-300' : 'bg-[#0E1117] text-zinc-200'
      }`}
    >
      {/* 1. TOP DOCUMENT CANVAS HUD */}
      <div className="h-11 px-4 flex items-center justify-between bg-black/40 border-b border-white/[0.06] backdrop-blur-md z-10 text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SANDBOXED BROWSER RENDER</span>
          </div>
          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-zinc-400 text-[11px] truncate hidden md:inline">
            Page {currentPage + 1} of {pages.length} · {activePageObj?.width || 612} × {activePageObj?.height || 792} pt
          </span>
        </div>

        {/* Viewport Zoom & Mode Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-1.5 text-[11px] text-zinc-300 min-w-[42px] text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => rotatePage(currentPage)}
            className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-cyan-400 transition-colors"
            title="Rotate Page 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleNightMode}
            className={`p-1 rounded transition-colors ${
              nightMode ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="Toggle Night / Reading Mode"
          >
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN DOCUMENT VIEWPORT (Virtual Page Sheet) */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative">
        <div
          className="relative transition-all duration-150 origin-center shadow-2xl rounded-sm"
          style={{
            transform: `scale(${zoom}) rotate(${activePageObj?.rotation || 0}deg)`,
            width: `${activePageObj?.width || 612}px`,
            height: `${activePageObj?.height || 792}px`,
            backgroundColor: nightMode ? '#151821' : '#ffffff',
            color: nightMode ? '#e2e8f0' : '#1e293b'
          }}
        >
          {/* Document Content Rendering */}
          <div className="p-10 w-full h-full flex flex-col justify-between text-xs leading-relaxed font-sans overflow-hidden relative">
            {/* Header watermarks / Bates numbering simulation if applicable */}
            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono border-b pb-2 mb-4">
              <span>GS-OS // CONFIDENTIAL</span>
              <span>BATES-0000{currentPage + 1}</span>
            </div>

            {/* Simulated Document Body text */}
            <div className="flex-1 whitespace-pre-wrap font-serif text-[11px] leading-relaxed select-text">
              {activePageObj?.extractedText || 'Blank Page'}
            </div>

            {/* Interactive Overlaid Annotations Layer */}
            {pageAnnotations.map((anno) => (
              <div
                key={anno.id}
                className="absolute rounded border pointer-events-auto transition-all cursor-pointer group"
                style={{
                  left: `${anno.rect.x}px`,
                  top: `${anno.rect.y}px`,
                  width: `${anno.rect.width}px`,
                  height: `${anno.rect.height}px`,
                  backgroundColor: anno.color,
                  opacity: anno.opacity || 0.5,
                  borderColor: anno.color
                }}
                title={`${anno.type.toUpperCase()}: ${anno.content || ''}`}
              >
                {anno.content && (
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 z-30 bg-black/90 text-white text-[9px] font-sans px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {anno.author}: {anno.content}
                  </div>
                )}
              </div>
            ))}

            {/* Interactive Form Fields Layer */}
            {pageFields.map((field) => (
              <div
                key={field.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${field.rect.x}px`,
                  top: `${field.rect.y}px`,
                  width: `${field.rect.width}px`,
                  height: `${field.rect.height}px`
                }}
              >
                {field.type === 'text' ? (
                  <input
                    type="text"
                    value={String(field.value)}
                    onChange={(e) => updateFormField(field.id, e.target.value)}
                    className="w-full h-full px-1.5 text-[10px] bg-blue-50/80 border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-500 font-sans text-blue-900"
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(field.value)}
                    onChange={(e) => updateFormField(field.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                ) : null}
              </div>
            ))}

            {/* AI Non-Destructive Diff Overlay */}
            {activeVariant && (
              <div className="absolute inset-x-4 top-20 p-3 bg-purple-500/10 border-2 border-dashed border-purple-500 rounded-lg pointer-events-none backdrop-blur-[2px] flex items-center justify-between z-20">
                <div className="flex items-center gap-2 text-purple-700 font-mono text-[10px]">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                  <span>AI PROPOSED CHANGE: {activeVariant.prompt}</span>
                </div>
              </div>
            )}

            {/* Footer page marker */}
            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono border-t pt-2 mt-4">
              <span>SECURITY CERTIFIED (SHA-256)</span>
              <span>Page {currentPage + 1} of {pages.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FLOATING NAVIGATOR BAR */}
      <div className="h-10 px-4 bg-[#0A0C10] border-t border-white/[0.06] flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 text-zinc-300 transition-colors"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-zinc-300">
            Page {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 text-zinc-300 transition-colors"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-white/[0.04]">
            Active Domain: <strong className="text-rose-400 uppercase">{activeDomain}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
