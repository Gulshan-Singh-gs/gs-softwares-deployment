// src/suites/text/registry/textTaxonomy.ts
import { TextToolCapability, TextSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: TextSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const TEXT_DOMAINS: DomainMeta[] = [
  { id: 'writing', name: 'Authoring & Writing', shortLabel: 'Write', iconName: 'PenTool', description: 'Focus mode, typewriter mode, word goals, distraction-free environment' },
  { id: 'formatting', name: 'Typography & Styles', shortLabel: 'Format', iconName: 'Type', description: 'Font selection, line spacing, margins, color palettes, and themes' },
  { id: 'structure', name: 'Document Structure', shortLabel: 'Outline', iconName: 'AlignLeft', description: 'Heading hierarchy, auto-generated Table of Contents, and section breaks' },
  { id: 'tables', name: 'Table Studio', shortLabel: 'Tables', iconName: 'Table', description: 'Insert grids, cell formatting, sort columns, and convert text to tables' },
  { id: 'media', name: 'Media Embeds', shortLabel: 'Media', iconName: 'Image', description: 'Images, SVG diagrams, callouts, and captions with responsive wrapping' },
  { id: 'references', name: 'Citations & Footnotes', shortLabel: 'Citations', iconName: 'Bookmark', description: 'Academic referencing, APA/IEEE citations, and cross-references' },
  { id: 'review', name: 'Proofreading & Track Changes', shortLabel: 'Review', iconName: 'CheckCheck', description: 'Spelling, grammar diagnostics, readability analysis, and threaded comments' },
  { id: 'ai_studio', name: 'AI Writing Studio', shortLabel: 'AI Studio', iconName: 'Sparkles', description: 'Rewrite for executive tone, expand, shorten, strengthen claims with diffs' },
  { id: 'ai_intelligence', name: 'Doc Intelligence', shortLabel: 'Intel', iconName: 'ScanEye', description: 'Ask questions about document, extract requirements, and find contradictions' },
  { id: 'research', name: 'Research Workspace', shortLabel: 'Research', iconName: 'Library', description: 'Source collection, evidence snippets, quote extraction, and fact-checking' },
  { id: 'markdown', name: 'Markdown Matrix', shortLabel: 'Markdown', iconName: 'FileCode', description: 'Real-time synchronized WYSIWYG ↔ Raw Markdown source editor' },
  { id: 'code', name: 'Technical Writing & Code', shortLabel: 'Code', iconName: 'Terminal', description: 'Monospace code blocks, syntax highlight, Mermaid diagrams, and LaTeX math' },
  { id: 'templates', name: 'Document Templates', shortLabel: 'Templates', iconName: 'FileText', description: 'PRD, Technical Spec, Executive Report, Proposal, and Resume archetypes' },
  { id: 'publishing', name: 'Publish & Delivery', shortLabel: 'Publish', iconName: 'Share2', description: 'Multi-format export: Clean Markdown, PDF, HTML, TXT, and Docx' },
  { id: 'accessibility', name: 'Accessibility (A11y)', shortLabel: 'A11y', iconName: 'Eye', description: 'Heading sequence validation, alt-text audits, and screen-reader contrast' },
  { id: 'analytics', name: 'Document Analytics', shortLabel: 'Stats', iconName: 'BarChart2', description: 'Word count, syllable density, reading time, and passive voice telemetry' }
];

export const TEXT_CAPABILITIES: TextToolCapability[] = [
  // 1. WRITING
  { id: 'writing.focus', name: 'Distraction-Free Focus Mode', domain: 'writing', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Hides all chrome panels focusing 100% on active paragraph' },
  { id: 'writing.typewriter', name: 'Typewriter Scrolling', domain: 'writing', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Keeps active writing line centered on viewport' },

  // 2. FORMATTING
  { id: 'formatting.typography', name: 'Typographic Engine', domain: 'formatting', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Custom font stacks, line-height geometry, and kerning' },

  // 3. STRUCTURE
  { id: 'structure.toc', name: 'Dynamic Table of Contents', domain: 'structure', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Auto-updating navigation tree derived from H1/H2/H3 blocks' },

  // 4. TABLES
  { id: 'tables.grid', name: 'Markdown & HTML Grid Builder', domain: 'tables', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Interactive row/column manipulation and header pinning' },

  // 5. MEDIA
  { id: 'media.callout', name: 'Contextual Warning & Info Callouts', domain: 'media', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Distinct styled admonition blocks (Note, Tip, Important)' },

  // 6. REFERENCES
  { id: 'references.citations', name: 'Evidence Footnotes & Endnotes', domain: 'references', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Anchored citations with automated bibliography generation' },

  // 7. REVIEW
  { id: 'review.readability', name: 'Flesch-Kincaid Readability Score', domain: 'review', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'On-device mathematical syllable and sentence length analysis' },
  { id: 'review.comments', name: 'Block-Anchored Review Notes', domain: 'review', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Threaded review annotations with resolve/accept toggles' },

  // 8. AI WRITING STUDIO
  { id: 'ai_studio.executive_rewrite', name: 'Executive Audience Rewrite', domain: 'ai_studio', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Transform verbose technical draft into concise decision briefings' },
  { id: 'ai_studio.concise', name: 'Length Reduction & Clarifier', domain: 'ai_studio', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Compress paragraph by ~40% preserving critical technical claims' },

  // 9. AI INTELLIGENCE
  { id: 'ai_intelligence.contradictions', name: 'Contradiction & Claim Audit', domain: 'ai_intelligence', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Identify conflicting statements across sections' },

  // 10. RESEARCH
  { id: 'research.evidence_linker', name: 'Evidence-Aware Source Binder', domain: 'research', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Map claims directly to cited source passages' },

  // 11. MARKDOWN
  { id: 'markdown.sync', name: 'Bidirectional WYSIWYG ↔ Markdown', domain: 'markdown', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant lossless synchronization between visual blocks and raw AST' },

  // 12. CODE
  { id: 'code.blocks', name: 'Syntax-Highlighted Technical Code', domain: 'code', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Monospace code containers with copy-to-clipboard and line numbering' },

  // 13. TEMPLATES
  { id: 'templates.prd', name: 'Product Architecture PRD Template', domain: 'templates', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Industry-standard technical product requirements scaffold' },

  // 14. PUBLISHING
  { id: 'publishing.export_md', name: 'Clean GitHub-Flavored Markdown', domain: 'publishing', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Clean formatted .md export with standard frontmatter' },

  // 15. ACCESSIBILITY
  { id: 'accessibility.heading_audit', name: 'H1-H6 Hierarchy Validator', domain: 'accessibility', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Detect skipped heading levels and accessible landmarks' },

  // 16. ANALYTICS
  { id: 'analytics.stats', name: 'Real-time Metrics & Reading Velocity', domain: 'analytics', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Telemetry on words, characters, paragraphs, and reading duration' }
];
