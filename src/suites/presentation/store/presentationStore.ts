// src/suites/presentation/store/presentationStore.ts
import { create } from 'zustand';
import {
  PresentationDomain,
  SlideData,
  SlideObject,
  SlideTheme,
  EditorMode
} from './types';
import { downloadBlob } from '../../../lib/fileUtils';
import { parseMarkdownToSlides, serializeSlidesToMarkdown } from '../engine/markdownSync';
import { exportSlideDeckToPdf } from '../engine/pdfExport';

interface PresentationStoreState {
  // Editor View Mode (Edit / Markdown / Outline / Present)
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;

  // Navigation
  activeDomain: PresentationDomain;
  setDomain: (domain: PresentationDomain) => void;

  // Deck Structure
  deckTitle: string;
  setDeckTitle: (title: string) => void;
  slides: SlideData[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;

  // Markdown Source
  markdownSource: string;
  setMarkdownSource: (md: string) => void;
  syncFromMarkdown: (md: string) => void;
  syncToMarkdown: () => void;

  // Slide CRUD
  addSlide: (layout?: SlideData['layout']) => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (from: number, to: number) => void;
  toggleHideSlide: (index: number) => void;

  // Object Selection & Canvas
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  addObjectToCurrentSlide: (obj: Omit<SlideObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<SlideObject>) => void;
  deleteObject: (id: string) => void;

  // Slide Metadata & Notes
  updateCurrentSlideNotes: (notes: string) => void;
  setSlideBackground: (bg: string) => void;
  updateSlideTitle: (index: number, title: string) => void;
  updateSlideLayout: (index: number, layout: SlideData['layout']) => void;

  // Theme
  theme: SlideTheme;
  setTheme: (theme: SlideTheme) => void;

  // Presenter Mode
  isPresenting: boolean;
  setIsPresenting: (presenting: boolean) => void;
  nextSlide: () => void;
  prevSlide: () => void;

  // Export
  exportDeckJson: () => void;
  exportDeckPdf: (options?: { includeHidden?: boolean; slideNumbers?: boolean }) => Promise<void>;
  importDeckJson: (file: File) => Promise<void>;
  loadDemoDeck: () => void;

  statusMessage: string;
  setStatusMessage: (msg: string) => void;
}

// Built-in hardcoded example presentation per Section 36
const createDemoSlides = (): SlideData[] => [
  {
    id: 'slide_1',
    title: 'The Zero-Upload Client OS',
    layout: 'title',
    background: 'linear-gradient(135deg, #090A0F 0%, #0F172A 100%)',
    notes: 'Introduce the core thesis: browser computing without cloud leakage.',
    hidden: false,
    markdown: '# The Zero-Upload Client OS\n\n100% In-Memory Architecture · Guaranteed Data Sovereignty\n\nNotes: Introduce the core thesis: browser computing without cloud leakage.',
    objects: [
      {
        id: 'obj_1_title',
        type: 'text',
        x: 80,
        y: 160,
        width: 800,
        height: 80,
        content: 'The Zero-Upload Client OS',
        style: {
          color: '#38BDF8',
          fontSize: 44,
          fontWeight: 'bold',
          textAlign: 'left'
        }
      },
      {
        id: 'obj_1_sub',
        type: 'text',
        x: 80,
        y: 250,
        width: 760,
        height: 60,
        content: '100% In-Memory Architecture · Guaranteed Data Sovereignty',
        style: {
          color: '#94A3B8',
          fontSize: 20,
          textAlign: 'left'
        }
      },
      {
        id: 'obj_1_badge',
        type: 'shape',
        x: 80,
        y: 350,
        width: 220,
        height: 42,
        content: 'STAGE: PRODUCTION',
        style: {
          bgColor: 'rgba(56, 189, 248, 0.15)',
          color: '#38BDF8',
          borderColor: 'rgba(56, 189, 248, 0.4)',
          borderWidth: 1,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }
      }
    ]
  },
  {
    id: 'slide_2',
    title: 'Multi-Core Parallelism & Workers',
    layout: 'content',
    background: 'linear-gradient(135deg, #090A0F 0%, #172554 100%)',
    notes: 'Explain thread offloading using Comlink and WorkerPool.',
    hidden: false,
    markdown: '# Multi-Core Parallelism & Workers\n\n- Dedicated Web Workers prevent main thread micro-stutters\n- PDF generation and Markdown compilation run strictly client-side\n- Zero cloud telemetry; 100% offline capable',
    objects: [
      {
        id: 'obj_2_title',
        type: 'text',
        x: 80,
        y: 60,
        width: 800,
        height: 50,
        content: 'Multi-Core Parallelism & Workers',
        style: {
          color: '#38BDF8',
          fontSize: 32,
          fontWeight: 'bold',
          textAlign: 'left'
        }
      },
      {
        id: 'obj_2_body',
        type: 'text',
        x: 80,
        y: 140,
        width: 800,
        height: 200,
        content: '• Web Workers offload document rendering & transforms\n• Zero cloud telemetry; 100% client-side memory safety\n• Fully deterministic outputs across machines',
        style: {
          color: '#CBD5E1',
          fontSize: 18,
          textAlign: 'left'
        }
      }
    ]
  },
  {
    id: 'slide_3',
    title: 'Architectural Performance Metrics',
    layout: 'stat',
    background: 'linear-gradient(135deg, #090A0F 0%, #064E3B 100%)',
    notes: 'Review the verifiable latency benefits of offline execution.',
    hidden: false,
    markdown: '# Architectural Performance Metrics\n\n< 16 ms\n\nFrame Budget Maintained Across Heavy Calculations and Canvas Redraws',
    objects: [
      {
        id: 'obj_3_stat',
        type: 'text',
        x: 80,
        y: 180,
        width: 400,
        height: 90,
        content: '< 16 ms',
        style: {
          color: '#10B981',
          fontSize: 64,
          fontWeight: 'bold',
          textAlign: 'left'
        }
      },
      {
        id: 'obj_3_stat_desc',
        type: 'text',
        x: 80,
        y: 280,
        width: 600,
        height: 60,
        content: 'Frame Budget Maintained Across Heavy Calculations and Canvas Redraws',
        style: {
          color: '#E2E8F0',
          fontSize: 18,
          textAlign: 'left'
        }
      }
    ]
  }
];

const initialDemo = createDemoSlides();

export const usePresentationStore = create<PresentationStoreState>((set, get) => ({
  editorMode: 'edit',
  setEditorMode: (mode) => {
    if (mode === 'present') {
      set({ isPresenting: true });
    } else {
      if (mode === 'markdown') {
        // Ensure markdown source is updated from current slides
        get().syncToMarkdown();
      }
      set({ editorMode: mode, isPresenting: false });
    }
  },

  activeDomain: 'canvas',
  setDomain: (domain) => set({ activeDomain: domain }),

  deckTitle: 'GS_Architecture_Master',
  setDeckTitle: (title) => set({ deckTitle: title }),

  slides: initialDemo,
  currentSlideIndex: 0,
  setCurrentSlideIndex: (idx) => set({ currentSlideIndex: idx, selectedObjectId: null }),

  markdownSource: serializeSlidesToMarkdown(initialDemo),
  setMarkdownSource: (md) => set({ markdownSource: md }),

  syncFromMarkdown: (md) => {
    const parsed = parseMarkdownToSlides(md);
    const currIdx = Math.min(get().currentSlideIndex, Math.max(0, parsed.length - 1));
    set({
      markdownSource: md,
      slides: parsed,
      currentSlideIndex: currIdx,
      statusMessage: `Synchronized ${parsed.length} slides from Markdown`
    });
  },

  syncToMarkdown: () => {
    const md = serializeSlidesToMarkdown(get().slides);
    set({ markdownSource: md });
  },

  addSlide: (layout = 'content') => {
    const { slides, currentSlideIndex } = get();
    const newSlide: SlideData = {
      id: `slide_${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      layout,
      background: 'linear-gradient(135deg, #090A0F 0%, #0F172A 100%)',
      notes: '',
      hidden: false,
      markdown: `# Slide ${slides.length + 1}\n\nEnter slide contents here.`,
      objects: [
        {
          id: `obj_${Date.now()}_title`,
          type: 'text',
          x: 80,
          y: 60,
          width: 800,
          height: 50,
          content: `New Slide Header`,
          style: {
            color: '#F8FAFC',
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'left'
          }
        },
        {
          id: `obj_${Date.now()}_body`,
          type: 'text',
          x: 80,
          y: 140,
          width: 800,
          height: 200,
          content: '• Add clear bullet points\n• Structure your thesis cleanly',
          style: {
            color: '#CBD5E1',
            fontSize: 18,
            textAlign: 'left'
          }
        }
      ]
    };

    const next = [...slides];
    next.splice(currentSlideIndex + 1, 0, newSlide);
    set({
      slides: next,
      currentSlideIndex: currentSlideIndex + 1,
      selectedObjectId: null,
      statusMessage: `Added slide #${currentSlideIndex + 2}`
    });
    get().syncToMarkdown();
  },

  duplicateSlide: (index) => {
    const { slides } = get();
    const target = slides[index];
    if (!target) return;

    const duplicated: SlideData = {
      ...target,
      id: `slide_${Date.now()}`,
      title: `${target.title} (Copy)`,
      objects: target.objects.map((o) => ({
        ...o,
        id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      }))
    };

    const next = [...slides];
    next.splice(index + 1, 0, duplicated);
    set({
      slides: next,
      currentSlideIndex: index + 1,
      selectedObjectId: null,
      statusMessage: `Duplicated slide #${index + 1}`
    });
    get().syncToMarkdown();
  },

  deleteSlide: (index) => {
    const { slides, currentSlideIndex } = get();
    if (slides.length <= 1) return;

    const next = slides.filter((_, i) => i !== index);
    const nextIdx = Math.min(currentSlideIndex, next.length - 1);
    set({
      slides: next,
      currentSlideIndex: nextIdx,
      selectedObjectId: null,
      statusMessage: `Deleted slide #${index + 1}`
    });
    get().syncToMarkdown();
  },

  moveSlide: (from, to) => {
    const { slides } = get();
    if (from < 0 || from >= slides.length || to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({ slides: next, currentSlideIndex: to });
    get().syncToMarkdown();
  },

  toggleHideSlide: (index) => {
    const { slides } = get();
    const next = slides.map((s, idx) => (idx === index ? { ...s, hidden: !s.hidden } : s));
    set({
      slides: next,
      statusMessage: `Slide #${index + 1} visibility toggled`
    });
  },

  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  addObjectToCurrentSlide: (obj) => {
    const { slides, currentSlideIndex } = get();
    const newObj: SlideObject = {
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const next = slides.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;
      return {
        ...slide,
        objects: [...slide.objects, newObj]
      };
    });
    set({
      slides: next,
      selectedObjectId: newObj.id,
      statusMessage: `Added ${obj.type} object`
    });
    get().syncToMarkdown();
  },

  updateObject: (id, updates) => {
    const { slides, currentSlideIndex } = get();
    const next = slides.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;
      return {
        ...slide,
        objects: slide.objects.map((o) => (o.id === id ? { ...o, ...updates } : o))
      };
    });
    set({ slides: next });
  },

  deleteObject: (id) => {
    const { slides, currentSlideIndex } = get();
    const next = slides.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;
      return {
        ...slide,
        objects: slide.objects.filter((o) => o.id !== id)
      };
    });
    set({ slides: next, selectedObjectId: null, statusMessage: 'Deleted object' });
    get().syncToMarkdown();
  },

  updateCurrentSlideNotes: (notes) => {
    const { slides, currentSlideIndex } = get();
    const next = slides.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, notes } : slide));
    set({ slides: next });
    get().syncToMarkdown();
  },

  setSlideBackground: (bg) => {
    const { slides, currentSlideIndex } = get();
    const next = slides.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, background: bg } : slide));
    set({ slides: next });
  },

  updateSlideTitle: (index, title) => {
    const { slides } = get();
    const next = slides.map((slide, idx) => {
      if (idx !== index) return slide;
      // also update title object if present
      const updatedObjects = slide.objects.map((o) =>
        o.id.includes('title') ? { ...o, content: title } : o
      );
      return { ...slide, title, objects: updatedObjects };
    });
    set({ slides: next });
    get().syncToMarkdown();
  },

  updateSlideLayout: (index, layout) => {
    const { slides } = get();
    const next = slides.map((slide, idx) => (idx === index ? { ...slide, layout } : slide));
    set({ slides: next });
  },

  theme: 'midnight_cyan',
  setTheme: (theme) => set({ theme }),

  isPresenting: false,
  setIsPresenting: (presenting) => set({ isPresenting: presenting }),

  nextSlide: () => {
    const { currentSlideIndex, slides } = get();
    if (currentSlideIndex < slides.length - 1) {
      set({ currentSlideIndex: currentSlideIndex + 1 });
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 });
    }
  },

  exportDeckJson: () => {
    const { slides, deckTitle } = get();
    const exportData = {
      format: 'gsdeck',
      version: '2.0.0',
      title: deckTitle,
      created: new Date().toISOString(),
      slides
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${deckTitle.replace(/\.[^/.]+$/, '')}.gsdeck`);
    set({ statusMessage: 'Exported local .gsdeck JSON file' });
  },

  exportDeckPdf: async (options = { includeHidden: false, slideNumbers: true }) => {
    const { slides, deckTitle } = get();
    set({ statusMessage: 'Rendering 16:9 PDF slide deck...' });
    try {
      const pdfBytes = await exportSlideDeckToPdf(slides, deckTitle, options);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, `${deckTitle.replace(/\.[^/.]+$/, '')}.pdf`);
      set({ statusMessage: '16:9 PDF Slide Deck exported successfully' });
    } catch (err: any) {
      set({ statusMessage: `PDF Export failed: ${err.message || 'Unknown error'}` });
    }
  },

  importDeckJson: async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        set({
          slides: parsed,
          currentSlideIndex: 0,
          selectedObjectId: null,
          statusMessage: `Imported ${parsed.length} slides`
        });
      } else if (parsed.slides && Array.isArray(parsed.slides)) {
        set({
          deckTitle: parsed.title || get().deckTitle,
          slides: parsed.slides,
          currentSlideIndex: 0,
          selectedObjectId: null,
          statusMessage: `Imported ${parsed.slides.length} slides from .gsdeck`
        });
      }
      get().syncToMarkdown();
    } catch {
      set({ statusMessage: 'Failed to import deck JSON: invalid format' });
    }
  },

  loadDemoDeck: () => {
    const demo = createDemoSlides();
    set({
      slides: demo,
      currentSlideIndex: 0,
      selectedObjectId: null,
      markdownSource: serializeSlidesToMarkdown(demo),
      statusMessage: 'Restored Demo Presentation Deck'
    });
  },

  statusMessage: 'Ready (Deterministic Presentation Engine)',
  setStatusMessage: (msg) => set({ statusMessage: msg })
}));
