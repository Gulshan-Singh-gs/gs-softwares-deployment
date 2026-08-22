import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  Sliders, 
  Trash2, 
  Sparkles, 
  FileCheck, 
  Archive,
  RefreshCw,
  Crop,
  RotateCw,
  Stamp,
  FileSearch,
  Palette,
  Code,
  FileText,
  Layers,
  Wand2,
  FlipHorizontal,
  Contrast,
  Sun,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

type PixelSubTool = 
  | 'studio' 
  | 'compress' 
  | 'convert' 
  | 'resize' 
  | 'crop' 
  | 'rotate' 
  | 'watermark' 
  | 'metadata' 
  | 'palette' 
  | 'base64' 
  | 'img2doc';

interface ImageItem {
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

export const PixelsApp: React.FC = () => {
  const [activeTool, setActiveTool] = useState<PixelSubTool>('studio');
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // Tool Configs
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState<number>(85);
  const [scale, setScale] = useState<number>(100);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [aspectLock, setAspectLock] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [sepia, setSepia] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('GS Softwares');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(40);
  const [base64Output, setBase64Output] = useState<string>('');
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subTools = [
    { id: 'studio', name: 'Photo Studio', icon: Wand2, tagline: 'All-in-One Canvas FX & Overlays' },
    { id: 'compress', name: 'Smart Compressor', icon: Sliders, tagline: 'Lossy & Lossless Space Saver' },
    { id: 'convert', name: 'Universal Converter', icon: RefreshCw, tagline: 'JPG ↔ PNG ↔ WebP' },
    { id: 'resize', name: 'Resize & Fit', icon: Layers, tagline: 'Exact PX or Scale Dimensions' },
    { id: 'crop', name: 'Crop Studio', icon: Crop, tagline: 'Aspect-Ratio Crop & Framing' },
    { id: 'rotate', name: 'Rotate & Flip', icon: RotateCw, tagline: '90°/180° Angle & Mirror' },
    { id: 'watermark', name: 'Watermark Stamper', icon: Stamp, tagline: 'Brand Protection Overlay' },
    { id: 'metadata', name: 'EXIF Scrubber', icon: FileSearch, tagline: 'View & Sanitize Metadata' },
    { id: 'palette', name: 'Palette Extractor', icon: Palette, tagline: 'Extract Dominant Color Themes' },
    { id: 'base64', name: 'Image to Base64', icon: Code, tagline: 'Direct HTML / CSS Data URIs' },
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const item: ImageItem = {
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          previewUrl: url,
          originalSize: file.size,
          width: img.width,
          height: img.height,
          status: 'idle'
        };
        setImages((prev) => [...prev, item]);
        setTargetWidth(img.width);
        setTargetHeight(img.height);

        // Auto extract palette and base64 for single file inspections
        if (images.length === 0) {
          extractColors(img);
          toBase64(file);
        }
      };
      img.src = url;
    });
  };

  const toBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBase64Output(reader.result as string);
    };
  };

  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(img, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    const colors: string[] = [];

    for (let i = 0; i < data.length; i += 400) {
      const r = data[i].toString(16).padStart(2, '0');
      const g = data[i + 1].toString(16).padStart(2, '0');
      const b = data[i + 2].toString(16).padStart(2, '0');
      const hex = `#${r}${g}${b}`;
      if (!colors.includes(hex) && colors.length < 6) {
        colors.push(hex);
      }
    }
    setExtractedPalette(colors);
  };

  const processImage = async (item: ImageItem): Promise<ImageItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (activeTool === 'resize') {
          w = targetWidth;
          h = targetHeight;
        } else if (scale !== 100) {
          w = Math.max(1, Math.round((img.width * scale) / 100));
          h = Math.max(1, Math.round((img.height * scale) / 100));
        }

        const isRotated90 = rotation === 90 || rotation === 270;
        canvas.width = isRotated90 ? h : w;
        canvas.height = isRotated90 ? w : h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(item);
          return;
        }

        // Apply filters
        let filterStr = `brightness(${brightness}%) contrast(${contrast}%)`;
        if (blur > 0) filterStr += ` blur(${blur}px)`;
        if (grayscale) filterStr += ` grayscale(100%)`;
        if (sepia) filterStr += ` sepia(100%)`;
        if (invert) filterStr += ` invert(100%)`;
        ctx.filter = filterStr;

        // Transformation matrix
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();

        // Watermark Overlay
        if (activeTool === 'watermark' || activeTool === 'studio') {
          if (watermarkText.trim()) {
            ctx.save();
            ctx.font = `bold ${Math.max(16, Math.round(canvas.width / 20))}px sans-serif`;
            ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
            ctx.textAlign = 'center';
            ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
            ctx.restore();
          }
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(item);
              return;
            }
            const processedUrl = URL.createObjectURL(blob);
            resolve({
              ...item,
              processedUrl,
              processedSize: blob.size,
              status: 'done'
            });
          },
          format,
          quality / 100
        );
      };
      img.src = item.previewUrl;
    });
  };

  const handleProcessAll = async () => {
    if (images.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const updated: ImageItem[] = [];
    for (const item of images) {
      const res = await processImage(item);
      updated.push(res);
    }

    setImages(updated);
    setIsProcessing(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const extension = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';

    for (const item of images) {
      if (item.processedUrl) {
        const blob = await fetch(item.processedUrl).then((r) => r.blob());
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        zip.file(`${baseName}-processed.${extension}`, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `gs-pixels-${activeTool}-${Date.now()}.zip`;
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">GS-Pixels Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                10 Integrated Tools
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete suite: Resize, Crop, Compress, Rotate, Watermark, EXIF, Palette & Base64</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Add Images</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {images.some((i) => i.status === 'done') && (
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Archive className="w-4 h-4" />
              <span>Export ZIP</span>
            </button>
          )}

          {images.length > 0 && (
            <button
              onClick={() => setImages([])}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tools Ribbon Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-glow">
        {subTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'glass-panel text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Controls + Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Tool Control Deck */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 border-slate-800 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {subTools.find((t) => t.id === activeTool)?.name}
            </h2>
            <p className="text-[11px] text-slate-400">
              {subTools.find((t) => t.id === activeTool)?.tagline}
            </p>
          </div>

          {/* STUDIO / CONVERT / COMPRESS OPTIONS */}
          {(activeTool === 'studio' || activeTool === 'convert' || activeTool === 'compress') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP' },
                    { id: 'image/jpeg', label: 'JPEG' },
                    { id: 'image/png', label: 'PNG' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        format === fmt.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {format !== 'image/png' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Quality</span>
                    <span className="text-indigo-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* RESIZE CONTROLS */}
          {activeTool === 'resize' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROTATE & FLIP CONTROLS */}
          {(activeTool === 'rotate' || activeTool === 'studio') && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300">Rotation & Flipping</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`py-1.5 rounded-lg text-xs font-bold border ${
                      rotation === deg
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setFlipX(!flipX)}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    flipX ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Flip Horiz ↔
                </button>
                <button
                  onClick={() => setFlipY(!flipY)}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    flipY ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Flip Vert ↕
                </button>
              </div>
            </div>
          )}

          {/* WATERMARK CONTROLS */}
          {(activeTool === 'watermark' || activeTool === 'studio') && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                placeholder="Watermark / Copyright..."
              />
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Opacity</span>
                <span className="text-indigo-400 font-bold">{watermarkOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* PALETTE EXTRACTOR */}
          {activeTool === 'palette' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Dominant Palette Extracted</label>
              {extractedPalette.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {extractedPalette.map((hex, i) => (
                    <div key={i} className="space-y-1 text-center">
                      <div className="h-10 rounded-lg shadow-inner border border-white/10" style={{ backgroundColor: hex }} />
                      <span className="text-[10px] font-mono text-slate-300">{hex}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Upload an image to extract HEX color swatches.</p>
              )}
            </div>
          )}

          {/* BASE64 CONVERTER */}
          {activeTool === 'base64' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Data URI Base64</label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(base64Output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <textarea
                readOnly
                value={base64Output}
                className="w-full h-32 p-2 bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400 rounded-lg resize-none"
                placeholder="Data URI will appear here..."
              />
            </div>
          )}

          {/* METADATA SCRUBBER */}
          {activeTool === 'metadata' && (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">EXIF Geolocation:</span>
                  <span className="text-emerald-400 font-bold">Auto-Stripped</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Model & Lens:</span>
                  <span className="text-emerald-400 font-bold">Sanitized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Timestamp:</span>
                  <span className="text-emerald-400 font-bold">Cleaned</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleProcessAll}
            disabled={images.length === 0 || isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply {subTools.find((t) => t.id === activeTool)?.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Gallery / Image Grid */}
        <div className="lg:col-span-2 space-y-4">
          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 cursor-pointer glass-panel transition-all min-h-[380px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Upload images to begin studio processing</p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP, AVIF, GIF • Multiple files supported</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((item) => {
                const savings = item.processedSize
                  ? Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)
                  : 0;

                return (
                  <div key={item.id} className="glass-panel rounded-xl p-4 space-y-3 border-slate-800">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <img
                        src={item.processedUrl || item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                      {item.status === 'done' && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <FileCheck className="w-3 h-3" />
                          <span>{savings > 0 ? `-${savings}%` : 'Ready'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Original: {formatBytes(item.originalSize)}</span>
                        {item.processedSize && (
                          <span className="text-emerald-400 font-semibold">
                            {formatBytes(item.processedSize)}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.processedUrl && (
                      <a
                        href={item.processedUrl}
                        download={`gs-${activeTool}-${item.name}`}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Result</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
