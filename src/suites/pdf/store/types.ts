// src/suites/pdf/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant in-browser manipulation (PDF-Lib, OffscreenCanvas, SVG)
  | 'CLASS_B_LOCAL_COMPUTE'        // Local WASM/Worker/WebGPU/Tesseract OCR
  | 'CLASS_C_AI_REMOTE'            // Heavy multimodal LLM/doc intelligence
  | 'CLASS_D_HYBRID';              // Local editor + AI structured operations

export type PdfSuiteDomain =
  | 'reader'
  | 'organizer'
  | 'editor'
  | 'annotation'
  | 'forms'
  | 'sign'
  | 'ocr'
  | 'conversion'
  | 'compress'
  | 'security'
  | 'redaction'
  | 'comparison'
  | 'analysis'
  | 'ai_assistant'
  | 'ai_editing'
  | 'ai_extraction'
  | 'creation'
  | 'design'
  | 'accessibility'
  | 'collaboration'
  | 'workspace'
  | 'batch'
  | 'export';

export interface PdfToolCapability {
  id: string;
  name: string;
  domain: PdfSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export interface PdfAnnotation {
  id: string;
  type: 'highlight' | 'underline' | 'strikethrough' | 'freehand' | 'note' | 'stamp' | 'callout' | 'shape';
  pageIndex: number;
  rect: { x: number; y: number; width: number; height: number };
  color: string;
  opacity?: number;
  author?: string;
  content?: string;
  createdAt: number;
}

export interface PdfFormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature' | 'date';
  pageIndex: number;
  rect: { x: number; y: number; width: number; height: number };
  value: string | boolean;
  required?: boolean;
  options?: string[];
}

export interface PdfPageObject {
  id: string;
  pageIndex: number;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
  extractedText?: string;
  thumbnailUrl?: string;
}

export interface AIPdfVariant {
  id: string;
  prompt: string;
  toolId: string;
  timestamp: number;
  description: string;
  suggestedAction: string;
  status: 'preview' | 'accepted' | 'rejected';
}

export interface PdfDocumentState {
  // Document metadata
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  currentPage: number;
  zoom: number; // 0.5 to 3.0
  rotation: 0 | 90 | 180 | 270;
  viewMode: 'single' | 'two-page' | 'continuous' | 'book';
  nightMode: boolean;

  // Pages & Content Tree
  pages: PdfPageObject[];
  annotations: PdfAnnotation[];
  formFields: PdfFormField[];
  selectedAnnotationId: string | null;
  selectedFieldId: string | null;

  // Domain & Tool selection
  activeDomain: PdfSuiteDomain;
  activeToolId: string;

  // AI & Inspection
  aiVariants: AIPdfVariant[];
  activeVariantId: string | null;
  isAiProcessing: boolean;
  aiQuery: string;

  // Search & Navigation
  searchQuery: string;
  searchResultsCount: number;

  // Comparison State (before/after hold or split)
  isComparing: boolean;

  // History Stack
  undoStack: Array<{ pages: PdfPageObject[]; annotations: PdfAnnotation[]; formFields: PdfFormField[] }>;
  redoStack: Array<{ pages: PdfPageObject[]; annotations: PdfAnnotation[]; formFields: PdfFormField[] }>;

  // Universal parameter controls
  universalParams: {
    amount: number;       // 0-100
    strength: number;     // 0-100
    intensity: number;    // 0-100
    threshold: number;    // 0-100
    fidelity: number;     // 0-100
  };

  // Status feedback
  statusMessage: string;
}
