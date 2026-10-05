// src/suites/text/store/textStore.ts
import { create } from 'zustand';
import {
  TextDocumentState,
  DocumentBlock,
  ReviewComment,
  ResearchSource,
  AITextVariant,
  TextSuiteDomain
} from './types';

// Bundled high-production demo document (Architectural Whitepaper / Specification)
export const DEMO_BLOCKS: DocumentBlock[] = [
  {
    id: 'b-title',
    type: 'title',
    content: 'GS Softwares Architecture: The 100% Client-Side Operating System'
  },
  {
    id: 'b-h1-exec',
    type: 'heading1',
    content: '1. Executive Overview & Mission'
  },
  {
    id: 'b-p1',
    type: 'paragraph',
    content: 'Modern cloud platforms routinely extract and monetize proprietary user files under the guise of AI processing. GS Softwares fundamentally repudiates this paradigm by constructing a high-performance browser-native operating system. Zero bytes, zero cryptographic keys, and zero telemetry payloads ever depart the host machine.'
  },
  {
    id: 'b-callout',
    type: 'callout',
    content: 'IMPORTANT: All cryptographic signing, WASM media transcoding, and neural inference execute strictly inside Web Workers and OffscreenCanvas sandboxes. The network inspector remains completely empty during editing operations.'
  },
  {
    id: 'b-h1-tech',
    type: 'heading1',
    content: '2. Triad Execution Pipeline'
  },
  {
    id: 'b-p2',
    type: 'paragraph',
    content: 'The core document state is structured as an immutable directed acyclic graph rather than unstructured HTML. Document transformations are expressed as discrete, non-destructive commands.'
  },
  {
    id: 'b-code',
    type: 'code',
    language: 'typescript',
    content: 'export interface DocumentStateNode {\n  readonly id: string;\n  readonly version: number;\n  readonly payload: ArrayBuffer | string;\n  readonly checksum: string; // SHA-256\n}'
  },
  {
    id: 'b-checklist-1',
    type: 'checklist',
    content: 'Verify zero-upload privacy contract (D1 Prime Directive)',
    checked: true
  },
  {
    id: 'b-checklist-2',
    type: 'checklist',
    content: 'Offline PWA Service Worker caching (D2 Prime Directive)',
    checked: true
  },
  {
    id: 'b-checklist-3',
    type: 'checklist',
    content: 'Non-blocking Web Worker execution tier (D3 Prime Directive)',
    checked: true
  },
  {
    id: 'b-h1-perf',
    type: 'heading1',
    content: '3. Empirical Performance Telemetry'
  },
  {
    id: 'b-p3',
    type: 'paragraph',
    content: 'Across a 100-operation stress test, the document state engine maintains steady 60 FPS scrolling and interaction times strictly under 25 milliseconds.'
  }
];

export const DEMO_COMMENTS: ReviewComment[] = [
  {
    id: 'c-1',
    blockId: 'b-p1',
    author: 'Principal Architect',
    text: 'Ensure the D1 zero-upload guarantee is explicitly verified in automated CI runs.',
    timestamp: Date.now() - 3600000,
    resolved: false
  }
];

export const DEMO_SOURCES: ResearchSource[] = [
  {
    id: 'src-1',
    title: 'W3C WebAssembly Specification (2.0)',
    citationKey: 'W3C-WASM-2024',
    url: 'https://www.w3.org/TR/wasm-core-2/',
    snippet: 'WebAssembly provides a secure, sandboxed execution environment with predictable performance.'
  }
];

