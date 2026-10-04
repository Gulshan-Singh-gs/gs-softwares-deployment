import React from 'react';
import {
  Sliders,
  Crop,
  Layers,
  RotateCw,
  Scissors,
  Stamp,
  ShieldAlert,
  Palette,
  FileCheck,
  Code,
  Maximize2,
  Eraser,
  Sparkle,
  Contrast,
  Grid as GridIcon,
  SplitSquareVertical,
  Columns,
  Archive,
  Wand2
} from 'lucide-react';
import { PixelCapability, CapabilityMeta } from './types';

export const CAPABILITIES: CapabilityMeta[] = [
  {
    id: 'adjust',
    name: 'Adjust & Tone',
    shortName: 'Adjust',
    icon: Sliders,
    tagline: 'Exposure, saturation, warmth, tone & curves',
    category: 'basic',
    isLocalOnly: true,
  },
  {
    id: 'crop',
    name: 'Crop & Frame',
    shortName: 'Crop',
    icon: Crop,
    tagline: 'Aspect ratio framing & freeform crop',
    category: 'basic',
    isLocalOnly: true,
  },
  {
    id: 'resize',
    name: 'Resize & Scale',
    shortName: 'Resize',
    icon: Layers,
    tagline: 'Pixel exact & percentage dimension scaling',
    category: 'basic',
    isLocalOnly: true,
  },
  {
    id: 'rotate',
    name: 'Rotate & Flip',
    shortName: 'Rotate',
    icon: RotateCw,
    tagline: '90°/180° rotation & horizontal/vertical mirroring',
    category: 'basic',
    isLocalOnly: true,
  },
  {
    id: 'bgremove',
    name: 'AI BG Removal',
    shortName: 'Remove BG',
    icon: Scissors,
    tagline: 'Edge segmentation & transparent cutout',
    badge: 'AI',
    category: 'ai',
    isLocalOnly: true,
  },
  {
    id: 'watermark',
    name: 'Watermark Stamp',
    shortName: 'Watermark',
    icon: Stamp,
    tagline: 'Copyright stamps & diagonal tiling',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'privacy',
    name: 'Privacy & EXIF',
    shortName: 'Privacy',
    icon: ShieldAlert,
    tagline: 'GPS sanitization & face/plate censorship',
    category: 'security',
    isLocalOnly: true,
  },
  {
    id: 'palette',
    name: 'Color Spectrum',
    shortName: 'Palette',
    icon: Palette,
    tagline: 'Dominant swatches, HEX, CSS & Tailwind tokens',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'convert',
    name: 'Compress & Convert',
    shortName: 'Convert',
    icon: FileCheck,
    tagline: 'WebP, JPEG, PNG transcoding with size savings',
    category: 'workflow',
    isLocalOnly: true,
  },
  {
    id: 'upscale',
    name: 'Smart Resolution',
    shortName: 'Upscale',
    icon: Maximize2,
    tagline: '2x / 4x bicubic detail synthesis',
    badge: 'HD',
    category: 'ai',
    isLocalOnly: true,
  },
  {
    id: 'inpaint',
    name: 'Object Inpaint',
    shortName: 'Inpaint',
    icon: Eraser,
    tagline: 'Boundary harmonic diffusion blemish eraser',
    category: 'ai',
    isLocalOnly: true,
  },
  {
    id: 'vectorize',
    name: 'Vectorize to SVG',
    shortName: 'Vectorize',
    icon: Code,
    tagline: 'Trace raster luminance contours to SVG',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'dither',
    name: 'Retro Dither',
    shortName: 'Dither',
    icon: Sparkle,
    tagline: 'Floyd-Steinberg & Game Boy 1-bit aesthetics',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'negative',
    name: 'Color Inversion',
    shortName: 'Negative',
    icon: Contrast,
    tagline: 'Film negative & channel bitwise inversion',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'grid',
    name: 'Grid Slicer',
    shortName: 'Grid',
    icon: GridIcon,
    tagline: 'Slice into social 3x3 grids & game sprite sheets',
    category: 'workflow',
    isLocalOnly: true,
  },
  {
    id: 'diff',
    name: 'Visual Regression Diff',
    shortName: 'Diff',
    icon: SplitSquareVertical,
    tagline: 'Pixel delta compare across 2 assets',
    category: 'workflow',
    isLocalOnly: true,
  },
  {
    id: 'stitch',
    name: 'Panorama & Stitch',
    shortName: 'Stitch',
    icon: Columns,
    tagline: 'Multi-image strip & collage montage',
    category: 'creative',
    isLocalOnly: true,
  },
  {
    id: 'batch',
    name: 'Batch Studio',
    shortName: 'Batch',
    icon: Archive,
    tagline: 'Multi-asset pipeline & ZIP export',
    category: 'workflow',
    isLocalOnly: true,
  },
];

interface PixelsToolRailProps {
  activeCapability: PixelCapability;
  onSelectCapability: (cap: PixelCapability) => void;
  isCollapsed?: boolean;
}

export const PixelsToolRail: React.FC<PixelsToolRailProps> = ({
  activeCapability,
  onSelectCapability,
}) => {
  return (
    <aside
      aria-label="Image editing tools"
      className="w-16 md:w-20 border-r border-slate-500/20 backdrop-blur-xl bg-slate-900/30 flex flex-col items-center py-3 select-none z-20 shrink-0"
    >
      {/* Mini App Badge */}
      <div className="mb-3 flex flex-col items-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <Wand2 className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-bold tracking-wider text-cyan-400 mt-1 uppercase">GS-PX</span>
      </div>

      <div className="w-8 h-[1px] bg-slate-500/20 mb-2" />

      {/* Tool Rail Navigation List */}
      <nav className="w-full flex-1 overflow-y-auto no-scrollbar space-y-1.5 px-2">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          const isActive = activeCapability === cap.id;

          return (
            <button
              key={cap.id}
              onClick={() => onSelectCapability(cap.id)}
              title={`${cap.name} — ${cap.tagline}`}
              aria-label={cap.name}
              aria-pressed={isActive}
              className={`w-full group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}

              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {cap.badge && (
                  <span className="absolute -top-1.5 -right-2 text-[8px] font-black px-1 py-0.2 rounded bg-cyan-500 text-black leading-tight">
                    {cap.badge}
                  </span>
                )}
              </div>

              <span className={`text-[9px] font-medium tracking-tight mt-1 truncate max-w-full leading-none ${isActive ? 'font-bold text-cyan-300' : 'text-slate-400'}`}>
                {cap.shortName}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
