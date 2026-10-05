import { ShortcutDefinition } from './types';

/**
 * GS Softwares — Canonical Global & Contextual Shortcut Registry
 * Follows industry standards (VS Code, Figma, Adobe, Office) without shortcut pollution.
 */
export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  // ==========================================
  // LEVEL 1: GLOBAL SHORTCUTS
  // ==========================================
  {
    id: 'app.commandPalette',
    command: 'command.openPalette',
    title: 'Command Palette',
    description: 'Open quick launcher and tool search',
    category: 'Application',
    scope: 'global',
    keys: ['PRIMARY+K'],
    preventDefault: true,
    allowInInputs: true
  },
  {
    id: 'app.help',
    command: 'command.openHelp',
    title: 'Keyboard Shortcuts Help',
    description: 'Show cheat sheet of available shortcuts',
    category: 'Application',
    scope: 'global',
    keys: ['?'],
    preventDefault: true,
    allowInInputs: false
  },
  {
    id: 'app.closeModal',
    command: 'modal.close',
    title: 'Close Modal / Cancel',
    description: 'Close active dialog or cancel operation',
    category: 'Application',
    scope: 'global',
    keys: ['Esc'],
    preventDefault: true,
    allowInInputs: true
  },
  {
    id: 'app.undo',
    command: 'edit.undo',
    title: 'Undo',
    description: 'Revert last action',
    category: 'Editing',
    scope: 'global',
    keys: ['PRIMARY+Z'],
    preventDefault: true
  },
  {
    id: 'app.redo',
    command: 'edit.redo',
    title: 'Redo',
    description: 'Re-apply previously undone action',
    category: 'Editing',
    scope: 'global',
    keys: ['PRIMARY+Shift+Z', 'PRIMARY+Y'],
    preventDefault: true
  },
  {
    id: 'app.open',
    command: 'file.open',
    title: 'Open / Import File',
    description: 'Browse device for file to import',
    category: 'File',
    scope: 'global',
    keys: ['PRIMARY+O'],
    preventDefault: true
  },
  {
    id: 'app.export',
    command: 'file.export',
    title: 'Export / Download Result',
    description: 'Export processed document or image',
    category: 'File',
    scope: 'global',
    keys: ['PRIMARY+E', 'PRIMARY+S'],
    preventDefault: true
  },

  // ==========================================
  // LEVEL 2: SUITE SPECIFIC SHORTCUTS
  // ==========================================

  // GS-Pixels (Image Editing)
  {
    id: 'pixels.crop',
    command: 'pixels.tool.crop',
    title: 'Crop Tool',
    category: 'Tools',
    scope: 'suite',
    suiteId: 'pixels',
    keys: ['C']
  },
  {
    id: 'pixels.select',
    command: 'pixels.tool.select',
    title: 'Select / Pointer',
    category: 'Tools',
    scope: 'suite',
    suiteId: 'pixels',
    keys: ['V']
  },
  {
    id: 'pixels.zoomIn',
    command: 'view.zoomIn',
    title: 'Zoom In',
    category: 'View',
    scope: 'suite',
    suiteId: 'pixels',
    keys: ['PRIMARY++', 'PRIMARY+=']
  },
  {
    id: 'pixels.zoomOut',
    command: 'view.zoomOut',
    title: 'Zoom Out',
    category: 'View',
    scope: 'suite',
    suiteId: 'pixels',
    keys: ['PRIMARY+-']
  },
  {
    id: 'pixels.zoomFit',
    command: 'view.zoomFit',
    title: 'Fit to Screen',
    category: 'View',
    scope: 'suite',
    suiteId: 'pixels',
    keys: ['0']
  },

  // GS-PDF (Documents)
  {
    id: 'pdf.prevPage',
    command: 'pdf.prevPage',
    title: 'Previous Page',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'pdf',
    keys: ['PageUp', 'ArrowLeft']
  },
  {
    id: 'pdf.nextPage',
    command: 'pdf.nextPage',
    title: 'Next Page',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'pdf',
    keys: ['PageDown', 'ArrowRight']
  },
  {
    id: 'pdf.firstPage',
    command: 'pdf.firstPage',
    title: 'First Page',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'pdf',
    keys: ['Home']
  },
  {
    id: 'pdf.lastPage',
    command: 'pdf.lastPage',
    title: 'Last Page',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'pdf',
    keys: ['End']
  },
  {
    id: 'pdf.rotate',
    command: 'pdf.rotatePage',
    title: 'Rotate Page 90°',
    category: 'Editing',
    scope: 'suite',
    suiteId: 'pdf',
    keys: ['R']
  },

  // GS-Video & GS-Audio (Playback & Trimming)
  {
    id: 'media.playPause',
    command: 'media.playPause',
    title: 'Play / Pause',
    category: 'Playback',
    scope: 'suite',
    suiteId: 'video',
    keys: ['Space']
  },
  {
    id: 'media.audioPlayPause',
    command: 'media.playPause',
    title: 'Play / Pause',
    category: 'Playback',
    scope: 'suite',
    suiteId: 'audio',
    keys: ['Space']
  },
  {
    id: 'media.setIn',
    command: 'media.setInPoint',
    title: 'Set In Point',
    category: 'Editing',
    scope: 'suite',
    suiteId: 'video',
    keys: ['I']
  },
  {
    id: 'media.setOut',
    command: 'media.setOutPoint',
    title: 'Set Out Point',
    category: 'Editing',
    scope: 'suite',
    suiteId: 'video',
    keys: ['O']
  },
  {
    id: 'media.slice',
    command: 'media.splitClip',
    title: 'Split / Slice',
    category: 'Editing',
    scope: 'suite',
    suiteId: 'video',
    keys: ['S']
  },

  // GS-Slides (Presentation & Decks)
  {
    id: 'slides.next',
    command: 'slides.nextSlide',
    title: 'Next Slide',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'presentation',
    keys: ['ArrowRight', 'Space', 'PageDown']
  },
  {
    id: 'slides.prev',
    command: 'slides.prevSlide',
    title: 'Previous Slide',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'presentation',
    keys: ['ArrowLeft', 'PageUp']
  },
  {
    id: 'slides.first',
    command: 'slides.firstSlide',
    title: 'First Slide',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'presentation',
    keys: ['Home']
  },
  {
    id: 'slides.last',
    command: 'slides.lastSlide',
    title: 'Last Slide',
    category: 'Navigation',
    scope: 'suite',
    suiteId: 'presentation',
    keys: ['End']
  },

  // GS-Canvas (Vector Board)
  {
    id: 'canvas.select',
    command: 'canvas.tool.select',
    title: 'Select',
    category: 'Tools',
    scope: 'suite',
    suiteId: 'canvas',
    keys: ['V']
  },
  {
    id: 'canvas.brush',
    command: 'canvas.tool.brush',
    title: 'Pen / Freehand',
    category: 'Tools',
    scope: 'suite',
    suiteId: 'canvas',
    keys: ['P', 'B']
  },
  {
    id: 'canvas.eraser',
    command: 'canvas.tool.eraser',
    title: 'Eraser',
    category: 'Tools',
    scope: 'suite',
    suiteId: 'canvas',
    keys: ['E']
  }
];
