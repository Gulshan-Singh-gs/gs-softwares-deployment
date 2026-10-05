// src/suites/image/store/imageStore.ts
import { create } from 'zustand';
import {
  ImageWorkspaceState,
  ToolCategory,
  StandardizedParams,
  AIVariant,
  AILifecycleState
} from './types';

// High-resolution architectural photography demo asset bundled client-side
export const BUNDLED_DEMO_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop';

const DEFAULT_PARAMS: StandardizedParams = {
  strength: 75,
  influence: 60,
  creativity: 40,
  similarity: 80,
  detail: 70,
  preservation: 85,
};

export const useImageStore = create<ImageWorkspaceState>((set, get) => ({
  // Image pipeline: Canvas is NEVER empty
  originalImage: null,
  activeImage: BUNDLED_DEMO_IMAGE,
  isDemo: true,
  imageDimensions: { width: 1600, height: 1067 },

  // History & Variants
  undoStack: [],
  redoStack: [],
  variants: [],
  activeVariantId: null,

  // Canvas Transform
  zoom: 1,
  pan: { x: 0, y: 0 },
  splitPosition: 50,
  isComparing: false,

  // Tool & Taxonomy
  activeCategory: 'enhance',
  activeToolId: 'enhance.upscale',
  promptText: '',
  brushSize: 32,

  // Standardized Parameters (Avoiding the slider graveyard)
  params: { ...DEFAULT_PARAMS },

  // AI Lifecycle State Machine
  lifecycleState: 'IDLE',
  generationProgress: 0,
  statusMessage: 'Ready · Experiment with tools',

  loadImage: (url: string, isDemo = false, dimensions = { width: 1200, height: 800 }) => {
    set({
      originalImage: url,
      activeImage: url,
      isDemo,
      imageDimensions: dimensions,
      undoStack: [],
      redoStack: [],
      variants: [],
      activeVariantId: null,
      lifecycleState: 'IDLE',
      zoom: 1,
      pan: { x: 0, y: 0 },
      isComparing: false,
      statusMessage: isDemo ? 'Demo Image Loaded' : 'User Image Imported'
    });
  },

  restoreDemoImage: () => {
    set({
      originalImage: null,
      activeImage: BUNDLED_DEMO_IMAGE,
      isDemo: true,
      imageDimensions: { width: 1600, height: 1067 },
      undoStack: [],
      redoStack: [],
      variants: [],
      activeVariantId: null,
      lifecycleState: 'IDLE',
      zoom: 1,
      pan: { x: 0, y: 0 },
      isComparing: false,
      statusMessage: 'Restored Demo Asset'
    });
  },

  setZoom: (update) => set((s) => ({
    zoom: Math.max(0.1, Math.min(10, typeof update === 'function' ? update(s.zoom) : update))
  })),

  setPan: (update) => set((s) => ({
    pan: typeof update === 'function' ? update(s.pan) : update
  })),

  resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
  setSplitPosition: (pos) => set({ splitPosition: Math.max(0, Math.min(100, pos)) }),
  setIsComparing: (isComparing) => set({ isComparing }),

  setCategory: (category: ToolCategory, defaultToolId?: string) => set({
    activeCategory: category,
    activeToolId: defaultToolId ?? `${category}.default`,
    lifecycleState: 'CONFIGURING_PARAMETERS',
    statusMessage: `Active Suite: ${category.toUpperCase()}`
  }),

  setTool: (toolId: string) => set({
    activeToolId: toolId,
    lifecycleState: 'CONFIGURING_PARAMETERS'
  }),

  setParam: (key: keyof StandardizedParams, value: number) => set((s) => ({
    params: { ...s.params, [key]: value }
  })),

  setPromptText: (promptText) => set({ promptText }),
  setBrushSize: (brushSize) => set({ brushSize }),

  startGeneration: () => {
    const { activeToolId, activeCategory, params, promptText, activeImage, variants } = get();
    set({
      lifecycleState: 'GENERATING',
      generationProgress: 15,
      statusMessage: `Synthesizing neural pass for ${activeToolId}...`
    });

    // Client-side local deterministic processing simulation (Worker/WASM ready)
    setTimeout(() => {
      set({ generationProgress: 55, statusMessage: 'Refining texture & micro-details...' });
    }, 400);

    setTimeout(() => {
      // Create non-destructive variant entry
      const newVariant: AIVariant = {
        id: `var-${Date.now()}`,
        timestamp: Date.now(),
        blobUrl: activeImage, // Points to non-destructive render
        prompt: promptText || undefined,
        toolId: activeToolId,
        category: activeCategory,
        parameters: { ...params }
      };

      set((s) => ({
        variants: [newVariant, ...s.variants],
        activeVariantId: newVariant.id,
        lifecycleState: 'RESULT_READY',
        generationProgress: 100,
        isComparing: true,
        statusMessage: 'Neural variant generated · Compare and Commit'
      }));
    }, 900);
  },

  receiveVariant: (variant: AIVariant) => {
    set((s) => ({
      variants: [variant, ...s.variants],
      activeVariantId: variant.id,
      activeImage: variant.blobUrl,
      lifecycleState: 'RESULT_READY',
      isComparing: true,
      statusMessage: 'New variant ready for comparison'
    }));
  },

  acceptVariant: (variantId: string) => {
    const { variants, activeImage, undoStack } = get();
    const selected = variants.find((v) => v.id === variantId);
    if (!selected) return;

    set({
      undoStack: [...undoStack, activeImage],
      redoStack: [],
      activeImage: selected.blobUrl,
      lifecycleState: 'DECIDED',
      isComparing: false,
      statusMessage: 'Committed variant to project timeline'
    });
  },

  rejectVariant: (variantId: string) => {
    const { originalImage, undoStack, variants } = get();
    const fallback = undoStack[undoStack.length - 1] || originalImage || BUNDLED_DEMO_IMAGE;
    set({
      variants: variants.filter((v) => v.id !== variantId),
      activeImage: fallback,
      lifecycleState: 'IDLE',
      isComparing: false,
      activeVariantId: null,
      statusMessage: 'Rejected variant · Reverted'
    });
  },

  applyCanvasTransform: (command) => {
    const { activeImage, undoStack } = get();
    // Non-destructive push to history
    set({
      undoStack: [...undoStack, activeImage],
      redoStack: [],
      statusMessage: `Applied transformation: ${command}`
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (command === 'rotate90') {
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else if (command === 'flipH') {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
      } else if (command === 'flipV') {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0);
      } else if (command === 'grayscale' || command === 'invert') {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = command === 'grayscale' ? 'grayscale(100%)' : 'invert(100%)';
        ctx.drawImage(img, 0, 0);
      }

      const newUrl = canvas.toDataURL('image/png');
      set({ activeImage: newUrl });
    };
    img.src = activeImage;
  },

  undo: () => {
    const { undoStack, activeImage, redoStack } = get();
    if (!undoStack.length) return;
    const previous = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [activeImage, ...redoStack],
      activeImage: previous,
      isComparing: false,
      statusMessage: 'Undo previous action'
    });
  },

  redo: () => {
    const { redoStack, activeImage, undoStack } = get();
    if (!redoStack.length) return;
    const next = redoStack[0];
    set({
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, activeImage],
      activeImage: next,
      isComparing: false,
      statusMessage: 'Redo action'
    });
  }
}));
