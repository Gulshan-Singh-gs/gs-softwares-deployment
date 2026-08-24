import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Image,
  FileText,
  Save,
  X,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CanvasProject, ExportSettings } from '../../lib/canvas/types';
import {
  exportToSvg,
  exportToRaster,
  exportToPdf,
  packageGSCanvasProject
} from '../../lib/canvas/exportEngine';

interface CanvasExportModalProps {
  project: CanvasProject;
  onClose: () => void;
}

export const CanvasExportModal: React.FC<CanvasExportModalProps> = ({
  project,
  onClose
}) => {
  const [format, setFormat] = useState<'svg' | 'png' | 'webp' | 'pdf' | 'gscanvas'>('svg');
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewSvg, setPreviewSvg] = useState<string>('');

  useEffect(() => {
    // Generate live SVG preview
    try {
      const svg = exportToSvg(project, { includeBackground, includeGrid });
      setPreviewSvg(svg);
    } catch (e) {
      console.warn('SVG Preview Error:', e);
    }
  }, [project, includeBackground, includeGrid]);

  const handleCopySvg = () => {
    const svg = exportToSvg(project, { includeBackground, includeGrid });
    navigator.clipboard.writeText(svg);
    setCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const baseName = (project.name || 'sketch').replace(/\s+/g, '_').toLowerCase();

    try {
      if (format === 'svg') {
        const svg = exportToSvg(project, { includeBackground, includeGrid });
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(blob, `${baseName}.svg`);
      } else if (format === 'png' || format === 'webp') {
        const settings: ExportSettings = {
          format,
          scale,
          includeBackground,
          includeGrid,
          quality: 0.95,
          cropToContent: true,
          padding: 40
        };
        const blob = await exportToRaster(project, settings);
        downloadBlob(blob, `${baseName}_${scale}x.${format}`);
      } else if (format === 'pdf') {
        const pdfBytes = await exportToPdf(project, {
          includeBackground,
          includeGrid,
          padding: 40
        });
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        downloadBlob(blob, `${baseName}.pdf`);
      } else if (format === 'gscanvas') {
        const json = packageGSCanvasProject(project);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `${baseName}.gscanvas`);
      }

      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Export Failed:', err);
      alert('Export failed. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="neu-card rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-700/40 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">Export Artwork</h3>
              <p className="text-xs text-slate-400">Standard Vector SVG • High-DPI PNG/WebP • Print-Ready PDF</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              id: 'svg',
              label: 'Vector SVG',
              desc: 'Illustrator / Figma / Web',
              icon: FileCode,
              color: 'from-amber-500 to-orange-600'
            },
            {
              id: 'png',
              label: 'Raster PNG',
              desc: 'High-Res 1x / 2x / 4x',
              icon: Image,
              color: 'from-cyan-500 to-blue-600'
            },
            {
              id: 'pdf',
              label: 'Print PDF',
              desc: 'Vector Document',
              icon: FileText,
              color: 'from-rose-500 to-pink-600'
            },
            {
              id: 'gscanvas',
              label: '.gscanvas',
              desc: 'Native Project Backup',
              icon: Save,
              color: 'from-purple-500 to-indigo-600'
            }
          ].map(fmt => {
            const isSelected = format === fmt.id;
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id as any)}
                className={`p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${fmt.color} text-white shadow-lg scale-102 ring-2 ring-white/30`
                    : 'neu-btn text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <p className="text-xs font-bold leading-tight">{fmt.label}</p>
                <p className="text-[10px] opacity-75">{fmt.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Options & Live Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 flex-1 min-h-0">
          {/* Options Panel */}
          <div className="sm:col-span-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export Settings</h4>

            {/* Resolution Scaling (For PNG/WebP) */}
            {(format === 'png' || format === 'webp') && (
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold">Resolution Multiplier:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setScale(s as any)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        scale === s
                          ? 'bg-cyan-600 text-white shadow'
                          : 'neu-inset text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x ({s === 1 ? '72 DPI' : s === 2 ? '144 DPI' : '300 DPI'})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="neu-card p-3 rounded-2xl space-y-2.5 border border-slate-700/20 text-xs font-semibold text-slate-300">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Include Background Canvas</span>
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={e => setIncludeBackground(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Include Grid Lines / Dots</span>
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={e => setIncludeGrid(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* SVG Quick Copy CTA */}
            {format === 'svg' && (
              <button
                onClick={handleCopySvg}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl neu-btn text-cyan-300 hover:text-white text-xs font-bold transition-all"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'SVG Code Copied!' : 'Copy Raw SVG Code'}</span>
              </button>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="sm:col-span-7 flex flex-col neu-inset rounded-2xl p-3 border border-slate-700/40 relative overflow-hidden min-h-[220px]">
            <div className="flex items-center justify-between pb-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Preview Window</span>
              <span className="font-mono text-cyan-400">{project.strokes.length} vector objects</span>
            </div>

            <div
              className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/60 p-2"
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-3 border-t border-slate-700/30 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Exported completely client-side. Zero server transmission.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl neu-btn text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : `Download ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
