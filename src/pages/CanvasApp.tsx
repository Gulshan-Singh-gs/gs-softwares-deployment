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
  Maximize2,
  Minimize2,
  HelpCircle,
  Keyboard,
  Settings2,
  Save,
  FilePlus,
  FolderOpen,
  Eye,
  Shapes
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
  HistoryEntry
} from '../lib/canvas/types';
import {
  createDefaultProject,
  autoSaveProject,
  loadLastActiveProject
} from '../lib/canvas/canvasStorage';
import { parseGSCanvasProject, packageGSCanvasProject } from '../lib/canvas/exportEngine';
import { transformStroke } from '../lib/canvas/bezierMath';

import { CanvasViewport } from '../components/canvas/CanvasViewport';
import { RadialToolMenu } from '../components/canvas/RadialToolMenu';
import { FloatingPropertyBar } from '../components/canvas/FloatingPropertyBar';
import { NodeEditorOverlay } from '../components/canvas/NodeEditorOverlay';
import { LayersPanel } from '../components/canvas/LayersPanel';
import { ColorPaletteModal } from '../components/canvas/ColorPaletteModal';
import { CanvasMinimap } from '../components/canvas/CanvasMinimap';
import { CanvasExportModal } from '../components/canvas/CanvasExportModal';

export const CanvasApp: React.FC = () => {
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
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [leftHanded, setLeftHanded] = useState<boolean>(() => {
    return localStorage.getItem('gs_canvas_left_handed') === 'true';
  });
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [showPaletteModal, setShowPaletteModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isNodeEditMode, setIsNodeEditMode] = useState<boolean>(false);

  // Undo / Redo History Stack
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoingRef = useRef<boolean>(false);

  // File Input Ref for .gscanvas import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push Snapshot to History
  const pushHistory = useCallback((description: string, currentProject: CanvasProject, selectedIds: string[] = []) => {
    if (isUndoRedoingRef.current) return;

    // Prune forward history if we're in the middle of the stack
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({
      description,
      strokes: JSON.parse(JSON.stringify(currentProject.strokes)),
      layers: JSON.parse(JSON.stringify(currentProject.layers)),
      selectedStrokeIds: [...selectedIds]
    });

    // Cap history length to 50 snapshots
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
        setProject(saved);
        if (saved.layers.length > 0) {
          setActiveLayerId(saved.layers[0].id);
        }
        pushHistory('Initial Project Load', saved);
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
  }, [handleUndo, handleRedo, selectedStrokeIds]);

  // STROKE HANDLERS
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
        updatedAt: Date.now()
      };
      pushHistory('Erase Stroke(s)', updated);
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
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
  };

  // Color Change on Selection
  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s =>
            selectedStrokeIds.includes(s.id) ? { ...s, color: newColor, updatedAt: Date.now() } : s
          ),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Color', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  // Width Change on Selection
  const handleWidthChange = (newWidth: number) => {
    setCurrentWidth(newWidth);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s =>
            selectedStrokeIds.includes(s.id) ? { ...s, width: newWidth, updatedAt: Date.now() } : s
          ),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Width', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  // Opacity Change on Selection
  const handleOpacityChange = (newOpacity: number) => {
    setCurrentOpacity(newOpacity);
    if (selectedStrokeIds.length > 0) {
      setProject(prev => {
        const updated = {
          ...prev,
          strokes: prev.strokes.map(s =>
            selectedStrokeIds.includes(s.id) ? { ...s, opacity: newOpacity, updatedAt: Date.now() } : s
          ),
          updatedAt: Date.now()
        };
        pushHistory('Change Stroke Opacity', updated, selectedStrokeIds);
        return updated;
      });
    }
  };

  // LAYER ACTIONS
  const handleAddLayer = () => {
    const newLayer: CanvasLayer = {
      id: `layer_${Date.now()}`,
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
        layers: [...prev.layers, newLayer],
        updatedAt: Date.now()
      };
      pushHistory('Add Layer', updated);
      return updated;
    });
    setActiveLayerId(newLayer.id);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (project.layers.length <= 1) return;
    setProject(prev => {
      const updatedLayers = prev.layers.filter(l => l.id !== layerId);
      const updatedStrokes = prev.strokes.filter(s => s.layerId !== layerId);
      const updated = {
        ...prev,
        layers: updatedLayers,
        strokes: updatedStrokes,
        updatedAt: Date.now()
      };
      pushHistory('Delete Layer', updated);
      return updated;
    });

    if (activeLayerId === layerId) {
      const remaining = project.layers.filter(l => l.id !== layerId);
      setActiveLayerId(remaining[0]?.id || 'layer_1');
    }
  };

  const handleDuplicateLayer = (layerId: string) => {
    const target = project.layers.find(l => l.id === layerId);
    if (!target) return;

    const newLayerId = `layer_${Date.now()}`;
    const duplicatedLayer: CanvasLayer = {
      ...target,
      id: newLayerId,
      name: `${target.name} (Copy)`,
      createdAt: Date.now()
    };

    const duplicatedStrokes = project.strokes
      .filter(s => s.layerId === layerId)
      .map(s => ({
        ...s,
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        layerId: newLayerId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

    setProject(prev => {
      const updated = {
        ...prev,
        layers: [...prev.layers, duplicatedLayer],
        strokes: [...prev.strokes, ...duplicatedStrokes],
        updatedAt: Date.now()
      };
      pushHistory('Duplicate Layer', updated);
      return updated;
    });
    setActiveLayerId(newLayerId);
  };

  const handleUpdateLayer = (updatedLayer: CanvasLayer) => {
    setProject(prev => {
      const updated = {
        ...prev,
        layers: prev.layers.map(l => (l.id === updatedLayer.id ? updatedLayer : l)),
        updatedAt: Date.now()
      };
      pushHistory('Update Layer', updated);
      return updated;
    });
  };

  const handleReorderLayer = (fromIndex: number, toIndex: number) => {
    const newLayers = [...project.layers];
    const [moved] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, moved);

    setProject(prev => {
      const updated = { ...prev, layers: newLayers, updatedAt: Date.now() };
      pushHistory('Reorder Layers', updated);
      return updated;
    });
  };

  // CAMERA ACTIONS
  const handleCameraChanged = (newCam: CameraViewport) => {
    setProject(prev => ({
      ...prev,
      camera: newCam
    }));
  };

  const handleFitToScreen = () => {
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
      const fresh = createDefaultProject('New Sketchbook');
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

  // Selected stroke objects for overlays
  const selectedStrokes = project.strokes.filter(s => selectedStrokeIds.includes(s.id));

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 select-none">
      {/* Hidden File Input for .gscanvas */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gscanvas,.json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* TOP HEADER CONTROLS BAR (Hidden in Zen Mode) */}
      {!isZenMode && (
        <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Left: Project Name & Menu Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto neu-card px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/30">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0 pr-2">
              <input
                type="text"
                value={project.name}
                onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
                className="text-xs font-black text-white bg-transparent border-b border-transparent hover:border-slate-500 focus:border-cyan-400 focus:outline-none max-w-[140px] sm:max-w-[220px] truncate"
                placeholder="Sketchbook Name"
              />
              <p className="text-[10px] text-slate-400 font-mono">
                {project.strokes.length} vectors • {project.layers.length} layers
              </p>
            </div>

            <div className="w-px h-6 bg-slate-700/50 mx-1" />

            {/* New Sketch */}
            <button
              onClick={handleNewSketch}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white"
              title="New Blank Sketchbook"
            >
              <FilePlus className="w-4 h-4" />
            </button>

            {/* Open .gscanvas */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white"
              title="Open .gscanvas Project File"
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            {/* Grid Toggle */}
            <button
              onClick={handleToggleGrid}
              className="p-1.5 rounded-xl neu-btn text-slate-300 hover:text-white"
              title={`Grid: ${project.grid.type.toUpperCase()} (Click to toggle)`}
            >
              <Grid className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Right: Export & Zen Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Zen Distraction-Free Toggle */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-2.5 rounded-2xl neu-card text-slate-300 hover:text-white shadow-xl backdrop-blur-md"
              title="Distraction-Free Zen Mode (Press Tab)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Shortcuts Modal Trigger */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2.5 rounded-2xl neu-card text-slate-300 hover:text-white shadow-xl backdrop-blur-md hidden sm:block"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Main Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
              title="Export SVG, PNG, PDF, or .gscanvas"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </header>
      )}

      {/* ZEN MODE FLOATING RESTORE BUTTON */}
      {isZenMode && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
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

      {/* MAIN INFINITE VIEWPORT */}
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
      />

      {/* NODE EDITOR OVERLAY (When Node Edit is active or stroke is selected) */}
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

      {/* COLOR PALETTE & PRO MARKER MODAL */}
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

      {/* SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="neu-card p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl border border-slate-700/40">
            <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <span>GS-Canvas Keyboard Shortcuts</span>
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
                { key: 'P', desc: 'Pen Tool' },
                { key: 'M', desc: 'Marker Tool (Multiply)' },
                { key: 'B', desc: 'Pencil Tool' },
                { key: 'E', desc: 'Eraser Tool' },
                { key: 'V', desc: 'Select / Node Tool' },
                { key: 'H / Space', desc: 'Pan Infinite Canvas' },
                { key: 'Ctrl + Z', desc: 'Undo' },
                { key: 'Ctrl + Y', desc: 'Redo' },
                { key: 'Ctrl + E', desc: 'Export Dialog' },
                { key: 'Tab', desc: 'Zen Distraction-Free' },
                { key: 'Del / Backspace', desc: 'Delete Selected' },
                { key: 'Pinch / Wheel', desc: 'Zoom In / Out' }
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
