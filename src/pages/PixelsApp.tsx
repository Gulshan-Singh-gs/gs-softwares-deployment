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
  Check,
  Undo2,
  Redo2,
  ChevronDown,
  FileJson,
  Move
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
  | 'watermark' 
  | 'metadata' 
  | 'palette' 
  | 'base64';

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

  // Watermark Positioning & Typography State
  const [watermarkX, setWatermarkX] = useState<number>(50);
  const [watermarkY, setWatermarkY] = useState<number>(50);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(24);
  const [watermarkFontFamily, setWatermarkFontFamily] = useState<string>('sans-serif');
  const [watermarkTextColor, setWatermarkTextColor] = useState<string>('#ffffff');
  const [watermarkStrokeColor, setWatermarkStrokeColor] = useState<string>('#000000');
  const [watermarkStrokeWidth, setWatermarkStrokeWidth] = useState<number>(1);
  const [watermarkBgColor, setWatermarkBgColor] = useState<string>('transparent');
  const [watermarkBgPadding, setWatermarkBgPadding] = useState<number>(6);
  const [isDraggingWatermark, setIsDraggingWatermark] = useState<boolean>(false);

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
      blur,
      grayscale,
      sepia,
      invert,
      rotation,
      flipX,
      flipY,
      watermarkText,
      watermarkOpacity,
      watermarkX,
      watermarkY,
      watermarkFontSize,
      watermarkFontFamily,
      watermarkTextColor,
      watermarkStrokeColor,
      watermarkStrokeWidth,
      watermarkBgColor,
      watermarkBgPadding,
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
    blur,
    grayscale,
    sepia,
    invert,
    rotation,
    flipX,
    flipY,
    watermarkText,
    watermarkOpacity,
    watermarkX,
    watermarkY,
    watermarkFontSize,
    watermarkFontFamily,
    watermarkTextColor,
    watermarkStrokeColor,
    watermarkStrokeWidth,
    watermarkBgColor,
    watermarkBgPadding,
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
    if (snap.blur !== undefined) setBlur(snap.blur);
    if (snap.grayscale !== undefined) setGrayscale(snap.grayscale);
    if (snap.sepia !== undefined) setSepia(snap.sepia);
    if (snap.invert !== undefined) setInvert(snap.invert);
    if (snap.rotation !== undefined) setRotation(snap.rotation);
    if (snap.flipX !== undefined) setFlipX(snap.flipX);
    if (snap.flipY !== undefined) setFlipY(snap.flipY);
    if (snap.watermarkText !== undefined) setWatermarkText(snap.watermarkText);
    if (snap.watermarkOpacity !== undefined) setWatermarkOpacity(snap.watermarkOpacity);
    if (snap.watermarkX !== undefined) setWatermarkX(snap.watermarkX);
    if (snap.watermarkY !== undefined) setWatermarkY(snap.watermarkY);
    if (snap.watermarkFontSize !== undefined) setWatermarkFontSize(snap.watermarkFontSize);
    if (snap.watermarkFontFamily !== undefined) setWatermarkFontFamily(snap.watermarkFontFamily);
    if (snap.watermarkTextColor !== undefined) setWatermarkTextColor(snap.watermarkTextColor);
    if (snap.watermarkStrokeColor !== undefined) setWatermarkStrokeColor(snap.watermarkStrokeColor);
    if (snap.watermarkStrokeWidth !== undefined) setWatermarkStrokeWidth(snap.watermarkStrokeWidth);
    if (snap.watermarkBgColor !== undefined) setWatermarkBgColor(snap.watermarkBgColor);
    if (snap.watermarkBgPadding !== undefined) setWatermarkBgPadding(snap.watermarkBgPadding);
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
    { id: 'watermark', name: 'Watermark Studio', icon: Stamp, tagline: 'Custom Text & Position Overlay' },
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

  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = Math.min(img.width || 200, 200);
    const height = Math.min(img.height || 200, 200);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};

    const binStep = 24;
    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      if (a < 128) continue; // Skip transparent pixels

      const r = Math.round(imgData[i] / binStep) * binStep;
      const g = Math.round(imgData[i + 1] / binStep) * binStep;
      const b = Math.round(imgData[i + 2] / binStep) * binStep;

      const cr = Math.min(255, Math.max(0, r));
      const cg = Math.min(255, Math.max(0, g));
      const cb = Math.min(255, Math.max(0, b));

      const hex = `#${cr.toString(16).padStart(2, '0')}${cg.toString(16).padStart(2, '0')}${cb.toString(16).padStart(2, '0')}`;
      if (!colorCounts[hex]) {
        colorCounts[hex] = { count: 0, r: cr, g: cg, b: cb };
      }
      colorCounts[hex].count++;
    }

    const sorted = Object.entries(colorCounts).sort((a, b) => b[1].count - a[1].count);

    const distinctColors: string[] = [];
    const colorDistance = (c1: string, c2: string) => {
      const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
      const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    };

    for (const [hex] of sorted) {
      const isFarEnough = distinctColors.every((c) => colorDistance(c, hex) > 30);
      if (isFarEnough) {
        distinctColors.push(hex);
      }
      if (distinctColors.length >= 6) break;
    }

    if (distinctColors.length < 6) {
      for (const [hex] of sorted) {
        if (!distinctColors.includes(hex)) distinctColors.push(hex);
        if (distinctColors.length >= 6) break;
      }
    }

    setExtractedPalette(distinctColors);
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
        if (activeTool === 'crop' || cropW < 100 || cropH < 100 || cropX > 0 || cropY > 0) {
          ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
        } else {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
        ctx.restore();

        // Watermark Overlay on Canvas with Custom Font, Size, Stroke, and Background
        if ((activeTool === 'watermark' || activeTool === 'studio') && watermarkText.trim()) {
          ctx.save();
          const wx = (watermarkX / 100) * canvas.width;
          const wy = (watermarkY / 100) * canvas.height;
          const fontPx = Math.max(12, Math.round((watermarkFontSize / 800) * canvas.width));

          ctx.font = `bold ${fontPx}px ${watermarkFontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const metrics = ctx.measureText(watermarkText);
          const textWidth = metrics.width;
          const textHeight = fontPx * 1.2;

          // Render Background Box behind Text
          if (watermarkBgColor && watermarkBgColor !== 'transparent') {
            ctx.fillStyle = watermarkBgColor;
            const padX = (watermarkBgPadding / 800) * canvas.width;
            const padY = (watermarkBgPadding / 800) * canvas.height;
            ctx.fillRect(
              wx - textWidth / 2 - padX,
              wy - textHeight / 2 - padY,
              textWidth + padX * 2,
              textHeight + padY * 2
            );
          }

          // Render Text Stroke (Outline)
          if (watermarkStrokeWidth > 0) {
            ctx.strokeStyle = watermarkStrokeColor || '#000000';
            ctx.lineWidth = Math.max(1, Math.round((watermarkStrokeWidth / 800) * canvas.width));
            ctx.strokeText(watermarkText, wx, wy);
          }

          // Helper to parse hex to rgba
          const hexToRgb = (hex: string, alpha: number) => {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map((x) => x + x).join('');
            const num = parseInt(c, 16);
            return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
          };

          // Render Fill Text with Selected Color Wheel Choice
          ctx.fillStyle = hexToRgb(watermarkTextColor, watermarkOpacity / 100);
          ctx.fillText(watermarkText, wx, wy);
          ctx.restore();
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
    if (images.length === 0 || isDraggingWatermark) return;
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

    // Fast 30ms real-time drag debounce for Watermark, 250ms threshold for heavy operations
    const timeout = setTimeout(runRealTimeProcessing, activeTool === 'watermark' ? 30 : 250);

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
    watermarkText,
    watermarkOpacity,
    watermarkX,
    watermarkY,
    watermarkFontSize,
    watermarkFontFamily,
    watermarkTextColor,
    watermarkStrokeColor,
    watermarkStrokeWidth,
    watermarkBgColor,
    watermarkBgPadding,
    isDraggingWatermark,
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
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Complete suite: Resize, Crop, Compress, Rotate, Watermark, EXIF, Palette &amp; Base64</p>
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
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Live Image Filters & Effects</label>
              
              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Brightness</span>
                  <span className="text-cyan-400 font-bold">{brightness}%</span>
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

              {/* Contrast */}
              <div className="space-y-1">
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

              {/* Blur */}
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

          {/* WATERMARK CONTROLS */}
          {(activeTool === 'watermark' || activeTool === 'studio') && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Watermark Text</label>
                <span className="text-[10px] text-cyan-400 font-bold">Hold & drag to place</span>
              </div>
              {/* Watermark Text Input */}
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white"
                placeholder="Watermark / Copyright..."
              />

              {/* Text Color Wheel Picker */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Text Color Wheel</span>
                  <span className="font-mono text-cyan-400 font-bold">{watermarkTextColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={watermarkTextColor}
                    onChange={(e) => setWatermarkTextColor(e.target.value)}
                    className="w-full h-8 rounded-lg bg-black border border-white/20 cursor-pointer p-0.5"
                    title="Select watermark text color from color wheel"
                  />
                  {['#ffffff', '#000000', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setWatermarkTextColor(c)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        watermarkTextColor === c ? 'border-cyan-400 scale-110 shadow' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Font Size</span>
                  <span className="text-cyan-400 font-bold">{watermarkFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={watermarkFontSize}
                  onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Font Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'sans-serif', label: 'Sans' },
                    { id: 'serif', label: 'Serif' },
                    { id: 'monospace', label: 'Mono' },
                    { id: 'cursive', label: 'Script' },
                    { id: 'Impact, sans-serif', label: 'Impact' },
                    { id: 'Outfit, sans-serif', label: 'Display' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setWatermarkFontFamily(f.id)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                        watermarkFontFamily === f.id
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-black border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke / Outline */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Text Stroke / Outline</span>
                  <span className="text-cyan-400 font-bold">{watermarkStrokeWidth}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={watermarkStrokeWidth}
                    onChange={(e) => setWatermarkStrokeWidth(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer flex-1"
                  />
                  <input
                    type="color"
                    value={watermarkStrokeColor}
                    onChange={(e) => setWatermarkStrokeColor(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-black border border-white/20 cursor-pointer p-0.5"
                    title="Stroke Color"
                  />
                </div>
              </div>

              {/* Background Box Fill */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <label className="text-xs text-slate-400">Background Box Fill</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWatermarkBgColor('transparent')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                      watermarkBgColor === 'transparent' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-black border-white/10 text-slate-400'
                    }`}
                  >
                    None
                  </button>
                  {['#000000', '#ffffff', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setWatermarkBgColor(color)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        watermarkBgColor === color ? 'border-cyan-400 scale-110 shadow-md' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Opacity</span>
                  <span className="text-cyan-400 font-bold">{watermarkOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Pos X & Pos Y */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Pos X</span>
                    <span className="text-cyan-400 font-bold">{watermarkX}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={watermarkX}
                    onChange={(e) => setWatermarkX(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Pos Y</span>
                    <span className="text-cyan-400 font-bold">{watermarkY}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={watermarkY}
                    onChange={(e) => setWatermarkY(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setWatermarkX(50);
                  setWatermarkY(50);
                }}
                className="w-full py-1 rounded-lg text-[11px] font-bold bg-neutral-900 border border-white/10 text-slate-400 hover:text-white transition-all"
              >
                Reset Center Position (50%, 50%)
              </button>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Dominant Palette Extracted
                </label>

                {/* Neumorphic Copy & Download Dropdown Menu */}
                {extractedPalette.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Palette</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${paletteMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {paletteMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 neu-card border border-slate-700/60 rounded-2xl shadow-2xl p-2 z-50 space-y-1 bg-slate-900/95 backdrop-blur-xl">
                        <button
                          onClick={() => {
                            const text = extractedPalette.join(', ');
                            navigator.clipboard.writeText(text);
                            setPaletteToast('Copied HEX list to clipboard!');
                            setPaletteMenuOpen(false);
                            setTimeout(() => setPaletteToast(null), 2500);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                        >
                          <Copy className="w-4 h-4 text-cyan-400" />
                          <span>Copy HEX List</span>
                        </button>

                        <button
                          onClick={() => {
                            const jsonStr = JSON.stringify({ palette: extractedPalette }, null, 2);
                            navigator.clipboard.writeText(jsonStr);
                            setPaletteToast('Copied Palette JSON to clipboard!');
                            setPaletteMenuOpen(false);
                            setTimeout(() => setPaletteToast(null), 2500);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                        >
                          <FileJson className="w-4 h-4 text-emerald-400" />
                          <span>Copy JSON Object</span>
                        </button>

                        <button
                          onClick={() => {
                            const cssStr = extractedPalette.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
                            navigator.clipboard.writeText(cssStr);
                            setPaletteToast('Copied CSS Variables to clipboard!');
                            setPaletteMenuOpen(false);
                            setTimeout(() => setPaletteToast(null), 2500);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-left"
                        >
                          <Code className="w-4 h-4 text-amber-400" />
                          <span>Copy CSS Variables</span>
                        </button>

                        <div className="border-t border-slate-800 my-1"></div>

                        <button
                          onClick={() => {
                            const jsonStr = JSON.stringify({ palette: extractedPalette }, null, 2);
                            const blob = new Blob([jsonStr], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'palette.json';
                            a.click();
                            URL.revokeObjectURL(url);
                            setPaletteToast('Downloaded palette.json!');
                            setPaletteMenuOpen(false);
                            setTimeout(() => setPaletteToast(null), 2500);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all text-left"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span>Download JSON File</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {paletteToast && (
                <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>{paletteToast}</span>
                </div>
              )}

              {extractedPalette.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {extractedPalette.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(hex);
                        setPaletteToast(`Copied ${hex} to clipboard!`);
                        setTimeout(() => setPaletteToast(null), 2000);
                      }}
                      className="space-y-2 p-2.5 rounded-2xl bg-black border border-white/10 hover:border-cyan-500/60 hover:scale-105 active:scale-95 transition-all text-center group cursor-pointer"
                      title={`Click to copy ${hex}`}
                    >
                      <div
                        className="h-12 rounded-xl shadow-lg border border-white/20 relative overflow-hidden"
                        style={{ backgroundColor: hex }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                          <Copy className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {hex}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                  Upload an image to extract HEX color swatches.
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

        {/* Gallery / Image Grid */}
        <div className="lg:col-span-2 space-y-4">
          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
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
              className={`border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 cursor-pointer glass-panel transition-all min-h-[420px] ${
                isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' : 'border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-bold text-white">Drag & Drop multiple images or click to browse</p>
                <p className="text-xs text-slate-400">Supports PNG, JPG, WebP, AVIF, GIF • Infinite batch processing</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Batch Queue Status Header */}
              <div className="flex items-center justify-between px-1">
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
                        onMouseDown={(e) => {
                          if (activeTool !== 'watermark' && !watermarkText.trim()) return;
                          setIsDraggingWatermark(true);
                          triggerVibrate(35);

                          const rect = e.currentTarget.getBoundingClientRect();
                          const updatePos = (clientX: number, clientY: number) => {
                            const xPercent = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
                            const yPercent = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
                            setWatermarkX(Math.round(xPercent));
                            setWatermarkY(Math.round(yPercent));
                          };

                          updatePos(e.clientX, e.clientY);

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            updatePos(moveEvent.clientX, moveEvent.clientY);
                          };

                          const handleMouseUp = () => {
                            setIsDraggingWatermark(false);
                            triggerVibrate([20, 15, 20]);
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                          };

                          window.addEventListener('mousemove', handleMouseMove);
                          window.addEventListener('mouseup', handleMouseUp);
                        }}
                        onTouchStart={(e) => {
                          if (activeTool !== 'watermark' && !watermarkText.trim()) return;
                          setIsDraggingWatermark(true);
                          triggerVibrate(35);

                          const rect = e.currentTarget.getBoundingClientRect();
                          if (!e.touches[0]) return;

                          const updatePos = (clientX: number, clientY: number) => {
                            const xPercent = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
                            const yPercent = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
                            setWatermarkX(Math.round(xPercent));
                            setWatermarkY(Math.round(yPercent));
                          };

                          updatePos(e.touches[0].clientX, e.touches[0].clientY);

                          const handleTouchMove = (touchEvent: TouchEvent) => {
                            if (!touchEvent.touches[0]) return;
                            updatePos(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
                          };

                          const handleTouchEnd = () => {
                            setIsDraggingWatermark(false);
                            triggerVibrate([20, 15, 20]);
                            window.removeEventListener('touchmove', handleTouchMove);
                            window.removeEventListener('touchend', handleTouchEnd);
                          };

                          window.addEventListener('touchmove', handleTouchMove);
                          window.addEventListener('touchend', handleTouchEnd);
                        }}
                        className={`relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-inner group/thumb select-none ${
                          activeTool === 'watermark' ? 'cursor-crosshair' : ''
                        }`}
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

                        {/* Instant Real-Time Draggable DOM Overlay Text */}
                        {(activeTool === 'watermark' || isDraggingWatermark) && watermarkText.trim() !== '' && (
                          <div
                            style={{
                              left: `${watermarkX}%`,
                              top: `${watermarkY}%`,
                              transform: `translate(-50%, -50%) scale(${isDraggingWatermark ? 1.2 : 1})`,
                              opacity: watermarkOpacity / 100,
                              fontSize: `${Math.max(14, Math.min(36, watermarkFontSize))}px`,
                              fontFamily: watermarkFontFamily,
                              color: watermarkTextColor,
                              backgroundColor: watermarkBgColor === 'transparent' ? 'transparent' : watermarkBgColor,
                              padding: watermarkBgColor === 'transparent' ? '0px' : `${watermarkBgPadding}px`,
                              WebkitTextStroke: watermarkStrokeWidth > 0 ? `${watermarkStrokeWidth}px ${watermarkStrokeColor}` : 'none'
                            }}
                            className={`absolute z-30 cursor-move font-bold select-none transition-transform duration-75 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] pointer-events-none ${
                              isDraggingWatermark
                                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black scale-120 shadow-2xl rounded-lg'
                                : 'hover:outline hover:outline-dashed hover:outline-cyan-400/80 hover:outline-1 hover:px-1 rounded'
                            }`}
                          >
                            {watermarkText}
                          </div>
                        )}
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
