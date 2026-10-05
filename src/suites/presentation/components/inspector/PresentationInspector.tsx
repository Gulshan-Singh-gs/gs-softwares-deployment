// src/suites/presentation/components/inspector/PresentationInspector.tsx
import React, { useState } from 'react';
import { usePresentationStore } from '../../store/presentationStore';
import {
  Sliders,
  Type,
  Square,
  Trash2,
  Play,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Copy,
  FolderOpen,
  FileCheck
} from 'lucide-react';
import { SlideData } from '../../store/types';

export const PresentationInspector: React.FC = () => {
  const slides = usePresentationStore((s) => s.slides);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const selectedObjectId = usePresentationStore((s) => s.selectedObjectId);
  const updateObject = usePresentationStore((s) => s.updateObject);
  const deleteObject = usePresentationStore((s) => s.deleteObject);
  const addObjectToCurrentSlide = usePresentationStore((s) => s.addObjectToCurrentSlide);
  const updateCurrentSlideNotes = usePresentationStore((s) => s.updateCurrentSlideNotes);
  const setSlideBackground = usePresentationStore((s) => s.setSlideBackground);
  const updateSlideTitle = usePresentationStore((s) => s.updateSlideTitle);
  const updateSlideLayout = usePresentationStore((s) => s.updateSlideLayout);
  const toggleHideSlide = usePresentationStore((s) => s.toggleHideSlide);
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide);
  const deleteSlide = usePresentationStore((s) => s.deleteSlide);
  const setIsPresenting = usePresentationStore((s) => s.setIsPresenting);
  const exportDeckPdf = usePresentationStore((s) => s.exportDeckPdf);
  const exportDeckJson = usePresentationStore((s) => s.exportDeckJson);
  const importDeckJson = usePresentationStore((s) => s.importDeckJson);
  const deckTitle = usePresentationStore((s) => s.deckTitle);
  const setDeckTitle = usePresentationStore((s) => s.setDeckTitle);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [includeHiddenInPdf, setIncludeHiddenInPdf] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const selectedObject = currentSlide?.objects.find((o) => o.id === selectedObjectId);

  const handleAddText = () => {
    addObjectToCurrentSlide({
      type: 'text',
      x: 80,
      y: 120,
      width: 400,
      height: 60,
      content: 'New Presentation Heading',
      style: {
        fontSize: 24,
        color: '#F8FAFC',
        textAlign: 'left',
        fontWeight: 'bold'
      }
    });
  };

  const handleAddCard = () => {
    addObjectToCurrentSlide({
      type: 'shape',
      x: 80,
      y: 200,
      width: 360,
      height: 180,
      content: 'Card Feature Summary\n\n• Point 1: Client memory isolation\n• Point 2: Zero cloud telemetry',
      style: {
        bgColor: 'rgba(15, 23, 42, 0.7)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        borderRadius: 12,
        color: '#CBD5E1',
        fontSize: 14,
        textAlign: 'left'
      }
    });
  };

  const handleExportPdfClick = async () => {
    setIsExportingPdf(true);
    await exportDeckPdf({ includeHidden: includeHiddenInPdf, slideNumbers: true });
    setIsExportingPdf(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importDeckJson(file);
    }
  };

  return (
    <aside className="w-80 h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col overflow-hidden text-xs text-zinc-300 select-none">
      {/* Header */}
      <div className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0F111A]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            {selectedObject ? 'Object Properties' : 'Contextual Inspector'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded">
          {selectedObject ? selectedObject.type.toUpperCase() : `SLIDE ${currentSlideIndex + 1}`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* 1. Quick Add Primitives */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Insert Elements</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddText}
              className="py-1.5 px-2 rounded bg-white/[0.03] hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 text-zinc-200 transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Text Block</span>
            </button>
            <button
              onClick={handleAddCard}
              className="py-1.5 px-2 rounded bg-white/[0.03] hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 text-zinc-200 transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Shape Card</span>
            </button>
          </div>
        </div>

        {/* 2. Contextual Object Properties vs Slide Properties */}
        {selectedObject ? (
          <div className="space-y-4 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-300">Selected Object</span>
              <button
                onClick={() => deleteObject(selectedObject.id)}
                className="text-rose-400 hover:text-rose-300 p-1"
                title="Delete Object"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content text editor */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Content Text</label>
              <textarea
                value={selectedObject.content}
                onChange={(e) => updateObject(selectedObject.id, { content: e.target.value })}
                rows={4}
                className="w-full bg-[#141724] border border-white/10 rounded p-2 text-xs text-white focus:outline-none resize-none font-mono"
              />
            </div>

            {/* Font Size & Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedObject.style.fontSize || 16}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      style: { ...selectedObject.style, fontSize: parseInt(e.target.value, 10) || 16 }
                    })
                  }
                  className="w-full bg-[#141724] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Text Align</label>
                <div className="flex items-center bg-[#141724] rounded border border-white/10 p-0.5">
                  <button
                    onClick={() =>
                      updateObject(selectedObject.id, {
                        style: { ...selectedObject.style, textAlign: 'left' }
                      })
                    }
                    className="p-1 flex-1 hover:text-white"
                  >
                    <AlignLeft className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() =>
                      updateObject(selectedObject.id, {
                        style: { ...selectedObject.style, textAlign: 'center' }
                      })
                    }
                    className="p-1 flex-1 hover:text-white"
                  >
                    <AlignCenter className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() =>
                      updateObject(selectedObject.id, {
                        style: { ...selectedObject.style, textAlign: 'right' }
                      })
                    }
                    className="p-1 flex-1 hover:text-white"
                  >
                    <AlignRight className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Text Color</label>
              <div className="flex items-center gap-2 bg-[#141724] border border-white/10 rounded p-1">
                <input
                  type="color"
                  value={selectedObject.style.color || '#ffffff'}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      style: { ...selectedObject.style, color: e.target.value }
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300 uppercase">
                  {selectedObject.style.color || '#FFFFFF'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 3. Slide Properties */
          <div className="space-y-4">
            {/* Slide Title */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Slide Title</label>
              <input
                type="text"
                value={currentSlide?.title || ''}
                onChange={(e) => updateSlideTitle(currentSlideIndex, e.target.value)}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Slide Layout Selector */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Slide Archetype</label>
              <div className="grid grid-cols-3 gap-1">
                {(['title', 'content', 'two_column', 'quote', 'stat', 'blank'] as SlideData['layout'][]).map(
                  (layout) => (
                    <button
                      key={layout}
                      onClick={() => updateSlideLayout(currentSlideIndex, layout)}
                      className={`py-1 px-1.5 rounded border text-[10px] font-mono uppercase truncate ${
                        currentSlide?.layout === layout
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {layout.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Slide Backgrounds */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Background</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Dark Slate', val: 'linear-gradient(135deg, #090A0F 0%, #0F172A 100%)' },
                  { name: 'Navy Blue', val: 'linear-gradient(135deg, #090A0F 0%, #172554 100%)' },
                  { name: 'Deep Emerald', val: 'linear-gradient(135deg, #090A0F 0%, #064E3B 100%)' },
                  { name: 'Midnight Purple', val: 'linear-gradient(135deg, #090A0F 0%, #3B0764 100%)' },
                  { name: 'Solid Black', val: '#000000' },
                  { name: 'Pitch Dark', val: '#0F121C' }
                ].map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => setSlideBackground(bg.val)}
                    className="py-1.5 px-2 rounded border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-white truncate text-left"
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Visibility & Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-zinc-400">Visibility Status</span>
              <button
                onClick={() => toggleHideSlide(currentSlideIndex)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
              >
                {currentSlide?.hidden ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">Hidden</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Visible</span>
                  </>
                )}
              </button>
            </div>

            {/* Slide Actions (Duplicate / Delete) */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => duplicateSlide(currentSlideIndex)}
                className="py-1.5 px-2 rounded border border-white/10 bg-white/[0.02] hover:bg-white/10 flex items-center justify-center gap-1.5 text-zinc-300"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              {slides.length > 1 && (
                <button
                  onClick={() => deleteSlide(currentSlideIndex)}
                  className="py-1.5 px-2 rounded border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 flex items-center justify-center gap-1.5 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {/* Speaker Notes */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Speaker Notes</label>
              <textarea
                value={currentSlide?.notes || ''}
                onChange={(e) => updateCurrentSlideNotes(e.target.value)}
                rows={3}
                placeholder="Private speaker cues & talking points..."
                className="w-full bg-[#141724] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* 4. Deck Management & Export Panel */}
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          <label className="text-[11px] font-mono text-zinc-400 uppercase block">Deck Storage & Export</label>

          {/* Deck Title */}
          <div>
            <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">Deck File Name</label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              className="w-full bg-[#141724] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          {/* Include Hidden toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-400">
            <input
              type="checkbox"
              checked={includeHiddenInPdf}
              onChange={(e) => setIncludeHiddenInPdf(e.target.checked)}
              className="rounded bg-[#141724] border-white/20 text-sky-500"
            />
            <span>Include hidden slides in PDF</span>
          </label>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdfClick}
            disabled={isExportingPdf}
            className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all text-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Slide Deck → PDF (16:9)'}</span>
          </button>

          {/* JSON Save / Open */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={exportDeckJson}
              className="py-1.5 px-2 rounded border border-white/10 bg-white/[0.04] hover:bg-white/10 flex items-center justify-center gap-1.5 text-zinc-300"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save .gsdeck</span>
            </button>

            <label className="py-1.5 px-2 rounded border border-white/10 bg-white/[0.04] hover:bg-white/10 flex items-center justify-center gap-1.5 text-zinc-300 cursor-pointer">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Open .gsdeck</span>
              <input type="file" accept=".json,.gsdeck" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* 5. Presentation Delivery Trigger */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setIsPresenting(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all text-xs"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Presenter Mode (F5)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
