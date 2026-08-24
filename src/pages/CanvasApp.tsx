import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  PenTool,
  Download,
  Upload,
  Layers,
  Palette,
  Undo2,
  Redo2,
  Trash2,
  Grid,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  HelpCircle,
  Keyboard,
  Settings2,
  Save,
  FilePlus,
  FolderOpen,
  Eye,
  Shapes,
  Camera,
  Image as ImageIcon,
  RectangleHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CanvasProject,
  VectorStroke,
  CanvasLayer,
  ToolMode,
  BrushType,
  CameraViewport,
  GridType,
  HistoryEntry,
  AspectRatioPreset,
  CanvasSheet,
  CanvasImageItem
} from '../lib/canvas/types';
import {
  createDefaultProject,
  autoSaveProject,
  loadLastActiveProject,
  getSheetDimensions
} from '../lib/canvas/canvasStorage';
import { parseGSCanvasProject, packageGSCanvasProject } from '../lib/canvas/exportEngine';
import { transformStroke } from '../lib/canvas/bezierMath';
import { saveWorkspaceFile } from '../lib/db';

import { CanvasViewport } from '../components/canvas/CanvasViewport';
import { RadialToolMenu } from '../components/canvas/RadialToolMenu';
import { FloatingPropertyBar } from '../components/canvas/FloatingPropertyBar';
import { NodeEditorOverlay } from '../components/canvas/NodeEditorOverlay';
import { LayersPanel } from '../components/canvas/LayersPanel';
import { ColorPaletteModal } from '../components/canvas/ColorPaletteModal';
import { CanvasMinimap } from '../components/canvas/CanvasMinimap';
import { CanvasExportModal } from '../components/canvas/CanvasExportModal';
import { CanvasSnapshotModal } from '../components/canvas/CanvasSnapshotModal';

interface CanvasAppProps {
  onNavigate?: (app: string) => void;
}