export const useTextStore = create<TextDocumentState & {
  // Block Editing Actions
  updateBlockContent: (id: string, content: string) => void;
  insertBlockAfter: (afterId: string, type: DocumentBlock['type']) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  toggleChecklist: (id: string) => void;
  selectBlock: (id: string | null) => void;

  // View & Mode controls
  setViewMode: (mode: TextDocumentState['viewMode']) => void;
  toggleTypewriterMode: () => void;
  setDomain: (domain: TextSuiteDomain) => void;
  setTool: (toolId: string) => void;

  // Universal parameter controls
  setUniversalParam: (key: keyof TextDocumentState['universalParams'], val: number) => void;

  // AI & Non-destructive Variants
  synthesizeAiWriting: (prompt: string, targetBlockId?: string) => void;
  acceptAiVariant: (id: string) => void;
  rejectAiVariant: (id: string) => void;

  // Review & Comments
  addComment: (blockId: string, text: string) => void;
  resolveComment: (id: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // Demo Project Restoration
  loadDemoDocument: () => void;
}>((set, get) => {
  const calculateStats = (blocks: DocumentBlock[]) => {
    const text = blocks.map((b) => b.content).join(' ');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, characterCount: chars, readingTimeMin: readingTime };
  };

  const initialStats = calculateStats(DEMO_BLOCKS);

  return {
    id: 'doc-whitepaper-architecture',
    title: 'GS Softwares Architecture Specification',
    author: 'Chief Platform Architect',
    language: 'en-US',
    wordCount: initialStats.wordCount,
    characterCount: initialStats.characterCount,
    readingTimeMin: initialStats.readingTimeMin,

    activeDomain: 'writing',
    activeToolId: 'writing.focus',
    viewMode: 'wysiwyg',
    typewriterMode: false,

    blocks: [...DEMO_BLOCKS],
    selectedBlockId: 'b-p1',

    comments: [...DEMO_COMMENTS],
    sources: [...DEMO_SOURCES],

    aiVariants: [],
    activeVariantId: null,
    isAiProcessing: false,
    aiPrompt: '',

    universalParams: {
      strength: 80,
      creativity: 40,
      conciseness: 75,
      formality: 90,
      fidelity: 95
    },

    undoStack: [],
    redoStack: [],
    statusMessage: 'Ready · Client-side Block Engine Active',

    updateBlockContent: (id, content) => {
      const { blocks, title } = get();
      const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
      const stats = calculateStats(updated);
      set({
        undoStack: [...get().undoStack, { blocks, title }],
        blocks: updated,
        ...stats,
        statusMessage: 'Document autosaved locally'
      });
    },

    insertBlockAfter: (afterId, type) => {
      const { blocks, title } = get();
      const index = blocks.findIndex((b) => b.id === afterId);
      const newBlock: DocumentBlock = {
        id: `b-${Date.now()}`,
        type,
        content: ''
      };
      const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
      const stats = calculateStats(updated);
      set({
        undoStack: [...get().undoStack, { blocks, title }],
        blocks: updated,
        selectedBlockId: newBlock.id,
        ...stats,
        statusMessage: `Inserted new ${type} block`
      });
    },

    deleteBlock: (id) => {
      const { blocks, title } = get();
      if (blocks.length <= 1) return;
      const updated = blocks.filter((b) => b.id !== id);
      const stats = calculateStats(updated);
      set({
        undoStack: [...get().undoStack, { blocks, title }],
        blocks: updated,
        selectedBlockId: null,
        ...stats,
        statusMessage: 'Block deleted'
      });
    },

    moveBlock: (fromIndex, toIndex) => {
      const { blocks, title } = get();
      const updated = [...blocks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      set({
        undoStack: [...get().undoStack, { blocks, title }],
        blocks: updated,
        statusMessage: 'Block order updated'
      });
    },

    toggleChecklist: (id) => {
      set((s) => ({
        blocks: s.blocks.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b))
      }));
    },

    selectBlock: (id) => set({ selectedBlockId: id }),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleTypewriterMode: () => set((s) => ({ typewriterMode: !s.typewriterMode })),

    setDomain: (domain) => {
      set({
        activeDomain: domain,
        statusMessage: `Workspace Domain: ${domain.toUpperCase()}`
      });
    },

    setTool: (toolId) => {
      set({
        activeToolId: toolId,
        statusMessage: `Active Processor: ${toolId}`
      });
    },

    setUniversalParam: (key, val) => {
      set((s) => ({
        universalParams: { ...s.universalParams, [key]: val }
      }));
    },

    synthesizeAiWriting: (prompt, targetBlockId) => {
      const { blocks, selectedBlockId } = get();
      const targetId = targetBlockId || selectedBlockId || blocks[1]?.id || 'b-p1';
      set({ isAiProcessing: true, statusMessage: 'Synthesizing document transformation...' });

      setTimeout(() => {
        const targetBlock = blocks.find((b) => b.id === targetId);
        const originalContent = targetBlock ? targetBlock.content : '';
        const newVar: AITextVariant = {
          id: `var-${Date.now()}`,
          prompt,
          toolId: get().activeToolId,
          timestamp: Date.now(),
          targetBlockId: targetId,
          proposedContent: `${originalContent} [Refined for clarity & precision]: ${prompt}`,
          status: 'preview'
        };
        set((s) => ({
          aiVariants: [newVar, ...s.aiVariants],
          activeVariantId: newVar.id,
          isAiProcessing: false,
          statusMessage: 'AI Proposal Ready for Diff Review'
        }));
      }, 700);
    },

    acceptAiVariant: (id) => {
      const { aiVariants, blocks, title } = get();
      const variant = aiVariants.find((v) => v.id === id);
      if (!variant) return;

      const updated = blocks.map((b) =>
        b.id === variant.targetBlockId ? { ...b, content: variant.proposedContent } : b
      );
      const stats = calculateStats(updated);
      set({
        undoStack: [...get().undoStack, { blocks, title }],
        blocks: updated,
        aiVariants: aiVariants.map((v) => (v.id === id ? { ...v, status: 'accepted' as const } : v)),
        activeVariantId: null,
        ...stats,
        statusMessage: 'AI revision merged into document'
      });
    },

    rejectAiVariant: (id) => {
      set((s) => ({
        aiVariants: s.aiVariants.map((v) => (v.id === id ? { ...v, status: 'rejected' as const } : v)),
        activeVariantId: null,
        statusMessage: 'AI proposal dismissed'
      }));
    },

    addComment: (blockId, text) => {
      const newComment: ReviewComment = {
        id: `c-${Date.now()}`,
        blockId,
        author: 'Reviewer',
        text,
        timestamp: Date.now(),
        resolved: false
      };
      set((s) => ({
        comments: [...s.comments, newComment],
        statusMessage: 'Review comment added'
      }));
    },

    resolveComment: (id) => {
      set((s) => ({
        comments: s.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c))
      }));
    },

    undo: () => {
      const { undoStack, redoStack, blocks, title } = get();
      if (undoStack.length === 0) return;
      const prev = undoStack[undoStack.length - 1];
      const stats = calculateStats(prev.blocks);
      set({
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, { blocks, title }],
        blocks: prev.blocks,
        title: prev.title,
        ...stats,
        statusMessage: 'Undo applied'
      });
    },

    redo: () => {
      const { undoStack, redoStack, blocks, title } = get();
      if (redoStack.length === 0) return;
      const next = redoStack[redoStack.length - 1];
      const stats = calculateStats(next.blocks);
      set({
        redoStack: redoStack.slice(0, -1),
        undoStack: [...undoStack, { blocks, title }],
        blocks: next.blocks,
        title: next.title,
        ...stats,
        statusMessage: 'Redo applied'
      });
    },

    loadDemoDocument: () => {
      const stats = calculateStats(DEMO_BLOCKS);
      set({
        blocks: [...DEMO_BLOCKS],
        comments: [...DEMO_COMMENTS],
        sources: [...DEMO_SOURCES],
        undoStack: [],
        redoStack: [],
        aiVariants: [],
        ...stats,
        statusMessage: 'Demo Architectural Specification Restored'
      });
    }
  };
});
