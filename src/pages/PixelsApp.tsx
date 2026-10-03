import React, { useState, useRef, useEffect } from 'react';
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
  Check,
  Undo2,
  Redo2,
  ChevronDown,
  FileJson,
  Move,
  Pipette,
  Clipboard,
  Filter,
  Share2
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { saveWorkspaceFile, getWorkspaceFilesByApp, deleteWorkspaceFile } from '../lib/db';

type PixelSubTool = 
  | 'studio' 
  | 'compress' 
  | 'resize' 
  | 'crop' 
  | 'rotate' 
  | 'metadata' 
  | 'palette' 
  | 'base64';

export interface ExtractedColorItem {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  name: string;
  category: 'all' | 'dominant' | 'vibrant' | 'light' | 'dark' | 'muted' | 'accent';
}

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
  const [saturation, setSaturation] = useState<number>(100);
  const [blueTone, setBlueTone] = useState<number>(0);
  const [skinTone, setSkinTone] = useState<number>(0);
  const [tint, setTint] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(0);
  const [straighten, setStraighten] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [sepia, setSepia] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [toolSearch, setToolSearch] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  
  // Advanced Palette Extractor State
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [detailedColors, setDetailedColors] = useState<ExtractedColorItem[]>([]);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'dominant' | 'vibrant' | 'light' | 'dark' | 'muted' | 'accent'>('all');
  const [paletteCountLimit, setPaletteCountLimit] = useState<number>(32);
  const [pickedEyedropperColor, setPickedEyedropperColor] = useState<string | null>(null);

  const [paletteMenuOpen, setPaletteMenuOpen] = useState<boolean>(false);
  const [paletteToast, setPaletteToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Multi-Image & Drag-Drop State
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Crop Studio State
  const [cropAspect, setCropAspect] = useState<string>('free');
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropW, setCropW] = useState<number>(100);
  const [cropH, setCropH] = useState<number>(100);


  // Robust Vibration API Helper
  const triggerVibrate = (pattern: number | number[]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      // Ignore if user context restricts vibration
    }
  };

  // Undo / Redo History Stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isApplyingUndoRedo = useRef<boolean>(false);

  // Automated History Snapshot Tracker
  useEffect(() => {
    if (isApplyingUndoRedo.current) {
      isApplyingUndoRedo.current = false;
      return;
    }

    const snapshot = {
      format,
      quality,
      scale,
      targetWidth,
      targetHeight,
      brightness,
      contrast,
      saturation,
      blueTone,
      skinTone,
      tint,
      warmth,
      straighten,
      blur,
      grayscale,
      sepia,
      invert,
      rotation,
      flipX,
      flipY,
      cropAspect,
      cropX,
      cropY,
      cropW,
      cropH
    };

    const timeout = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const last = newHistory[newHistory.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
          return prev;
        }
        const updated = [...newHistory, snapshot].slice(-50);
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    format,
    quality,
    scale,
    targetWidth,
    targetHeight,
    brightness,
    contrast,
    saturation,
    blueTone,
    skinTone,
    tint,
    warmth,
    straighten,
    blur,
    grayscale,
    sepia,
    invert,
    rotation,
    flipX,
    flipY,
    cropAspect,
    cropX,
    cropY,
    cropW,
    cropH
  ]);

  const applySnapshot = (snap: any) => {
    if (!snap) return;
    isApplyingUndoRedo.current = true;
    if (snap.format) setFormat(snap.format);
    if (snap.quality !== undefined) setQuality(snap.quality);
    if (snap.scale !== undefined) setScale(snap.scale);
    if (snap.targetWidth !== undefined) setTargetWidth(snap.targetWidth);
    if (snap.targetHeight !== undefined) setTargetHeight(snap.targetHeight);
    if (snap.brightness !== undefined) setBrightness(snap.brightness);
    if (snap.contrast !== undefined) setContrast(snap.contrast);
    if (snap.saturation !== undefined) setSaturation(snap.saturation);
    if (snap.blueTone !== undefined) setBlueTone(snap.blueTone);
    if (snap.skinTone !== undefined) setSkinTone(snap.skinTone);
    if (snap.tint !== undefined) setTint(snap.tint);
    if (snap.warmth !== undefined) setWarmth(snap.warmth);
    if (snap.straighten !== undefined) setStraighten(snap.straighten);
    if (snap.blur !== undefined) setBlur(snap.blur);
    if (snap.grayscale !== undefined) setGrayscale(snap.grayscale);
    if (snap.sepia !== undefined) setSepia(snap.sepia);
    if (snap.invert !== undefined) setInvert(snap.invert);
    if (snap.rotation !== undefined) setRotation(snap.rotation);
    if (snap.flipX !== undefined) setFlipX(snap.flipX);
    if (snap.flipY !== undefined) setFlipY(snap.flipY);
    if (snap.cropAspect !== undefined) setCropAspect(snap.cropAspect);
    if (snap.cropX !== undefined) setCropX(snap.cropX);
    if (snap.cropY !== undefined) setCropY(snap.cropY);
    if (snap.cropW !== undefined) setCropW(snap.cropW);
    if (snap.cropH !== undefined) setCropH(snap.cropH);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prev = history[prevIndex];
      setHistoryIndex(prevIndex);
      applySnapshot(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const next = history[nextIndex];
      setHistoryIndex(nextIndex);
      applySnapshot(next);
    }
  };

  // Keyboard Hotkeys (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subTools = [
    { id: 'studio', name: 'Photo Studio', icon: Wand2, tagline: 'All-in-One Canvas FX & Overlays' },
    { id: 'compress', name: 'Compress & Convert', icon: Sliders, tagline: 'JPG ↔ PNG ↔ WebP Format & Quality' },
    { id: 'resize', name: 'Resize & Fit', icon: Layers, tagline: 'Exact PX or Scale Dimensions' },
    { id: 'crop', name: 'Crop Studio', icon: Crop, tagline: 'Aspect-Ratio Crop & Framing' },
    { id: 'rotate', name: 'Rotate & Flip', icon: RotateCw, tagline: '90°/180° Angle & Mirror' },
    { id: 'metadata', name: 'EXIF Scrubber', icon: FileSearch, tagline: 'Remove Privacy Metadata' },
    { id: 'palette', name: 'Color Extractor', icon: Palette, tagline: 'Extract Dominant Palette' },
    { id: 'base64', name: 'Base64 Encoder', icon: Code, tagline: 'Convert Image to Data URI' },
  ];
  
  // Restore image workspace files from IndexedDB on refresh
  useEffect(() => {
    const restoreFromDB = async () => {
      const stored = await getWorkspaceFilesByApp('pixels');
      if (stored.length === 0) return;
      const restoredItems: ImageItem[] = [];
      for (const rec of stored) {
        try {
          const blob = new Blob([rec.data as ArrayBuffer], { type: rec.type });
          const file = new File([blob], rec.name, { type: rec.type });
          const url = URL.createObjectURL(file);
          const img = new Image();
          await new Promise((res) => {
            img.onload = () => {
              restoredItems.push({
                id: rec.id,
                file,
                name: rec.name,
                previewUrl: url,
                originalSize: rec.size,
                width: img.width,
                height: img.height,
                status: 'idle'
              });
              res(null);
            };
            img.src = url;
          });
        } catch (e) {
          console.error('IndexedDB Pixels Restore Error:', e);
        }
      }
      if (restoredItems.length > 0) {
        setImages(restoredItems);
      }
    };
    restoreFromDB();
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileList.length === 0) return;

    const newItems: ImageItem[] = [];
    let loadedCount = 0;

    fileList.forEach((file) => {
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
        newItems.push(item);
        loadedCount++;

        file.arrayBuffer().then((buf) => {
          saveWorkspaceFile({
            id: item.id,
            app: 'pixels',
            name: item.name,
            type: file.type || 'image/png',
            size: item.originalSize,
            data: buf,
            timestamp: Date.now()
          });
        });

        if (loadedCount === fileList.length) {
          setImages((prev) => {
            const next = [...prev, ...newItems];
            if (!selectedImageId && next.length > 0) {
              setSelectedImageId(next[0].id);
            }
            return next;
          });
          if (newItems.length > 0) {
            setTargetWidth(newItems[0].width);
            setTargetHeight(newItems[0].height);
            extractColors(img);
            toBase64(fileList[0]);
          }
        }
      };
      img.src = url;
    });
  };

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
    if (selectedImageId === id) {
      const remaining = images.filter((item) => item.id !== id);
      setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const toBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBase64Output(reader.result as string);
    };
  };

  // GLOBAL CLIPBOARD PASTE LISTENER (Ctrl + V anywhere)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        handleFiles(pastedFiles as any);
        setPaletteToast(`Pasted ${pastedFiles.length} image(s) from clipboard!`);
        setTimeout(() => setPaletteToast(null), 2500);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // One-Click Mobile / Button Clipboard Paste
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        const files: File[] = [];
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const ext = type.split('/')[1] || 'png';
              files.push(new File([blob], `pasted-${Date.now()}.${ext}`, { type }));
            }
          }
        }
        if (files.length > 0) {
          handleFiles(files as any);
          setPaletteToast(`Pasted ${files.length} image(s) from clipboard!`);
          setTimeout(() => setPaletteToast(null), 2500);
          return;
        }
      }
      setPaletteToast('Please press Ctrl+V to paste your image.');
      setTimeout(() => setPaletteToast(null), 2500);
    } catch (err) {
      setPaletteToast('Press Ctrl+V to paste your image from clipboard.');
      setTimeout(() => setPaletteToast(null), 2500);
    }
  };

  // Live Eyedropper Tool
  const handlePickEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res && res.sRGBHex) {
          const hex = res.sRGBHex.toUpperCase();
          setPickedEyedropperColor(hex);
          navigator.clipboard.writeText(hex);
          setPaletteToast(`Sampled & Copied ${hex}!`);
          setTimeout(() => setPaletteToast(null), 2500);
        }
      } catch (e) {}
    } else {
      setPaletteToast('Click any swatch card below to copy its color.');
      setTimeout(() => setPaletteToast(null), 2500);
    }
  };

  // Color Utility Helpers
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const getColorName = (h: number, s: number, l: number): string => {
    if (l > 92) return 'Pure White';
    if (l < 9) return 'Midnight Black';
    if (s < 12) {
      if (l < 30) return 'Charcoal Grey';
      if (l < 65) return 'Slate Grey';
      return 'Silver Mist';
    }
    if (h >= 345 || h < 15) return l > 65 ? 'Pastel Rose' : l < 35 ? 'Deep Crimson' : 'Vibrant Red';
    if (h >= 15 && h < 45) return l > 65 ? 'Peach Coral' : l < 35 ? 'Burnt Sienna' : 'Sunset Orange';
    if (h >= 45 && h < 70) return l > 65 ? 'Cream Gold' : l < 35 ? 'Bronze Olive' : 'Amber Gold';
    if (h >= 70 && h < 150) return l > 65 ? 'Lime Mint' : l < 35 ? 'Forest Emerald' : 'Emerald Green';
    if (h >= 150 && h < 195) return l > 65 ? 'Ice Cyan' : l < 35 ? 'Deep Teal' : 'Electric Cyan';
    if (h >= 195 && h < 255) return l > 65 ? 'Sky Azure' : l < 35 ? 'Navy Midnight' : 'Electric Blue';
    if (h >= 255 && h < 290) return l > 65 ? 'Lavender' : l < 35 ? 'Deep Indigo' : 'Royal Indigo';
    if (h >= 290 && h < 345) return l > 65 ? 'Blush Violet' : l < 35 ? 'Dark Plum' : 'Magenta Purple';
    return 'Vibrant Shade';
  };

  const categorizeColor = (h: number, s: number, l: number, percentage: number): ExtractedColorItem['category'] => {
    if (percentage >= 14) return 'dominant';
    if (s >= 55 && l >= 35 && l <= 72) return 'vibrant';
    if (l >= 72) return 'light';
    if (l <= 25) return 'dark';
    if (s < 30) return 'muted';
    return 'accent';
  };

  // FULL COMPREHENSIVE PALETTE EXTRACTOR ENGINE
  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High sample fidelity
    const width = Math.min(img.width || 320, 320);
    const height = Math.min(img.height || 320, 320);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};
    let totalValidPixels = 0;

    // Fine-grained quantization bin step
    const binStep = 12;
    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      if (a < 128) continue;

      totalValidPixels++;
      const r = Math.min(255, Math.max(0, Math.round(imgData[i] / binStep) * binStep));
      const g = Math.min(255, Math.max(0, Math.round(imgData[i + 1] / binStep) * binStep));
      const b = Math.min(255, Math.max(0, Math.round(imgData[i + 2] / binStep) * binStep));

      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      if (!colorCounts[hex]) {
        colorCounts[hex] = { count: 0, r, g, b };
      }
      colorCounts[hex].count++;
    }

    if (totalValidPixels === 0) return;

    const sorted = Object.entries(colorCounts).sort((a, b) => b[1].count - a[1].count);

    // Delta-E / Euclidean distance clustering
    const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
      return Math.sqrt(Math.pow(r1 - r2, 2) * 0.3 + Math.pow(g1 - g2, 2) * 0.59 + Math.pow(b1 - b2, 2) * 0.11);
    };

    const distinctList: ExtractedColorItem[] = [];
    const minThreshold = 18;

    for (const [hex, data] of sorted) {
      const isFarEnough = distinctList.every(
        (c) => colorDistance(c.rgb.r, c.rgb.g, c.rgb.b, data.r, data.g, data.b) > minThreshold
      );

      if (isFarEnough) {
        const hsl = rgbToHsl(data.r, data.g, data.b);
        const percentage = Math.max(0.1, Math.round((data.count / totalValidPixels) * 1000) / 10);
        const name = getColorName(hsl.h, hsl.s, hsl.l);
        const category = categorizeColor(hsl.h, hsl.s, hsl.l, percentage);

        distinctList.push({
          hex,
          rgb: { r: data.r, g: data.g, b: data.b },
          hsl,
          percentage,
          name,
          category
        });
      }

      if (distinctList.length >= 48) break;
    }

    // Fallback fill if image has very few colors
    if (distinctList.length < 12) {
      for (const [hex, data] of sorted) {
        if (!distinctList.some((c) => c.hex === hex)) {
          const hsl = rgbToHsl(data.r, data.g, data.b);
          const percentage = Math.max(0.1, Math.round((data.count / totalValidPixels) * 1000) / 10);
          const name = getColorName(hsl.h, hsl.s, hsl.l);
          const category = categorizeColor(hsl.h, hsl.s, hsl.l, percentage);

          distinctList.push({
            hex,
            rgb: { r: data.r, g: data.g, b: data.b },
            hsl,
            percentage,
            name,
            category
          });
        }
        if (distinctList.length >= 32) break;
      }
    }

    setDetailedColors(distinctList);
    setExtractedPalette(distinctList.map((c) => c.hex));
  };

  // Export Palette as PNG Swatch Card
  const handleExportPaletteImage = () => {
    if (detailedColors.length === 0) return;
    const canvas = document.createElement('canvas');
    const cols = Math.min(detailedColors.length, 6);
    const rows = Math.ceil(detailedColors.length / cols);
    const cellW = 140;
    const cellH = 150;
    canvas.width = cols * cellW + 40;
    canvas.height = rows * cellH + 110;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Title
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('GS-Pixels Color Palette', 24, 44);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`${detailedColors.length} Extracted Swatches • ${images[0]?.name || 'Artwork'}`, 24, 68);

    // Render Swatches
    detailedColors.forEach((color, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = 20 + colIdx * cellW;
      const y = 86 + rowIdx * cellH;

      // Swatch Rect
      ctx.fillStyle = color.hex;
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x + 6, y + 6, cellW - 12, cellH - 52, 12);
      } else {
        ctx.rect(x + 6, y + 6, cellW - 12, cellH - 52);
      }
      ctx.fill();

      // HEX Code
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(color.hex, x + 10, y + cellH - 24);

      // Percentage & Name
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${color.percentage}% • ${color.name}`, x + 10, y + cellH - 10);
    });

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `palette-${(images[0]?.name || 'swatches').replace(/[^a-z0-9]/gi, '-')}.png`;
    a.click();
    setPaletteToast('Downloaded PNG Palette Card!');
    setTimeout(() => setPaletteToast(null), 2500);
  };

  // Contextual Tool Paste & Dropzone Definitions
  const getToolPasteContext = () => {
    switch (activeTool) {
      case 'palette':
        return {
          badge: 'Color Extractor Studio',
          title: 'Paste or Drop Image to Extract Full Color Spectrum',
          desc: 'Extracts 32+ dominant, vibrant, light, and pastel color swatches with HEX, RGB, HSL, CSS & Tailwind export',
          icon: Palette,
          gradient: 'from-cyan-600 to-blue-600'
        };
      case 'crop':
        return {
          badge: 'Crop Studio',
          title: 'Paste or Drop Image for Aspect-Ratio Framing',
          desc: 'Supports 16:9, 1:1, 4:3, 9:16, Freeform framing, and pixel-perfect cropping',
          icon: Crop,
          gradient: 'from-purple-600 to-indigo-600'
        };
      case 'compress':
        return {
          badge: 'Compress & Convert',
          title: 'Paste or Drop Image to Compress & Convert Format',
          desc: 'Lossless & lossy compression across WebP, JPEG, PNG with live size savings',
          icon: Sliders,
          gradient: 'from-emerald-600 to-teal-600'
        };
      case 'resize':
        return {
          badge: 'Resize & Fit',
          title: 'Paste or Drop Image to Scale & Resize Dimensions',
          desc: 'Exact width/height scaling with aspect-ratio lock and batch processing',
          icon: Layers,
          gradient: 'from-blue-600 to-cyan-600'
        };
      case 'rotate':
        return {
          badge: 'Rotate & Flip',
          title: 'Paste or Drop Image to Rotate & Mirror',
          desc: '90°/180°/270° orientation adjustments and horizontal/vertical flipping',
          icon: RotateCw,
          gradient: 'from-rose-600 to-pink-600'
        };
      case 'metadata':
        return {
          badge: 'EXIF Scrubber',
          title: 'Paste or Drop Image to Wipe Privacy Metadata',
          desc: 'Sanitize privacy metadata, GPS geolocation, device details, and timestamps',
          icon: FileSearch,
          gradient: 'from-teal-600 to-emerald-600'
        };
      case 'base64':
        return {
          badge: 'Base64 Encoder',
          title: 'Paste or Drop Image for Data URI Conversion',
          desc: 'Instant Data URI Base64 encoding with 1-click code copying',
          icon: Code,
          gradient: 'from-cyan-600 to-indigo-600'
        };
      case 'studio':
      default:
        return {
          badge: 'Photo Studio',
          title: 'Paste or Drop Image for All-in-One FX & Overlays',
          desc: 'Multi-layer contrast, brightness, sepia, invert, blur, and live studio canvas',
          icon: Wand2,
          gradient: 'from-cyan-600 via-teal-500 to-emerald-500'
        };
    }
  };

  useEffect(() => {
    if (images.length === 0) return;
    const targetItem = images.find((i) => i.id === selectedImageId) || images[0];
    if (targetItem) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => extractColors(img);
      img.src = targetItem.processedUrl || targetItem.previewUrl;
      if (targetItem.file) {
        toBase64(targetItem.file);
      }
    }
  }, [selectedImageId, activeTool, images]);

  const processImage = async (item: ImageItem): Promise<ImageItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (activeTool === 'crop' || cropW < 100 || cropH < 100 || cropX > 0 || cropY > 0) {
          sx = (cropX / 100) * img.width;
          sy = (cropY / 100) * img.height;
          sw = (cropW / 100) * img.width;
          sh = (cropH / 100) * img.height;
          sx = Math.max(0, Math.min(img.width - 10, sx));
          sy = Math.max(0, Math.min(img.height - 10, sy));
          sw = Math.max(10, Math.min(img.width - sx, sw));
          sh = Math.max(10, Math.min(img.height - sy, sh));
          w = Math.round(sw);
          h = Math.round(sh);
        }

        if (activeTool === 'resize') {
          w = targetWidth;
          h = targetHeight;
        } else if (activeTool !== 'crop' && scale !== 100) {
          w = Math.max(1, Math.round((img.width * scale) / 100));
          h = Math.max(1, Math.round((img.height * scale) / 100));
        }

        const canvas = document.createElement('canvas');
        const isRotated90 = rotation === 90 || rotation === 270;
        canvas.width = isRotated90 ? h : w;
        canvas.height = isRotated90 ? w : h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(item);
          return;
        }

        // Apply filters
        let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        if (blur > 0) filterStr += ` blur(${blur}px)`;
        if (grayscale) filterStr += ` grayscale(100%)`;
        if (sepia) filterStr += ` sepia(100%)`;
        if (invert) filterStr += ` invert(100%)`;
        ctx.filter = filterStr;

        // Transformation matrix (including straighten angle + 90deg steps)
        const totalAngle = ((rotation + straighten) * Math.PI) / 180;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(totalAngle);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        if (activeTool === 'crop' || cropW < 100 || cropH < 100 || cropX > 0 || cropY > 0) {
          ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
        } else {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
        ctx.restore();

        // Secondary Pass: Pixel-level tone balancing (Blue tone, Skin tone warmth, Tint)
        if (blueTone !== 0 || skinTone !== 0 || tint !== 0 || warmth !== 0) {
          try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              let r = d[i];
              let g = d[i + 1];
              let b = d[i + 2];

              // Warmth / Coolness (Red vs Blue shift)
              if (warmth !== 0) {
                r += warmth * 1.2;
                b -= warmth * 1.0;
              }

              // Blue Tone (Selective sky/blue boost or soften)
              if (blueTone !== 0) {
                b += blueTone * 1.5;
                if (blueTone < 0) {
                  r -= blueTone * 0.3;
                }
              }

              // Skin Tone warmth & exposure balance (targeted at mid-warm tones)
              if (skinTone !== 0) {
                if (r > g && g > b) {
                  r += skinTone * 1.1;
                  g += skinTone * 0.7;
                  b -= skinTone * 0.4;
                }
              }

              // Tint balance (Magenta vs Green)
              if (tint !== 0) {
                r += tint * 0.8;
                g -= tint * 0.8;
                b += tint * 0.8;
              }

              d[i] = Math.min(255, Math.max(0, r));
              d[i + 1] = Math.min(255, Math.max(0, g));
              d[i + 2] = Math.min(255, Math.max(0, b));
            }
            ctx.putImageData(imgData, 0, 0);
          } catch (e) {
            console.warn('Tone adjustment pass skipped:', e);
          }
        }


        // Optimization for Low-End Devices: Downscale max preview dimensions during live editing
        const MAX_PREVIEW_DIM = 1920;
        if (w > MAX_PREVIEW_DIM || h > MAX_PREVIEW_DIM) {
          const ratio = Math.min(MAX_PREVIEW_DIM / w, MAX_PREVIEW_DIM / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          sw = Math.round(sw * ratio);
          sh = Math.round(sh * ratio);
        }

        if (activeTool === 'metadata' && item.file) {
          import('../lib/imageEngine').then(({ scrubExifLossless }) => {
            scrubExifLossless(item.file!).then((blob) => {
              const processedUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                processedUrl,
                processedSize: blob.size,
                status: 'done'
              });
            }).catch(() => {
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
            });
          });
          return;
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

  // Crop preset handler
  const handleCropPreset = (preset: string) => {
    setCropAspect(preset);
    if (preset === 'free') {
      setCropX(0);
      setCropY(0);
      setCropW(100);
      setCropH(100);
      return;
    }
    let targetRatio = 1;
    if (preset === '16:9') targetRatio = 16 / 9;
    if (preset === '9:16') targetRatio = 9 / 16;
    if (preset === '1:1') targetRatio = 1;
    if (preset === '4:3') targetRatio = 4 / 3;
    if (preset === '3:2') targetRatio = 3 / 2;

    const img = images[0];
    const currentRatio = img ? img.width / img.height : 1;

    if (targetRatio > currentRatio) {
      const newH = Math.round((currentRatio / targetRatio) * 100);
      setCropW(100);
      setCropH(newH);
      setCropX(0);
      setCropY(Math.round((100 - newH) / 2));
    } else {
      const newW = Math.round((targetRatio / currentRatio) * 100);
      setCropW(newW);
      setCropH(100);
      setCropX(Math.round((100 - newW) / 2));
      setCropY(0);
    }
  };

  // Real-time automatic processing on control or image changes
  useEffect(() => {
    if (images.length === 0) return;
    let isCancelled = false;

    const runRealTimeProcessing = async () => {
      setIsProcessing(true);
      const updated: ImageItem[] = [];
      for (const item of images) {
        if (isCancelled) return;
        const res = await processImage(item);
        if (item.processedUrl && item.processedUrl !== res.processedUrl) {
          URL.revokeObjectURL(item.processedUrl);
        }
        updated.push(res);
        // Non-blocking yield chunk to keep main thread 60FPS responsive on low-end CPUs
        await new Promise((r) => setTimeout(r, 10));
      }
      if (!isCancelled) {
        setImages(updated);
        setIsProcessing(false);
      }
    };

    const timeout = setTimeout(runRealTimeProcessing, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [
    images.map((i) => i.id).join(','),
    activeTool,
    format,
    quality,
    scale,
    targetWidth,
    targetHeight,
    brightness,
    contrast,
    blur,
    grayscale,
    sepia,
    invert,
    rotation,
    flipX,
    flipY,
    activeTool,
    cropAspect,
    cropX,
    cropY,
    cropW,
    cropH
  ]);

  const applyCurrentSettingsToAll = () => {
    if (images.length === 0) return;
    let isCancelled = false;

    const runApplyToAll = async () => {
      setIsProcessing(true);
      const updated: ImageItem[] = [];
      for (const item of images) {
        if (isCancelled) return;
        const res = await processImage(item);
        updated.push(res);
        await new Promise((r) => setTimeout(r, 10));
      }
      if (!isCancelled) {
        setImages(updated);
        setIsProcessing(false);
        setPaletteToast('Applied settings to all images in batch!');
        setTimeout(() => setPaletteToast(null), 2500);
      }
    };

    runApplyToAll();
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
      <div className="flex flex-col gap-4 glass-panel p-4 sm:p-6 rounded-2xl border-slate-800">
        {/* Title Row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shrink-0">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">GS-Pixels Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Complete suite: Resize, Crop, Compress, Rotate, EXIF Scrubber, Palette &amp; Base64</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo & Redo Controls */}
          <div className="flex items-center gap-1 neu-inset rounded-xl p-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo last adjustment"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo adjustment"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo</span>
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
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
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-600/30'
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

          {/* FORMAT & COMPRESSION */}
          {(activeTool === 'compress' || activeTool === 'studio') && (
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
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow'
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
                    <span className="text-cyan-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* STUDIO LIVE ADJUSTMENTS */}
          {activeTool === 'studio' && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Search editing tools bar */}
              <div className="relative">
                <input
                  type="text"
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  placeholder="Search editing tools (warmth, tint, tone...)"
                  className="w-full px-3.5 py-2 pl-9 rounded-xl neu-inset bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500"
                />
                <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                {toolSearch && (
                  <button
                    onClick={() => setToolSearch('')}
                    className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Blue Tone */}
              {(!toolSearch || 'blue tone'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Blue tone</p>
                      <p className="text-[10px] text-slate-400">Increase to make blues more vivid, decrease to soften</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{blueTone > 0 ? `+${blueTone}` : blueTone}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={blueTone}
                    onChange={(e) => setBlueTone(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Saturation */}
              {(!toolSearch || 'saturation'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Saturation</p>
                      <p className="text-[10px] text-slate-400">Make the colors more or less vibrant</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Skin Tone */}
              {(!toolSearch || 'skin tone'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Skin tone</p>
                      <p className="text-[10px] text-slate-400">Increase for warmth, decrease for overexposed areas</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{skinTone > 0 ? `+${skinTone}` : skinTone}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={skinTone}
                    onChange={(e) => setSkinTone(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Tint */}
              {(!toolSearch || 'tint'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Tint</p>
                      <p className="text-[10px] text-slate-400">Adjust the color balance by adding more magenta or green</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{tint > 0 ? `+${tint}` : tint}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={tint}
                    onChange={(e) => setTint(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Warmth */}
              {(!toolSearch || 'warmth'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Warmth</p>
                      <p className="text-[10px] text-slate-400">Make the image appear warmer or cooler</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{warmth > 0 ? `+${warmth}` : warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={warmth}
                    onChange={(e) => setWarmth(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Straighten */}
              {(!toolSearch || 'straighten'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Straighten</p>
                      <p className="text-[10px] text-slate-400">Make image look like it's being viewed from a straight angle</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{straighten}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={straighten}
                    onChange={(e) => setStraighten(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Brightness */}
              {(!toolSearch || 'brightness'.includes(toolSearch.toLowerCase())) && (
                <div className="p-3 rounded-2xl neu-inset space-y-1.5 border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Brightness</p>
                      <p className="text-[10px] text-slate-400">Lighten or darken image to balance exposure</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-xs">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Contrast & Blur Controls */}
              {(!toolSearch || 'contrast'.includes(toolSearch.toLowerCase())) && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Contrast</span>
                    <span className="text-cyan-400 font-bold">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Blur */}
              {(!toolSearch || 'blur'.includes(toolSearch.toLowerCase())) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Blur</span>
                    <span className="text-cyan-400 font-bold">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Quick Reset All Adjustments */}
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                  setBlueTone(0);
                  setSkinTone(0);
                  setTint(0);
                  setWarmth(0);
                  setStraighten(0);
                  setBlur(0);
                  setGrayscale(false);
                  setSepia(false);
                  setInvert(false);
                  setRotation(0);
                  setFlipX(false);
                  setFlipY(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold neu-btn border border-slate-700 hover:border-cyan-500/50 text-slate-300 transition-all"
              >
                Reset All Image Adjustments
              </button>

              {/* Preset Filter Toggles */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => setGrayscale(!grayscale)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    grayscale ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  B&W
                </button>
                <button
                  onClick={() => setSepia(!sepia)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    sepia ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => setInvert(!invert)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    invert ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Invert
                </button>
              </div>
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
                    className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
          {/* CROP STUDIO CONTROLS */}
          {activeTool === 'crop' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Aspect Ratio Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'free', label: 'Free' },
                    { id: '16:9', label: '16:9' },
                    { id: '9:16', label: '9:16' },
                    { id: '1:1', label: '1:1' },
                    { id: '4:3', label: '4:3' },
                    { id: '3:2', label: '3:2' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleCropPreset(preset.id)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        cropAspect === preset.id
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                          : 'bg-black border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold text-slate-300">Crop Frame Bounds</label>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Crop Width</span>
                    <span className="text-cyan-400 font-bold">{Math.round(cropW)}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={cropW}
                    onChange={(e) => {
                      setCropAspect('custom');
                      setCropW(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Crop Height</span>
                    <span className="text-cyan-400 font-bold">{Math.round(cropH)}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={cropH}
                    onChange={(e) => {
                      setCropAspect('custom');
                      setCropH(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Position X</span>
                    <span className="text-cyan-400 font-bold">{Math.round(cropX)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 100 - cropW)}
                    value={cropX}
                    onChange={(e) => setCropX(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Position Y</span>
                    <span className="text-cyan-400 font-bold">{Math.round(cropY)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 100 - cropH)}
                    value={cropY}
                    onChange={(e) => setCropY(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    setCropAspect('free');
                    setCropX(0);
                    setCropY(0);
                    setCropW(100);
                    setCropH(100);
                  }}
                  className="w-full py-1.5 rounded-lg text-xs font-bold bg-neutral-900 border border-white/10 hover:border-cyan-500/50 text-slate-300 transition-all"
                >
                  Reset Crop Frame
                </button>
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
                        ? 'bg-cyan-600 border-cyan-500 text-white'
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
                    flipX ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Flip Horiz ↔
                </button>
                <button
                  onClick={() => setFlipY(!flipY)}
                  className={`py-1.5 rounded-lg text-xs font-bold border ${
                    flipY ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Flip Vert ↕
                </button>
              </div>
            </div>
          )}


          {/* Apply Settings to All Images Button */}
          {images.length > 1 && (
            <button
              onClick={applyCurrentSettingsToAll}
              disabled={isProcessing}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Selected Settings to All Images</span>
            </button>
          )}

          {/* PALETTE EXTRACTOR */}
          {activeTool === 'palette' && (
            <div className="space-y-4 relative">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Extracted Palette ({detailedColors.length})
                  </label>
                  {pickedEyedropperColor && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                      Picked: {pickedEyedropperColor}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Eyedropper Button */}
                  <button
                    onClick={handlePickEyedropper}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 shadow transition-all"
                    title="Sample pixel from screen with Eyedropper"
                  >
                    <Pipette className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pick Color</span>
                  </button>

                  {/* Neumorphic Copy & Download Dropdown Menu */}
                  {detailedColors.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${paletteMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {paletteMenuOpen && (
                        <div className="absolute right-0 mt-2 w-60 neu-card border border-slate-700/60 rounded-2xl shadow-2xl p-2 z-50 space-y-1 bg-slate-900/95 backdrop-blur-xl">
                          <button
                            onClick={() => {
                              const text = detailedColors.map((c) => c.hex).join(', ');
                              navigator.clipboard.writeText(text);
                              setPaletteToast('Copied HEX list to clipboard!');
                              setPaletteMenuOpen(false);
                              setTimeout(() => setPaletteToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                          >
                            <Copy className="w-4 h-4 text-cyan-400" />
                            <span>Copy All HEX Codes</span>
                          </button>

                          <button
                            onClick={() => {
                              const cssStr = detailedColors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} (${c.percentage}%) */`).join('\n');
                              navigator.clipboard.writeText(`:root {\n${cssStr}\n}`);
                              setPaletteToast('Copied CSS Variables to clipboard!');
                              setPaletteMenuOpen(false);
                              setTimeout(() => setPaletteToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                          >
                            <Code className="w-4 h-4 text-amber-400" />
                            <span>Copy CSS Variables (:root)</span>
                          </button>

                          <button
                            onClick={() => {
                              const twObj = detailedColors.reduce((acc, c, i) => {
                                acc[`palette-${i + 1}`] = c.hex;
                                return acc;
                              }, {} as Record<string, string>);
                              const twStr = `colors: ${JSON.stringify(twObj, null, 2)}`;
                              navigator.clipboard.writeText(twStr);
                              setPaletteToast('Copied Tailwind Config to clipboard!');
                              setPaletteMenuOpen(false);
                              setTimeout(() => setPaletteToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                          >
                            <Sparkles className="w-4 h-4 text-sky-400" />
                            <span>Copy Tailwind Config</span>
                          </button>

                          <button
                            onClick={() => {
                              const jsonStr = JSON.stringify({
                                totalColors: detailedColors.length,
                                palette: detailedColors
                              }, null, 2);
                              navigator.clipboard.writeText(jsonStr);
                              setPaletteToast('Copied Full Palette JSON to clipboard!');
                              setPaletteMenuOpen(false);
                              setTimeout(() => setPaletteToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                          >
                            <FileJson className="w-4 h-4 text-emerald-400" />
                            <span>Copy Full Palette JSON</span>
                          </button>

                          <div className="border-t border-slate-800 my-1"></div>

                          <button
                            onClick={() => {
                              handleExportPaletteImage();
                              setPaletteMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all text-left shadow-sm"
                          >
                            <ImageIcon className="w-4 h-4 text-white" />
                            <span>Download PNG Swatch Card</span>
                          </button>

                          <button
                            onClick={() => {
                              const jsonStr = JSON.stringify({
                                image: images[0]?.name || 'image',
                                total: detailedColors.length,
                                palette: detailedColors
                              }, null, 2);
                              const blob = new Blob([jsonStr], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `palette-${(images[0]?.name || 'colors').replace(/[^a-z0-9]/gi, '-')}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                              setPaletteToast('Downloaded palette.json!');
                              setPaletteMenuOpen(false);
                              setTimeout(() => setPaletteToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                          >
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>Download JSON File</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {paletteToast && (
                <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>{paletteToast}</span>
                </div>
              )}

              {/* Tonal Category Filters */}
              {detailedColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-glow text-[11px]">
                    {[
                      { id: 'all', label: `All (${detailedColors.length})` },
                      { id: 'dominant', label: '🌟 Dominant' },
                      { id: 'vibrant', label: '⚡ Vibrant' },
                      { id: 'light', label: '☀️ Light' },
                      { id: 'dark', label: '🌙 Dark' },
                      { id: 'accent', label: '💎 Accents' },
                    ].map((cat) => {
                      const count = cat.id === 'all'
                        ? detailedColors.length
                        : detailedColors.filter((c) => cat.id === 'all' || c.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setPaletteFilter(cat.id as any)}
                          className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border transition-all ${
                            paletteFilter === cat.id
                              ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat.label} {cat.id !== 'all' ? `(${count})` : ''}
                        </button>
                      );
                    })}
                  </div>

                  {/* Swatch Display Grid */}
                  <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2 scrollbar-glow">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {detailedColors
                        .filter((c) => paletteFilter === 'all' || c.category === paletteFilter)
                        .map((color, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-1.5 group relative"
                          >
                            {/* Color Bar Swatch with Hover Copy */}
                            <div
                              onClick={() => {
                                navigator.clipboard.writeText(color.hex);
                                setPaletteToast(`Copied ${color.hex} to clipboard!`);
                                setTimeout(() => setPaletteToast(null), 2000);
                              }}
                              className="h-10 rounded-lg shadow border border-white/10 relative overflow-hidden cursor-pointer flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                              style={{ backgroundColor: color.hex }}
                              title={`Click to copy HEX ${color.hex}`}
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                <Copy className="w-3.5 h-3.5 text-white drop-shadow" />
                              </div>
                            </div>

                            {/* Color Meta */}
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span
                                  onClick={() => {
                                    navigator.clipboard.writeText(color.hex);
                                    setPaletteToast(`Copied ${color.hex}!`);
                                    setTimeout(() => setPaletteToast(null), 2000);
                                  }}
                                  className="text-[11px] font-mono font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer"
                                >
                                  {color.hex}
                                </span>
                                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-1 rounded">
                                  {color.percentage}%
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="truncate pr-1" title={color.name}>{color.name}</span>
                                <button
                                  onClick={() => {
                                    const rgbStr = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                                    navigator.clipboard.writeText(rgbStr);
                                    setPaletteToast(`Copied ${rgbStr}!`);
                                    setTimeout(() => setPaletteToast(null), 2000);
                                  }}
                                  className="text-[9px] hover:text-cyan-300 font-mono text-slate-500 underline decoration-slate-700"
                                  title="Copy RGB"
                                >
                                  RGB
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {detailedColors.length === 0 && (
                <p className="text-xs text-slate-400 italic bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                  Paste (Ctrl+V) or upload an image to extract full color spectrum and swatches.
                </p>
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
                  className="text-[10px] text-cyan-400 font-bold hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <textarea
                readOnly
                value={base64Output}
                className="w-full h-32 p-2 bg-black border border-white/10 text-[10px] font-mono text-emerald-400 rounded-lg resize-none"
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


        </div>

        {/* Gallery / Image Grid & Contextual Drop / Paste Placeholder */}
        <div className="lg:col-span-2 space-y-4">
          {images.length === 0 ? (
            (() => {
              const pasteCtx = getToolPasteContext();
              const ToolIcon = pasteCtx.icon;

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
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 glass-panel transition-all min-h-[460px] relative overflow-hidden ${
                    isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' : 'border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  {/* Subtle Background Glow Accent */}
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

                  {/* Tool Badge Header */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold shadow-inner">
                    <ToolIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pasteCtx.badge}</span>
                  </div>

                  {/* Center Hero Icon */}
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${pasteCtx.gradient} flex items-center justify-center text-white shadow-xl shadow-cyan-600/20 transform hover:scale-105 transition-transform`}>
                    <ToolIcon className="w-10 h-10 drop-shadow-md" />
                  </div>

                  {/* Title & Tool Guidance Description */}
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {pasteCtx.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {pasteCtx.desc}
                    </p>
                  </div>

                  {/* Dedicated Call-To-Action Paste & Upload Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handlePasteFromClipboard}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Clipboard className="w-4 h-4" />
                      <span>Paste from Clipboard (Ctrl + V)</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Browse Local Files</span>
                    </button>
                  </div>

                  {/* Footer Hint */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-white/5 w-full justify-center">
                    <span>Supports PNG, JPG, WebP, AVIF, GIF, SVG</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">Or Drag &amp; Drop Anywhere</span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="space-y-4">
              {/* Batch Queue Status Header + Quick Paste Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Image Queue ({images.length})
                  </span>
                  {isProcessing && (
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Batch...</span>
                    </span>
                  )}
                </div>

                {/* Quick In-Queue Paste & Add Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition-all"
                    title="Paste another image from clipboard (Ctrl+V)"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste (Ctrl+V)</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Add More</span>
                  </button>
                </div>
              </div>

              {/* Multi-Image Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((item) => {
                  const isSelected = item.id === selectedImageId;
                  const savings = item.processedSize
                    ? Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedImageId(item.id)}
                      className={`glass-panel rounded-2xl p-4 space-y-3 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'border-white/10 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-inner group/thumb select-none"
                      >
                        <img
                          src={item.processedUrl || item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-contain transition-all duration-75 pointer-events-none"
                          style={{
                            filter: `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) ${grayscale ? 'grayscale(100%)' : ''} ${sepia ? 'sepia(100%)' : ''} ${invert ? 'invert(100%)' : ''}`,
                            transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(item.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-md z-10"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isSelected && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-bold shadow">
                            Active Focus
                          </div>
                        )}
                        {item.status === 'done' && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                            <FileCheck className="w-3 h-3" />
                            <span>{savings > 0 ? `-${savings}%` : 'Ready'}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400 truncate">
                            <span>{item.width}x{item.height}px</span>
                            <span>•</span>
                            <span>{formatBytes(item.originalSize)}</span>
                            {item.processedSize && (
                              <>
                                <span>→</span>
                                <span className="text-emerald-400 font-bold">
                                  {formatBytes(item.processedSize)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(item.id);
                          }}
                          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all shrink-0"
                          title="Remove image from suite"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>

                      {item.processedUrl && (
                        <a
                          href={item.processedUrl}
                          download={`gs-${activeTool}-${item.name}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Result</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
