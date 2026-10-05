// src/suites/pdf/store/pdfStore.ts
import { create } from 'zustand';
import {
  PdfDocumentState,
  PdfSuiteDomain,
  PdfPageObject,
  PdfAnnotation,
  PdfFormField,
  AIPdfVariant
} from './types';

// Bundled high-production demo PDF representation
export const DEMO_PAGES: PdfPageObject[] = [
  {
    id: 'page-1',
    pageIndex: 0,
    rotation: 0,
    width: 612,
    height: 792,
    extractedText: 'GS-PDF ARCHITECTURAL SPECIFICATION & ENTERPRISE CONTRACT\n\nExecutive Summary\nThis document certifies the client-side execution boundaries of the GS-PDF Operating System. All document transformations, cryptographic signatures, and redactions occur strictly inside the browser sandbox without server transmission.\n\nSection 1: Security and Cryptographic Boundary\n1.1 Zero Upload Architecture: Every PDF byte stream remains strictly within device memory (ArrayBuffer/Blob).\n1.2 True Redaction: Visual blackouts permanently purge underlying font descriptors, vector paths, and metadata streams.\n\nAuthorized Signature: _______________________ Date: 2026-10-05'
  },
  {
    id: 'page-2',
    pageIndex: 1,
    rotation: 0,
    width: 612,
    height: 792,
    extractedText: 'Section 2: Interactive Form & Workflow Schema\n\nEmployee Verification Form:\n[X] Verified Identity Record\nFull Name: Alexandra Vance\nDepartment: Applied Document AI Engineering\nSecurity Clearance: Level 4 Enterprise Vault\n\nFinancial Overview & Quarterly Table:\nQ1 Revenue: $2,450,000 | Growth: +18.4%\nQ2 Revenue: $3,120,000 | Growth: +27.3%\nQ3 Revenue: $3,890,000 | Growth: +24.6%\n\nCompliance Auditor: _______________________ Seal: [CERTIFIED]'
  },
  {
    id: 'page-3',
    pageIndex: 2,
    rotation: 0,
    width: 612,
    height: 792,
    extractedText: 'Section 3: Appendix & Accessibility (PDF/UA)\n\n3.1 Semantic Reading Order: Tagged structure tree conforms to ISO 14289-1.\n3.2 Alternate Text: Embedded visual assets provide descriptive tags for assistive screen-readers.\n\nNotes & Field Feedback:\nReview complete. Approved for deployment across all edge nodes.'
  }
];

export const DEMO_ANNOTATIONS: PdfAnnotation[] = [
  {
    id: 'anno-1',
    type: 'highlight',
    pageIndex: 0,
    rect: { x: 50, y: 120, width: 380, height: 22 },
    color: '#facc15',
    opacity: 0.45,
    author: 'Lead Auditor',
    content: 'Review zero-upload privacy architecture mandate',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'anno-2',
    type: 'note',
    pageIndex: 1,
    rect: { x: 420, y: 220, width: 140, height: 80 },
    color: '#38bdf8',
    opacity: 0.9,
    author: 'Financial Officer',
    content: 'Verify Q3 growth numbers against ledger',
    createdAt: Date.now() - 1800000
  }
];

export const DEMO_FORM_FIELDS: PdfFormField[] = [
  {
    id: 'field-1',
    name: 'employee_name',
    type: 'text',
    pageIndex: 1,
    rect: { x: 120, y: 160, width: 220, height: 24 },
    value: 'Alexandra Vance',
    required: true
  },
  {
    id: 'field-2',
    name: 'verified_checkbox',
    type: 'checkbox',
    pageIndex: 1,
    rect: { x: 50, y: 130, width: 18, height: 18 },
    value: true,
    required: true
  }
];