export const CanvasApp: React.FC<CanvasAppProps> = ({ onNavigate }) => {
  // Project State
  const [project, setProject] = useState<CanvasProject>(() => createDefaultProject());
  const [activeLayerId, setActiveLayerId] = useState<string>(() => project.layers[0]?.id || 'layer_1');
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);

  // Tool & Brush State
  const [currentTool, setCurrentTool] = useState<ToolMode>('draw');
  const [currentBrush, setCurrentBrush] = useState<BrushType>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#06b6d4');
  const [currentWidth, setCurrentWidth] = useState<number>(4);
  const [currentOpacity, setCurrentOpacity] = useState<number>(1);
  const [smartShapeEnabled, setSmartShapeEnabled] = useState<boolean>(true);

  // UI Modes & Modals
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [leftHanded, setLeftHanded] = useState<boolean>(() => {
    return localStorage.getItem('gs_canvas_left_handed') === 'true';
  });
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [showPaletteModal, setShowPaletteModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState<boolean>(false);
  const [showAspectRatioModal, setShowAspectRatioModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isNodeEditMode, setIsNodeEditMode] = useState<boolean>(false);

  // Undo / Redo History Stack
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoingRef = useRef<boolean>(false);

  // Container & File Input Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen Toggle Handler
  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      // Graceful fallback to CSS viewport fullscreen
      setIsFullscreen(prev => !prev);
    }
  }, []);

  // Push Snapshot to History
  const pushHistory = useCallback((description: string, currentProject: CanvasProject, selectedIds: string[] = []) => {
    if (isUndoRedoingRef.current) return;

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({
      description,
      strokes: JSON.parse(JSON.stringify(currentProject.strokes)),
      layers: JSON.parse(JSON.stringify(currentProject.layers)),
      sheets: currentProject.sheets ? JSON.parse(JSON.stringify(currentProject.sheets)) : undefined,
      images: currentProject.images ? JSON.parse(JSON.stringify(currentProject.images)) : undefined,
      selectedStrokeIds: [...selectedIds]
    });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  // Initialize and Restore last active project from IndexedDB
  useEffect(() => {
    const restore = async () => {
      const saved = await loadLastActiveProject();
      if (saved) {
        // Ensure defaults if missing in legacy saved project
        const projectWithDefaults: CanvasProject = {
          ...saved,
          aspectRatio: saved.aspectRatio || 'infinite',
          activeSheetIndex: saved.activeSheetIndex || 0,
          sheets: saved.sheets && saved.sheets.length > 0 ? saved.sheets : [
            {
              id: `sheet_1`,
              pageNumber: 1,
              name: 'Sheet 1',
              aspectRatio: saved.aspectRatio || 'infinite',
              width: getSheetDimensions(saved.aspectRatio || 'infinite').width,
              height: getSheetDimensions(saved.aspectRatio || 'infinite').height,
              x: 0,
              y: 0
            }
          ],
          images: saved.images || []
        };
        setProject(projectWithDefaults);
        if (projectWithDefaults.layers.length > 0) {
          setActiveLayerId(projectWithDefaults.layers[0].id);
        }
        pushHistory('Initial Project Load', projectWithDefaults);
      } else {
        const initial = createDefaultProject();
        setProject(initial);
        setActiveLayerId(initial.layers[0].id);
        pushHistory('Initial Canvas', initial);
      }
    };
    restore();
  }, [pushHistory]);

  // Debounced Autosave to IndexedDB
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSaveProject(project);
    }, 1000);
    return () => clearTimeout(timer);
  }, [project]);

  // Undo Action
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoingRef.current = true;
      historyIndexRef.current -= 1;
      const snapshot = historyRef.current[historyIndexRef.current];

      setProject(prev => ({
        ...prev,
        strokes: JSON.parse(JSON.stringify(snapshot.strokes)),
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        sheets: snapshot.sheets ? JSON.parse(JSON.stringify(snapshot.sheets)) : prev.sheets,
        images: snapshot.images ? JSON.parse(JSON.stringify(snapshot.images)) : prev.images,
        updatedAt: Date.now()
      }));
      setSelectedStrokeIds(snapshot.selectedStrokeIds || []);
      isUndoRedoingRef.current = false;
    }
  }, []);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoingRef.current = true;
      historyIndexRef.current += 1;
      const snapshot = historyRef.current[historyIndexRef.current];

      setProject(prev => ({
        ...prev,
        strokes: JSON.parse(JSON.stringify(snapshot.strokes)),
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        sheets: snapshot.sheets ? JSON.parse(JSON.stringify(snapshot.sheets)) : prev.sheets,
        images: snapshot.images ? JSON.parse(JSON.stringify(snapshot.images)) : prev.images,
        updatedAt: Date.now()
      }));
      setSelectedStrokeIds(snapshot.selectedStrokeIds || []);
      isUndoRedoingRef.current = false;
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdOrCtrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      } else if (cmdOrCtrl && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setShowExportModal(true);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        if (!cmdOrCtrl) {
          e.preventDefault();
          setShowSnapshotModal(true);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('draw');
        setCurrentBrush('pen');
      } else if (e.key === 'm' || e.key === 'M') {
        setCurrentTool('draw');
        setCurrentBrush('marker');
      } else if (e.key === 'b' || e.key === 'B') {
        setCurrentTool('draw');
        setCurrentBrush('pencil');
      } else if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      } else if (e.key === 'v' || e.key === 'V') {
        setCurrentTool('select');
      } else if (e.key === 'h' || e.key === 'H') {
        setCurrentTool('pan');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStrokeIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleToggleFullscreen, selectedStrokeIds]);

  // STROKE & IMAGE HANDLERS
  const handleStrokeCompleted = (newStroke: VectorStroke) => {
    setProject(prev => {
      const updated = {
        ...prev,
        strokes: [...prev.strokes, newStroke],
        updatedAt: Date.now()
      };
      pushHistory('Draw Stroke', updated);
      return updated;
    });
  };

  const handleStrokesDeleted = (deletedIds: string[]) => {
    const idSet = new Set(deletedIds);
    setProject(prev => {
      const updated = {
        ...prev,
        strokes: prev.strokes.filter(s => !idSet.has(s.id)),
        images: (prev.images || []).filter(img => !idSet.has(img.id)),
        updatedAt: Date.now()
      };
      pushHistory('Erase Item(s)', updated);
      return updated;
    });
    setSelectedStrokeIds(prev => prev.filter(id => !idSet.has(id)));
  };

  const handleStrokeUpdated = (updatedStroke: VectorStroke) => {
    setProject(prev => {
      const updated = {
        ...prev,
        strokes: prev.strokes.map(s => (s.id === updatedStroke.id ? updatedStroke : s)),
        updatedAt: Date.now()
      };
      pushHistory('Edit Vector Node', updated, selectedStrokeIds);
      return updated;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedStrokeIds.length === 0) return;
    handleStrokesDeleted(selectedStrokeIds);
    setSelectedStrokeIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedStrokeIds.length === 0) return;
    const selected = project.strokes.filter(s => selectedStrokeIds.includes(s.id));
    const duplicated = selected.map(s => {
      const transformed = transformStroke(s, 20, 20);
      return {
        ...transformed,
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    });

    setProject(prev => {
      const updated = {
        ...prev,
        strokes: [...prev.strokes, ...duplicated],
        updatedAt: Date.now()
      };
      pushHistory('Duplicate Stroke(s)', updated, duplicated.map(d => d.id));
      return updated;
    });

    setSelectedStrokeIds(duplicated.map(d => d.id));
  };

  // PLACED IMAGE HANDLERS
  const handleImageAdded = (newImage: CanvasImageItem) => {
    setProject(prev => {
      const updated = {
        ...prev,
        images: [...(prev.images || []), newImage],
        updatedAt: Date.now()
      };
      pushHistory('Insert Image', updated);
      return updated;
    });
    setSelectedStrokeIds([newImage.id]);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
  };

  const handleImageUpdated = (updatedImage: CanvasImageItem) => {
    setProject(prev => ({
      ...prev,
      images: (prev.images || []).map(img => (img.id === updatedImage.id ? updatedImage : img)),
      updatedAt: Date.now()
    }));
  };

  // FILE INPUT FOR IMAGE UPLOAD
  const handleImageFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const cam = project.camera;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const centerWorld = {
          x: (screenW / 2 - cam.x) / cam.zoom,
          y: (screenH / 2 - cam.y) / cam.zoom
        };

        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const r = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * r);
          h = Math.round(h * r);
        }

        const newImageItem: CanvasImageItem = {
          id: `img_${Date.now()}`,
          layerId: activeLayerId,
          src,
          name: file.name,
          x: centerWorld.x - w / 2,
          y: centerWorld.y - h / 2,
          width: w,
          height: h,
          opacity: 1,
          createdAt: Date.now()
        };

        handleImageAdded(newImageItem);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ASPECT RATIO & SHEET HANDLERS
  const handleChangeAspectRatio = (preset: AspectRatioPreset) => {
    const dims = getSheetDimensions(preset);
    setProject(prev => {
      const newSheets: CanvasSheet[] =
        preset === 'infinite'
          ? [
              {
                id: `sheet_infinite`,
                pageNumber: 1,
                name: 'Infinite Desk',
                aspectRatio: 'infinite',
                width: 0,
                height: 0,
                x: 0,
                y: 0
              }
            ]
          : (prev.sheets || []).map((s, idx) => ({
              ...s,
              aspectRatio: preset,
              width: dims.width,
              height: dims.height,
              x: idx * (dims.width + 120),
              y: 0
            }));

      // If no sheets existed before
      if (newSheets.length === 0 && preset !== 'infinite') {
        newSheets.push({
          id: `sheet_${Date.now()}`,
          pageNumber: 1,
          name: 'Sheet 1',
          aspectRatio: preset,
          width: dims.width,
          height: dims.height,
          x: 0,
          y: 0
        });
      }

      const updated = {
        ...prev,
        aspectRatio: preset,
        activeSheetIndex: 0,
        sheets: newSheets,
        updatedAt: Date.now()
      };
      pushHistory(`Change Aspect Ratio to ${preset}`, updated);
      return updated;
    });

    setShowAspectRatioModal(false);

    // Center camera on active sheet
    if (preset !== 'infinite' && dims.width > 0) {
      centerCameraOnSheet(0, dims.width, dims.height, 0);
    }
  };

  const centerCameraOnSheet = (sheetIndex: number, sheetW: number, sheetH: number, sheetX: number) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const padding = 120;
    const zoom = Math.min((screenW - padding) / sheetW, (screenH - padding) / sheetH, 1.2);
    const camX = screenW / 2 - (sheetX + sheetW / 2) * zoom;
    const camY = screenH / 2 - (sheetH / 2) * zoom;

    setProject(prev => ({
      ...prev,
      activeSheetIndex: sheetIndex,
      camera: { x: camX, y: camY, zoom }
    }));
  };

  const handleSelectSheet = (sheetIndex: number) => {
    if (!project.sheets || !project.sheets[sheetIndex]) return;
    const sheet = project.sheets[sheetIndex];
    centerCameraOnSheet(sheetIndex, sheet.width, sheet.height, sheet.x);
  };

  const handleAddSheet = () => {
    const dims = getSheetDimensions(project.aspectRatio);
    const currentSheets = project.sheets || [];
    const nextIdx = currentSheets.length;
    const lastSheet = currentSheets[currentSheets.length - 1];
    const nextX = lastSheet ? lastSheet.x + lastSheet.width + 140 : 0;

    const newSheet: CanvasSheet = {
      id: `sheet_${Date.now()}`,
      pageNumber: nextIdx + 1,
      name: `Sheet ${nextIdx + 1}`,
      aspectRatio: project.aspectRatio,
      width: dims.width || 1240,
      height: dims.height || 1754,
      x: nextX,
      y: 0
    };

    setProject(prev => {
      const updated = {
        ...prev,
        sheets: [...(prev.sheets || []), newSheet],
        activeSheetIndex: nextIdx,
        updatedAt: Date.now()
      };
      pushHistory('Add New Sheet', updated);
      return updated;
    });

    centerCameraOnSheet(nextIdx, newSheet.width, newSheet.height, newSheet.x);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
  };

  const handleDeleteSheet = (sheetIndex: number) => {
    if (!project.sheets || project.sheets.length <= 1) return;
    if (window.confirm(`Delete Sheet ${sheetIndex + 1}?`)) {
      setProject(prev => {
        const filtered = prev.sheets.filter((_, idx) => idx !== sheetIndex);
        const renumbered = filtered.map((s, idx) => ({ ...s, pageNumber: idx + 1, name: `Sheet ${idx + 1}` }));
        const newActive = Math.min(prev.activeSheetIndex, renumbered.length - 1);
        const updated = {
          ...prev,
          sheets: renumbered,
          activeSheetIndex: newActive,
          updatedAt: Date.now()
        };
        pushHistory('Delete Sheet', updated);
        return updated;
      });
    }
  };

  // SUITE BRIDGES HANDOFFS
  const handleSendToPixels = async (blob: Blob, name: string) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      await saveWorkspaceFile({
        id: `img_handoff_${Date.now()}`,
        app: 'pixels',
        name,
        type: blob.type || 'image/png',
        size: blob.size,
        data: arrayBuffer,
        timestamp: Date.now()
      });
      setShowSnapshotModal(false);
      if (onNavigate) {
        onNavigate('pixels');
      } else {
        alert('Snapshot saved to GS-Pixels! Switch to GS-Pixels from the suite menu to edit.');
      }
    } catch (e) {
      console.error('Handoff error:', e);
    }
  };

  const handleSendToPdf = async (blob: Blob, name: string) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      await saveWorkspaceFile({
        id: `doc_handoff_${Date.now()}`,
        app: 'pdf',
        name,
        type: blob.type || 'image/png',
        size: blob.size,
        data: arrayBuffer,
        timestamp: Date.now()
      });
      setShowSnapshotModal(false);
      if (onNavigate) {
        onNavigate('pdf');
      } else {
        alert('Snapshot saved to GS-PDF! Switch to GS-PDF from the suite menu to view.');
      }
    } catch (e) {
      console.error('Handoff error:', e);
    }
  };

  // PROPERTY BAR HANDLERS
  const handleWidthChange = (width: number) => {
    setCurrentWidth(width);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s => (selectedStrokeIds.includes(s.id) ? { ...s, width, updatedAt: Date.now() } : s)),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Width', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    setCurrentOpacity(opacity);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s => (selectedStrokeIds.includes(s.id) ? { ...s, opacity, updatedAt: Date.now() } : s)),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Opacity', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s => (selectedStrokeIds.includes(s.id) ? { ...s, color, updatedAt: Date.now() } : s)),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Color', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  // LAYER HANDLERS
  const handleAddLayer = () => {
    const newLayerId = `layer_${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newLayerId,
      name: `Layer ${project.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      createdAt: Date.now()
    };
    setProject(prev => {
      const updated = {
        ...prev,
        layers: [newLayer, ...prev.layers],
        updatedAt: Date.now()
      };
      pushHistory('Add Layer', updated);
      return updated;
    });
    setActiveLayerId(newLayerId);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (project.layers.length <= 1) return;
    setProject(prev => {
      const updated = {
        ...prev,
        layers: prev.layers.filter(l => l.id !== layerId),
        strokes: prev.strokes.filter(s => s.layerId !== layerId),
        updatedAt: Date.now()
      };
      pushHistory('Delete Layer', updated);
      return updated;
    });
    if (activeLayerId === layerId) {
      setActiveLayerId(project.layers.find(l => l.id !== layerId)?.id || 'layer_1');
    }
  };

  const handleDuplicateLayer = (layerId: string) => {
    const layer = project.layers.find(l => l.id === layerId);
    if (!layer) return;

    const dupLayerId = `layer_${Date.now()}`;
    const dupLayer: CanvasLayer = {
      ...layer,
      id: dupLayerId,
      name: `${layer.name} (Copy)`,
      createdAt: Date.now()
    };

    const layerStrokes = project.strokes.filter(s => s.layerId === layerId);
    const dupStrokes = layerStrokes.map(s => ({
      ...s,
      id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      layerId: dupLayerId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    setProject(prev => {
      const updated = {
        ...prev,
        layers: [dupLayer, ...prev.layers],
        strokes: [...prev.strokes, ...dupStrokes],
        updatedAt: Date.now()
      };
      pushHistory('Duplicate Layer', updated);
      return updated;
    });
    setActiveLayerId(dupLayerId);
  };

  const handleUpdateLayer = (updatedLayer: CanvasLayer) => {
    setProject(prev => {
      const updated = {
        ...prev,
        layers: prev.layers.map(l => (l.id === updatedLayer.id ? updatedLayer : l)),
        updatedAt: Date.now()
      };
      pushHistory('Update Layer Settings', updated);
      return updated;
    });
  };

  const handleReorderLayer = (dragIndex: number, hoverIndex: number) => {
    setProject(prev => {
      const reordered = [...prev.layers];
      const [removed] = reordered.splice(dragIndex, 1);
      reordered.splice(hoverIndex, 0, removed);
      const updated = {
        ...prev,
        layers: reordered,
        updatedAt: Date.now()
      };
      pushHistory('Reorder Layers', updated);
      return updated;
    });
  };

  // CAMERA & MINIMAP HANDLERS
  const handleCameraChanged = (camera: CameraViewport) => {
    setProject(prev => ({
      ...prev,
      camera
    }));
  };

  const handleFitToScreen = () => {
    if (project.aspectRatio !== 'infinite' && project.sheets && project.sheets[project.activeSheetIndex]) {
      const sheet = project.sheets[project.activeSheetIndex];
      centerCameraOnSheet(project.activeSheetIndex, sheet.width, sheet.height, sheet.x);
      return;
    }

    if (project.strokes.length === 0) {
      setProject(prev => ({
        ...prev,
        camera: { x: 0, y: 0, zoom: 1 }
      }));
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const s of project.strokes) {
      if (s.bounds.minX < minX) minX = s.bounds.minX;
      if (s.bounds.maxX > maxX) maxX = s.bounds.maxX;
      if (s.bounds.minY < minY) minY = s.bounds.minY;
      if (s.bounds.maxY > maxY) maxY = s.bounds.maxY;
    }

    const contentW = maxX - minX + 100;
    const contentH = maxY - minY + 100;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const zoom = Math.min(screenW / contentW, screenH / contentH, 4);
    const camX = screenW / 2 - ((minX + maxX) / 2) * zoom;
    const camY = screenH / 2 - ((minY + maxY) / 2) * zoom;

    setProject(prev => ({
      ...prev,
      camera: { x: camX, y: camY, zoom }
    }));
  };

  const handleResetZoom = () => {
    setProject(prev => ({
      ...prev,
      camera: { ...prev.camera, zoom: 1 }
    }));
  };

  // GRID & BACKGROUND TOGGLES
  const handleToggleGrid = () => {
    const order: GridType[] = ['dot', 'line', 'isometric', 'none'];
    const nextIndex = (order.indexOf(project.grid.type) + 1) % order.length;
    setProject(prev => ({
      ...prev,
      grid: { ...prev.grid, type: order[nextIndex] }
    }));
  };

  // NEW SKETCH / CLEAR / IMPORT
  const handleNewSketch = () => {
    if (window.confirm('Create a new blank sketchbook? Unsaved changes are safely autosaved in IndexedDB.')) {
      const fresh = createDefaultProject('New Sketchbook', project.aspectRatio);
      setProject(fresh);
      setActiveLayerId(fresh.layers[0].id);
      setSelectedStrokeIds([]);
      pushHistory('New Sketchbook', fresh);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const imported = parseGSCanvasProject(text);
        setProject(imported);
        if (imported.layers.length > 0) {
          setActiveLayerId(imported.layers[0].id);
        }
        setSelectedStrokeIds([]);
        pushHistory('Import .gscanvas', imported);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (err) {
        alert('Could not parse .gscanvas file. Please ensure it is a valid GS-Canvas file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedStrokes = project.strokes.filter(s => selectedStrokeIds.includes(s.id));

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`relative w-full overflow-hidden bg-slate-950 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gscanvas,.json"
        onChange={handleImportFile}
        className="hidden"
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*,.svg"
        onChange={handleImageFileInputChange}
        className="hidden"
      />

      {/* TOP HEADER CONTROLS BAR (Hidden in Zen Mode) */}
      {!isZenMode && (
        <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2 flex-wrap sm:flex-nowrap">
          {/* Left: Project Name & Quick Tools */}
          <div className="flex items-center gap-2 pointer-events-auto neu-card px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/30">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0 pr-2">
              <input
                type="text"
                value={project.name}
                onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
                className="text-xs font-black text-white bg-transparent border-b border-transparent hover:border-slate-500 focus:border-cyan-400 focus:outline-none max-w-[120px] sm:max-w-[200px] truncate"
                placeholder="Sketchbook Name"
              />
              <p className="text-[10px] text-slate-400 font-mono">
                {project.strokes.length} vectors • {project.layers.length} layers
              </p>
            </div>

            <div className="w-px h-6 bg-slate-700/50 mx-0.5" />

            {/* Aspect Ratio Constraint Selector */}
            <button
              onClick={() => setShowAspectRatioModal(true)}
              className="px-2.5 py-1.5 rounded-xl neu-btn text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-bold"
              title="Canvas Aspect Ratio & Sheet Preset (A4, 16:9, etc.)"
            >
              <RectangleHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline capitalize">
                {project.aspectRatio === 'infinite' ? 'Infinite' : project.aspectRatio.replace('-', ' ')}
              </span>
            </button>

            {/* Insert Image Button */}
            <button
              onClick={() => imageFileInputRef.current?.click()}
              className="p-1.5 rounded-xl neu-btn text-emerald-400 hover:text-emerald-300"
              title="Upload File / Image to Canvas"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Grid Toggle */}
            <button
              onClick={handleToggleGrid}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white"
              title={`Grid: ${project.grid.type.toUpperCase()}`}
            >
              <Grid className="w-4 h-4 text-cyan-400" />
            </button>

            {/* New Sketch */}
            <button
              onClick={handleNewSketch}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white hidden sm:inline-flex"
              title="New Blank Sketchbook"
            >
              <FilePlus className="w-4 h-4" />
            </button>

            {/* Open .gscanvas */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white hidden sm:inline-flex"
              title="Open .gscanvas Project File"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Snapshot, Fullscreen, Zen & Export */}
          <div className="flex items-center gap-2 pointer-events-auto ml-auto">
            {/* Snapshot Camera Button */}
            <button
              onClick={() => setShowSnapshotModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl neu-card text-xs font-bold text-cyan-300 hover:text-white shadow-xl backdrop-blur-md border border-cyan-500/30 hover:scale-105 transition-all"
              title="Take Canvas Snapshot & Share (Press S)"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Snapshot</span>
            </button>

            {/* Fullscreen Canvas Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className={`p-2.5 rounded-2xl neu-card transition-all shadow-xl backdrop-blur-md ${
                isFullscreen ? 'text-cyan-400 neu-inset' : 'text-slate-300 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Full Screen (Press F)' : 'Full Screen Canvas (Press F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Zen Distraction-Free Toggle */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-2.5 rounded-2xl neu-card text-slate-300 hover:text-white shadow-xl backdrop-blur-md hidden sm:block"
              title="Distraction-Free Zen Mode (Press Tab)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Main Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>
      )}

      {/* MULTI-SHEET PAGINATION BAR (When Constrained Aspect Ratio like A4 is active) */}
      {!isZenMode && project.aspectRatio !== 'infinite' && project.sheets && project.sheets.length > 0 && (
        <div className="absolute top-18 sm:top-18 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 neu-card px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md border border-cyan-500/30 animate-in fade-in slide-in-from-top-2">
          {/* Previous Sheet */}
          <button
            onClick={() => handleSelectSheet(Math.max(0, project.activeSheetIndex - 1))}
            disabled={project.activeSheetIndex === 0}
            className="p-1 rounded-lg neu-btn text-slate-300 disabled:opacity-30"
            title="Previous Sheet"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Badge */}
          <span className="text-xs font-black text-white px-2">
            Sheet {project.activeSheetIndex + 1} <span className="text-slate-500">/ {project.sheets.length}</span>
          </span>

          {/* Next Sheet */}
          <button
            onClick={() => handleSelectSheet(Math.min(project.sheets.length - 1, project.activeSheetIndex + 1))}
            disabled={project.activeSheetIndex >= project.sheets.length - 1}
            className="p-1 rounded-lg neu-btn text-slate-300 disabled:opacity-30"
            title="Next Sheet"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700/60 mx-1" />

          {/* Add New Sheet */}
          <button
            onClick={handleAddSheet}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shadow-md shadow-cyan-600/30 transition-all hover:scale-105"
            title="Add New Sheet Page to Project"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sheet</span>
          </button>

          {/* Delete Sheet */}
          {project.sheets.length > 1 && (
            <button
              onClick={() => handleDeleteSheet(project.activeSheetIndex)}
              className="p-1 rounded-lg neu-btn text-rose-400 hover:text-rose-300"
              title="Delete Active Sheet"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ZEN MODE FLOATING RESTORE BUTTON */}
      {isZenMode && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={handleToggleFullscreen}
            className={`p-2.5 rounded-2xl neu-card shadow-2xl backdrop-blur-md hover:scale-105 transition-all ${
              isFullscreen ? 'text-cyan-400 neu-inset' : 'text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Full Screen (Press F)' : 'Full Screen Canvas (Press F)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-card text-xs font-bold text-cyan-300 shadow-2xl backdrop-blur-md hover:scale-105"
            title="Exit Zen Mode (Press Tab)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT WITH 2-FINGER TOUCH PHYSICS & UNDO */}
      <CanvasViewport
        project={project}
        currentTool={currentTool}
        currentBrush={currentBrush}
        currentColor={currentColor}
        currentWidth={currentWidth}
        currentOpacity={currentOpacity}
        activeLayerId={activeLayerId}
        selectedStrokeIds={selectedStrokeIds}
        smartShapeEnabled={smartShapeEnabled}
        onStrokeCompleted={handleStrokeCompleted}
        onStrokesDeleted={handleStrokesDeleted}
        onSelectionChanged={setSelectedStrokeIds}
        onCameraChanged={handleCameraChanged}
        onUndo={handleUndo}
        onImageAdded={handleImageAdded}
        onImageUpdated={handleImageUpdated}
        onSheetSelect={handleSelectSheet}
      />

      {/* NODE EDITOR OVERLAY */}
      {isNodeEditMode && selectedStrokes.length > 0 && (
        <NodeEditorOverlay
          selectedStrokes={selectedStrokes}
          camera={project.camera}
          onStrokeUpdated={handleStrokeUpdated}
        />
      )}

      {/* CONTEXTUAL FLOATING PROPERTY PILL */}
      {!isZenMode && (
        <FloatingPropertyBar
          currentTool={currentTool}
          currentBrush={currentBrush}
          currentColor={currentColor}
          currentWidth={currentWidth}
          currentOpacity={currentOpacity}
          selectedStrokes={selectedStrokes}
          onWidthChange={handleWidthChange}
          onOpacityChange={handleOpacityChange}
          onColorChange={handleColorChange}
          onOpenColorPicker={() => setShowPaletteModal(true)}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onToggleNodeEdit={() => setIsNodeEditMode(prev => !prev)}
          isNodeEditMode={isNodeEditMode}
        />
      )}

      {/* FLOATING RADIAL TOOL WHEEL & AUXILIARY CONTROLS */}
      <RadialToolMenu
        currentTool={currentTool}
        currentBrush={currentBrush}
        smartShapeEnabled={smartShapeEnabled}
        leftHanded={leftHanded}
        canUndo={historyIndexRef.current > 0}
        canRedo={historyIndexRef.current < historyRef.current.length - 1}
        onSelectTool={(tool, brush) => {
          setCurrentTool(tool);
          if (brush) setCurrentBrush(brush);
          if (tool !== 'select' && tool !== 'node-edit') {
            setIsNodeEditMode(false);
          }
        }}
        onToggleSmartShape={() => setSmartShapeEnabled(prev => !prev)}
        onOpenLayers={() => setShowLayersPanel(prev => !prev)}
        onOpenPalette={() => setShowPaletteModal(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSnapshot={() => setShowSnapshotModal(true)}
        onUploadImage={() => imageFileInputRef.current?.click()}
      />

      {/* FLOATING MINIMAP NAVIGATOR */}
      {!isZenMode && (
        <CanvasMinimap
          project={project}
          onCameraChange={handleCameraChanged}
          onFitToScreen={handleFitToScreen}
          onResetZoom={handleResetZoom}
        />
      )}

      {/* FLOATING LAYERS PANEL */}
      {showLayersPanel && (
        <LayersPanel
          layers={project.layers}
          strokes={project.strokes}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onUpdateLayer={handleUpdateLayer}
          onReorderLayer={handleReorderLayer}
          onClose={() => setShowLayersPanel(false)}
        />
      )}

      {/* COLOR PALETTE MODAL */}
      {showPaletteModal && (
        <ColorPaletteModal
          currentColor={currentColor}
          onSelectColor={handleColorChange}
          onClose={() => setShowPaletteModal(false)}
        />
      )}

      {/* EXPORT ARTWORK MODAL */}
      {showExportModal && (
        <CanvasExportModal
          project={project}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* SNAPSHOT STUDIO BRIDGE MODAL */}
      {showSnapshotModal && (
        <CanvasSnapshotModal
          project={project}
          onClose={() => setShowSnapshotModal(false)}
          onSendToPixels={handleSendToPixels}
          onSendToPdf={handleSendToPdf}
        />
      )}

      {/* ASPECT RATIO SELECTOR MODAL */}
      {showAspectRatioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="neu-card p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <RectangleHorizontal className="w-5 h-5 text-cyan-400" />
                <span>Canvas Aspect Ratio & Sheet Presets</span>
              </div>
              <button
                onClick={() => setShowAspectRatioModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select standard print sheets (A4, Letter) or digital aspect ratios (16:9, 1:1, 9:16). Sheets constrain drawing boundaries, allow multi-page pagination, and export clean documents.
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'infinite', name: 'Infinite Workbench', desc: 'Unbounded infinite canvas' },
                { id: 'a4-portrait', name: 'A4 Portrait', desc: '1240 × 1754 px • Standard Print' },
                { id: 'a4-landscape', name: 'A4 Landscape', desc: '1754 × 1240 px • Landscape Paper' },
                { id: 'letter-portrait', name: 'US Letter', desc: '1275 × 1650 px • US Paper' },
                { id: '16:9', name: '16:9 Widescreen', desc: '1920 × 1080 px • Presentation' },
                { id: '9:16', name: '9:16 Mobile Story', desc: '1080 × 1920 px • Mobile Screen' },
                { id: '1:1', name: '1:1 Square', desc: '1200 × 1200 px • Social Media' },
                { id: '4:3', name: '4:3 Classic', desc: '1600 × 1200 px • Tablet Screen' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleChangeAspectRatio(item.id as AspectRatioPreset)}
                  className={`p-3 rounded-2xl neu-btn text-left border transition-all ${
                    project.aspectRatio === item.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/20'
                      : 'border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-xs text-white">{item.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="neu-card p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl border border-slate-700/40">
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <span>GS-Canvas Keyboard Shortcuts & Gestures</span>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: '2-Finger Drag', desc: 'Smooth Viewport Pan & Pinch Zoom' },
                { key: '2-Finger Quick Tap', desc: 'Instant Undo ↺' },
                { key: 'Ctrl + V / Drop', desc: 'Paste / Drop Image onto Sheet' },
                { key: 'S', desc: 'Snapshot Studio & Share' },
                { key: 'P', desc: 'Pen Tool' },
                { key: 'M', desc: 'Marker Tool (Multiply)' },
                { key: 'B', desc: 'Pencil Tool' },
                { key: 'E', desc: 'Eraser Tool' },
                { key: 'V', desc: 'Select / Node Tool' },
                { key: 'H / Space', desc: 'Pan Infinite Canvas' },
                { key: 'Ctrl + Z', desc: 'Undo' },
                { key: 'Ctrl + Y', desc: 'Redo' },
                { key: 'Ctrl + E', desc: 'Export Dialog' },
                { key: 'F', desc: 'Full Screen Canvas' },
                { key: 'Tab', desc: 'Zen Distraction-Free' },
                { key: 'Del / Backspace', desc: 'Delete Selected' }
              ].map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl neu-inset flex justify-between items-center">
                  <kbd className="px-2 py-0.5 rounded bg-slate-900 font-mono text-cyan-400 font-bold text-[11px] border border-slate-700">
                    {s.key}
                  </kbd>
                  <span className="text-slate-300 text-[11px]">{s.desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasApp;
