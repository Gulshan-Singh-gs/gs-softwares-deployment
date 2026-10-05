// src/suites/presentation/components/outline/OutlineEditorView.tsx
import React from 'react';
import { usePresentationStore } from '../../store/presentationStore';
import { ListOrdered, Plus, ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Copy, FileText } from 'lucide-react';

export const OutlineEditorView: React.FC = () => {
  const slides = usePresentationStore((s) => s.slides);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const setCurrentSlideIndex = usePresentationStore((s) => s.setCurrentSlideIndex);
  const setEditorMode = usePresentationStore((s) => s.setEditorMode);
  const addSlide = usePresentationStore((s) => s.addSlide);
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide);
  const deleteSlide = usePresentationStore((s) => s.deleteSlide);
  const moveSlide = usePresentationStore((s) => s.moveSlide);
  const toggleHideSlide = usePresentationStore((s) => s.toggleHideSlide);
  const updateSlideTitle = usePresentationStore((s) => s.updateSlideTitle);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07080D]">
      {/* Top Outline Bar */}
      <div className="h-11 px-6 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0C0E16]">
        <div className="flex items-center gap-2.5">
          <ListOrdered className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-zinc-200">Deck Outline & Structural Hierarchy</span>
          <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
            {slides.length} SLIDES
          </span>
        </div>

        <button
          onClick={() => addSlide('content')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-3">
        {slides.map((slide, idx) => {
          const isSelected = currentSlideIndex === idx;

          return (
            <div
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10 text-white'
                  : 'bg-[#0E111C] border-white/5 hover:border-white/10 text-zinc-300'
              } ${slide.hidden ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-sky-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlideTitle(idx, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-none text-white w-full max-w-md py-0.5"
                  />

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 shrink-0 uppercase">
                    {slide.layout}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => moveSlide(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveSlide(idx, idx + 1)}
                    disabled={idx === slides.length - 1}
                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleHideSlide(idx)}
                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                    title={slide.hidden ? 'Show Slide' : 'Hide Slide'}
                  >
                    {slide.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => duplicateSlide(idx)}
                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(idx)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      setEditorMode('edit');
                    }}
                    className="ml-2 px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-xs text-zinc-200 border border-white/10 flex items-center gap-1"
                    title="Open in Canvas Editor"
                  >
                    <FileText className="w-3 h-3 text-sky-400" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {slide.notes && (
                <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-mono italic">
                  Note: {slide.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
