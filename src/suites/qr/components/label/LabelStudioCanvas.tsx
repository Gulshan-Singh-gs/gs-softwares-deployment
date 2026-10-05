// src/suites/qr/components/label/LabelStudioCanvas.tsx
import React, { useRef, useEffect } from 'react';
import { useQrStore } from '../../store/qrStore';
import { downloadBlob } from '../../../../lib/fileUtils';
import { Tag, Download, Printer, Check, Copy } from 'lucide-react';

export const LabelStudioCanvas: React.FC = () => {
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);

  const labelConfig = useQrStore((s) => s.labelConfig);
  const setLabelConfig = useQrStore((s) => s.setLabelConfig);
  const barcodeValue = useQrStore((s) => s.barcodeValue);

  // Render Label Canvas with product title, barcode, and price
  useEffect(() => {
    const canvas = labelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const widthPx = labelConfig.widthMm * 8; // scale mm to screen pixels
    const heightPx = labelConfig.heightMm * 8;

    canvas.width = widthPx;
    canvas.height = heightPx;

    // Thermal label white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Border line (dashed thermal boundary)
    ctx.strokeStyle = '#D4D4D8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, widthPx - 8, heightPx - 8);

    // Product Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelConfig.title, widthPx / 2, 24);

    // Barcode lines simulation
    const barCount = 50;
    const barW = (widthPx - 40) / barCount;
    const startX = 20;
    const startY = 32;
    const barH = heightPx - 80;

    let hash = 0;
    for (let i = 0; i < barcodeValue.length; i++) {
      hash = (hash << 5) - hash + barcodeValue.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < barCount; i++) {
      const isGuard = i < 2 || (i >= 23 && i <= 25) || i >= barCount - 2;
      const bit = isGuard || Math.sin(i * 11 + hash) > -0.25;
      if (bit) {
        ctx.fillRect(startX + i * barW, startY, barW - 0.5, barH);
      }
    }

    // SKU / Barcode text under bars
    if (labelConfig.includeText) {
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(barcodeValue || 'N/A', widthPx / 2, startY + barH + 16);
    }

    // Price Pill / Tag
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelConfig.price, widthPx / 2, heightPx - 10);
  }, [labelConfig, barcodeValue]);

  const handleDownloadLabel = () => {
    const canvas = labelCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `thermal_label_${labelConfig.sku}.png`);
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#08090E] select-none overflow-y-auto">
      <div className="p-6 rounded-2xl bg-[#0F121C] border border-white/10 shadow-2xl flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 border-b border-white/5 pb-2">
          <span className="flex items-center gap-1.5 text-zinc-200">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal Label Studio</span>
          </span>
          <span>{labelConfig.widthMm}mm × {labelConfig.heightMm}mm</span>
        </div>

        {/* Rendered Label Canvas */}
        <div className="p-2 rounded-xl bg-zinc-800 shadow-inner border border-white/10">
          <canvas ref={labelCanvasRef} className="rounded shadow max-w-full" />
        </div>

        {/* Quick parameters */}
        <div className="grid grid-cols-2 gap-2 w-full text-xs font-mono">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase block mb-1">Product Title</label>
            <input
              type="text"
              value={labelConfig.title}
              onChange={(e) => setLabelConfig({ title: e.target.value })}
              className="w-full bg-[#141724] border border-white/10 rounded px-2 py-1 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase block mb-1">Price Tag</label>
            <input
              type="text"
              value={labelConfig.price}
              onChange={(e) => setLabelConfig({ price: e.target.value })}
              className="w-full bg-[#141724] border border-white/10 rounded px-2 py-1 text-white"
            />
          </div>
        </div>

        {/* Download action */}
        <button
          onClick={handleDownloadLabel}
          className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Thermal Label</span>
        </button>
      </div>
    </div>
  );
};
