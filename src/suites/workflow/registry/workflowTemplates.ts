// src/suites/workflow/registry/workflowTemplates.ts
import { WorkflowTemplate } from '../store/types';

export const PREBUILT_WORKFLOWS: WorkflowTemplate[] = [
  // --- IMAGE WORKFLOWS ---
  {
    id: 'wf-01-web-image-opt',
    version: '1.0.0',
    name: '01 — Web Image Optimization',
    description: 'Scrub invasive metadata, apply dimension crops, and compress into fast WebP format.',
    category: 'Image',
    tags: ['WebP', 'Compress', 'EXIF', 'Web'],
    inputType: 'Image',
    outputType: 'Image',
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        name: 'Input Image',
        position: { x: 50, y: 150 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Raw Image', dataType: 'Image' }],
        parameters: {},
        status: 'idle'
      },
      {
        id: 'node-2',
        type: 'tool',
        toolId: 'image.exif',
        suite: 'pixels',
        name: 'EXIF Scrubber',
        position: { x: 260, y: 150 },
        inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }],
        outputs: [{ id: 'out', name: 'Scrubbed', dataType: 'Image' }],
        parameters: { stripGPS: true, stripCamera: true },
        status: 'idle',
        localOnly: true
      },
      {
        id: 'node-3',
        type: 'tool',
        toolId: 'image.crop',
        suite: 'pixels',
        name: 'Crop Studio',
        position: { x: 470, y: 150 },
        inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }],
        outputs: [{ id: 'out', name: 'Cropped', dataType: 'Image' }],
        parameters: { aspect: '16:9' },
        status: 'idle',
        localOnly: true
      },
      {
        id: 'node-4',
        type: 'tool',
        toolId: 'image.compressor',
        suite: 'pixels',
        name: 'Image Compressor',
        position: { x: 680, y: 150 },
        inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }],
        outputs: [{ id: 'out', name: 'Compressed WebP', dataType: 'Image' }],
        parameters: { format: 'webp', quality: 80 },
        status: 'idle',
        localOnly: true
      },
      {
        id: 'node-5',
        type: 'output',
        name: 'Export Web Image',
        position: { x: 890, y: 150 },
        inputs: [{ id: 'in', name: 'Optimized Image', dataType: 'Image' }],
        outputs: [],
        parameters: { filenameFormat: '{{name}}-web.webp' },
        status: 'idle'
      }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' },
      { id: 'e4', sourceNodeId: 'node-4', sourcePortId: 'out', targetNodeId: 'node-5', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-02-social-pack',
    version: '1.0.0',
    name: '02 — Social Media Image Pack',
    description: 'Crop to standard social ratios, compress, and produce tailored thumbnails.',
    category: 'Image',
    tags: ['Social', 'Thumbnails', 'Aspect', 'Crop'],
    inputType: 'Image',
    outputType: 'Image',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Source Image', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Image', dataType: 'Image' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'image.crop', suite: 'pixels', name: 'Crop Studio', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Cropped', dataType: 'Image' }], parameters: { aspect: '1:1' }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'image.compressor', suite: 'pixels', name: 'Compressor', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Optimized', dataType: 'Image' }], parameters: { format: 'jpeg', quality: 85 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Social Post', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'Post', dataType: 'Image' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-03-product-photo-clean',
    version: '1.0.0',
    name: '03 — Product Photo Cleanup',
    description: 'Remove background, relight product scene, cast raytraced shadows, and compress.',
    category: 'Image',
    tags: ['E-Commerce', 'Background Removal', 'Studio', 'Shadows'],
    inputType: 'Image',
    outputType: 'Image',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Product Image', position: { x: 50, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Raw', dataType: 'Image' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'image.bgRemove', suite: 'pixels', name: 'Remove Background', position: { x: 260, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Masked', dataType: 'Image' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'image.compressor', suite: 'pixels', name: 'Compressor', position: { x: 480, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Clean', dataType: 'Image' }], parameters: { format: 'png' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Product Export', position: { x: 700, y: 140 }, inputs: [{ id: 'in', name: 'Final', dataType: 'Image' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-07-image-privacy',
    version: '1.0.0',
    name: '07 — Image Privacy Pipeline',
    description: 'Strip location GPS, device headers, author fingerprints, and compress safely.',
    category: 'Image',
    tags: ['Privacy', 'EXIF', 'Sanitize'],
    inputType: 'Image',
    outputType: 'Image',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Photo', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Raw', dataType: 'Image' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'image.exif', suite: 'pixels', name: 'EXIF Scrubber', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Sanitized', dataType: 'Image' }], parameters: { stripGPS: true }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'image.compressor', suite: 'pixels', name: 'PNG/WebP Re-encode', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Image', dataType: 'Image' }], outputs: [{ id: 'out', name: 'Clean', dataType: 'Image' }], parameters: { format: 'webp', quality: 90 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Sanitized Image', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'Image' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },

  // --- PDF WORKFLOWS ---
  {
    id: 'wf-13-pdf-cleanup-compress',
    version: '1.0.0',
    name: '13 — PDF Cleanup & Compression',
    description: 'Organize pages, eliminate redundant streams, and compress vector PDF payloads.',
    category: 'PDF',
    tags: ['PDF', 'Compress', 'Vector', 'Optimize'],
    inputType: 'PDF',
    outputType: 'PDF',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Document PDF', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'PDF', dataType: 'PDF' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'pdf.organizer', suite: 'pdf', name: 'Page Organizer', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Organized', dataType: 'PDF' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'pdf.compressor', suite: 'pdf', name: 'PDF Compressor', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Optimized', dataType: 'PDF' }], parameters: { compressionLevel: 'medium' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Export PDF', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'Final PDF', dataType: 'PDF' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-14-scanned-pdf-ocr',
    version: '1.0.0',
    name: '14 — Scanned PDF → Searchable PDF',
    description: 'Run neural OCR across scanned raster documents and synthesize searchable PDF text.',
    category: 'PDF',
    tags: ['OCR', 'Searchable', 'Tesseract', 'PDF'],
    inputType: 'PDF',
    outputType: 'PDF',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Scanned Document', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'PDF', dataType: 'PDF' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'pdf.ocr', suite: 'pdf', name: 'Neural OCR Engine', position: { x: 290, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Text Stream', dataType: 'Text' }], parameters: { language: 'eng' }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'pdf.compressor', suite: 'pdf', name: 'PDF Compressor', position: { x: 510, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'PDF', dataType: 'PDF' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Searchable Document', position: { x: 730, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-15-pdf-images-zip',
    version: '1.0.0',
    name: '15 — PDF → Images → ZIP',
    description: 'Render high-resolution raster plates from document pages and archive into a clean ZIP.',
    category: 'Cross-Media',
    tags: ['PDF to Image', 'ZIP', 'Bridge'],
    inputType: 'PDF',
    outputType: 'Archive',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Input PDF', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'PDF', dataType: 'PDF' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'transform', name: 'PDF → Images', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Image Plates', dataType: 'Image[]' }], parameters: { dpi: 200 }, status: 'idle' },
      { id: 'node-3', type: 'tool', toolId: 'archive.zip', suite: 'archive', name: 'ZIP Creator', position: { x: 510, y: 140 }, inputs: [{ id: 'in', name: 'Files', dataType: 'Image[]' }], outputs: [{ id: 'out', name: 'ZIP Package', dataType: 'Archive' }], parameters: { compression: 'deflate' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Download ZIP', position: { x: 730, y: 140 }, inputs: [{ id: 'in', name: 'Archive', dataType: 'Archive' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-16-pdf-security',
    version: '1.0.0',
    name: '16 — PDF Security Pipeline',
    description: 'Redact sensitive phrases, stamp confidential watermarks, and seal with AES password.',
    category: 'Security',
    tags: ['Redact', 'Watermark', 'Encrypt', 'PDF'],
    inputType: 'PDF',
    outputType: 'PDF',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Draft PDF', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'PDF', dataType: 'PDF' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'pdf.redact', suite: 'pdf', name: 'Redaction Tool', position: { x: 270, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Redacted', dataType: 'PDF' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'pdf.watermark', suite: 'pdf', name: 'Watermark Stamp', position: { x: 480, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Stamped', dataType: 'PDF' }], parameters: { text: 'CONFIDENTIAL', opacity: 0.3 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'tool', toolId: 'pdf.encrypt', suite: 'pdf', name: 'PDF Encrypt', position: { x: 690, y: 140 }, inputs: [{ id: 'in', name: 'PDF', dataType: 'PDF' }], outputs: [{ id: 'out', name: 'Encrypted', dataType: 'PDF' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-5', type: 'output', name: 'Secured PDF', position: { x: 900, y: 140 }, inputs: [{ id: 'in', name: 'Final', dataType: 'PDF' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' },
      { id: 'e4', sourceNodeId: 'node-4', sourcePortId: 'out', targetNodeId: 'node-5', targetPortId: 'in' }
    ]
  },

  // --- VIDEO WORKFLOWS ---
  {
    id: 'wf-19-social-video-convert',
    version: '1.0.0',
    name: '19 — Social Video Converter',
    description: 'Frame video for 9:16 mobile feeds, adjust playback cadence, and transcode locally.',
    category: 'Video',
    tags: ['Video', 'Mobile', 'Reels', 'Transcode'],
    inputType: 'Video',
    outputType: 'Video',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Video Raw', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Video', dataType: 'Video' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'video.trim', suite: 'video', name: 'Video Trimmer', position: { x: 270, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'Trimmed', dataType: 'Video' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'video.aspect', suite: 'video', name: 'Aspect Framer', position: { x: 480, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'Framed', dataType: 'Video' }], parameters: { ratio: '9:16' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'tool', toolId: 'video.transcoder', suite: 'video', name: 'Transcoder', position: { x: 690, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'MP4', dataType: 'Video' }], parameters: { codec: 'h264' }, status: 'idle', localOnly: true },
      { id: 'node-5', type: 'output', name: 'Export Reels/Shorts', position: { x: 900, y: 140 }, inputs: [{ id: 'in', name: 'Result', dataType: 'Video' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' },
      { id: 'e4', sourceNodeId: 'node-4', sourcePortId: 'out', targetNodeId: 'node-5', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-20-video-to-gif',
    version: '1.0.0',
    name: '20 — Video → Animated GIF',
    description: 'Trim key highlight sequence and encode into optimized web-friendly GIF.',
    category: 'Video',
    tags: ['GIF', 'Animation', 'Video to GIF'],
    inputType: 'Video',
    outputType: 'Image',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Video Clip', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Video', dataType: 'Video' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'video.trim', suite: 'video', name: 'Video Trimmer', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'Segment', dataType: 'Video' }], parameters: { maxDurationSec: 5 }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'video.gif', suite: 'video', name: 'Video → GIF Converter', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'GIF', dataType: 'Image' }], parameters: { fps: 15, quality: 80 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Export Animated GIF', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'GIF', dataType: 'Image' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-21-video-audio-extract',
    version: '1.0.0',
    name: '21 — Video Audio Extraction',
    description: 'Extract raw audio stem from video, normalize loudness, and encode to lossless WAV/MP3.',
    category: 'Cross-Media',
    tags: ['Audio Extractor', 'Transmute', 'Normalizer'],
    inputType: 'Video',
    outputType: 'Audio',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Source Video', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Video', dataType: 'Video' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'video.audioExtract', suite: 'video', name: 'Audio Extractor', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Video', dataType: 'Video' }], outputs: [{ id: 'out', name: 'Audio Track', dataType: 'Audio' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'audio.normalizer', suite: 'audio', name: 'Audio Normalizer', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Audio', dataType: 'Audio' }], outputs: [{ id: 'out', name: 'Normalized Audio', dataType: 'Audio' }], parameters: { targetLUFS: -14 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Export Soundtrack', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'Audio', dataType: 'Audio' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },

  // --- AUDIO WORKFLOWS ---
  {
    id: 'wf-24-podcast-cleanup',
    version: '1.0.0',
    name: '24 — Podcast Audio Mastering',
    description: 'Filter low background hum, equalize gain across speech, and transcode broadcast MP3.',
    category: 'Audio',
    tags: ['Podcast', 'Denoise', 'Mastering', 'Audio'],
    inputType: 'Audio',
    outputType: 'Audio',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Raw Mic Feed', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Audio', dataType: 'Audio' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'audio.noiseGate', suite: 'audio', name: 'Noise Gate & Denoiser', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Audio', dataType: 'Audio' }], outputs: [{ id: 'out', name: 'Cleaned', dataType: 'Audio' }], parameters: { thresholdDb: -40 }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'audio.normalizer', suite: 'audio', name: 'Loudness Normalizer', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Audio', dataType: 'Audio' }], outputs: [{ id: 'out', name: 'Mastered', dataType: 'Audio' }], parameters: { targetLUFS: -16 }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Broadcast Audio', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'Final', dataType: 'Audio' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },

  // --- TEXT / DATA WORKFLOWS ---
  {
    id: 'wf-30-csv-cleanup-json',
    version: '1.0.0',
    name: '30 — CSV Cleanup & JSON Converter',
    description: 'Inspect delimiters, strip whitespace anomalies, filter columns, and export JSON.',
    category: 'Data',
    tags: ['CSV', 'JSON', 'Data Grid', 'Format'],
    inputType: 'CSV',
    outputType: 'JSON',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Raw CSV File', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'CSV', dataType: 'CSV' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'sheets.delimiter', suite: 'spreadsheet', name: 'Delimiter Cleaner', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'CSV', dataType: 'CSV' }], outputs: [{ id: 'out', name: 'Normalized CSV', dataType: 'CSV' }], parameters: { delimiter: ',' }, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'transform', name: 'CSV ➔ JSON Matrix', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'CSV', dataType: 'CSV' }], outputs: [{ id: 'out', name: 'JSON Record', dataType: 'JSON' }], parameters: { pretty: true }, status: 'idle' },
      { id: 'node-4', type: 'output', name: 'Export JSON', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'Data', dataType: 'JSON' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },

  // --- ARCHIVE & SECURITY WORKFLOWS ---
  {
    id: 'wf-35-batch-archive-manifest',
    version: '1.0.0',
    name: '35 — Batch Archive & Hash Manifest',
    description: 'Bundle arbitrary file payload into standard ZIP and compute cryptographic SHA-256 fingerprint.',
    category: 'Archive',
    tags: ['ZIP', 'SHA-256', 'Manifest', 'Security'],
    inputType: 'File[]',
    outputType: 'Archive',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Asset Files', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'Files', dataType: 'File[]' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'archive.zip', suite: 'archive', name: 'ZIP Compiler', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'Files', dataType: 'File[]' }], outputs: [{ id: 'out', name: 'ZIP', dataType: 'Archive' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'hash.calculate', suite: 'hash', name: 'SHA-256 Hasher', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'Archive', dataType: 'Archive' }], outputs: [{ id: 'out', name: 'Hash', dataType: 'Hash' }], parameters: { algo: 'SHA-256' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Signed Archive Package', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'ZIP', dataType: 'Archive' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-39-encrypt-hash',
    version: '1.0.0',
    name: '39 — Encrypt + SHA-256 Checksum',
    description: 'Symmetrically seal payload with AES-256-GCM and generate verification checksum.',
    category: 'Security',
    tags: ['AES-256', 'Encryption', 'SHA-256', 'Security'],
    inputType: 'File',
    outputType: 'File',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Confidential File', position: { x: 60, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'File', dataType: 'File' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'security.encrypt', suite: 'security', name: 'AES-256 Encryptor', position: { x: 280, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [{ id: 'out', name: 'Encrypted', dataType: 'File' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'hash.calculate', suite: 'hash', name: 'SHA-256 Fingerprint', position: { x: 500, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [{ id: 'out', name: 'Digest', dataType: 'Hash' }], parameters: { algo: 'SHA-256' }, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'output', name: 'Export .gsenc Container', position: { x: 720, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' }
    ]
  },
  {
    id: 'wf-40-secure-package',
    version: '1.0.0',
    name: '40 — Complete Secure File Package',
    description: 'Scrub metadata, encrypt with PBKDF2 600k, compute SHA-512, and package into verified ZIP.',
    category: 'Security',
    tags: ['Vault', 'Air-Gapped', 'Complete Pipeline'],
    inputType: 'File',
    outputType: 'Archive',
    nodes: [
      { id: 'node-1', type: 'input', name: 'Source File', position: { x: 50, y: 140 }, inputs: [], outputs: [{ id: 'out', name: 'File', dataType: 'File' }], parameters: {}, status: 'idle' },
      { id: 'node-2', type: 'tool', toolId: 'security.privacy', suite: 'security', name: 'Metadata Scrub', position: { x: 260, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [{ id: 'out', name: 'Sanitized', dataType: 'File' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-3', type: 'tool', toolId: 'security.encrypt', suite: 'security', name: 'AES-256 Encryptor', position: { x: 470, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [{ id: 'out', name: 'Encrypted', dataType: 'File' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-4', type: 'tool', toolId: 'archive.zip', suite: 'archive', name: 'ZIP Creator', position: { x: 680, y: 140 }, inputs: [{ id: 'in', name: 'File', dataType: 'File' }], outputs: [{ id: 'out', name: 'ZIP', dataType: 'Archive' }], parameters: {}, status: 'idle', localOnly: true },
      { id: 'node-5', type: 'output', name: 'Export Vault Archive', position: { x: 890, y: 140 }, inputs: [{ id: 'in', name: 'Archive', dataType: 'Archive' }], outputs: [], parameters: {}, status: 'idle' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node-1', sourcePortId: 'out', targetNodeId: 'node-2', targetPortId: 'in' },
      { id: 'e2', sourceNodeId: 'node-2', sourcePortId: 'out', targetNodeId: 'node-3', targetPortId: 'in' },
      { id: 'e3', sourceNodeId: 'node-3', sourcePortId: 'out', targetNodeId: 'node-4', targetPortId: 'in' },
      { id: 'e4', sourceNodeId: 'node-4', sourcePortId: 'out', targetNodeId: 'node-5', targetPortId: 'in' }
    ]
  }
];
