import React, { useState } from 'react';
import {
  Upload,
  Clipboard,
  ShieldCheck,
  ImageIcon,
  Sparkles,
  Layers,
  Crop,
  Sliders,
  Scissors
} from 'lucide-react';

interface PixelsEmptyStateProps {
  onSelectFiles: (files: FileList | null) => void;
  onPasteClipboard: () => void;
  onOpenFilePicker: () => void;
}

export const PixelsEmptyState: React.FC<PixelsEmptyStateProps> = ({
  onSelectFiles,
  onPasteClipboard,
  onOpenFilePicker,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onSelectFiles(e.dataTransfer.files);
      }}
      className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-12 transition-all relative overflow-hidden select-none ${
        isDragging
          ? 'bg-cyan-500/10 border-2 border-dashed border-cyan-400'
          : 'bg-slate-950/40'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Workstation Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-[1px] shadow-2xl shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[23px] flex items-center justify-center">
            <ImageIcon className="w-9 h-9 text-cyan-400" />
          </div>
        </div>

        {/* Title & Technical Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy Workstation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            GS-Pixels Workstation
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Professional in-browser image processing. Non-destructive operations, batch pipelines, and local AI segmentation with zero server uploads.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={onOpenFilePicker}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Open Image Files</span>
          </button>

          <button
            onClick={onPasteClipboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Clipboard className="w-4 h-4 text-cyan-400" />
            <span>Paste (Ctrl + V)</span>
          </button>
        </div>

        {/* Feature Capability Highlights */}
        <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-slate-300">Tone & Color</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <Scissors className="w-4 h-4 text-teal-400" />
            <span className="font-medium text-slate-300">AI Cutout</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <Crop className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-300">Crop & Scale</span>
          </div>
        </div>

        {/* Format Compatibility Footer */}
        <p className="text-[10px] text-slate-500 font-mono">
          PNG • JPEG • WebP • AVIF • SVG • BMP • GIF
        </p>
      </div>
    </div>
  );
};
