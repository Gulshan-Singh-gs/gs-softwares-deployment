// src/suites/text/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant DOM/Canvas/Regex editing
  | 'CLASS_B_LOCAL_COMPUTE'        // Local WASM/Worker/Wasm spellcheck, regex AST, readability
  | 'CLASS_C_AI_REMOTE'            // Heavy generative writing, summarization, research assistant
  | 'CLASS_D_HYBRID';              // Local editor + AI structured operations

export type TextSuiteDomain =
  | 'writing'
  | 'formatting'
  | 'structure'
  | 'tables'
  | 'media'
  | 'references'
  | 'review'
  | 'ai_studio'
  | 'ai_intelligence'
  | 'research'
  | 'markdown'
  | 'code'
  | 'templates'
  | 'publishing'
  | 'accessibility'
  | 'analytics';

export interface TextToolCapability {
  id: string;
  name: string;
  domain: TextSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export type BlockType =
  | 'title'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'bullet_list'
  | 'numbered_list'
  | 'checklist'
  | 'quote'
  | 'code'
  | 'callout'
  | 'table'
  | 'divider';

export interface DocumentBlock {
  id: string;
  type: BlockType;
  content: string;
  language?: string; // for code blocks
  checked?: boolean; // for checklists
  meta?: Record<string, any>;
}

export interface ReviewComment {
  id: string;
  blockId: string;
  author: string;
  text: string;
  timestamp: number;
  resolved: boolean;
}

export interface ResearchSource {
  id: string;
  title: string;
  citationKey: string;
  url?: string;
  snippet: string;
}

export interface AITextVariant {
  id: string;
  prompt: string;
  toolId: string;
  timestamp: number;
  proposedContent: string;
  targetBlockId: string;
  status: 'preview' | 'accepted' | 'rejected';
}

export interface TextDocumentState {
  // Metadata
  id: string;
  title: string;
  author: string;
  language: string;
  wordCount: number;
  characterCount: number;
  readingTimeMin: number;

  // View & Mode states
  activeDomain: TextSuiteDomain;
  activeToolId: string;
  viewMode: 'wysiwyg' | 'markdown' | 'split' | 'focus';
  typewriterMode: boolean;

  // Structured Document Tree
  blocks: DocumentBlock[];
  selectedBlockId: string | null;

  // Review & Collaboration
  comments: ReviewComment[];
  sources: ResearchSource[];

  // Non-Destructive AI
  aiVariants: AITextVariant[];
  activeVariantId: string | null;
  isAiProcessing: boolean;
  aiPrompt: string;

  // Universal parameter vocabulary
  universalParams: {
    strength: number;      // 0-100 (Tone transformation intensity)
    creativity: number;    // 0-100 (Exploratory vs deterministic)
    conciseness: number;   // 0-100 (Brevity compression ratio)
    formality: number;     // 0-100 (Executive formal vs conversational)
    fidelity: number;      // 0-100 (Source claim preservation factor)
  };

  // Undo / Redo
  undoStack: Array<{ blocks: DocumentBlock[]; title: string }>;
  redoStack: Array<{ blocks: DocumentBlock[]; title: string }>;

  // Status
  statusMessage: string;
}
