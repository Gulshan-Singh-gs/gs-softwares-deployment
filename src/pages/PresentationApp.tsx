import React, { useState, useEffect } from 'react';
import { 
  Presentation, 
  Play, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Sparkles, 
  Layout, 
  Palette, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import { downloadBlob } from '../lib/fileUtils';

interface Slide {
  id: number;
  title: string;
  bullets: string[];
  notes?: string;
}

export const PresentationApp: React.FC = () => {
  const [markdownInput, setMarkdownInput] = useState<string>(`# The Zero-Upload Future
- 100% Client-Side WebAssembly Architecture
- Zero Server Hosting Costs
- Zero Telemetry & Zero Leakage

---

# Multi-Core Parallelism
- Web Worker Pools & SharedArrayBuffers
- OffscreenCanvas 2D/3D Rendering
- Ultra-Low Latency UI Interaction

---

# Mathematical Privacy
- Client-Side AES-256-GCM Encryption
- In-Memory Non-Destructive Pipelines
- Guaranteed Data Sovereignty`);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [presenterMode, setPresenterMode] = useState<boolean>(false);
  const [themeGradient, setThemeGradient] = useState<'cyan' | 'purple' | 'amber' | 'emerald'>('cyan');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Parse markdown into slides separated by `---` or `# `
  useEffect(() => {
    const rawParts = markdownInput.split(/\n---\n/).filter((p) => p.trim().length > 0);
    const parsed: Slide[] = rawParts.map((part, i) => {
      const lines = part.split('\n').map((l) => l.trim()).filter(Boolean);
      const titleLine = lines.find((l) => l.startsWith('#')) || lines[0] || `Slide ${i + 1}`;
      const title = titleLine.replace(/^#+\s*/, '');
      const bullets = lines
        .filter((l) => l !== titleLine)
        .map((l) => l.replace(/^[-*•]\s*/, ''));
      return { id: i + 1, title, bullets };
    });
    setSlides(parsed);
    if (currentSlideIdx >= parsed.length) {
      setCurrentSlideIdx(0);
    }
  }, [markdownInput]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentSlideIdx((p) => Math.min(slides.length - 1, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIdx((p) => Math.max(0, p - 1));
      } else if (e.key === 'Escape') {
        setPresenterMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Dual-Window Presenter Sync via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('gs-slides-presenter-sync');
        channel.onmessage = (event) => {
          if (typeof event.data?.slideIdx === 'number') {
            setCurrentSlideIdx(event.data.slideIdx);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync unavailable:', e);
    }
    return () => {
      channel?.close();
    };
  }, []);

  // Broadcast slide changes to secondary presenter window
  const updateSlideWithSync = (newIdx: number) => {
    setCurrentSlideIdx(newIdx);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('gs-slides-presenter-sync');
        channel.postMessage({ slideIdx: newIdx });
        channel.close();
      }
    } catch (e) {}
  };

  // Client-Side Vector PDF Slide Deck Export via pdf-lib
  const handleExportPdf = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const slide of slides) {
        // Landscape 16:9 Presentation slide size (842 x 473 pt)
        const page = pdfDoc.addPage([842, 473]);
        
        // Background dark gradient fill
        page.drawRectangle({
          x: 0,
          y: 0,
          width: 842,
          height: 473,
          color: rgb(0.04, 0.06, 0.1),
        });

        // Top accent bar
        page.drawRectangle({
          x: 40,
          y: 430,
          width: 762,
          height: 4,
          color: themeGradient === 'purple' ? rgb(0.65, 0.3, 0.95) : rgb(0.02, 0.71, 0.83),
        });

        // Slide Title
        page.drawText(slide.title, {
          x: 50,
          y: 370,
          size: 32,
          font: font,
          color: rgb(1, 1, 1),
        });

        // Bullet Points
        let yPos = 300;
        slide.bullets.forEach((b) => {
          page.drawText(`•  ${b}`, {
            x: 60,
            y: yPos,
            size: 18,
            font: bodyFont,
            color: rgb(0.8, 0.85, 0.9),
          });
          yPos -= 36;
        });

        // Slide Number Footer
        page.drawText(`GS-Presentation  ·  Slide ${slide.id} of ${slides.length}`, {
          x: 50,
          y: 30,
          size: 10,
          font: bodyFont,
          color: rgb(0.4, 0.5, 0.6),
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, `gs-slide-deck-${Date.now()}.pdf`);
    } catch (e: any) {
      alert(`PDF Export Failed: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const curSlide = slides[currentSlideIdx] || { title: '', bullets: [] };

  const getThemeClasses = () => {
    switch (themeGradient) {
      case 'purple':
        return 'from-purple-900/60 via-indigo-900/40 to-black text-purple-300 border-purple-500/30';
      case 'amber':
        return 'from-amber-900/60 via-orange-900/40 to-black text-amber-300 border-amber-500/30';
      case 'emerald':
        return 'from-emerald-900/60 via-teal-900/40 to-black text-emerald-300 border-emerald-500/30';
      case 'cyan':
      default:
        return 'from-cyan-900/60 via-blue-900/40 to-black text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              GS-Presentation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Deck Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">100% Client-side Markdown-to-Slides presenter mode and high-resolution PDF deck generator</p>
          </div>
        </div>

        {/* Presentation & PDF Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPresenterMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md"
          >
            <Play className="w-4 h-4" />
            <span>Present Fullscreen</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-200 hover:text-white transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Markdown Editor + Live 16:9 Canvas Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Markdown Outline Editor */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Markdown Slide Deck Content
              </h2>
              <span className="text-[11px] text-cyan-400 font-mono">Use '---' to separate slides</span>
            </div>
            <textarea
              rows={14}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              className="w-full p-4 rounded-2xl neu-inset bg-transparent border border-slate-700 text-xs font-mono text-slate-200 leading-relaxed outline-none"
            />
          </div>

          {/* Theme Palette Chooser */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Stage Theme</span>
            <div className="flex items-center gap-2">
              {(['cyan', 'purple', 'amber', 'emerald'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setThemeGradient(t)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    themeGradient === t ? 'border-white scale-110 shadow' : 'border-transparent opacity-60'
                  } ${
                    t === 'cyan' ? 'bg-cyan-500' : t === 'purple' ? 'bg-purple-500' : t === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 16:9 Slide Stage */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Live Stage Preview ({currentSlideIdx + 1} / {slides.length})
            </span>
            <button
              onClick={() => setPresenterMode(true)}
              className="p-1.5 rounded-lg neu-btn text-slate-400 hover:text-white"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 16:9 Aspect Presentation Frame */}
          <div 
            className={`aspect-video rounded-2xl bg-gradient-to-br p-8 flex flex-col justify-between border shadow-2xl transition-all ${getThemeClasses()}`}
          >
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {curSlide.title}
              </h2>
              <ul className="space-y-3">
                {curSlide.bullets.map((b, idx) => (
                  <li key={idx} className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-4 border-t border-white/10">
              <span>GS Softwares</span>
              <span>Slide {currentSlideIdx + 1}</span>
            </div>
          </div>

          {/* Slide Deck Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => updateSlideWithSync(Math.max(0, currentSlideIdx - 1))}
              disabled={currentSlideIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl neu-btn text-xs font-bold text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateSlideWithSync(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlideIdx === i ? 'bg-cyan-400 w-5' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => updateSlideWithSync(Math.min(slides.length - 1, currentSlideIdx + 1))}
              disabled={currentSlideIdx === slides.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold disabled:opacity-30 shadow-md"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Presenter Mode Overlay */}
      {presenterMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 sm:p-16 animate-in fade-in">
          <div className="flex justify-between items-center text-slate-500 text-xs font-mono">
            <span>GS-Presentation Mode (Press Esc to Exit)</span>
            <span>{currentSlideIdx + 1} / {slides.length}</span>
          </div>

          <div className="max-w-4xl mx-auto w-full space-y-8 my-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {curSlide.title}
            </h1>
            <ul className="space-y-5 text-lg sm:text-2xl font-medium text-slate-300">
              {curSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentSlideIdx((p) => Math.max(0, p - 1))}
              disabled={currentSlideIdx === 0}
              className="px-6 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold disabled:opacity-20 hover:bg-white/20"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPresenterMode(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Exit Fullscreen
            </button>
            <button
              onClick={() => setCurrentSlideIdx((p) => Math.min(slides.length - 1, p + 1))}
              disabled={currentSlideIdx === slides.length - 1}
              className="px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-20 hover:bg-cyan-500 shadow-lg"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
