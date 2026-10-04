import React, { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  removeBackgroundClient,
  applyWatermark,
  applyPrivacyBlur,
  vectorizeBitmapToSvg,
  upscaleImageSmart,
  sliceImageGrid,
  inpaintImageClient,
  applyDitherFilter,
  invertImageNegative,
  diffImagesClient,
  stitchImagesClient,
  scrubExifLossless
} from '../lib/imageEngine';
import { downloadBlob, formatBytes } from '../lib/fileUtils';
import { saveWorkspaceFile, getWorkspaceFilesByApp, deleteWorkspaceFile } from '../lib/db';
import { GlobalStorage } from '../platform';
import {
  PixelCapability,
  PixelAsset,
  AdjustmentsState,
  ExtractedColorItem
} from '../components/pixels/types';
import { PixelsToolRail } from '../components/pixels/PixelsToolRail';
import { PixelsCanvas } from '../components/pixels/PixelsCanvas';
import { PixelsInspector } from '../components/pixels/PixelsInspector';
import { PixelsTopBar } from '../components/pixels/PixelsTopBar';
import { PixelsStatusBar } from '../components/pixels/PixelsStatusBar';
import { PixelsEmptyState } from '../components/pixels/PixelsEmptyState';

const INITIAL_CONFIG: AdjustmentsState = {
  format: 'image/webp',
  quality: 85,
  scale: 100,
  targetWidth: 800,
  targetHeight: 600,
  aspectLock: true,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blueTone: 0,
  skinTone: 0,
  tint: 0,
  warmth: 0,
  straighten: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
  invert: false,
  rotation: 0,
  flipX: false,
  flipY: false,
  cropAspect: 'free',
  cropX: 0,
  cropY: 0,
  cropW: 100,
  cropH: 100,
  bgTolerance: 38,
  watermarkText: 'CONFIDENTIAL',
  watermarkPos: 'bottom-right',
  watermarkOpacity: 50,
  watermarkColor: '#ffffff',
  blurMode: 'pixelate',
  blurAreaSize: 30,
  vectorThreshold: 128,
  upscaleFactor: 2,
  gridRows: 3,
  gridCols: 3,
  inpaintBoxSize: 20,
  ditherAlgorithm: 'floyd-steinberg',
  ditherPalette: '1bit',
  diffThreshold: 0.1,
  stitchOrientation: 'horizontal',
  stitchSpacing: 12,
};

