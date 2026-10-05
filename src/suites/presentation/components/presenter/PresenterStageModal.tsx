// src/suites/presentation/components/presenter/PresenterStageModal.tsx
import React, { useEffect, useState } from 'react';
import { usePresentationStore } from '../../store/presentationStore';
import { X, ChevronLeft, ChevronRight, Clock, Maximize2, Minimize2 } from 'lucide-react';

export const PresenterStageModal: React.FC = () => {
  const isPresenting = usePresentationStore((s) => s.isPresenting);
  const setIsPresenting = usePresentationStore((s) => s.setIsPresenting);
  const slides = usePresentationStore((s) => s.slides);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const nextSlide = usePresentationStore((s) => s.nextSlide);
  const prevSlide = usePresentationStore((s) => s.prevSlide);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Timer effect
  useEffect(() => {
    if (!isPresenting) {
      setElapsedSec(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPresenting]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextSlide, prevSlide, setIsPresenting]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore fullscreen rejection
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  if (!isPresenting) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080B] flex flex-col justify-between select-none animate-in fade-in duration-150">
      {/* Top Floating Controls */}
      <div className="h-12 px-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">
            Slide {currentSlideIndex + 1} / {slides.length}
          </span>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSec)}</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="truncate max-w-sm text-zinc-300 hidden sm:inline">{currentSlide?.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Native Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsPresenting(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-300 transition-colors"
            title="Exit Presentation (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 16:9 Projection Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-hidden">
        <div
          style={{
            width: 1120,
            height: 630,
            background: currentSlide?.background || '#0F121C'
          }}
          className="rounded-2xl shadow-2xl relative border border-white/10 overflow-hidden flex items-center justify-center max-w-[95vw] max-h-[85vh] aspect-video"
        >
          {currentSlide?.objects.map((obj) => (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left: obj.x * 1.16, // scale from 960 to 1120
                top: obj.y * 1.16,
                width: obj.width * 1.16,
                height: obj.height * 1.16,
                color: obj.style.color,
                backgroundColor: obj.style.bgColor,
                fontSize: (obj.style.fontSize || 16) * 1.16,
                fontWeight: obj.style.fontWeight as any,
                textAlign: obj.style.textAlign,
                borderRadius: obj.style.borderRadius,
                borderWidth: obj.style.borderWidth,
                borderColor: obj.style.borderColor,
                borderStyle: obj.style.borderWidth ? 'solid' : 'none',
                opacity: obj.style.opacity ?? 1,
                transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined
              }}
              className="p-3 select-none flex items-center leading-relaxed"
            >
              {obj.type === 'text' ? (
                <div className="w-full whitespace-pre-wrap">{obj.content}</div>
              ) : obj.type === 'image' ? (
                <img src={obj.content} alt="" className="w-full h-full object-cover rounded" />
              ) : (
                <div className="w-full h-full flex items-center justify-center whitespace-pre-wrap text-center font-mono">
                  {obj.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Presenter Status Bar */}
      <div className="h-14 px-6 flex items-center justify-between z-10 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Slide (Left Arrow / PageUp)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Slide (Right Arrow / Space / PageDown)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {currentSlide?.notes ? (
          <div className="text-xs font-mono text-zinc-300 bg-black/70 px-4 py-1.5 rounded-lg border border-white/10 max-w-xl truncate">
            <span className="text-sky-400 font-bold mr-1.5">Note:</span>
            {currentSlide.notes}
          </div>
        ) : (
          <span className="text-[11px] font-mono text-zinc-600 hidden sm:inline">
            Use Arrow keys or Space to advance · Esc to exit
          </span>
        )}

        <div className="w-20 text-right text-[11px] font-mono text-zinc-500">
          {Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%
        </div>
      </div>
    </div>
  );
};
