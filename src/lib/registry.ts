/**
 * GS Softwares Suite: Core Tool & Suite Registry
 * Layer 2 Kernel Architecture · AGENTS.md Contract
 * 12 Suites · Unified Tool Manifest & Discovery
 */

import React from 'react';

export type SuiteId = 
  | 'image'
  | 'canvas'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'text'
  | 'archive'
  | 'qr'
  | 'spreadsheet'
  | 'ebook'
  | 'presentation'
  | 'security'
  | 'hash'
  | 'bridge';

export interface ToolDef {
  id: string;                  // e.g. 'archive.zip'
  suite: SuiteId;              // e.g. 'archive'
  name: string;                // e.g. 'Zip Creator'
  slug: string;                // e.g. 'zip-extractor'
  description: string;         // e.g. 'Create or extract ZIP archives client-side'
  category: 'view' | 'edit' | 'convert' | 'optimize' | 'generate' | 'secure' | 'analyze' | 'automate';
  accepts: string[];           // MIME types or extensions
  produces: string[];
  weight: 'L' | 'M' | 'H';     // lazy-load + progress if H
  automation: { batchable: boolean; chainable: boolean; params: string[] };
  privacy: { offline: true; uploads: false };
  iconName: string;
}

export interface SuiteDef {
  id: SuiteId;
  name: string;
  badge: string;
  description: string;
  iconName: string;
  colorGradient: string;
  tools: ToolDef[];
}

