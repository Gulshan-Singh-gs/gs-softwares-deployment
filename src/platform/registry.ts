/**
 * GS Softwares Platform - Canonical Tool & Studio Registry
 * Single Source of Truth for:
 * 1. Studio registration & dynamic lazy-component mapping
 * 2. Home page catalog & category classification
 * 3. Navigation Header active items
 * 4. Command Palette search discovery
 * 5. SEO / AEO discovery metadata
 */

import { lazy } from 'react';
import { StudioId, StudioRegistration, ToolMetadata } from './types';

export const STUDIOS_REGISTRY: Record<StudioId, StudioRegistration> = {
  pixels: {
    id: 'pixels',
    name: 'GS-Pixels',
    badge: 'Image Studio',
    category: 'media',
    description: 'Compress, crop, resize, convert formats, extract palettes, and scrub EXIF metadata.',
    iconName: 'Image',
    gradient: 'from-cyan-600 to-teal-500',
    toolsCountLabel: '13 Categories',
    component: lazy(() => import('../suites/image/ImageSuite').then(m => ({ default: m.ImageSuite }))),
    tools: [
      {
        id: 'image.compress',
        name: 'Image Compressor',
        slug: 'image-compressor',
        studioId: 'pixels',
        category: 'optimize',
        description: 'Compress JPEG, PNG, WebP losslessly or with custom quality',
        version: '2.0.0',
        iconName: 'Sliders',
        inputs: [{ name: 'image', type: 'image/*' }],
        outputs: [{ name: 'image', type: 'image/webp' }],
        execution: { mode: 'worker', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      },
      {
        id: 'image.crop',
        name: 'Crop Studio',
        slug: 'crop-studio',
        studioId: 'pixels',
        category: 'edit',
        description: 'Aspect ratio framing and precise pixel cropping',
        version: '2.0.0',
        iconName: 'Crop',
        inputs: [{ name: 'image', type: 'image/*' }],
        outputs: [{ name: 'image', type: 'image/png' }],
        execution: { mode: 'main-thread', weight: 'L', supportsBatch: false, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      },
      {
        id: 'image.palette',
        name: 'Color Extractor',
        slug: 'color-extractor',
        studioId: 'pixels',
        category: 'analyze',
        description: 'Extract dominant and accent swatches with CSS/Tailwind export',
        version: '2.0.0',
        iconName: 'Palette',
        inputs: [{ name: 'image', type: 'image/*' }],
        outputs: [{ name: 'palette', type: 'application/json' }],
        execution: { mode: 'worker', weight: 'M', supportsBatch: true, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  canvas: {
    id: 'canvas',
    name: 'GS-Canvas',
    badge: 'Vector Canvas',
    category: 'media',
    description: 'Endless freehand drawing canvas with shapes, smart smoothing, and layer management.',
    iconName: 'PenTool',
    gradient: 'from-blue-600 to-indigo-500',
    toolsCountLabel: '3 Tools',
    component: lazy(() => import('../pages/CanvasApp').then(m => ({ default: m.CanvasApp }))),
    tools: [
      {
        id: 'canvas.draw',
        name: 'Vector Board',
        slug: 'vector-board',
        studioId: 'canvas',
        category: 'generate',
        description: 'Infinite vector canvas with brush, shapes, and layer graph',
        version: '2.0.0',
        iconName: 'PenTool',
        inputs: [{ name: 'svg', type: 'image/svg+xml', required: false }],
        outputs: [{ name: 'export', type: 'image/svg+xml' }],
        execution: { mode: 'browser-api', weight: 'M', supportsBatch: false, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  pdf: {
    id: 'pdf',
    name: 'GS-PDF',
    badge: 'AI PDF Studio',
    category: 'documents',
    description: 'Professional browser-native AI PDF operating system: 23 domains, viewer, page organizer, AcroForms, OCR, true redaction & AI document intelligence.',
    iconName: 'FileText',
    gradient: 'from-rose-600 to-pink-500',
    toolsCountLabel: '23 Domains',
    component: lazy(() => import('../suites/pdf/PdfSuite').then(m => ({ default: m.PdfSuite }))),
    tools: [
      {
        id: 'pdf.merge',
        name: 'PDF Merger',
        slug: 'pdf-merger',
        studioId: 'pdf',
        category: 'edit',
        description: 'Combine multiple PDF files into a single master document',
        version: '2.0.0',
        iconName: 'FileText',
        inputs: [{ name: 'documents', type: 'application/pdf' }],
        outputs: [{ name: 'merged', type: 'application/pdf' }],
        execution: { mode: 'wasm', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      },
      {
        id: 'pdf.split',
        name: 'PDF Splitter',
        slug: 'pdf-splitter',
        studioId: 'pdf',
        category: 'edit',
        description: 'Extract page ranges or split into individual single-page documents',
        version: '2.0.0',
        iconName: 'Scissors',
        inputs: [{ name: 'document', type: 'application/pdf' }],
        outputs: [{ name: 'split', type: 'application/pdf' }],
        execution: { mode: 'wasm', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  video: {
    id: 'video',
    name: 'GS-Video',
    badge: 'WASM Video',
    category: 'media',
    description: 'Frame-accurate video trimmer, converter, GIF maker, and audio extractor powered by WebAssembly.',
    iconName: 'Video',
    gradient: 'from-purple-600 to-indigo-600',
    toolsCountLabel: '17 Domains',
    component: lazy(() => import('../suites/video/VideoSuite').then(m => ({ default: m.VideoSuite }))),
    tools: [
      {
        id: 'video.trim',
        name: 'Video Trimmer',
        slug: 'video-trimmer',
        studioId: 'video',
        category: 'edit',
        description: 'Frame-accurate video trimming and segment extraction',
        version: '2.0.0',
        iconName: 'Scissors',
        inputs: [{ name: 'clip', type: 'video/*' }],
        outputs: [{ name: 'trimmed', type: 'video/webm' }],
        execution: { mode: 'browser-api', weight: 'H', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      },
      {
        id: 'video.gif',
        name: 'Video to GIF',
        slug: 'video-to-gif',
        studioId: 'video',
        category: 'convert',
        description: 'Convert video clips to optimized animated GIFs',
        version: '2.0.0',
        iconName: 'Film',
        inputs: [{ name: 'clip', type: 'video/*' }],
        outputs: [{ name: 'gif', type: 'image/gif' }],
        execution: { mode: 'worker', weight: 'H', supportsBatch: true, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  audio: {
    id: 'audio',
    name: 'GS-Audio',
    badge: 'AI Audio DAW',
    category: 'media',
    description: 'Professional browser-native AI Audio DAW: Triad Record-Edit-Play loop, multitrack timeline, console mixer, speech transcription & restoration.',
    iconName: 'Music',
    gradient: 'from-pink-600 to-rose-500',
    toolsCountLabel: '24 Domains',
    component: lazy(() => import('../suites/audio/AudioSuite').then(m => ({ default: m.AudioSuite }))),
    tools: [
      {
        id: 'audio.trim',
        name: 'Audio Waveform Slicer',
        slug: 'audio-slicer',
        studioId: 'audio',
        category: 'edit',
        description: 'Non-destructive waveform slicing and scrubbing',
        version: '2.0.0',
        iconName: 'Music',
        inputs: [{ name: 'track', type: 'audio/*' }],
        outputs: [{ name: 'sliced', type: 'audio/wav' }],
        execution: { mode: 'browser-api', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  text: {
    id: 'text',
    name: 'GS-Text',
    badge: 'AI Text Suite',
    category: 'developer',
    description: 'Professional browser-native AI Text & Document Suite: structured block editor, synchronized Markdown matrix, research citations, and AI writing studio.',
    iconName: 'FileText',
    gradient: 'from-emerald-600 to-teal-500',
    toolsCountLabel: '16 Domains',
    component: lazy(() => import('../suites/text/TextSuite').then(m => ({ default: m.TextSuite }))),
    tools: [
      {
        id: 'text.diff',
        name: 'Diff Comparator',
        slug: 'diff-comparator',
        studioId: 'text',
        category: 'analyze',
        description: 'Side-by-side text and code diff comparison',
        version: '2.0.0',
        iconName: 'FileCode',
        inputs: [{ name: 'source', type: 'text/plain' }, { name: 'modified', type: 'text/plain' }],
        outputs: [{ name: 'diff', type: 'text/plain' }],
        execution: { mode: 'main-thread', weight: 'L', supportsBatch: false, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  archive: {
    id: 'archive',
    name: 'GS-Archive',
    badge: 'ZIP & TAR',
    category: 'developer',
    description: 'Inspect, compress, extract, and convert multi-file ZIP and TAR archives in-memory.',
    iconName: 'Archive',
    gradient: 'from-amber-600 to-orange-500',
    toolsCountLabel: '15 Domains',
    component: lazy(() => import('../suites/archive/ArchiveSuite').then(m => ({ default: m.ArchiveSuite }))),
    tools: [
      {
        id: 'archive.zip',
        name: 'ZIP Creator & Inspector',
        slug: 'zip-inspector',
        studioId: 'archive',
        category: 'optimize',
        description: 'Multi-file in-memory ZIP compression and decompression',
        version: '2.0.0',
        iconName: 'Archive',
        inputs: [{ name: 'files', type: '*/*' }],
        outputs: [{ name: 'archive', type: 'application/zip' }],
        execution: { mode: 'worker', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  qr: {
    id: 'qr',
    name: 'GS-QR & Barcode',
    badge: 'QR & Barcode Studio',
    category: 'developer',
    description: 'Generate custom branded QR codes, WiFi access cards, vCards, and Code128 barcodes.',
    iconName: 'QrCode',
    gradient: 'from-violet-600 to-purple-500',
    toolsCountLabel: '12 Domains',
    component: lazy(() => import('../suites/qr/QrSuite').then(m => ({ default: m.QrSuite }))),
    tools: [
      {
        id: 'qr.generate',
        name: 'QR Code Generator',
        slug: 'qr-generator',
        studioId: 'qr',
        category: 'generate',
        description: 'Custom colored QR codes with embedded icons and vector SVG export',
        version: '2.0.0',
        iconName: 'QrCode',
        inputs: [{ name: 'payload', type: 'text/plain' }],
        outputs: [{ name: 'qr', type: 'image/svg+xml' }],
        execution: { mode: 'main-thread', weight: 'L', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  spreadsheet: {
    id: 'spreadsheet',
    name: 'GS-Sheets',
    badge: 'CSV & Data Grid',
    category: 'documents',
    description: 'Fast offline spreadsheet viewer, delimiter cleaner, and CSV to JSON/Markdown converter.',
    iconName: 'Table',
    gradient: 'from-emerald-600 to-green-500',
    toolsCountLabel: '12 Domains',
    component: lazy(() => import('../suites/spreadsheet/SpreadsheetSuite').then(m => ({ default: m.SpreadsheetSuite }))),
    tools: [
      {
        id: 'sheet.viewer',
        name: 'Data Grid Viewer',
        slug: 'grid-viewer',
        studioId: 'spreadsheet',
        category: 'view',
        description: 'Fast in-browser spreadsheet grid with sorting, filtering, and export',
        version: '2.0.0',
        iconName: 'Table',
        inputs: [{ name: 'table', type: 'text/csv' }],
        outputs: [{ name: 'export', type: 'text/csv' }],
        execution: { mode: 'main-thread', weight: 'M', supportsBatch: false, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  ebook: {
    id: 'ebook',
    name: 'GS-EBook',
    badge: 'EPUB Studio',
    category: 'documents',
    description: 'Distraction-free EPUB reader and Markdown-to-EPUB 3.0 publication builder.',
    iconName: 'BookOpen',
    gradient: 'from-amber-600 to-yellow-500',
    toolsCountLabel: '2 Tools',
    component: lazy(() => import('../pages/EbookApp').then(m => ({ default: m.EbookApp }))),
    tools: [
      {
        id: 'ebook.reader',
        name: 'EPUB Reader',
        slug: 'epub-reader',
        studioId: 'ebook',
        category: 'view',
        description: 'Distraction-free e-book reader with chapter navigation and font customization',
        version: '2.0.0',
        iconName: 'BookOpen',
        inputs: [{ name: 'book', type: 'application/epub+zip' }],
        outputs: [],
        execution: { mode: 'main-thread', weight: 'M', supportsBatch: false, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  presentation: {
    id: 'presentation',
    name: 'GS-Slides',
    badge: 'Deck Studio',
    category: 'documents',
    description: 'Markdown to 16:9 slide presenter mode with vector printable PDF handouts.',
    iconName: 'Presentation',
    gradient: 'from-indigo-600 to-blue-500',
    toolsCountLabel: '12 Domains',
    component: lazy(() => import('../suites/presentation/PresentationSuite').then(m => ({ default: m.PresentationSuite }))),
    tools: [
      {
        id: 'slides.present',
        name: 'Markdown Slide Deck',
        slug: 'markdown-slides',
        studioId: 'presentation',
        category: 'generate',
        description: 'Present sleek 16:9 slides written in pure markdown',
        version: '2.0.0',
        iconName: 'Presentation',
        inputs: [{ name: 'markdown', type: 'text/markdown' }],
        outputs: [{ name: 'pdf', type: 'application/pdf' }],
        execution: { mode: 'main-thread', weight: 'M', supportsBatch: false, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  security: {
    id: 'security',
    name: 'GS-Security',
    badge: 'AES-256',
    category: 'security',
    description: 'Client-side PBKDF2 password-protected AES-256-GCM file encryption and decryption.',
    iconName: 'Lock',
    gradient: 'from-blue-600 to-indigo-600',
    toolsCountLabel: '10 Domains',
    component: lazy(() => import('../suites/security/SecuritySuite').then(m => ({ default: m.SecuritySuite }))),
    tools: [
      {
        id: 'security.encrypt',
        name: 'File Encryptor',
        slug: 'file-encryptor',
        studioId: 'security',
        category: 'secure',
        description: 'Military-grade in-browser encryption with PBKDF2 key derivation',
        version: '2.0.0',
        iconName: 'Lock',
        inputs: [{ name: 'file', type: '*/*' }],
        outputs: [{ name: 'encrypted', type: 'application/octet-stream' }],
        execution: { mode: 'browser-api', weight: 'M', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  hash: {
    id: 'hash',
    name: 'GS-Hash',
    badge: 'Checksum & Verify',
    category: 'security',
    description: 'Compute SHA-256, SHA-512, SHA-1, and MD5 file digests for tamper verification.',
    iconName: 'Sliders',
    gradient: 'from-teal-600 to-cyan-500',
    toolsCountLabel: '11 Domains',
    component: lazy(() => import('../suites/hash/HashSuite').then(m => ({ default: m.HashSuite }))),
    tools: [
      {
        id: 'hash.calculate',
        name: 'Cryptographic Hash Calculator',
        slug: 'hash-calculator',
        studioId: 'hash',
        category: 'analyze',
        description: 'Fast SHA-256, SHA-512, MD5 verification',
        version: '2.0.0',
        iconName: 'Sliders',
        inputs: [{ name: 'file', type: '*/*' }],
        outputs: [{ name: 'digest', type: 'text/plain' }],
        execution: { mode: 'browser-api', weight: 'L', supportsBatch: true, supportsChaining: false },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  },
  bridge: {
    id: 'bridge',
    name: 'GS-Workflow',
    badge: 'Automation',
    category: 'developer',
    description: 'Cross-suite workflow automation studio with 40+ prebuilt templates and DAG builder.',
    iconName: 'Sparkles',
    gradient: 'from-amber-500 via-rose-500 to-cyan-500',
    toolsCountLabel: '40+ Templates',
    component: lazy(() => import('../suites/workflow/WorkflowSuite').then(m => ({ default: m.WorkflowSuite }))),
    tools: [
      {
        id: 'bridge.workflow',
        name: 'Workflow Pipeline Studio',
        slug: 'workflow-studio',
        studioId: 'bridge',
        category: 'automate',
        description: 'Orchestrate 99 tools into reusable multi-step pipelines',
        version: '2.0.0',
        iconName: 'Sparkles',
        inputs: [{ name: 'payload', type: '*/*' }],
        outputs: [{ name: 'result', type: '*/*' }],
        execution: { mode: 'worker', weight: 'H', supportsBatch: true, supportsChaining: true },
        permissions: { network: false, persistentStorage: true }
      }
    ]
  }
};

export class ToolRegistry {
  static getStudio(id: StudioId): StudioRegistration | undefined {
    return STUDIOS_REGISTRY[id];
  }

  static listStudios(): StudioRegistration[] {
    return Object.values(STUDIOS_REGISTRY);
  }

  static listStudiosByCategory(category: string): StudioRegistration[] {
    if (category === 'all') return this.listStudios();
    return this.listStudios().filter(s => s.category === category);
  }

  static getTool(toolId: string): ToolMetadata | undefined {
    for (const studio of Object.values(STUDIOS_REGISTRY)) {
      const match = studio.tools.find(t => t.id === toolId);
      if (match) return match;
    }
    return undefined;
  }

  static getAllTools(): ToolMetadata[] {
    return Object.values(STUDIOS_REGISTRY).flatMap(s => s.tools);
  }

  static isRegisteredStudio(id: string): id is StudioId {
    return id in STUDIOS_REGISTRY;
  }
}
