// GS-Canvas Core Vector Math & Data Architecture

export type BrushType = 'pen' | 'marker' | 'pencil' | 'eraser' | 'shape';
export type ToolMode = 'draw' | 'select' | 'node-edit' | 'lasso' | 'pan' | 'eraser' | 'shape';
export type GridType = 'dot' | 'line' | 'isometric' | 'none';
export type ShapeKind = 'freehand' | 'circle' | 'ellipse' | 'rectangle' | 'rounded-rect' | 'triangle' | 'line' | 'arrow';
export type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export interface CanvasPoint {
  x: number;
  y: number;
  pressure?: number; // 0.0 to 1.0 (default 0.5)
  tiltX?: number;
  tiltY?: number;
  time?: number;
}

export interface BezierSegment {
  p0: CanvasPoint; // Start Anchor
  cp1: CanvasPoint; // Control Point 1
  cp2: CanvasPoint; // Control Point 2
  p1: CanvasPoint; // End Anchor
  startWidth?: number;
  endWidth?: number;
}

export interface VectorNode {
  id: string;
  point: CanvasPoint;
  handleIn?: CanvasPoint; // Relative or absolute control handle in
  handleOut?: CanvasPoint; // Relative or absolute control handle out
  isCorner?: boolean;
}

export interface VectorStroke {
  id: string;
  layerId: string;
  brushType: BrushType;
  shapeKind?: ShapeKind;
  color: string;
  opacity: number; // 0.0 to 1.0
  width: number; // base stroke width
  blendMode?: BlendMode;
  cap?: 'round' | 'square' | 'butt';
  join?: 'round' | 'bevel' | 'miter';
  isClosed?: boolean;
  fillColor?: string; // null or transparent if none
  
  // Raw input points before smoothing
  rawPoints: CanvasPoint[];
  
  // Computed smooth Bézier segments for rendering & export
  segments: BezierSegment[];

  // Outline polygon points for perfect-freehand variable-width stroke rendering
  outlinePoints?: [number, number][];
  
  // Editable vector nodes (anchors + handles) for post-stroke editing
  nodes: VectorNode[];
  
  // Bounding box cache in world coordinates
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  
  createdAt: number;
  updatedAt: number;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0.0 to 1.0
  blendMode: BlendMode;
  createdAt: number;
}

export type AspectRatioPreset =
  | 'infinite'
  | 'a4-portrait'
  | 'a4-landscape'
  | 'letter-portrait'
  | 'letter-landscape'
  | '16:9'
  | '9:16'
  | '1:1'
  | '4:3';

export interface CanvasSheet {
  id: string;
  pageNumber: number;
  name: string;
  aspectRatio: AspectRatioPreset;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface CanvasImageItem {
  id: string;
  layerId: string;
  sheetId?: string;
  src: string; // Data URL or Object URL
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // radians
  opacity?: number;
  createdAt: number;
}

export interface CameraViewport {
  x: number; // Pan X in world units
  y: number; // Pan Y in world units
  zoom: number; // Scale factor (e.g. 0.1 to 32.0)
}

export interface CanvasProject {
  id: string;
  name: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  aspectRatio: AspectRatioPreset;
  activeSheetIndex: number;
  sheets: CanvasSheet[];
  camera: CameraViewport;
  grid: {
    type: GridType;
    size: number;
    opacity: number;
    color: string;
  };
  layers: CanvasLayer[];
  strokes: VectorStroke[];
  images?: CanvasImageItem[];
  backgroundColor: string; // Hex, e.g. '#121820' or '#f8fafc'
}

export interface HistoryEntry {
  description: string;
  strokes: VectorStroke[];
  layers: CanvasLayer[];
  sheets?: CanvasSheet[];
  images?: CanvasImageItem[];
  selectedStrokeIds: string[];
}

export interface ExportSettings {
  format: 'svg' | 'png' | 'webp' | 'pdf' | 'gscanvas' | 'jpeg';
  scale: 1 | 2 | 4;
  includeBackground: boolean;
  includeGrid: boolean;
  quality: number; // 0.1 - 1.0 for raster
  cropToContent: boolean;
  padding: number;
  exportTarget?: 'active-sheet' | 'all-sheets' | 'full-viewport';
}