export const SUITES_REGISTRY: SuiteDef[] = [
  {
    id: 'image',
    name: 'GS-Pixels',
    badge: 'Image Studio',
    description: 'Compress, crop, convert, resize, filter, extract palettes, and scrub EXIF.',
    iconName: 'Image',
    colorGradient: 'from-cyan-600 via-teal-500 to-emerald-400',
    tools: [
      { id: 'image.compress', suite: 'image', name: 'Image Compressor', slug: 'image-compressor', description: 'Compress JPEG, PNG, WebP losslessly or with custom quality', category: 'optimize', accepts: ['image/*'], produces: ['image/webp', 'image/jpeg', 'image/png'], weight: 'M', automation: { batchable: true, chainable: true, params: ['quality', 'format'] }, privacy: { offline: true, uploads: false }, iconName: 'Sliders' },
      { id: 'image.crop', suite: 'image', name: 'Crop Studio', slug: 'crop-studio', description: 'Aspect ratio framing and precise pixel cropping', category: 'edit', accepts: ['image/*'], produces: ['image/png', 'image/jpeg'], weight: 'L', automation: { batchable: false, chainable: true, params: ['aspect', 'cropX', 'cropY'] }, privacy: { offline: true, uploads: false }, iconName: 'Crop' },
      { id: 'image.palette', suite: 'image', name: 'Color Extractor', slug: 'color-extractor', description: 'Extract dominant and accent swatches with CSS/Tailwind export', category: 'analyze', accepts: ['image/*'], produces: ['image/png', 'application/json'], weight: 'M', automation: { batchable: true, chainable: false, params: ['limit', 'filter'] }, privacy: { offline: true, uploads: false }, iconName: 'Palette' },
    ]
  },
  {
    id: 'canvas',
    name: 'GS-Canvas',
    badge: 'Vector Canvas',
    description: 'Infinite vector canvas, drawing, shape manipulation, and SVG/PNG vector rendering.',
    iconName: 'PenTool',
    colorGradient: 'from-blue-600 via-indigo-500 to-violet-500',
    tools: [
      { id: 'canvas.draw', suite: 'canvas', name: 'Vector Board', slug: 'vector-board', description: 'Infinite vector canvas with brush, shapes, and layer graph', category: 'generate', accepts: ['image/svg+xml'], produces: ['image/svg+xml', 'image/png'], weight: 'M', automation: { batchable: false, chainable: false, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'PenTool' }
    ]
  },
  {
    id: 'pdf',
    name: 'GS-PDF',
    badge: 'PDF Tools',
    description: 'Merge, split, compress, reorder, stamp, extract pages, and convert PDF client-side.',
    iconName: 'FileText',
    colorGradient: 'from-rose-600 via-pink-500 to-purple-500',
    tools: [
      { id: 'pdf.merge', suite: 'pdf', name: 'PDF Merger', slug: 'pdf-merger', description: 'Combine multiple PDF files into a single master document', category: 'edit', accepts: ['application/pdf'], produces: ['application/pdf'], weight: 'M', automation: { batchable: true, chainable: true, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'FileText' },
      { id: 'pdf.split', suite: 'pdf', name: 'PDF Splitter', slug: 'pdf-splitter', description: 'Extract page ranges or split into individual single-page documents', category: 'edit', accepts: ['application/pdf'], produces: ['application/pdf', 'application/zip'], weight: 'M', automation: { batchable: true, chainable: true, params: ['pages'] }, privacy: { offline: true, uploads: false }, iconName: 'Scissors' }
    ]
  },
  {
    id: 'video',
    name: 'GS-Video',
    badge: 'Canvas & Stream',
    description: 'Trim, transcode, compress, mute, extract audio, and create GIF clips in-browser via Canvas & MediaRecorder.',
    iconName: 'Video',
    colorGradient: 'from-purple-600 via-indigo-600 to-blue-600',
    tools: [
      { id: 'video.trim', suite: 'video', name: 'Video Trimmer', slug: 'video-trimmer', description: 'Frame-accurate video trimming and segment extraction', category: 'edit', accepts: ['video/*'], produces: ['video/webm'], weight: 'H', automation: { batchable: true, chainable: true, params: ['start', 'end'] }, privacy: { offline: true, uploads: false }, iconName: 'Scissors' },
      { id: 'video.gif', suite: 'video', name: 'Video to GIF', slug: 'video-to-gif', description: 'Convert video clips to optimized animated GIFs', category: 'convert', accepts: ['video/*'], produces: ['image/gif'], weight: 'H', automation: { batchable: true, chainable: false, params: ['fps', 'quality'] }, privacy: { offline: true, uploads: false }, iconName: 'Film' }
    ]
  },
  {
    id: 'audio',
    name: 'GS-Audio',
    badge: 'WebAudio',
    description: 'High-res Web Audio player, 10-band equalizer, audio trimmer, pitch/speed shifter, and recorder.',
    iconName: 'Music',
    colorGradient: 'from-pink-600 via-rose-500 to-amber-500',
    tools: [
      { id: 'audio.player', suite: 'audio', name: 'Audio Player & EQ', slug: 'audio-player', description: 'Audiophile playback with spectrum visualizer and 10-band parametric EQ', category: 'view', accepts: ['audio/*'], produces: [], weight: 'M', automation: { batchable: false, chainable: false, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'Play' },
      { id: 'audio.trim', suite: 'audio', name: 'Audio Trimmer', slug: 'audio-trimmer', description: 'Cut and export clean uncompressed 16-bit PCM WAV stems with fade in/out', category: 'edit', accepts: ['audio/*'], produces: ['audio/wav'], weight: 'M', automation: { batchable: true, chainable: true, params: ['start', 'end'] }, privacy: { offline: true, uploads: false }, iconName: 'Scissors' }
    ]
  },
  {
    id: 'text',
    name: 'GS-Text',
    badge: 'Code & Diff',
    description: 'Diff comparison, JSON/YAML formatter, Regex studio, Markdown previewer, and Base64 encoder.',
    iconName: 'FileCode',
    colorGradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    tools: [
      { id: 'text.diff', suite: 'text', name: 'Text Diff Engine', slug: 'text-diff', description: 'Side-by-side and unified git-style visual diff comparator', category: 'analyze', accepts: ['text/*'], produces: ['text/plain'], weight: 'L', automation: { batchable: false, chainable: false, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'FileCode' },
      { id: 'text.json', suite: 'text', name: 'JSON/YAML Studio', slug: 'json-yaml-studio', description: 'Format, validate, query, and convert structured data', category: 'convert', accepts: ['application/json', 'text/yaml'], produces: ['application/json', 'text/yaml'], weight: 'L', automation: { batchable: true, chainable: true, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'Code' }
    ]
  },
  {
    id: 'archive',
    name: 'GS-Archive',
    badge: 'ZIP & TAR',
    description: 'Compress, inspect, extract, and convert multi-file ZIP, TAR, GZ archives client-side with 0 uploads.',
    iconName: 'Archive',
    colorGradient: 'from-amber-600 via-orange-500 to-red-500',
    tools: [
      { id: 'archive.extract', suite: 'archive', name: 'Archive Unpacker', slug: 'archive-unpacker', description: 'Inspect and extract ZIP files in-memory without unzipping to disk', category: 'view', accepts: ['application/zip', 'application/x-zip-compressed'], produces: ['*/*'], weight: 'M', automation: { batchable: true, chainable: true, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'FolderOpen' },
      { id: 'archive.create', suite: 'archive', name: 'ZIP Packager', slug: 'zip-packager', description: 'Batch compress folders and files with custom compression levels', category: 'optimize', accepts: ['*/*'], produces: ['application/zip'], weight: 'M', automation: { batchable: true, chainable: true, params: ['compressionLevel'] }, privacy: { offline: true, uploads: false }, iconName: 'Archive' },
      { id: 'archive.convert', suite: 'archive', name: 'Archive Converter', slug: 'archive-converter', description: 'Re-compress and re-package archive archives client-side', category: 'convert', accepts: ['application/zip'], produces: ['application/zip'], weight: 'M', automation: { batchable: true, chainable: true, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'RefreshCw' }
    ]
  },
  {
    id: 'qr',
    name: 'GS-QR & Barcode',
    badge: 'Scanner & Gen',
    description: 'Generate high-res vector QR codes, WiFi cards, vCards, Barcodes, and live camera scanning.',
    iconName: 'QrCode',
    colorGradient: 'from-violet-600 via-purple-500 to-indigo-500',
    tools: [
      { id: 'qr.generate', suite: 'qr', name: 'Custom QR Studio', slug: 'qr-generator', description: 'Create branded QR codes with colors, logos, and custom error correction', category: 'generate', accepts: ['text/plain'], produces: ['image/svg+xml', 'image/png'], weight: 'L', automation: { batchable: true, chainable: true, params: ['data', 'ecc', 'color'] }, privacy: { offline: true, uploads: false }, iconName: 'QrCode' },
      { id: 'qr.barcode', suite: 'qr', name: 'Barcode Generator', slug: 'barcode-generator', description: 'Generate standard Code128, EAN-13, and UPC vector barcodes', category: 'generate', accepts: ['text/plain'], produces: ['image/svg+xml', 'image/png'], weight: 'L', automation: { batchable: true, chainable: true, params: ['format', 'data'] }, privacy: { offline: true, uploads: false }, iconName: 'Barcode' }
    ]
  },
  {
    id: 'spreadsheet',
    name: 'GS-Spreadsheet',
    badge: 'CSV & XLSX',
    description: 'Fast offline CSV & Excel viewer, formula calculator, delimiter cleaner, and JSON/Markdown converter.',
    iconName: 'Table',
    colorGradient: 'from-emerald-600 via-green-500 to-teal-500',
    tools: [
      { id: 'sheet.viewer', suite: 'spreadsheet', name: 'Grid Viewer & Editor', slug: 'sheet-viewer', description: 'Fast responsive in-browser grid spreadsheet editor with sort and filter', category: 'view', accepts: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], produces: ['text/csv', 'application/json'], weight: 'M', automation: { batchable: false, chainable: false, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'Table' },
      { id: 'sheet.convert', suite: 'spreadsheet', name: 'CSV to JSON/Markdown', slug: 'csv-converter', description: 'Transmute table rows into JSON arrays, Markdown tables, or SQL inserts', category: 'convert', accepts: ['text/csv'], produces: ['application/json', 'text/markdown'], weight: 'L', automation: { batchable: true, chainable: true, params: ['targetFormat'] }, privacy: { offline: true, uploads: false }, iconName: 'FileSpreadsheet' }
    ]
  },
  {
    id: 'ebook',
    name: 'GS-EBook',
    badge: 'EPUB & MOBI',
    description: 'Read EPUB books, inspect chapters, customize typography, and convert TXT/Markdown into formatted e-books.',
    iconName: 'BookOpen',
    colorGradient: 'from-amber-600 via-yellow-500 to-orange-500',
    tools: [
      { id: 'ebook.reader', suite: 'ebook', name: 'EPUB Reader', slug: 'epub-reader', description: 'Clean distraction-free e-book reader with font size, night mode, and chapter navigation', category: 'view', accepts: ['application/epub+zip', 'text/plain'], produces: [], weight: 'M', automation: { batchable: false, chainable: false, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'BookOpen' },
      { id: 'ebook.builder', suite: 'ebook', name: 'EPUB Creator', slug: 'epub-creator', description: 'Bundle Markdown chapters and cover art into a clean EPUB 3.0 publication', category: 'generate', accepts: ['text/markdown', 'text/plain'], produces: ['application/epub+zip'], weight: 'M', automation: { batchable: false, chainable: true, params: ['title', 'author'] }, privacy: { offline: true, uploads: false }, iconName: 'BookPlus' }
    ]
  },
  {
    id: 'presentation',
    name: 'GS-Presentation',
    badge: 'Deck & Slides',
    description: 'Markdown to slide deck renderer, presentation presenter mode, and PDF slide exporter.',
    iconName: 'Presentation',
    colorGradient: 'from-indigo-600 via-blue-500 to-cyan-500',
    tools: [
      { id: 'pres.slides', suite: 'presentation', name: 'Markdown Slides Studio', slug: 'markdown-slides', description: 'Write in simple markdown and project sleek high-res presentations', category: 'generate', accepts: ['text/markdown', 'text/plain'], produces: ['application/pdf', 'image/png'], weight: 'M', automation: { batchable: false, chainable: false, params: ['theme'] }, privacy: { offline: true, uploads: false }, iconName: 'Presentation' },
      { id: 'pres.export', suite: 'presentation', name: 'Deck PDF Exporter', slug: 'deck-pdf-exporter', description: 'Convert slide deck directly into printable vector PDF handouts', category: 'convert', accepts: ['text/markdown'], produces: ['application/pdf'], weight: 'M', automation: { batchable: true, chainable: true, params: [] }, privacy: { offline: true, uploads: false }, iconName: 'FileText' }
    ]
  },
  {
    id: 'security',
    name: 'GS-Security',
    badge: 'AES-256',
    description: 'PBKDF2 password-protected AES-256-GCM file encryption and decryption in Web Crypto.',
    iconName: 'Lock',
    colorGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    tools: [
      { id: 'security.encrypt', suite: 'security', name: 'File Encryptor', slug: 'file-encryptor', description: 'Military-grade in-browser encryption with master password', category: 'secure', accepts: ['*/*'], produces: ['application/octet-stream'], weight: 'M', automation: { batchable: true, chainable: true, params: ['password'] }, privacy: { offline: true, uploads: false }, iconName: 'Lock' }
    ]
  },
  {
    id: 'hash',
    name: 'GS-Hash',
    badge: 'Checksum',
    description: 'Fast SHA-256, SHA-512, SHA-1, and MD5 cryptographic integrity verification.',
    iconName: 'Sliders',
    colorGradient: 'from-teal-600 via-cyan-500 to-blue-500',
    tools: [
      { id: 'hash.checksum', suite: 'hash', name: 'Hash Calculator', slug: 'hash-calculator', description: 'Calculate cryptographic hash digest and compare tamper verification', category: 'analyze', accepts: ['*/*'], produces: ['text/plain'], weight: 'L', automation: { batchable: true, chainable: false, params: ['algorithm'] }, privacy: { offline: true, uploads: false }, iconName: 'Sliders' }
    ]
  },
  {
    id: 'bridge',
    name: 'GS-Bridge',
    badge: 'Transmutation',
    description: 'Cross-domain transmutation pipeline: Video → Audio, Image → PDF, PDF → Image, OCR Text.',
    iconName: 'Sparkles',
    colorGradient: 'from-amber-500 via-rose-500 to-cyan-500',
    tools: [
      { id: 'bridge.transmute', suite: 'bridge', name: 'Cross-Domain Bridge', slug: 'cross-domain-bridge', description: 'Transmute formats across audio, video, pdf, and text domains', category: 'convert', accepts: ['*/*'], produces: ['*/*'], weight: 'H', automation: { batchable: true, chainable: true, params: ['targetMode'] }, privacy: { offline: true, uploads: false }, iconName: 'Sparkles' }
    ]
  }
];

export const getSuiteById = (id: SuiteId): SuiteDef | undefined => {
  return SUITES_REGISTRY.find((s) => s.id === id);
};

export const getAllTools = (): ToolDef[] => {
  return SUITES_REGISTRY.flatMap((s) => s.tools);
};
