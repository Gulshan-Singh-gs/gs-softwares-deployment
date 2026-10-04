import type React from 'react';

export type PixelCapability =
  | 'adjust'
  | 'crop'
  | 'resize'
  | 'rotate'
  | 'bgremove'
  | 'watermark'
  | 'privacy'
  | 'palette'
  | 'convert'
  | 'vectorize'
  | 'upscale'
  | 'inpaint'
  | 'dither'
  | 'negative'
  | 'grid'
  | 'diff'
  | 'stitch'
  | 'batch';

export interface PixelAsset {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  originalSize: number;
  processedUrl?: string;
  processedSize?: number;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'done';
}

export interface AdjustmentsState {
  format: 'image/webp' | 'image/jpeg' | 'image/png';
  quality: number;
  scale: number;
  targetWidth: number;
  targetHeight: number;
  aspectLock: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blueTone: number;
  skinTone: number;
  tint: number;
  warmth: number;
  straighten: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  // Crop
  cropAspect: string;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  // AI & Advanced
  bgTolerance: number;
  watermarkText: string;
  watermarkPos: 'bottom-right' | 'center' | 'bottom-left' | 'top-right' | 'tile';
  watermarkOpacity: number;
  watermarkColor: string;
  blurMode: 'pixelate' | 'blackout';
  blurAreaSize: number;
  vectorThreshold: number;
  upscaleFactor: 2 | 4;
  gridRows: number;
  gridCols: number;
  inpaintBoxSize: number;
  ditherAlgorithm: 'floyd-steinberg' | 'atkinson' | 'bayer';
  ditherPalette: '1bit' | 'gameboy' | 'sepia' | 'cmyk';
  diffThreshold: number;
  stitchOrientation: 'horizontal' | 'vertical' | 'grid2x2';
  stitchSpacing: number;
}

export interface ExtractedColorItem {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  name: string;
  category: 'all' | 'dominant' | 'vibrant' | 'light' | 'dark' | 'muted' | 'accent';
}

export interface CapabilityMeta {
  id: PixelCapability;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  badge?: string;
  category: 'basic' | 'creative' | 'ai' | 'security' | 'workflow';
  isLocalOnly: boolean;
}
