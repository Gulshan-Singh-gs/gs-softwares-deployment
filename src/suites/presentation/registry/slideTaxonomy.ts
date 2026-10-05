// src/suites/presentation/registry/slideTaxonomy.ts
import { PresentationToolCapability, PresentationDomain } from '../store/types';

export interface DomainMeta {
  id: PresentationDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const SLIDE_DOMAINS: DomainMeta[] = [
  { id: 'slides', name: 'Slide Deck Manager', shortLabel: 'Slides', iconName: 'LayoutGrid', description: 'Thumbnail organizer, slide ordering, duplication, section grouping, slide numbering' },
  { id: 'layout', name: 'Layout Master', shortLabel: 'Layout', iconName: 'LayoutTemplate', description: 'Pre-designed 16:9 responsive archetypes: Title, Content, Two-Column, Quote, Big Stat' },
  { id: 'canvas', name: 'Object Canvas', shortLabel: 'Canvas', iconName: 'Layers', description: 'Figma-style vector surface: click-to-select, drag-to-move, resize handles, rotation' },
  { id: 'geometry', name: 'Geometry & Alignment', shortLabel: 'Geometry', iconName: 'AlignHorizontalDistributeCenter', description: 'Smart snap-to-guides, distribute horizontal/vertical, center on canvas, aspect lock' },
  { id: 'layers', name: 'Layer Tree', shortLabel: 'Layers', iconName: 'ListOrdered', description: 'Z-index control: Bring to front, send backward, lock object, visibility toggle' },
  { id: 'typography', name: 'Typography Studio', shortLabel: 'Type', iconName: 'Type', description: 'Header hierarchy (H1, H2, Body), line-height, kerning, color fills, bullets' },
  { id: 'shapes', name: 'Vector Shapes', shortLabel: 'Shapes', iconName: 'Square', description: 'Rectangles, rounded pills, circles, directional arrows, callouts, borders' },
  { id: 'media', name: 'Images & Media', shortLabel: 'Media', iconName: 'Image', description: 'High-res image insertion, aspect-ratio cropping, opacity, borders, drop shadows' },
  { id: 'tables', name: 'Data Tables', shortLabel: 'Tables', iconName: 'Table', description: 'Structured slide grid tables, column headers, cell padding, zebra stripes' },
  { id: 'charts', name: 'Chart Engine', shortLabel: 'Charts', iconName: 'BarChart2', description: 'Deterministic SVG Bar, Column, Line, and Metric KPI displays linked to values' },
  { id: 'themes', name: 'Theme Palettes', shortLabel: 'Themes', iconName: 'Palette', description: 'Global design system tokens: Midnight Cyan, Obsidian Emerald, Royal Purple, Amber' },
  { id: 'presenter', name: 'Presenter Mode', shortLabel: 'Present', iconName: 'Play', description: '16:9 full-screen deck delivery, dual-screen broadcast sync, speaker notes, live timer' }
];

export const SLIDE_CAPABILITIES: PresentationToolCapability[] = [
  // 01. SLIDES
  { id: 'slides.reorder', name: 'Drag-and-Drop Slide Reordering', domain: 'slides', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant DOM thumbnail deck resequencing' },

  // 02. LAYOUT
  { id: 'layout.archetypes', name: 'Responsive 16:9 Layout Engine', domain: 'layout', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Mathematical container grid supporting 16:9 widescreen formats' },

  // 03. CANVAS
  { id: 'canvas.direct_manipulation', name: 'Direct Canvas Manipulation', domain: 'canvas', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Pixel-exact drag, resize, and positioning on virtual stage' },

  // 04. GEOMETRY
  { id: 'geometry.align', name: 'Smart Snapping & Distribution', domain: 'geometry', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Equal spacing calculation and object bounding alignments' },

  // 05. LAYERS
  { id: 'layers.zindex', name: 'Z-Index Stack Management', domain: 'layers', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Reorder overlapping visual elements with front/back controls' },

  // 06. TYPOGRAPHY
  { id: 'type.rich', name: 'Vector Typography Engine', domain: 'typography', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Sub-pixel text rendering with custom Google Fonts stacks' },

  // 07. SHAPES
  { id: 'shapes.primitives', name: 'SVG Geometric Primitives', domain: 'shapes', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Scalable vector shapes with gradients and strokes' },

  // 08. MEDIA
  { id: 'media.optimizer', name: 'Local In-Memory Image Engine', domain: 'media', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-upload client asset management' },

  // 09. TABLES
  { id: 'tables.grid', name: 'Slide Data Grid', domain: 'tables', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Clean table formatting for metrics and comparisons' },

  // 10. CHARTS
  { id: 'charts.svg', name: 'Deterministic SVG Charts', domain: 'charts', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Reactive slide charts without external server dependencies' },

  // 11. THEMES
  { id: 'themes.system', name: 'Global Token Palette Switcher', domain: 'themes', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant presentation-wide color and font harmonization' },

  // 12. PRESENTER
  { id: 'presenter.fullscreen', name: 'Full-Screen Presentation Stage', domain: 'presenter', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Keyboard-controlled full-screen projection with BroadcastChannel sync' }
];
