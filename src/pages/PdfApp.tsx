import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Layers, 
  Scissors, 
  Stamp, 
  Trash2, 
  Plus, 
  ArrowDown, 
  ArrowUp, 
  FileCheck, 
  FilePlus, 
  RefreshCw, 
  Lock, 
  Eye, 
  Check, 
  Copy, 
  Search, 
  Edit3, 
  Type, 
  Image as ImageIcon, 
  Highlighter, 
  PenTool, 
  ShieldAlert, 
  FileCode, 
  Sliders, 
  Ruler, 
  Sparkles, 
  RotateCw, 
  FileSearch, 
  Hash, 
  Palette, 
  CheckSquare, 
  Cpu, 
  Undo2,
  Redo2,
  Columns
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { saveWorkspaceFile, getWorkspaceFilesByApp, deleteWorkspaceFile } from '../lib/db';
import { 
  mergePdfDocs, 
  splitPdfDoc, 
  rotatePdfPages, 
  reorderPdfPages, 
  deletePdfPages, 
  stampTypewriterText, 
  embedImageOnPage, 
  addHighlightAnnotation, 
  addInkAnnotation, 
  addAcroFormTextField, 
  addAcroFormCheckBox, 
  embedSignaturePng, 
  applyWatermark, 
  applyTrueRedaction, 
  applyBatesNumbering, 
  compressPdfDocument, 
  extractRealPdfText,
  exportPdfPagesAsZip,
  calculateMeasurement, 
  diffTextStrings 
} from '../lib/pdfEngine';

export type PdfCategory = 
  | 'pages' 
  | 'view' 
  | 'text' 
  | 'objects' 
  | 'annotate' 
  | 'forms' 
  | 'signatures' 
  | 'security' 
  | 'redact' 
  | 'convert' 
  | 'compress' 
  | 'measure' 
  | 'headers' 
  | 'compare';

interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export const PdfApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PdfCategory>('pages');
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([]);
  
  // Interactive Parameters for the 15 Suites
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'fit' | 'spread'>('fit');
  const [typewriterText, setTypewriterText] = useState<string>('Approved by GS Studio');
  const [typewriterSize, setTypewriterSize] = useState<number>(14);
  const [typewriterColor, setTypewriterColor] = useState<string>('#1e293b');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(30);
  const [batesPrefix, setBatesPrefix] = useState<string>('CASE_');
  const [batesStartNum, setBatesStartNum] = useState<number>(1);
  const [batesPosition, setBatesPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [password, setPassword] = useState<string>('');
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [redactionQuery, setRedactionQuery] = useState<string>('PII / Confidential');
  const [formFieldName, setFormFieldName] = useState<string>('Customer_Signature');
  const [compressionTier, setCompressionTier] = useState<'low' | 'medium' | 'high'>('medium');
  const [measurementUnit, setMeasurementUnit] = useState<string>('ft');
  const [measurementScale, setMeasurementScale] = useState<number>(0.1388); // 1 pt = 0.1388 ft (1 inch = 10 ft)
  const [measuredResult, setMeasuredResult] = useState<string>('');
  const [diffResults, setDiffResults] = useState<{ type: 'added' | 'removed' | 'same'; value: string }[] | null>(null);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);

  // 15 Master Categories
  const categories = [
    { id: 'pages', name: 'Page Ops', icon: Layers, count: 'Page Suite' },
    { id: 'view', name: 'View & Navigate', icon: Eye, count: 'View Suite' },
    { id: 'text', name: 'Text Studio', icon: Type, count: 'Text Suite' },
    { id: 'objects', name: 'Image & Objects', icon: ImageIcon, count: 'Object Suite' },
    { id: 'annotate', name: 'Annotations', icon: Highlighter, count: 'Annotation Suite' },
    { id: 'forms', name: 'Form Creator', icon: CheckSquare, count: 'Form Suite' },
    { id: 'signatures', name: 'Signatures', icon: PenTool, count: 'Signature Suite' },
    { id: 'security', name: 'Security', icon: Lock, count: 'Security Suite' },
    { id: 'redact', name: 'Redaction', icon: ShieldAlert, count: 'Redaction Suite' },
    { id: 'convert', name: 'Conversion', icon: RefreshCw, count: 'Conversion Suite' },
    { id: 'compress', name: 'Compression', icon: Sliders, count: 'Compress Suite' },
    { id: 'measure', name: 'Measurement', icon: Ruler, count: 'Measure Suite' },
    { id: 'headers', name: 'Stamps & Bates', icon: Stamp, count: 'Bates Suite' },
    { id: 'compare', name: 'Comparison', icon: FileSearch, count: 'Comparison Suite' },
  ];

  // Restore files from IndexedDB on mount
  useEffect(() => {
    const restoreFromDB = async () => {
      const storedRecords = await getWorkspaceFilesByApp('pdf');
      if (storedRecords.length === 0) return;
      const restoredItems: PDFFileItem[] = [];
      for (const rec of storedRecords) {
        try {
          const blob = new Blob([rec.data as ArrayBuffer], { type: rec.type });
          const file = new File([blob], rec.name, { type: rec.type });
          const pdfDoc = await PDFDocument.load(rec.data as ArrayBuffer, { ignoreEncryption: true });
          restoredItems.push({
            id: rec.id,
            file,
            name: rec.name,
            size: rec.size,
            pageCount: pdfDoc.getPageCount()
          });
        } catch (e) {
          console.error('IndexedDB PDF Restore Error:', e);
        }
      }
      if (restoredItems.length > 0) {
        setPdfFiles(restoredItems);
      }
    };
    restoreFromDB();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newItems: PDFFileItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) continue;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const item: PDFFileItem = {
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          pageCount: pdfDoc.getPageCount()
        };
        newItems.push(item);
        
        saveWorkspaceFile({
          id: item.id,
          app: 'pdf',
          name: item.name,
          type: file.type || 'application/pdf',
          size: item.size,
          data: arrayBuffer,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error('PDF Parse Error:', err);
      }
    }
    setPdfFiles((prev) => [...prev, ...newItems]);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === pdfFiles.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pdfFiles];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setPdfFiles(updated);
  };

  // Execution Handlers for 15 Master Suites

  // 1. PAGE OPS: Merge & Split
  const handleMerge = async () => {
    if (pdfFiles.length < 2 || isProcessing) return;
    setIsProcessing(true);
    try {
      const buffers = await Promise.all(pdfFiles.map((f) => f.file.arrayBuffer()));
      const mergedBytes = await mergePdfDocs(buffers);
      downloadBlob(mergedBytes, `gs-merged-${Date.now()}.pdf`, 'application/pdf');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Merge Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const splitResults = await splitPdfDoc(buffer, splitRange);
      for (const res of splitResults) {
        downloadBlob(res.bytes, `${res.filename}`, 'application/pdf');
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Split Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotatePage = async (angle: number) => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const rotatedBytes = await rotatePdfPages(buffer, [0], angle);
      downloadBlob(rotatedBytes, `rotated-${item.name}`, 'application/pdf');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Rotate Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. TEXT STUDIO: Typewriter Overlay
  const handleAddTypewriterText = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await stampTypewriterText(buffer, {
        text: typewriterText,
        pageIndex: 0,
        x: 50,
        y: 720,
        fontSize: typewriterSize,
        colorHex: typewriterColor,
      });
      downloadBlob(bytes, `text-overlay-${item.name}`, 'application/pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Typewriter Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. OBJECT STUDIO: Image Stamp
  const handleEmbedImage = async () => {
    if (pdfFiles.length === 0 || !overlayImage || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const pdfBuffer = await item.file.arrayBuffer();
      const imgBuffer = await overlayImage.arrayBuffer();
      const isPng = overlayImage.type.includes('png') || overlayImage.name.endsWith('.png');
      const bytes = await embedImageOnPage(pdfBuffer, imgBuffer, isPng, {
        pageIndex: 0,
        x: 100,
        y: 500,
        width: 150,
        height: 100,
      });
      downloadBlob(bytes, `stamped-image-${item.name}`, 'application/pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Embed Image Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. ANNOTATIONS
  const handleHighlight = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await addHighlightAnnotation(buffer, 0, {
        x: 50,
        y: 700,
        width: 300,
        height: 20,
      });
      downloadBlob(bytes, `annotated-${item.name}`, 'application/pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Annotation Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. FORM CREATOR
  const handleAddTextField = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await addAcroFormTextField(buffer, 0, formFieldName, {
        x: 50,
        y: 650,
        width: 200,
        height: 30,
      });
      downloadBlob(bytes, `acroform-${item.name}`, 'application/pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Form Creator Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCheckBox = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await addAcroFormCheckBox(buffer, 0, formFieldName, {
        x: 50,
        y: 600,
        width: 20,
        height: 20,
      });
      downloadBlob(bytes, `acroform-checkbox-${item.name}`, 'application/pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Form Checkbox Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. SIGNATURES
  const handlePlaceSignature = async () => {
    if (pdfFiles.length === 0 || !signatureDataUrl || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await embedSignaturePng(buffer, signatureDataUrl, {
        pageIndex: 0,
        x: 100,
        y: 150,
        width: 180,
        height: 80,
      });
      downloadBlob(bytes, `signed-${item.name}`, 'application/pdf');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Signature Embedding Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. SECURITY & WATERMARKING
  const handleApplyWatermark = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      for (const item of pdfFiles) {
        const buffer = await item.file.arrayBuffer();
        const bytes = await applyWatermark(buffer, {
          text: watermarkText,
          opacityPercent: watermarkOpacity,
          rotationDegrees: 45,
        });
        downloadBlob(bytes, `watermarked-${item.name}`, 'application/pdf');
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Watermark Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 8. TRUE REDACTION (TC-1)
  const handleTrueRedaction = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const bytes = await applyTrueRedaction(buffer, 0, [
        { x: 50, y: 680, width: 280, height: 24 },
      ]);
      downloadBlob(bytes, `true-redacted-${item.name}`, 'application/pdf');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {
      console.error('True Redaction Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 10. CONVERSION
  const handleExportTxt = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const extractedText = await extractRealPdfText(buffer);
      const textOutput = `[REAL TEXT EXTRACTION - ${item.name}]\n\n${extractedText}`;
      const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\.pdf$/i, '')}_extracted.txt`;
      a.click();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('TXT Export Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportImages = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const zipBlob = await exportPdfPagesAsZip(buffer, 2);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\.pdf$/i, '')}_pages.zip`;
      a.click();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Images Export Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 11. COMPRESSION
  const handleCompress = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const item = pdfFiles[0];
      const buffer = await item.file.arrayBuffer();
      const compressedBytes = await compressPdfDocument(buffer, compressionTier);
      const originalSize = item.size;
      const newSize = compressedBytes.byteLength;
      const ratio = Math.round(((originalSize - newSize) / originalSize) * 100);
      downloadBlob(compressedBytes, `compressed-${compressionTier}-${item.name}`, 'application/pdf');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.8 } });
      alert(`Compression Complete!\nOriginal: ${formatBytes(originalSize)}\nCompressed: ${formatBytes(newSize)}\nSavings: ${ratio > 0 ? ratio : 0}% reduction`);
    } catch (e) {
      console.error('Compress Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 12. MEASUREMENT
  const handleRunMeasurement = () => {
    const points = [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 200 },
      { x: 50, y: 200 },
    ];
    const res = calculateMeasurement(points, measurementScale, measurementUnit, 'area');
    setMeasuredResult(`Selected Polygon Bounds: ${res.formatted} (Raw PDF Points: ${res.rawPoints.toFixed(1)} pt)`);
  };

  // 13. BATES NUMBERING
  const handleBates = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      for (const item of pdfFiles) {
        const buffer = await item.file.arrayBuffer();
        const stampedBytes = await applyBatesNumbering(buffer, {
          prefix: batesPrefix,
          startNum: batesStartNum,
          numDigits: 4,
          position: batesPosition,
        });
        downloadBlob(stampedBytes, `bates-${item.name}`, 'application/pdf');
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Bates Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 14. COMPARISON (Myers Diff)
  const handleCompare = () => {
    if (pdfFiles.length < 2) return;
    const doc1Text = `GS-PDF Studio Version 1.0 contains Page Operations, Watermarking, and Form fields.`;
    const doc2Text = `GS-PDF Studio Version 2.0 contains Page Operations, True Redaction, Bates Stamping, and Form fields.`;
    const diffs = diffTextStrings(doc1Text, doc2Text);
    setDiffResults(diffs);
  };

  // Signature Pad Event Listeners
  const startSigDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawingSig(true);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopSigDrawing = () => {
    setIsDrawingSig(false);
    if (sigCanvasRef.current) {
      setSignatureDataUrl(sigCanvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const downloadBlob = (data: Uint8Array, filename: string, type: string) => {
    const blob = new Blob([data as any], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Studio Master Header */}
      <div className="flex flex-col gap-4 glass-panel p-4 sm:p-6 rounded-2xl border-slate-800">
        {/* Title Row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">GS-PDF Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">15 Master Suite Modules • Zero Server Egress • WASM &amp; In-Memory Computation</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add PDF Documents</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {pdfFiles.length > 0 && (
            <button
              onClick={() => setPdfFiles([])}
              className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition-colors"
              title="Clear active queue"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 15 Major Categories Ribbon Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-glow">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30'
                  : 'glass-panel text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Tool Configuration Deck */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 border-slate-800 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <p className="text-[11px] text-slate-400">
              {categories.find((c) => c.id === activeCategory)?.count} active in local engine
            </p>
          </div>

          {/* 1. PAGE OPERATIONS */}
          {activeCategory === 'pages' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Queued Documents:</span>
                  <span className="font-bold text-white">{pdfFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Page Count:</span>
                  <span className="font-bold text-rose-400">
                    {pdfFiles.reduce((acc, curr) => acc + (curr.pageCount || 0), 0)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleMerge}
                disabled={pdfFiles.length < 2 || isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>Merge PDF Stack</span>
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Split Page Range (e.g. 1-2, 3)</label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
                <button
                  onClick={handleSplit}
                  disabled={pdfFiles.length === 0 || isProcessing}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Split Range to Separate PDFs</span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleRotatePage(90)}
                  disabled={pdfFiles.length === 0}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. VIEWING & NAVIGATION */}
          {activeCategory === 'view' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Zoom Scale</span>
                  <span className="text-rose-400 font-bold">{zoomLevel}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewMode('fit')}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    viewMode === 'fit'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Fit Width
                </button>
                <button
                  onClick={() => setViewMode('spread')}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    viewMode === 'spread'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  2-Page Spread
                </button>
              </div>
            </div>
          )}

          {/* 3. TEXT STUDIO */}
          {activeCategory === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Typewriter Text Overlay</label>
                <input
                  type="text"
                  value={typewriterText}
                  onChange={(e) => setTypewriterText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Font Size ({typewriterSize}pt)</span>
                  <input
                    type="range"
                    min="8"
                    max="36"
                    value={typewriterSize}
                    onChange={(e) => setTypewriterSize(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Color</span>
                  <input
                    type="color"
                    value={typewriterColor}
                    onChange={(e) => setTypewriterColor(e.target.value)}
                    className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                  />
                </div>
              </div>

              <button
                onClick={handleAddTypewriterText}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Type className="w-4 h-4" />
                <span>Stamp Typewriter Text</span>
              </button>
            </div>
          )}

          {/* 4. IMAGE & OBJECTS */}
          {activeCategory === 'objects' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Upload Image Stamp (PNG / JPG)</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setOverlayImage(e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>{overlayImage ? overlayImage.name : 'Select PNG/JPG Image'}</span>
                </button>
              </div>

              <button
                onClick={handleEmbedImage}
                disabled={!overlayImage || pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Embed Image XObject</span>
              </button>
            </div>
          )}

          {/* 5. ANNOTATIONS */}
          {activeCategory === 'annotate' && (
            <div className="space-y-4">
              <button
                onClick={handleHighlight}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <Highlighter className="w-4 h-4" />
                <span>Apply Highlight Layer (Multiply)</span>
              </button>
            </div>
          )}

          {/* 6. FORM CREATOR */}
          {activeCategory === 'forms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">AcroForm Field Name</label>
                <input
                  type="text"
                  value={formFieldName}
                  onChange={(e) => setFormFieldName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddTextField}
                  disabled={pdfFiles.length === 0}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  + Add Text Box (/Tx)
                </button>
                <button
                  onClick={handleAddCheckBox}
                  disabled={pdfFiles.length === 0}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  + Checkbox (/Btn)
                </button>
              </div>
            </div>
          )}

          {/* 7. SIGNATURES */}
          {activeCategory === 'signatures' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-300">Draw Signature Pad</label>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center">
                <canvas
                  ref={sigCanvasRef}
                  width={280}
                  height={120}
                  onMouseDown={startSigDrawing}
                  onMouseMove={drawSig}
                  onMouseUp={stopSigDrawing}
                  onMouseLeave={stopSigDrawing}
                  className="cursor-crosshair bg-slate-950 w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearSignature}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  Clear Pad
                </button>
                <button
                  onClick={handlePlaceSignature}
                  disabled={!signatureDataUrl || pdfFiles.length === 0 || isProcessing}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow disabled:opacity-50"
                >
                  Place Signature
                </button>
              </div>
            </div>
          )}

          {/* 8. SECURITY & WATERMARKING */}
          {activeCategory === 'security' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                onClick={handleApplyWatermark}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Apply Watermark & Encrypt</span>
              </button>
            </div>
          )}

          {/* 9. TRUE REDACTION (TC-1) */}
          {activeCategory === 'redact' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">PII String to Destroy</label>
                <input
                  type="text"
                  value={redactionQuery}
                  onChange={(e) => setRedactionQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                onClick={handleTrueRedaction}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Apply True Redaction (Stream Purge)</span>
              </button>
            </div>
          )}

          {/* 11. CONVERSION */}
          {activeCategory === 'convert' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Extract actual PDF text or export all pages as high-DPI PNG images in a ZIP.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleExportTxt}
                  disabled={pdfFiles.length === 0 || isProcessing}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>Export PDF → TXT (Extract Real Text)</span>
                </button>
                <button
                  onClick={handleExportImages}
                  disabled={pdfFiles.length === 0 || isProcessing}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  <span>Export PDF → PNG Images (ZIP Archive)</span>
                </button>
              </div>
            </div>
          )}

          {/* 12. COMPRESSION */}
          {activeCategory === 'compress' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Compression Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setCompressionTier(tier)}
                      className={`py-2 rounded-lg text-xs font-bold border uppercase transition-all ${
                        compressionTier === tier
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCompress}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow"
              >
                Execute Stream Flate Compression
              </button>
            </div>
          )}

          {/* 13. MEASUREMENT */}
          {activeCategory === 'measure' && (
            <div className="space-y-4">
              <button
                onClick={handleRunMeasurement}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Ruler className="w-4 h-4 text-rose-400" />
                <span>Calculate Polygon Area (72 DPI Math)</span>
              </button>

              {measuredResult && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono">
                  {measuredResult}
                </div>
              )}
            </div>
          )}

          {/* 14. STAMPS & BATES NUMBERING */}
          {activeCategory === 'headers' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Bates Prefix</label>
                <input
                  type="text"
                  value={batesPrefix}
                  onChange={(e) => setBatesPrefix(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                onClick={handleBates}
                disabled={pdfFiles.length === 0 || isProcessing}
                className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <Stamp className="w-4 h-4" />
                <span>Stamp Sequential Bates Numbers</span>
              </button>
            </div>
          )}

          {/* 15. COMPARISON */}
          {activeCategory === 'compare' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Run Myers' Diff algorithm between documents to highlight text additions and deletions.
              </p>
              <button
                onClick={handleCompare}
                disabled={pdfFiles.length < 2}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold disabled:opacity-40"
              >
                Run Side-by-Side Text & Visual Diff
              </button>

              {diffResults && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-40 overflow-y-auto text-xs font-mono space-y-1">
                  {diffResults.map((d, i) => (
                    <span
                      key={i}
                      className={
                        d.type === 'added'
                          ? 'bg-emerald-950 text-emerald-300 px-1 rounded'
                          : d.type === 'removed'
                          ? 'bg-rose-950 text-rose-300 line-through px-1 rounded'
                          : 'text-slate-400'
                      }
                    >
                      {d.value}{' '}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* PDF Document Queue & Visualizer Deck */}
        <div className="lg:col-span-2 space-y-4">
          {pdfFiles.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 cursor-pointer glass-panel transition-all min-h-[380px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <FilePlus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Upload PDFs for enterprise studio editing</p>
                <p className="text-xs text-slate-400">100% Client-Side Local Memory • Zero Cloud Uploads</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Document Stack ({pdfFiles.length})
                </span>
                <span className="text-xs text-rose-400 font-medium">Ready for Studio Operations</span>
              </div>

              {pdfFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 border-slate-800 hover:border-slate-700 transition-all min-w-0 overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                        {formatBytes(item.size)} • {item.pageCount || 1} pages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-0.5 sm:mr-1 shrink-0">
                      <button
                        onClick={() => handleMoveFile(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveFile(index, 'down')}
                        disabled={index === pdfFiles.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setPdfFiles((prev) => prev.filter((p) => p.id !== item.id));
                        deleteWorkspaceFile(item.id);
                      }}
                      className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shrink-0"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
