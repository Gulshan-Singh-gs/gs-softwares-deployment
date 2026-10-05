// src/suites/image/store/types.ts

export type ToolCategory =
  | 'generate'
  | 'edit'
  | 'enhance'
  | 'background'
  | 'portrait'
  | 'character'
  | 'fashion'
  | 'product'
  | 'design'
  | 'typography'
  | 'transform'
  | 'vision'
  | 'advanced';

export type AILifecycleState =
  | 'IDLE'
  | 'SELECT_TOOL'
  | 'DEFINE_REGION_PROMPT'
  | 'CONFIGURING_PARAMETERS'
  | 'PREVIEWING'
  | 'GENERATING'
  | 'RESULT_READY'
  | 'COMPARING'
  | 'DECIDED';

export interface StandardizedParams {
  strength: number;      // 0 - 100
  influence: number;     // 0 - 100
  creativity: number;    // 0 - 100
  similarity: number;    // 0 - 100
  detail: number;        // 0 - 100
  preservation: number;  // 0 - 100
}

export interface AIVariant {
  id: string;
  timestamp: number;
  blobUrl: string;
  prompt?: string;
  toolId: string;
  category: ToolCategory;
  parameters: StandardizedParams;
}

export interface ImageWorkspaceState {
  // Image pipeline
  originalImage: string | null;
  activeImage: string;
  isDemo: boolean;
  imageDimensions: { width: number; height: number };

  // History & Variants
  undoStack: string[];
  redoStack: string[];
  variants: AIVariant[];
  activeVariantId: string | null;

  // Canvas Transform
  zoom: number;
  pan: { x: number; y: number };
  splitPosition: number; // 0 - 100 for Before/After split
  isComparing: boolean;

  // Active Tool & Taxonomy
  activeCategory: ToolCategory;
  activeToolId: string;
  promptText: string;
  brushSize: number;

  // Standardized Parameters (Avoiding the slider graveyard)
  params: StandardizedParams;

  // AI Lifecycle
  lifecycleState: AILifecycleState;
  generationProgress: number; // 0 - 100
  statusMessage: string;

  // Actions
  loadImage: (url: string, isDemo?: boolean, dimensions?: { width: number; height: number }) => void;
  restoreDemoImage: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetView: () => void;
  setSplitPosition: (pos: number) => void;
  setIsComparing: (comparing: boolean) => void;

  setCategory: (category: ToolCategory, defaultToolId?: string) => void;
  setTool: (toolId: string) => void;
  setParam: (key: keyof StandardizedParams, value: number) => void;
  setPromptText: (text: string) => void;
  setBrushSize: (size: number) => void;

  // Lifecycle Actions
  startGeneration: () => void;
  receiveVariant: (variant: AIVariant) => void;
  acceptVariant: (variantId: string) => void;
  rejectVariant: (variantId: string) => void;

  // Non-destructive Edit Commands (Crop, Rotate, Filter)
  applyCanvasTransform: (command: 'rotate90' | 'flipH' | 'flipV' | 'invert' | 'grayscale') => void;

  // History
  undo: () => void;
  redo: () => void;
}
