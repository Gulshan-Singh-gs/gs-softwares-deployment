import React, { useState, useEffect } from 'react';
import {
  Camera,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Scissors,
  FileText,
  X,
  ExternalLink,
  Layers,
  ZoomIn,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CanvasProject } from '../../lib/canvas/types';
import { exportProjectToRaster } from '../../lib/canvas/exportEngine';

interface CanvasSnapshotModalProps {
  project: CanvasProject;
  onClose: () => void;
  onSendToPixels?: (blob: Blob, name: string) => void;
  onSendToPdf?: (blob: Blob, name: string) => void;
}

export const CanvasSnapshotModal: React.FC<CanvasSnapshotModalProps> = ({
  project,
  onClose,
  onSendToPixels,
  onSendToPdf
}) => {
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [targetScope, setTargetScope] = useState<'active-sheet' | 'full-viewport'>('active-sheet');
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [snapshotBlob, setSnapshotBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Generate Snapshot Blob whenever settings change
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setIsGenerating(true);
      try {
        const activeSheet =
          project.aspectRatio !== 'infinite' && project.sheets && project.sheets[project.activeSheetIndex]
            ? project.sheets[project.activeSheetIndex]
            : undefined;

        const blob = await exportProjectToRaster(project, {
          format,
          scale,
          includeBackground: true,
          includeGrid: false,
          quality: 0.95,
          cropToContent: targetScope === 'full-viewport',
          padding: 32,
          exportTarget: targetScope === 'active-sheet' ? 'active-sheet' : 'full-viewport'
        });

        if (!isCancelled) {
          setSnapshotBlob(blob);
          const url = URL.createObjectURL(blob);
          setSnapshotUrl(url);

          // Get dimensions
          const img = new Image();
          img.onload = () => {
            if (!isCancelled) {
              setPreviewDims({ width: img.width, height: img.height });
            }
          };
          img.src = url;
        }
      } catch (err) {
        console.error('Snapshot render error:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [project, scale, format, targetScope]);

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!snapshotBlob) return;
    try {
      if (navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ [snapshotBlob.type || 'image/png']: snapshotBlob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  // Direct Download
  const handleDownload = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    const cleanName = (project.name || 'canvas-snapshot').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${cleanName}-${scale}x.${format}`;
    a.click();
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
  };

  // Native Web Share API
  const handleShare = async () => {
    if (!snapshotBlob || !navigator.share) return;
    try {
      const file = new File([snapshotBlob], `${project.name}.png`, { type: snapshotBlob.type });
      await navigator.share({
        title: project.name || 'GS-Canvas Artwork',
        text: 'Exported from GS-Canvas Studio',
        files: [file]
      });
    } catch (e) {}
  };

  // Suite Handoff: GS-Pixels
  const handleHandoffPixels = () => {
    if (!snapshotBlob || !onSendToPixels) return;
    onSendToPixels(snapshotBlob, `${project.name || 'canvas'}.png`);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
  };

  // Suite Handoff: GS-PDF
  const handleHandoffPdf = () => {
    if (!snapshotBlob || !onSendToPdf) return;
    onSendToPdf(snapshotBlob, `${project.name || 'canvas'}.png`);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="neu-card p-6 md:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Canvas Snapshot Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Instant Capture
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                100% Client-Side Render • Transfer to GS Suite Tools or Share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Viewport & Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Left 3 Cols: Preview Window */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-2xl neu-inset min-h-[260px] relative overflow-hidden bg-slate-950/80">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-cyan-400">
                <Sparkles className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold">Rendering Crisp Snapshot...</span>
              </div>
            ) : snapshotUrl ? (
              <div className="relative group max-h-[320px] flex items-center justify-center">
                <img
                  src={snapshotUrl}
                  alt="Canvas Snapshot"
                  className="max-h-[300px] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 text-[10px] font-mono border border-slate-700/50 backdrop-blur-md">
                  {previewDims.width} × {previewDims.height} px • {(snapshotBlob?.size ? snapshotBlob.size / 1024 : 0).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Could not render snapshot</div>
            )}
          </div>

          {/* Right 2 Cols: Capture Controls */}
          <div className="md:col-span-2 space-y-4 text-xs">
            
            {/* Scope Selection */}
            {project.aspectRatio !== 'infinite' && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Capture Scope</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTargetScope('active-sheet')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      targetScope === 'active-sheet' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active Sheet
                  </button>
                  <button
                    onClick={() => setTargetScope('full-viewport')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      targetScope === 'full-viewport' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Full Artwork
                  </button>
                </div>
              </div>
            )}

            {/* Resolution Scale */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Resolution Scale</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {([1, 2, 4] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      scale === s ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x {s === 2 ? '(HD)' : s === 4 ? '(Ultra)' : '(Standard)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Format</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {(['png', 'jpeg', 'webp'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`py-1.5 rounded-lg font-bold uppercase text-center transition-all ${
                      format === f ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !snapshotUrl}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  disabled={isGenerating || !snapshotBlob}
                  className="py-2 px-3 rounded-xl neu-btn text-slate-300 hover:text-white font-bold flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Image'}</span>
                </button>

                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <button
                    onClick={handleShare}
                    disabled={isGenerating || !snapshotBlob}
                    className="py-2 px-3 rounded-xl neu-btn text-slate-300 hover:text-white font-bold flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Share</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SUITE WORKFLOW BRIDGES */}
        <div className="pt-4 border-t border-slate-700/30 space-y-3">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Suite Workflow Integrations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Bridge 1: Send to GS-Pixels */}
            {onSendToPixels && (
              <button
                onClick={handleHandoffPixels}
                className="p-3.5 rounded-2xl neu-inset hover:border-cyan-500/40 border border-slate-800 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Edit in GS-Pixels
                    </p>
                    <p className="text-[10px] text-slate-400">
                      AI upscale, crop, watermark, color filters & compression
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            )}

            {/* Bridge 2: Send to GS-PDF */}
            {onSendToPdf && (
              <button
                onClick={handleHandoffPdf}
                className="p-3.5 rounded-2xl neu-inset hover:border-rose-500/40 border border-slate-800 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Convert to GS-PDF
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Add to PDF document stack, annotate, merge or sign
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