export const usePdfStore = create<PdfDocumentState & {
  // Navigation & View Actions
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  rotatePage: (pageIndex: number) => void;
  toggleNightMode: () => void;

  // Tool & Domain selection
  setDomain: (domain: PdfSuiteDomain) => void;
  setTool: (toolId: string) => void;

  // Universal parameter controls
  setUniversalParam: (key: keyof PdfDocumentState['universalParams'], val: number) => void;

  // Annotations & Editing
  addAnnotation: (anno: Omit<PdfAnnotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (id: string) => void;
  updateFormField: (id: string, val: string | boolean) => void;

  // Page Operations
  deletePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  reorderPage: (fromIndex: number, toIndex: number) => void;

  // AI & Non-destructive transformation
  synthesizeAiCommand: (prompt: string, toolId: string) => void;
  acceptAiVariant: (id: string) => void;
  rejectAiVariant: (id: string) => void;
  setAiQuery: (query: string) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // Demo Project Restoration
  loadDemoDocument: () => void;
}>((set, get) => ({
  id: 'doc-demo-architectural-spec',
  title: 'GS-PDF Architectural & Security Specification',
  fileName: 'GS_PDF_Architectural_Spec.pdf',
  pageCount: DEMO_PAGES.length,
  currentPage: 0,
  zoom: 1.0,
  rotation: 0,
  viewMode: 'single',
  nightMode: false,

  pages: [...DEMO_PAGES],
  annotations: [...DEMO_ANNOTATIONS],
  formFields: [...DEMO_FORM_FIELDS],
  selectedAnnotationId: null,
  selectedFieldId: null,

  activeDomain: 'reader',
  activeToolId: 'reader.view',

  aiVariants: [],
  activeVariantId: null,
  isAiProcessing: false,
  aiQuery: '',

  searchQuery: '',
  searchResultsCount: 0,
  isComparing: false,

  undoStack: [],
  redoStack: [],

  universalParams: {
    amount: 80,
    strength: 75,
    intensity: 60,
    threshold: 50,
    fidelity: 90
  },

  statusMessage: 'Ready · 100% Client-Side Sandbox Active',

  setCurrentPage: (page) => {
    const { pageCount } = get();
    if (page >= 0 && page < pageCount) {
      set({ currentPage: page });
    }
  },

  nextPage: () => {
    const { currentPage, pageCount } = get();
    if (currentPage < pageCount - 1) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 0) {
      set({ currentPage: currentPage - 1 });
    }
  },

  setZoom: (zoom) => set({ zoom: Math.min(2.5, Math.max(0.4, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(2.5, Number((s.zoom + 0.15).toFixed(2))) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.4, Number((s.zoom - 0.15).toFixed(2))) })),

  rotatePage: (pageIndex) => {
    set((s) => {
      const newPages = s.pages.map((p, idx) => {
        if (idx === pageIndex) {
          const nextRot = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
          return { ...p, rotation: nextRot };
        }
        return p;
      });
      return {
        undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
        pages: newPages,
        statusMessage: `Rotated page ${pageIndex + 1} to 90°`
      };
    });
  },

  toggleNightMode: () => set((s) => ({ nightMode: !s.nightMode })),

  setDomain: (domain) => {
    set({
      activeDomain: domain,
      statusMessage: `Domain switched to: ${domain.toUpperCase()}`
    });
  },

  setTool: (toolId) => {
    set({
      activeToolId: toolId,
      statusMessage: `Active Tool: ${toolId}`
    });
  },

  setUniversalParam: (key, val) => {
    set((s) => ({
      universalParams: { ...s.universalParams, [key]: val }
    }));
  },

  addAnnotation: (anno) => {
    set((s) => {
      const newAnno: PdfAnnotation = {
        ...anno,
        id: `anno-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now()
      };
      return {
        undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
        annotations: [...s.annotations, newAnno],
        statusMessage: `Added ${newAnno.type} annotation`
      };
    });
  },

  removeAnnotation: (id) => {
    set((s) => ({
      undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
      annotations: s.annotations.filter((a) => a.id !== id),
      statusMessage: 'Annotation deleted'
    }));
  },

  updateFormField: (id, val) => {
    set((s) => ({
      formFields: s.formFields.map((f) => (f.id === id ? { ...f, value: val } : f))
    }));
  },

  deletePage: (index) => {
    const { pages, currentPage } = get();
    if (pages.length <= 1) return;
    set((s) => {
      const newPages = s.pages.filter((_, i) => i !== index);
      const newCurrent = Math.min(currentPage, newPages.length - 1);
      return {
        undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
        pages: newPages,
        pageCount: newPages.length,
        currentPage: newCurrent,
        statusMessage: `Deleted page ${index + 1}`
      };
    });
  },

  duplicatePage: (index) => {
    set((s) => {
      const target = s.pages[index];
      if (!target) return s;
      const duplicated: PdfPageObject = {
        ...target,
        id: `page-${Date.now()}`,
        pageIndex: index + 1
      };
      const newPages = [...s.pages.slice(0, index + 1), duplicated, ...s.pages.slice(index + 1)];
      return {
        undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
        pages: newPages,
        pageCount: newPages.length,
        statusMessage: `Duplicated page ${index + 1}`
      };
    });
  },

  reorderPage: (fromIndex, toIndex) => {
    set((s) => {
      const newPages = [...s.pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, moved);
      return {
        undoStack: [...s.undoStack, { pages: s.pages, annotations: s.annotations, formFields: s.formFields }],
        pages: newPages,
        statusMessage: `Moved page ${fromIndex + 1} to position ${toIndex + 1}`
      };
    });
  },

  synthesizeAiCommand: (prompt, toolId) => {
    set({ isAiProcessing: true, statusMessage: 'Synthesizing document transformation...' });
    setTimeout(() => {
      const newVariant: AIPdfVariant = {
        id: `ai-var-${Date.now()}`,
        prompt,
        toolId,
        timestamp: Date.now(),
        description: `Transform: "${prompt.slice(0, 40)}..."`,
        suggestedAction: `Apply structured vector operation based on intent: ${prompt}`,
        status: 'preview'
      };
      set((s) => ({
        aiVariants: [newVariant, ...s.aiVariants],
        activeVariantId: newVariant.id,
        isAiProcessing: false,
        statusMessage: 'AI Structured Operation Ready for Review'
      }));
    }, 700);
  },

  acceptAiVariant: (id) => {
    set((s) => ({
      aiVariants: s.aiVariants.map((v) => (v.id === id ? { ...v, status: 'accepted' as const } : v)),
      activeVariantId: null,
      statusMessage: 'AI transformation merged into document state'
    }));
  },

  rejectAiVariant: (id) => {
    set((s) => ({
      aiVariants: s.aiVariants.map((v) => (v.id === id ? { ...v, status: 'rejected' as const } : v)),
      activeVariantId: null,
      statusMessage: 'AI transformation dismissed'
    }));
  },

  setAiQuery: (query) => set({ aiQuery: query }),

  setSearchQuery: (query) => {
    const { pages } = get();
    if (!query.trim()) {
      set({ searchQuery: '', searchResultsCount: 0 });
      return;
    }
    const count = pages.reduce((acc, p) => {
      const matches = (p.extractedText || '').toLowerCase().split(query.toLowerCase()).length - 1;
      return acc + Math.max(0, matches);
    }, 0);
    set({ searchQuery: query, searchResultsCount: count });
  },

  undo: () => {
    const { undoStack, redoStack, pages, annotations, formFields } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, { pages, annotations, formFields }],
      pages: previous.pages,
      annotations: previous.annotations,
      formFields: previous.formFields,
      pageCount: previous.pages.length,
      statusMessage: 'Undo action restored'
    });
  },

  redo: () => {
    const { undoStack, redoStack, pages, annotations, formFields } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, { pages, annotations, formFields }],
      pages: next.pages,
      annotations: next.annotations,
      formFields: next.formFields,
      pageCount: next.pages.length,
      statusMessage: 'Redo action applied'
    });
  },

  loadDemoDocument: () => {
    set({
      pages: [...DEMO_PAGES],
      annotations: [...DEMO_ANNOTATIONS],
      formFields: [...DEMO_FORM_FIELDS],
      currentPage: 0,
      zoom: 1.0,
      rotation: 0,
      undoStack: [],
      redoStack: [],
      aiVariants: [],
      statusMessage: 'Demo architectural document restored'
    });
  }
}));
