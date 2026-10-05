// src/suites/presentation/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant JS/DOM/Canvas/SVG rendering
  | 'CLASS_B_LOCAL_COMPUTE'        // Local Worker, PDF vector export, image compression
  | 'CLASS_C_AI_REMOTE'            // Remote cloud
  | 'CLASS_D_HYBRID';

export type PresentationDomain =
  | 'slides'       // 01: Slide organizer, thumbnails, reorder, duplicate, add/delete, sections
  | 'layout'       // 02: Layout templates (Title, Two-column, Full image, Quote, Comparison, Stat)
  | 'canvas'       // 03: Direct manipulation, select, move, resize, rotate, multi-select
  | 'geometry'     // 04: Alignment (Left/Center/Right/Top/Middle/Bottom), distribution, snap
  | 'layers'       // 05: Layer tree, bring to front/back, group/ungroup, lock, visibility
  | 'typography'   // 06: Font family, size, line-height, text color, alignment, bullet styling
  | 'shapes'       // 07: Vector primitives (Rectangle, Circle, Star, Arrow, Connectors), stroke/fill
  | 'media'        // 08: Image crop, opacity, border-radius, video/audio embeds
  | 'tables'       // 09: Structured presentation tables with header rows, cell borders
  | 'charts'       // 10: Bar, Column, Line, Donut charts with live data editor
  | 'themes'       // 11: Color palettes (Primary, Secondary, Background, Text) and theme switcher
  | 'presenter';   // 12: Dual-display / Full-screen Presenter Mode, timer, speaker notes, pointer

export interface PresentationToolCapability {
  id: string;
  name: string;
  domain: PresentationDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export type SlideObjectType =
  | 'text'
  | 'shape'
  | 'image'
  | 'table'
  | 'chart';

export interface SlideObject {
  id: string;
  type: SlideObjectType;
  x: number;          // % or px on 960x540 / 1920x1080 canvas
  y: number;
  width: number;
  height: number;
  rotation?: number;  // degrees
  content: string;    // text or image URL
  style: {
    color?: string;
    bgColor?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    opacity?: number;
    shapeType?: 'rectangle' | 'circle' | 'pill' | 'arrow';
  };
  locked?: boolean;
}

export type EditorMode = 'edit' | 'markdown' | 'outline' | 'present';

export interface SlideData {
  id: string;
  title: string;
  layout: 'title' | 'content' | 'two_column' | 'quote' | 'stat' | 'blank';
  background: string; // solid color or gradient
  objects: SlideObject[];
  notes: string;
  markdown?: string;
  hidden?: boolean;
}

export type SlideTheme = 'midnight_cyan' | 'obsidian_emerald' | 'royal_purple' | 'sunset_amber';
