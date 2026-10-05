// src/suites/qr/components/scanner/QrScannerPanel.tsx
import React, { useRef, useState } from 'react';
import { useQrStore } from '../../store/qrStore';
import {
  Camera,
  Upload,
  ScanText,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const QrScannerPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const scannedImage = useQrStore((s) => s.scannedImage);
  const setScannedImage = useQrStore((s) => s.setScannedImage);
  const ocrRunning = useQrStore((s) => s.ocrRunning);
  const ocrText = useQrStore((s) => s.ocrText);
  const ocrConfidence = useQrStore((s) => s.ocrConfidence);
  const runOcrOnImage = useQrStore((s) => s.runOcrOnImage);
  const addHistoryRecord = useQrStore((s) => s.addHistoryRecord);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setScannedImage(url);

      // Create image object to run OCR
      const img = new Image();
      img.src = url;
      img.onload = () => {
        runOcrOnImage(img);
      };
    }
  };

  const handleCopyText = async () => {
    if (!ocrText) return;
    await navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090E] p-6 overflow-y-auto select-none">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Dropzone & File Ingestion */}
        <div className="p-6 rounded-2xl bg-[#0F121C] border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Document & Code Ingestion</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md">
              Upload photos of receipts, invoices, barcodes, or QR labels to trigger on-device Tesseract WASM extraction.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Document / Photo</span>
          </button>
        </div>

        {/* Results Area */}
        {scannedImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview */}
            <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-zinc-400">Uploaded Document</span>
              <div className="flex-1 min-h-[220px] rounded-lg overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center">
                <img
                  src={scannedImage}
                  alt="Scanned Target"
                  className="max-h-[280px] max-w-full object-contain"
                />
              </div>
            </div>

            {/* Extracted Text & Metadata */}
            <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <ScanText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Extracted OCR Stream</span>
                </span>
                {ocrConfidence > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ocrConfidence}% CONFIDENCE
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-[220px] p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-zinc-200 overflow-y-auto whitespace-pre-wrap select-text">
                {ocrRunning ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Processing on-device WASM OCR...</span>
                  </div>
                ) : (
                  ocrText || 'Awaiting document submission.'
                )}
              </div>

              {ocrText && !ocrRunning && (
                <button
                  onClick={handleCopyText}
                  className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
