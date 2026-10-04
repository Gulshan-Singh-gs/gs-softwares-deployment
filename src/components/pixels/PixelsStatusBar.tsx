import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { PixelAsset } from './types';
import { formatBytes } from '../../lib/fileUtils';

interface PixelsStatusBarProps {
  asset: PixelAsset | null;
  totalAssets: number;
  isProcessing: boolean;
  savingsPct?: number;
}

export const PixelsStatusBar: React.FC<PixelsStatusBarProps> = ({
  asset,
  totalAssets,
  isProcessing,
  savingsPct = 0
}) => {
  return (
    <footer
      aria-label="Image workstation status"
      className="h-8 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none z-20 shrink-0 font-mono"
    >
      {/* Left: Security & Local Air-gap indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold" title="100% on-device processing. No network payload sent.">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">LOCAL AIR-GAPPED</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>WebWorker / Canvas2D</span>
        </div>
      </div>

      {/* Center: Processing status */}
      <div className="flex items-center gap-2">
        {isProcessing ? (
          <span className="text-amber-400 flex items-center gap-1.5 animate-pulse font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Computing Pipeline...</span>
          </span>
        ) : (
          <span className="text-slate-400 hidden sm:flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Pipeline Ready</span>
          </span>
        )}
      </div>

      {/* Right: Asset Dimensions, format & sizes */}
      <div className="flex items-center gap-3">
        {asset ? (
          <>
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-cyan-400">{asset.width} × {asset.height} px</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-3 text-slate-400">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{formatBytes(asset.originalSize)}</span>
              {asset.processedSize && (
                <>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-400 font-semibold">{formatBytes(asset.processedSize)}</span>
                  {savingsPct > 0 && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                      -{savingsPct}%
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-1 text-slate-400 border-l border-slate-800 pl-3">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{totalAssets} {totalAssets === 1 ? 'Asset' : 'Assets'}</span>
            </div>
          </>
        ) : (
          <span className="text-slate-500">No Asset Loaded</span>
        )}
      </div>
    </footer>
  );
};
