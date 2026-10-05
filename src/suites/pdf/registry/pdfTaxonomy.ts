// src/suites/pdf/registry/pdfTaxonomy.ts
import { PdfToolCapability, PdfSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: PdfSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const PDF_DOMAINS: DomainMeta[] = [
  { id: 'reader', name: 'Reader & Viewer', shortLabel: 'Reader', iconName: 'BookOpen', description: 'Page navigation, zoom, continuous scroll, presentation, bookmarks' },
  { id: 'organizer', name: 'Page Organizer', shortLabel: 'Pages', iconName: 'Layers', description: 'Reorder, insert, delete, duplicate, extract, merge, split, rotate' },
  { id: 'editor', name: 'PDF Editor', shortLabel: 'Edit', iconName: 'Edit3', description: 'In-place text editing, vector shapes, layout alignment, image replacements' },
  { id: 'annotation', name: 'Annotation Studio', shortLabel: 'Annotate', iconName: 'Highlighter', description: 'Highlight, strikethrough, freehand ink, sticky notes, callouts, stamps' },
  { id: 'forms', name: 'Form Authoring', shortLabel: 'Forms', iconName: 'CheckSquare', description: 'Interactive AcroForms: fill, text fields, checkboxes, calculations' },
  { id: 'sign', name: 'Sign & Certify', shortLabel: 'Sign', iconName: 'PenTool', description: 'Draw signature, cryptographic cert verification, audit trail sealing' },
  { id: 'ocr', name: 'OCR & Scan', shortLabel: 'OCR', iconName: 'ScanText', description: 'Scanned document to searchable PDF, Tesseract multi-language OCR' },
  { id: 'conversion', name: 'Conversion Matrix', shortLabel: 'Convert', iconName: 'RefreshCw', description: 'PDF to Word/Excel/JSON/Markdown, Office/Images to PDF' },
  { id: 'compress', name: 'Compress & Optimize', shortLabel: 'Compress', iconName: 'Minimize2', description: 'Lossless & lossy PDF slimming, downsampling, font subsetting' },
  { id: 'security', name: 'Security & Encrypt', shortLabel: 'Security', iconName: 'Lock', description: 'AES-256 encryption, user passwords, permission restrictions' },
  { id: 'redaction', name: 'True Redaction', shortLabel: 'Redact', iconName: 'ShieldAlert', description: 'Permanent pixel/vector scrubbing, metadata & hidden content purge' },
  { id: 'comparison', name: 'Doc Comparison', shortLabel: 'Compare', iconName: 'SplitSquareVertical', description: 'Side-by-side & overlay diffing, text & layout delta classification' },
  { id: 'analysis', name: 'Doc Analysis', shortLabel: 'Inspect', iconName: 'FileSearch', description: 'Structure analysis, font tree inspection, broken links, metadata audit' },
  { id: 'ai_assistant', name: 'AI Doc Assistant', shortLabel: 'AI Chat', iconName: 'Sparkles', description: 'Grounded Q&A, citations with page coordinates, summary generation' },
  { id: 'ai_editing', name: 'AI Natural Edit', shortLabel: 'AI Edit', iconName: 'Wand2', description: 'Natural language transformations: bold headings, replace terms, restyle' },
  { id: 'ai_extraction', name: 'AI Data Extraction', shortLabel: 'Extract', iconName: 'Table', description: 'Structured table, invoice, resume, key-value extraction to JSON/CSV' },
  { id: 'creation', name: 'Document Creator', shortLabel: 'Create', iconName: 'FilePlus', description: 'Author from templates: invoices, contracts, proposals, clean blank canvas' },
  { id: 'design', name: 'Document Design', shortLabel: 'Design', iconName: 'Layout', description: 'Typography hierarchy, grid margins, headers, footers, bates numbering' },
  { id: 'accessibility', name: 'Accessibility (A11y)', shortLabel: 'A11y', iconName: 'Eye', description: 'PDF/UA tagging, reading order repair, auto alt-text generation' },
  { id: 'collaboration', name: 'Collaboration', shortLabel: 'Collab', iconName: 'Users', description: 'Comments, review status states (Draft -> In Review -> Approved -> Signed)' },
  { id: 'workspace', name: 'Doc Workspace', shortLabel: 'Workspace', iconName: 'FolderKanban', description: 'Multi-document project container, extracted asset pool, version control' },
  { id: 'batch', name: 'Batch Pipeline', shortLabel: 'Batch', iconName: 'Boxes', description: 'Multi-document automation: bulk OCR, compress, watermark, rename' },
  { id: 'export', name: 'Export & Delivery', shortLabel: 'Export', iconName: 'Download', description: 'PDF/A archival, high-res raster, images, Word, CSV delivery' }
];

export const PDF_CAPABILITIES: PdfToolCapability[] = [
  // 1. READER
  { id: 'reader.view', name: 'Interactive PDF Canvas', domain: 'reader', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Client-side PDF.js rendering with zoom, pan, and page labels' },
  { id: 'reader.search', name: 'In-Document Search', domain: 'reader', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Regex & whole-word search across extracted text streams' },
  
  // 2. PAGE ORGANIZER
  { id: 'organizer.reorder', name: 'Thumbnail Drag & Drop', domain: 'organizer', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Interactive visual page sequence rearrangement' },
  { id: 'organizer.rotate', name: '90° Page Rotation', domain: 'organizer', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Lossless rotation flag updates in PDF catalog' },
  { id: 'organizer.extract', name: 'Extract & Split', domain: 'organizer', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Slice page ranges into independent documents via PDF-Lib' },

  // 3. PDF EDITOR
  { id: 'editor.text', name: 'In-Place Text Editing', domain: 'editor', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Direct typographic editing, font embedding and positioning' },
  { id: 'editor.images', name: 'Image Manipulation', domain: 'editor', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Insert, resize, replace, and crop embedded raster objects' },

  // 4. ANNOTATION
  { id: 'annotation.highlight', name: 'Vector Highlighter', domain: 'annotation', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Semi-transparent blend overlay for document text' },
  { id: 'annotation.ink', name: 'Freehand Pen & Ink', domain: 'annotation', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Smooth Bézier curve drawing with stylus and touch support' },
  { id: 'annotation.notes', name: 'Sticky Notes & Comments', domain: 'annotation', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Anchored review popups with threaded replies' },

  // 5. FORMS
  { id: 'forms.fill', name: 'AcroForm Fill Engine', domain: 'forms', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Fillable text boxes, checkboxes, radio clusters, and dropdowns' },
  { id: 'forms.create', name: 'Interactive Form Author', domain: 'forms', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Drag-and-drop field authoring with validation and calculations' },

  // 6. SIGN
  { id: 'sign.draw', name: 'Draw & Stamp Signature', domain: 'sign', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Vector signature pad with transparent PNG embedding' },
  { id: 'sign.certify', name: 'Digital Certificate Sealing', domain: 'sign', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Cryptographic SHA-256 PKCS#7 digital signature validation' },

  // 7. OCR / SCAN
  { id: 'ocr.tesseract', name: 'Tesseract WASM OCR', domain: 'ocr', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Client-side OCR WebWorker extracting hOCR searchable text' },
  { id: 'ocr.scan_clean', name: 'Scan Perspective Cleanup', domain: 'ocr', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Auto edge detection, de-skewing, and contrast normalization' },

  // 8. CONVERSION
  { id: 'conversion.markdown', name: 'PDF to Clean Markdown', domain: 'conversion', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Extract reading order and semantic markdown structure' },
  { id: 'conversion.office', name: 'PDF to Office Document', domain: 'conversion', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'High-fidelity document layout reconstruction' },

  // 9. COMPRESS / OPTIMIZE
  { id: 'compress.lossless', name: 'Lossless PDF Slimmer', domain: 'compress', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Prune duplicate XObjects, unreferenced fonts, and stream flate' },
  { id: 'compress.downsample', name: 'Image Downsampling', domain: 'compress', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Re-encode raster embeds to WebP/JPEG at target DPI' },

  // 10. SECURITY
  { id: 'security.encrypt', name: 'AES-256 Encryption', domain: 'security', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'User & owner password protection with granular permissions' },

  // 11. REDACTION
  { id: 'redaction.true_burn', name: 'True Raster Redaction', domain: 'redaction', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Physical removal of vector and text bytes underneath blackouts' },
  { id: 'redaction.ai_sensitive', name: 'Smart PII Auto-Redaction', domain: 'redaction', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Detect SSN, credit cards, emails, and names for review' },

  // 12. COMPARISON
  { id: 'comparison.split', name: 'Synchronized Diff Split', domain: 'comparison', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Dual-document viewport with synchronized panning and diff highlights' },

  // 13. DOCUMENT ANALYSIS
  { id: 'analysis.tree', name: 'Structural & Font Audit', domain: 'analysis', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Inspect embedded fonts, resolution warnings, metadata defects' },

  // 14. AI DOCUMENT ASSISTANT
  { id: 'ai_assistant.grounded_qa', name: 'Document Q&A with Citations', domain: 'ai_assistant', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Chat with PDF with strict paragraph and bounding-box coordinates' },
  { id: 'ai_assistant.summary', name: 'Executive Summary Generator', domain: 'ai_assistant', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Multi-page condensed briefing with key action points' },

  // 15. AI EDITING
  { id: 'ai_editing.intent', name: 'Natural Language Document Edit', domain: 'ai_editing', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Convert commands into structured non-destructive operations' },

  // 16. AI EXTRACTION
  { id: 'ai_extraction.tables', name: 'Intelligent Table Parser', domain: 'ai_extraction', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Convert tabular PDF layouts directly into CSV and JSON arrays' },

  // 17. CREATION
  { id: 'creation.templates', name: 'Template-Based Generation', domain: 'creation', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Generate invoices, agreements, and resumes on a clean canvas' },

  // 18. DESIGN
  { id: 'design.bates', name: 'Bates Numbering & Watermark', domain: 'design', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Legal indexing headers, footers, and diagonal security watermarks' },

  // 19. ACCESSIBILITY
  { id: 'accessibility.tagging', name: 'PDF/UA Reading Order Audit', domain: 'accessibility', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Screen-reader semantic tags and image alt-text generation' },

  // 20. COLLABORATION
  { id: 'collaboration.workflow', name: 'Review & Sign Workflow', domain: 'collaboration', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Approval states: Draft → In Review → Approved → Signed' },

  // 21. WORKSPACE
  { id: 'workspace.container', name: 'Multi-Doc Document Binder', domain: 'workspace', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Organize project PDFs, revisions, and extracted JSON sidecars' },

  // 22. BATCH
  { id: 'batch.queue', name: 'Batch Processing Pipeline', domain: 'batch', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Parallel multi-file OCR, compression, and watermarking queue' },

  // 23. EXPORT
  { id: 'export.delivery', name: 'High-Fidelity PDF Export', domain: 'export', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-loss compiled PDF byte stream download and save' }
];