export const PixelsApp: React.FC = () => {
  // Navigation & Workspace State
  const [activeCapability, setActiveCapability] = useState<PixelCapability>('adjust');
  const [images, setImages] = useState<PixelAsset[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [config, setConfig] = useState<AdjustmentsState>(INITIAL_CONFIG);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Advanced Tool Outputs
  const [detailedColors, setDetailedColors] = useState<ExtractedColorItem[]>([]);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [vectorSvgResult, setVectorSvgResult] = useState<string>('');
  const [gridSlices, setGridSlices] = useState<Array<{ filename: string; blob: Blob; url: string }>>([]);
  const [diffMismatchPct, setDiffMismatchPct] = useState<number | null>(null);
  const [diffResultUrl, setDiffResultUrl] = useState<string | null>(null);
  const [stitchResultUrl, setStitchResultUrl] = useState<string | null>(null);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<AdjustmentsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isApplyingUndoRedo = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentAsset = useMemo(() => {
    if (!images.length) return null;
    return images.find((i) => i.id === selectedImageId) || images[0];
  }, [images, selectedImageId]);

  // Update Config Helper
  const handleUpdateConfig = <K extends keyof AdjustmentsState>(key: K, value: AdjustmentsState[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Undo / Redo Snapshot Tracker
  useEffect(() => {
    if (isApplyingUndoRedo.current) {
      isApplyingUndoRedo.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const last = newHistory[newHistory.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(config)) {
          return prev;
        }
        const updated = [...newHistory, config].slice(-50);
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [config]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prev = history[prevIndex];
      isApplyingUndoRedo.current = true;
      setHistoryIndex(prevIndex);
      setConfig(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const next = history[nextIndex];
      isApplyingUndoRedo.current = true;
      setHistoryIndex(nextIndex);
      setConfig(next);
    }
  };

  // Keyboard Hotkeys (Ctrl+Z, Ctrl+Y, Ctrl+K)
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

  // Restore Image Workspace Files from IndexedDB on Load
  useEffect(() => {
    const restoreFromDB = async () => {
      try {
        const stored = await getWorkspaceFilesByApp('pixels');
        if (stored.length === 0) return;
        const restoredItems: PixelAsset[] = [];
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
          setSelectedImageId(restoredItems[0].id);
        }
      } catch (err) {
        console.warn('DB initialization error:', err);
      }
    };
    restoreFromDB();
  }, []);

  // Handle incoming files from file picker or drag & drop
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileList.length === 0) return;

    const newItems: PixelAsset[] = [];
    let loadedCount = 0;

    fileList.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const item: PixelAsset = {
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
          GlobalStorage.createAsset({
            name: item.name,
            type: file.type || 'image/png',
            data: buf,
            sourceApp: 'pixels',
            producingTool: 'pixels.import',
          }).catch(() => {});
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
            setConfig((c) => ({
              ...c,
              targetWidth: newItems[0].width,
              targetHeight: newItems[0].height
            }));
            extractColors(img);
          }
          showToast(`Loaded ${newItems.length} image(s) into workstation`);
        }
      };
      img.src = url;
    });
  };

  // Close an asset
  const handleCloseAsset = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
    deleteWorkspaceFile(id).catch(() => {});
    if (selectedImageId === id) {
      const remaining = images.filter((item) => item.id !== id);
      setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Global Clipboard Paste Listener (Ctrl+V)
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
        showToast(`Pasted ${pastedFiles.length} image(s) from clipboard!`);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

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
          showToast(`Pasted ${files.length} image(s) from clipboard!`);
          return;
        }
      }
      showToast('Press Ctrl+V to paste your image.');
    } catch (err) {
      showToast('Press Ctrl+V to paste your image from clipboard.');
    }
  };

  // Live Eyedropper API
  const handlePickEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res && res.sRGBHex) {
          const hex = res.sRGBHex.toUpperCase();
          setPickedColor(hex);
          navigator.clipboard.writeText(hex);
          showToast(`Sampled & Copied ${hex}!`);
        }
      } catch (e) {}
    } else {
      showToast('Click any color swatch below to copy its HEX code.');
    }
  };

  // Color Palette Extractor Engine
  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = Math.min(img.width || 320, 320);
    const height = Math.min(img.height || 320, 320);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};
    let totalValidPixels = 0;
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

    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255; g /= 255; b /= 255;
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
      if (s < 12) return l < 30 ? 'Charcoal Grey' : l < 65 ? 'Slate Grey' : 'Silver Mist';
      if (h >= 345 || h < 15) return l > 65 ? 'Pastel Rose' : l < 35 ? 'Deep Crimson' : 'Vibrant Red';
      if (h >= 15 && h < 45) return l > 65 ? 'Peach Coral' : l < 35 ? 'Burnt Sienna' : 'Sunset Orange';
      if (h >= 45 && h < 70) return l > 65 ? 'Cream Gold' : l < 35 ? 'Bronze Olive' : 'Amber Gold';
      if (h >= 70 && h < 150) return l > 65 ? 'Lime Mint' : l < 35 ? 'Forest Emerald' : 'Emerald Green';
      if (h >= 150 && h < 195) return l > 65 ? 'Ice Cyan' : l < 35 ? 'Deep Teal' : 'Electric Cyan';
      if (h >= 195 && h < 255) return l > 65 ? 'Sky Azure' : l < 35 ? 'Navy Midnight' : 'Electric Blue';
      if (h >= 255 && h < 290) return l > 65 ? 'Lavender' : l < 35 ? 'Deep Indigo' : 'Royal Indigo';
      return 'Vibrant Shade';
    };

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 32);

    const detailedList: ExtractedColorItem[] = sortedColors.map(([hex, data]) => {
      const percentage = totalValidPixels > 0 ? Math.round((data.count / totalValidPixels) * 1000) / 10 : 0;
      const hsl = rgbToHsl(data.r, data.g, data.b);
      const name = getColorName(hsl.h, hsl.s, hsl.l);
      return {
        hex,
        rgb: { r: data.r, g: data.g, b: data.b },
        hsl,
        percentage,
        name,
        category: percentage >= 14 ? 'dominant' : hsl.s >= 55 ? 'vibrant' : hsl.l >= 72 ? 'light' : 'accent'
      };
    });

    setDetailedColors(detailedList);
  };

  // Re-extract colors whenever current asset changes
  useEffect(() => {
    if (!currentAsset) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => extractColors(img);
    img.src = currentAsset.processedUrl || currentAsset.previewUrl;
  }, [currentAsset?.id]);

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

    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('GS-Pixels Color Palette', 24, 44);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`${detailedColors.length} Extracted Swatches • ${currentAsset?.name || 'Asset'}`, 24, 68);

    detailedColors.forEach((color, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = 20 + colIdx * cellW;
      const y = 86 + rowIdx * cellH;

      ctx.fillStyle = color.hex;
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x + 6, y + 6, cellW - 12, cellH - 52, 12);
      } else {
        ctx.rect(x + 6, y + 6, cellW - 12, cellH - 52);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(color.hex, x + 10, y + cellH - 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${color.percentage}% • ${color.name}`, x + 10, y + cellH - 10);
    });

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `palette-${(currentAsset?.name || 'swatches').replace(/[^a-z0-9]/gi, '-')}.png`;
    a.click();
    showToast('Downloaded PNG Palette Card!');
  };

  // Crop preset handler
  const handleCropPreset = (preset: string) => {
    setConfig((c) => {
      if (preset === 'free') {
        return { ...c, cropAspect: 'free', cropX: 0, cropY: 0, cropW: 100, cropH: 100 };
      }
      let targetRatio = 1;
      if (preset === '16:9') targetRatio = 16 / 9;
      if (preset === '9:16') targetRatio = 9 / 16;
      if (preset === '1:1') targetRatio = 1;
      if (preset === '4:3') targetRatio = 4 / 3;
      if (preset === '3:2') targetRatio = 3 / 2;

      const img = currentAsset;
      const currentRatio = img ? img.width / img.height : 1;

      if (targetRatio > currentRatio) {
        const newH = Math.round((currentRatio / targetRatio) * 100);
        return { ...c, cropAspect: preset, cropW: 100, cropH: newH, cropX: 0, cropY: Math.round((100 - newH) / 2) };
      } else {
        const newW = Math.round((targetRatio / currentRatio) * 100);
        return { ...c, cropAspect: preset, cropW: newW, cropH: 100, cropX: Math.round((100 - newW) / 2), cropY: 0 };
      }
    });
  };

  // Core Processing Pipeline
  const processImage = async (item: PixelAsset): Promise<PixelAsset> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (activeCapability === 'crop' || config.cropW < 100 || config.cropH < 100 || config.cropX > 0 || config.cropY > 0) {
          sx = (config.cropX / 100) * img.width;
          sy = (config.cropY / 100) * img.height;
          sw = (config.cropW / 100) * img.width;
          sh = (config.cropH / 100) * img.height;
          sx = Math.max(0, Math.min(img.width - 10, sx));
          sy = Math.max(0, Math.min(img.height - 10, sy));
          sw = Math.max(10, Math.min(img.width - sx, sw));
          sh = Math.max(10, Math.min(img.height - sy, sh));
          w = Math.round(sw);
          h = Math.round(sh);
        }

        if (activeCapability === 'resize') {
          w = config.targetWidth;
          h = config.targetHeight;
        } else if (activeCapability !== 'crop' && config.scale !== 100) {
          w = Math.max(1, Math.round((img.width * config.scale) / 100));
          h = Math.max(1, Math.round((img.height * config.scale) / 100));
        }

        const canvas = document.createElement('canvas');
        const isRotated90 = config.rotation === 90 || config.rotation === 270;
        canvas.width = isRotated90 ? h : w;
        canvas.height = isRotated90 ? w : h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(item);
          return;
        }

        let filterStr = `brightness(${config.brightness}%) contrast(${config.contrast}%) saturate(${config.saturation}%)`;
        if (config.blur > 0) filterStr += ` blur(${config.blur}px)`;
        if (config.grayscale) filterStr += ` grayscale(100%)`;
        if (config.sepia) filterStr += ` sepia(100%)`;
        if (config.invert) filterStr += ` invert(100%)`;
        ctx.filter = filterStr;

        const totalAngle = ((config.rotation + config.straighten) * Math.PI) / 180;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(totalAngle);
        ctx.scale(config.flipX ? -1 : 1, config.flipY ? -1 : 1);
        if (activeCapability === 'crop' || config.cropW < 100 || config.cropH < 100 || config.cropX > 0 || config.cropY > 0) {
          ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
        } else {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
        ctx.restore();

        // Secondary Pass: Pixel-level tone balancing
        if (config.blueTone !== 0 || config.skinTone !== 0 || config.tint !== 0 || config.warmth !== 0) {
          try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              let r = d[i];
              let g = d[i + 1];
              let b = d[i + 2];

              if (config.warmth !== 0) {
                r += config.warmth * 1.2;
                b -= config.warmth * 1.0;
              }
              if (config.blueTone !== 0) {
                b += config.blueTone * 1.5;
                if (config.blueTone < 0) r -= config.blueTone * 0.3;
              }
              if (config.skinTone !== 0) {
                if (r > g && g > b) {
                  r += config.skinTone * 1.1;
                  g += config.skinTone * 0.7;
                  b -= config.skinTone * 0.4;
                }
              }
              if (config.tint !== 0) {
                r += config.tint * 0.8;
                g -= config.tint * 0.8;
                b += config.tint * 0.8;
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

        // Specialized Capability Processors
        if (activeCapability === 'bgremove' && item.file) {
          removeBackgroundClient(item.file, { tolerance: config.bgTolerance }).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'watermark' && item.file) {
          applyWatermark(item.file, {
            text: config.watermarkText,
            position: config.watermarkPos,
            opacity: config.watermarkOpacity / 100,
            color: config.watermarkColor
          }).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'privacy' && item.file) {
          const bw = (w * config.blurAreaSize) / 100;
          const bh = (h * config.blurAreaSize) / 100;
          const bx = (w - bw) / 2;
          const by = (h - bh) / 2;
          applyPrivacyBlur(item.file, [{ x: bx, y: by, width: bw, height: bh, mode: config.blurMode }]).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'inpaint' && item.file) {
          const bw = (w * config.inpaintBoxSize) / 100;
          const bh = (h * config.inpaintBoxSize) / 100;
          const bx = (w - bw) / 2;
          const by = (h - bh) / 2;
          inpaintImageClient(item.file, [{ x: bx, y: by, width: bw, height: bh }]).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'dither' && item.file) {
          applyDitherFilter(item.file, config.ditherAlgorithm, config.ditherPalette).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'negative' && item.file) {
          invertImageNegative(item.file).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
          return;
        }

        if (activeCapability === 'upscale' && item.file) {
          upscaleImageSmart(item.file, config.upscaleFactor).then((blob) => {
            const processedUrl = URL.createObjectURL(blob);
            resolve({ ...item, processedUrl, processedSize: blob.size, status: 'done' });
          }).catch(() => resolve(item));
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
          config.format,
          config.quality / 100
        );
      };
      img.src = item.previewUrl;
    });
  };

  // Real-time Automatic Pipeline Processing on parameter changes
  useEffect(() => {
    if (images.length === 0) return;
    let isCancelled = false;

    const runProcessing = async () => {
      setIsProcessing(true);
      const updated: PixelAsset[] = [];
      for (const item of images) {
        if (isCancelled) return;
        const res = await processImage(item);
        if (item.processedUrl && item.processedUrl !== res.processedUrl) {
          URL.revokeObjectURL(item.processedUrl);
        }
        updated.push(res);
        await new Promise((r) => setTimeout(r, 10)); // Non-blocking yield
      }
      if (!isCancelled) {
        setImages(updated);
        setIsProcessing(false);
      }
    };

    const timeout = setTimeout(runProcessing, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [
    images.map((i) => i.id).join(','),
    activeCapability,
    config.format,
    config.quality,
    config.scale,
    config.targetWidth,
    config.targetHeight,
    config.brightness,
    config.contrast,
    config.saturation,
    config.blueTone,
    config.skinTone,
    config.tint,
    config.warmth,
    config.straighten,
    config.blur,
    config.grayscale,
    config.sepia,
    config.invert,
    config.rotation,
    config.flipX,
    config.flipY,
    config.cropAspect,
    config.cropX,
    config.cropY,
    config.cropW,
    config.cropH,
    config.bgTolerance,
    config.watermarkText,
    config.watermarkPos,
    config.watermarkOpacity,
    config.blurMode,
    config.blurAreaSize,
    config.upscaleFactor,
    config.inpaintBoxSize,
    config.ditherAlgorithm,
    config.ditherPalette
  ]);

  // Apply settings to all in batch
  const handleApplySettingsToAll = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    const updated: PixelAsset[] = [];
    for (const item of images) {
      const res = await processImage(item);
      updated.push(res);
      await new Promise((r) => setTimeout(r, 10));
    }
    setImages(updated);
    setIsProcessing(false);
    showToast('Applied parameters across all images!');
  };

  // Export current asset
  const handleDownloadCurrent = () => {
    if (!currentAsset) return;
    const url = currentAsset.processedUrl || currentAsset.previewUrl;
    const ext = config.format === 'image/webp' ? 'webp' : config.format === 'image/png' ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = url;
    a.download = `gs-pixels-${currentAsset.name.replace(/\.[^/.]+$/, '')}.${ext}`;
    a.click();
    showToast('Exported image file!');
  };

  // Export all as ZIP
  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    const ext = config.format === 'image/webp' ? 'webp' : config.format === 'image/png' ? 'png' : 'jpg';

    for (const item of images) {
      const url = item.processedUrl || item.previewUrl;
      const blob = await fetch(url).then((r) => r.blob());
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}-processed.${ext}`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, `gs-pixels-batch-${Date.now()}.zip`);
    showToast('Exported ZIP archive!');
  };

  // Specialized triggers
  const handleRunVectorize = async () => {
    if (!currentAsset) return;
    const svg = await vectorizeBitmapToSvg(currentAsset.file, { threshold: config.vectorThreshold });
    setVectorSvgResult(svg);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    showToast('Vectorized to SVG!');
  };

  const handleRunGridSlice = async () => {
    if (!currentAsset) return;
    const slices = await sliceImageGrid(currentAsset.file, config.gridRows, config.gridCols);
    const items = slices.map((s) => ({
      filename: s.filename,
      blob: s.blob,
      url: URL.createObjectURL(s.blob)
    }));
    setGridSlices(items);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    showToast(`Sliced into ${items.length} tiles!`);
  };

  const handleRunDiff = async () => {
    if (images.length < 2) return;
    const res = await diffImagesClient(images[0].file, images[1].file, config.diffThreshold);
    setDiffMismatchPct(res.mismatchPercentage);
    setDiffResultUrl(URL.createObjectURL(res.diffBlob));
    confetti({ particleCount: 30, spread: 50 });
    showToast('Regression comparison complete!');
  };

  const handleRunStitch = async () => {
    if (images.length < 2) return;
    const files = images.map((i) => i.file);
    const blob = await stitchImagesClient(files, config.stitchOrientation, config.stitchSpacing);
    setStitchResultUrl(URL.createObjectURL(blob));
    confetti({ particleCount: 35, spread: 60 });
    showToast('Stitched panorama montage assembled!');
  };

  // CSS Filter and Transform styles for interactive canvas preview
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${config.brightness}%) contrast(${config.contrast}%) saturate(${config.saturation}%) blur(${config.blur}px) ${
      config.grayscale ? 'grayscale(100%)' : ''
    } ${config.sepia ? 'sepia(100%)' : ''} ${config.invert ? 'invert(100%)' : ''}`,
  };

  const transformStyle: React.CSSProperties = {
    transform: `rotate(${config.rotation}deg) scaleX(${config.flipX ? -1 : 1}) scaleY(${config.flipY ? -1 : 1})`,
  };

  const savingsPct = currentAsset?.processedSize
    ? Math.max(0, Math.round(((currentAsset.originalSize - currentAsset.processedSize) / currentAsset.originalSize) * 100))
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] w-full overflow-hidden transition-colors duration-300">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 1. TOP BAR */}
      <PixelsTopBar
        assets={images}
        selectedId={selectedImageId}
        onSelectAsset={(id) => setSelectedImageId(id)}
        onCloseAsset={handleCloseAsset}
        onOpenFiles={() => fileInputRef.current?.click()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onDownloadCurrent={handleDownloadCurrent}
        onDownloadZip={handleDownloadZip}
        onClearAll={() => setImages([])}
        onPasteClipboard={handlePasteFromClipboard}
      />

      {/* 2. MAIN WORKSPACE DECK */}
      <div className="flex-1 flex overflow-hidden relative">
        {images.length === 0 ? (
          <PixelsEmptyState
            onSelectFiles={handleFiles}
            onPasteClipboard={handlePasteFromClipboard}
            onOpenFilePicker={() => fileInputRef.current?.click()}
          />
        ) : (
          <>
            {/* LEFT TOOL RAIL */}
            <PixelsToolRail
              activeCapability={activeCapability}
              onSelectCapability={(cap) => setActiveCapability(cap)}
            />

            {/* CENTER IMAGE CANVAS */}
            <PixelsCanvas
              asset={currentAsset}
              processedUrl={currentAsset?.processedUrl}
              config={config}
              onUpdateCrop={(crop) => setConfig((c) => ({ ...c, ...crop }))}
              isCropActive={activeCapability === 'crop'}
              filterStyle={filterStyle}
              transformStyle={transformStyle}
            />

            {/* RIGHT CONTEXTUAL INSPECTOR */}
            <PixelsInspector
              capability={activeCapability}
              config={config}
              onChangeConfig={handleUpdateConfig}
              onResetAdjustments={() => {
                setConfig((prev) => ({
                  ...prev,
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  blueTone: 0,
                  skinTone: 0,
                  tint: 0,
                  warmth: 0,
                  straighten: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: false,
                  invert: false,
                  rotation: 0,
                  flipX: false,
                  flipY: false,
                }));
                showToast('Reset adjustments');
              }}
              asset={currentAsset}
              allAssets={images}
              detailedColors={detailedColors}
              pickedColor={pickedColor}
              onPickEyedropper={handlePickEyedropper}
              onExportPaletteImage={handleExportPaletteImage}
              onCropPreset={handleCropPreset}
              onApplySettingsToAll={handleApplySettingsToAll}
              onRunVectorize={handleRunVectorize}
              vectorSvgResult={vectorSvgResult}
              onRunGridSlice={handleRunGridSlice}
              gridSlices={gridSlices}
              onRunDiff={handleRunDiff}
              diffMismatchPct={diffMismatchPct}
              diffResultUrl={diffResultUrl}
              onRunStitch={handleRunStitch}
              stitchResultUrl={stitchResultUrl}
              onDownloadZip={handleDownloadZip}
              showToast={showToast}
            />
          </>
        )}
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <PixelsStatusBar
        asset={currentAsset}
        totalAssets={images.length}
        isProcessing={isProcessing}
        savingsPct={savingsPct}
      />

      {/* Floating Micro-Toast Feedback */}
      {toastMessage && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-md z-50 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
