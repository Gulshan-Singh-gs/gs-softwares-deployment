// src/suites/presentation/PresentationSuite.tsx
import React, { useState } from 'react';
import { usePresentationStore } from './store/presentationStore';
import { SlideCanvasStage } from './components/canvas/SlideCanvasStage';
import { PresentationInspector } from './components/inspector/PresentationInspector';
import { PresenterStageModal } from './components/presenter/PresenterStageModal';
import { MarkdownEditorView } from './components/markdown/MarkdownEditorView';
import { OutlineEditorView } from './components/outline/OutlineEditorView';
import {
  Play,
  Plus,
  Trash2,
  Sliders,
  Shield,
  Download,
  Copy,
  Eye,
  EyeOff,
  Edit3,
  FileCode,
  ListOrdered,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { EditorMode } from './store/types';

export const PresentationSuite: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const editorMode = usePresentationStore((s) => s.editorMode);
  const setEditorMode = usePresentationStore((s) => s.setEditorMode);
  const deckTitle = usePresentationStore((s) => s.deckTitle);
  const slides = usePresentationStore((s) => s.slides);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const setCurrentSlideIndex = usePresentationStore((s) => s.setCurrentSlideIndex);
  const addSlide = usePresentationStore((s) => s.addSlide);
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide);
  const deleteSlide = usePresentationStore((s) => s.deleteSlide);
  const toggleHideSlide = usePresentationStore((s) => s.toggleHideSlide);
  const setIsPresenting = usePresentationStore((s) => s.setIsPresenting);
  const loadDemoDeck = usePresentationStore((s) => s.loadDemoDeck);
  const exportDeckPdf = usePresentationStore((s) => s.exportDeckPdf);
  const statusMessage = usePresentationStore((s) => s.statusMessage);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION BAR */}
      <header className="h-[52px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white uppercase">GS-Slides Studio</span>
              <span className="text-[9px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded hidden sm:inline">
                NON-AI
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{deckTitle}</span>
          </div>
        </div>

        {/* 4 Explicit Editor Mode Switchers */}
        <div className="flex items-center bg-[#07080E] p-0.5 rounded-lg border border-white/10">
          {(
            [
              { id: 'edit', label: 'Canvas', icon: Edit3 },
              { id: 'markdown', label: 'Markdown', icon: FileCode },
              { id: 'outline', label: 'Outline', icon: ListOrdered }
            ] as { id: EditorMode; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = editorMode === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setEditorMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Toolbar Commands */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addSlide('content')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
            title="Add New Slide"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Add Slide</span>
          </button>

          <button
            onClick={loadDemoDeck}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/10 text-zinc-400 border border-white/10 text-xs font-medium transition-colors"
            title="Reload Demo Presentation"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Demo</span>
          </button>

          <button
            onClick={() => exportDeckPdf()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
            title="Export Slide Deck to 16:9 PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">PDF</span>
          </button>

          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
            title="Present Fullscreen (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Present</span>
          </button>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 xl:hidden"
            title="Toggle Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE DEPENDING ON ACTIVE MODE */}
      <div className="flex-1 flex overflow-hidden relative">
        {editorMode === 'markdown' ? (
          <MarkdownEditorView />
        ) : editorMode === 'outline' ? (
          <OutlineEditorView />
        ) : (
          /* Canvas Edit Mode: 3-pane layout */
          <>
            {/* LEFT TAXONOMY & SLIDE THUMBNAIL RAIL */}
            <nav className="w-60 bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 select-none hidden lg:flex">
              {/* Domain tabs */}
              <div className="h-9 px-3 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <span>Slide Navigator</span>
                <span>{slides.length} SLIDES</span>
              </div>

              {/* Slide Thumbnails List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {slides.map((slide, idx) => {
                  const isActive = currentSlideIndex === idx;

                  return (
                    <div
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer group relative ${
                        isActive
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-400'
                      } ${slide.hidden ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                        <span className="font-semibold text-zinc-300">#{idx + 1}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHideSlide(idx);
                            }}
                            className="hover:text-amber-400"
                            title={slide.hidden ? 'Unhide' : 'Hide'}
                          >
                            {slide.hidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSlide(idx);
                            }}
                            className="hover:text-white"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {slides.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSlide(idx);
                              }}
                              className="hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Micro 16:9 Thumbnail Preview */}
                      <div
                        style={{ background: slide.background }}
                        className="w-full aspect-video rounded border border-white/5 p-1.5 flex flex-col justify-center overflow-hidden pointer-events-none"
                      >
                        <span className="text-[9px] font-bold text-white truncate">{slide.title}</span>
                        <span className="text-[8px] text-zinc-400 font-mono truncate">
                          {slide.objects.length} elements
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Zero Upload Privacy Badge */}
              <div className="p-3 border-t border-white/[0.04] bg-[#08090E]">
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider">Zero Upload Active</span>
                </div>
                <p className="text-[9px] text-zinc-600 mt-0.5">
                  100% In-Memory 16:9 Canvas Stage.
                </p>
              </div>
            </nav>

            {/* CENTER VIEWPORT: SLIDE STAGE */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <SlideCanvasStage />
            </main>

            {/* RIGHT INSPECTOR */}
            <div className="hidden xl:block shrink-0 h-full">
              <PresentationInspector />
            </div>

            {/* MOBILE SLIDE-OVER */}
            {mobileDrawerOpen && (
              <div className="fixed inset-0 z-40 flex justify-end xl:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="w-80 h-full bg-[#0C0E14] shadow-2xl relative">
                  <PresentationInspector />
                </div>
                <div className="flex-1 h-full" onClick={() => setMobileDrawerOpen(false)} />
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. BOTTOM APPLICATION STATUS BAR */}
      <footer className="h-7 bg-[#090A0E] border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">{statusMessage}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 hidden sm:flex">
          <span>Mode: {editorMode.toUpperCase()}</span>
          <span className="text-zinc-600">|</span>
          <span>16:9 Widescreen Engine</span>
          <span className="text-indigo-400">Deterministic Vector Surface</span>
          <span className="text-zinc-600">Zero Server Upload</span>
        </div>
      </footer>

      {/* 4. FULL-SCREEN PRESENTER MODAL */}
      <PresenterStageModal />
    </div>
  );
};
