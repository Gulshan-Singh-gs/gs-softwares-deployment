import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CanvasProject,
  VectorStroke,
  CameraViewport,
  ToolMode,
  BrushType,
  CanvasPoint,
  BezierSegment,
  VectorNode,
  GridType
} from '../../lib/canvas/types';
import {
  simplifyPointsRDP,
  pointsToBezierSegments,
  computeBounds,
  isPointNearStroke,
  isStrokeInLasso,
  calculateDynamicWidth
} from '../../lib/canvas/bezierMath';
import { recognizeSmartShape, RecognizedShape } from '../../lib/canvas/smartShapes';

interface CanvasViewportProps {
  project: CanvasProject;
  currentTool: ToolMode;
  currentBrush: BrushType;
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  activeLayerId: string;
  selectedStrokeIds: string[];
  smartShapeEnabled: boolean;
  onStrokeCompleted: (stroke: VectorStroke) => void;
  onStrokesDeleted: (strokeIds: string[]) => void;
  onSelectionChanged: (selectedIds: string[]) => void;
  onCameraChanged: (camera: CameraViewport) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  project,
  currentTool,
  currentBrush,
  currentColor,
  currentWidth,
  currentOpacity,
  activeLayerId,
  selectedStrokeIds,
  smartShapeEnabled,
  onStrokeCompleted,
  onStrokesDeleted,
  onSelectionChanged,
  onCameraChanged
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live interaction state
  const isPointerDownRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const rawPointsRef = useRef<CanvasPoint[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const smartShapeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeShapePreviewRef = useRef<RecognizedShape | null>(null);

  // Pan / Zoom touch state
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const isSpacePanningRef = useRef<boolean>(false);

  // Lasso / Box selection points
  const lassoPointsRef = useRef<CanvasPoint[]>([]);

  // Snap feedback state (for animation ripple)
  const [snapEffect, setSnapEffect] = useState<{ x: number; y: number; text: string } | null>(null);

  // Convert Screen Coordinates (pixel relative to canvas) to World Coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): CanvasPoint => {
    const cam = project.camera;
    return {
      x: (screenX - cam.x) / cam.zoom,
      y: (screenY - cam.y) / cam.zoom
    };
  }, [project.camera]);

  // Convert World Coordinates to Screen Coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number): { x: number; y: number } => {
    const cam = project.camera;
    return {
      x: worldX * cam.zoom + cam.x,
      y: worldY * cam.zoom + cam.y
    };
  }, [project.camera]);

  // Main high-performance Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cam = project.camera;

    // 1. Clear background
    ctx.fillStyle = project.backgroundColor || '#0c1015';
    ctx.fillRect(0, 0, width, height);

    // 2. Viewport Coordinate Transform
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.zoom, cam.zoom);

    // Compute Visible World Viewport Bounding Box for Viewport Culling
    const viewMinX = -cam.x / cam.zoom;
    const viewMinY = -cam.y / cam.zoom;
    const viewMaxX = (width - cam.x) / cam.zoom;
    const viewMaxY = (height - cam.y) / cam.zoom;

    // 3. Render Dynamic Adaptive Grid
    if (project.grid && project.grid.type !== 'none') {
      drawAdaptiveGrid(ctx, viewMinX, viewMinY, viewMaxX, viewMaxY, project.grid, cam.zoom);
    }

    // 4. Render Visible Layers and Strokes with Viewport Culling
    for (const layer of project.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      const layerStrokes = project.strokes.filter(s => s.layerId === layer.id);

      for (const stroke of layerStrokes) {
        // Viewport Culling Check: Ignore strokes outside camera viewport
        const b = stroke.bounds;
        if (
          b.maxX < viewMinX ||
          b.minX > viewMaxX ||
          b.maxY < viewMinY ||
          b.minY > viewMaxY
        ) {
          continue;
        }

        const isSelected = selectedStrokeIds.includes(stroke.id);

        ctx.save();
        ctx.globalAlpha = layer.opacity * stroke.opacity;

        if (stroke.brushType === 'marker') {
          ctx.globalCompositeOperation = 'multiply';
        }

        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.fillColor || 'transparent';
        ctx.lineCap = stroke.cap || 'round';
        ctx.lineJoin = stroke.join || 'round';
        ctx.lineWidth = stroke.width;

        // Draw Bézier segments
        if (stroke.segments.length > 0) {
          ctx.beginPath();
          const first = stroke.segments[0];
          ctx.moveTo(first.p0.x, first.p0.y);

          for (const seg of stroke.segments) {
            ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.p1.x, seg.p1.y);
          }

          if (stroke.isClosed) {
            ctx.closePath();
            if (stroke.fillColor && stroke.fillColor !== 'none') {
              ctx.fill();
            }
          }

          ctx.stroke();
        }

        // Selection highlight ring & bounding box
        if (isSelected) {
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = '#06b6d4'; // Cyan highlight
          ctx.lineWidth = Math.max(1.5 / cam.zoom, 1.2);
          ctx.setLineDash([4 / cam.zoom, 4 / cam.zoom]);

          // Stroke bounding box
          ctx.strokeRect(b.minX - 4, b.minY - 4, b.width + 8, b.height + 8);

          // Draw node anchors on selected stroke
          for (const node of stroke.nodes) {
            ctx.fillStyle = '#06b6d4';
            const nodeRadius = 3.5 / cam.zoom;
            ctx.beginPath();
            ctx.arc(node.point.x, node.point.y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      ctx.restore();
    }

    // 5. Render Active Live Drawing Stroke / Shape Preview
    if (activeShapePreviewRef.current) {
      // Draw Smart Shape preview snap
      const shape = activeShapePreviewRef.current;
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = currentOpacity;

      ctx.beginPath();
      const first = shape.segments[0];
      ctx.moveTo(first.p0.x, first.p0.y);
      for (const seg of shape.segments) {
        ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.p1.x, seg.p1.y);
      }
      if (shape.isClosed) ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (rawPointsRef.current.length > 0 && currentTool === 'draw') {
      // Draw live smoothed trail
      const points = rawPointsRef.current;
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = currentOpacity;
      if (currentBrush === 'marker') {
        ctx.globalCompositeOperation = 'multiply';
      }

      if (points.length === 1) {
        const p = points[0];
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (currentWidth * (p.pressure ?? 0.5)) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 6. Render Lasso Selection Outline
    if (lassoPointsRef.current.length > 1 && (currentTool === 'lasso' || currentTool === 'select')) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1.5 / cam.zoom;
      ctx.setLineDash([4 / cam.zoom, 3 / cam.zoom]);

      const lPts = lassoPointsRef.current;
      ctx.beginPath();
      ctx.moveTo(lPts[0].x, lPts[0].y);
      for (let i = 1; i < lPts.length; i++) {
        ctx.lineTo(lPts[i].x, lPts[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [
    project,
    currentTool,
    currentBrush,
    currentColor,
    currentWidth,
    currentOpacity,
    selectedStrokeIds
  ]);

  // Request Animation Frame Render Loop
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      renderCanvas();
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [renderCanvas]);

  // Handle Canvas Resize (Responsive with Device Pixel Ratio)
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePanningRef.current && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        isSpacePanningRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePanningRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'crosshair';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // POINTER DOWN HANDLER
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    isPointerDownRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);
    worldPt.pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    worldPt.tiltX = e.tiltX;
    worldPt.tiltY = e.tiltY;
    worldPt.time = Date.now();

    // Multi-touch tracking for pinch-to-zoom
    touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (touchesRef.current.size === 2) {
      // Initiate 2-finger pinch
      const touchArr = Array.from(touchesRef.current.values());
      initialPinchDistRef.current = Math.hypot(touchArr[0].x - touchArr[1].x, touchArr[0].y - touchArr[1].y);
      initialZoomRef.current = project.camera.zoom;
      return;
    }

    if (isSpacePanningRef.current || currentTool === 'pan' || e.button === 1) {
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (currentTool === 'draw') {
      rawPointsRef.current = [worldPt];
      lastSampleTimeRef.current = Date.now();
      activeShapePreviewRef.current = null;
    } else if (currentTool === 'eraser') {
      // Immediately test erase at tap location
      eraseAtPoint(worldPt);
    } else if (currentTool === 'select' || currentTool === 'lasso') {
      // Check if clicking existing stroke
      const clickedStroke = [...project.strokes].reverse().find(s => isPointNearStroke(worldPt, s, 12));
      if (clickedStroke) {
        onSelectionChanged([clickedStroke.id]);
      } else {
        // Start lasso / marquee selection
        lassoPointsRef.current = [worldPt];
        onSelectionChanged([]);
      }
    }
  };

  // POINTER MOVE HANDLER
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;

    touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch & Pan handling
    if (touchesRef.current.size === 2 && initialPinchDistRef.current) {
      const touchArr = Array.from(touchesRef.current.values());
      const currentDist = Math.hypot(touchArr[0].x - touchArr[1].x, touchArr[0].y - touchArr[1].y);
      const scaleDelta = currentDist / initialPinchDistRef.current;
      const targetZoom = Math.max(0.05, Math.min(32, initialZoomRef.current * scaleDelta));

      const midX = (touchArr[0].x + touchArr[1].x) / 2;
      const midY = (touchArr[0].y + touchArr[1].y) / 2;

      onCameraChanged({
        ...project.camera,
        zoom: targetZoom
      });
      return;
    }

    // Pan canvas
    if (isSpacePanningRef.current || currentTool === 'pan' || lastPanPointRef.current) {
      if (lastPanPointRef.current) {
        const dx = e.clientX - lastPanPointRef.current.x;
        const dy = e.clientY - lastPanPointRef.current.y;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };

        onCameraChanged({
          ...project.camera,
          x: project.camera.x + dx,
          y: project.camera.y + dy
        });
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);
    worldPt.pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    worldPt.tiltX = e.tiltX;
    worldPt.tiltY = e.tiltY;
    worldPt.time = Date.now();

    if (currentTool === 'draw') {
      rawPointsRef.current.push(worldPt);

      // Reset / Setup Smart Shape 400ms hold timer
      if (smartShapeTimerRef.current) {
        clearTimeout(smartShapeTimerRef.current);
      }

      if (smartShapeEnabled && rawPointsRef.current.length > 8) {
        smartShapeTimerRef.current = setTimeout(() => {
          if (isPointerDownRef.current) {
            const detected = recognizeSmartShape(rawPointsRef.current, currentWidth, currentBrush);
            if (detected) {
              activeShapePreviewRef.current = detected;
              // Trigger haptic feedback if available
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(25);
              }
              setSnapEffect({
                x: screenX,
                y: screenY,
                text: `Snapped to ${detected.kind.toUpperCase()}`
              });
              setTimeout(() => setSnapEffect(null), 1200);
            }
          }
        }, 380);
      }
    } else if (currentTool === 'eraser') {
      eraseAtPoint(worldPt);
    } else if (currentTool === 'lasso' || (currentTool === 'select' && lassoPointsRef.current.length > 0)) {
      lassoPointsRef.current.push(worldPt);
    }
  };

  // POINTER UP / END HANDLER
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    touchesRef.current.delete(e.pointerId);
    if (touchesRef.current.size === 0) {
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      lastPanPointRef.current = null;
      initialPinchDistRef.current = null;
    }

    if (smartShapeTimerRef.current) {
      clearTimeout(smartShapeTimerRef.current);
      smartShapeTimerRef.current = null;
    }

    if (currentTool === 'draw' && rawPointsRef.current.length > 0) {
      finalizeStroke();
    } else if (lassoPointsRef.current.length > 2) {
      // Find all strokes contained inside lasso selection
      const enclosed = project.strokes.filter(s => isStrokeInLasso(s, lassoPointsRef.current));
      onSelectionChanged(enclosed.map(s => s.id));
      lassoPointsRef.current = [];
    } else {
      lassoPointsRef.current = [];
    }
  };

  // Helper: Erase stroke at point
  const eraseAtPoint = (point: CanvasPoint) => {
    const hits = project.strokes.filter(s => isPointNearStroke(point, s, currentWidth * 1.5));
    if (hits.length > 0) {
      onStrokesDeleted(hits.map(s => s.id));
    }
  };

  // Helper: Finalize stroke creation
  const finalizeStroke = () => {
    const raw = rawPointsRef.current;
    if (raw.length === 0) return;

    let finalSegments: BezierSegment[];
    let finalNodes: VectorNode[];
    let isClosed = false;
    let shapeKind: RecognizedShape['kind'] | undefined = undefined;

    // Check if smart shape was recognized during hold or immediately recognizable
    if (activeShapePreviewRef.current) {
      finalSegments = activeShapePreviewRef.current.segments;
      finalNodes = activeShapePreviewRef.current.nodes;
      isClosed = activeShapePreviewRef.current.isClosed;
      shapeKind = activeShapePreviewRef.current.kind;
    } else {
      // Smooth raw points via RDP simplification and Catmull-Rom spline synthesis
      const simplified = simplifyPointsRDP(raw, 1.2);
      const computed = pointsToBezierSegments(simplified, currentWidth, currentBrush);
      finalSegments = computed.segments;
      finalNodes = computed.nodes;
    }

    const bounds = computeBounds(finalSegments, raw, currentWidth);

    const newStroke: VectorStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      layerId: activeLayerId,
      brushType: currentBrush,
      shapeKind,
      color: currentColor,
      opacity: currentOpacity,
      width: currentWidth,
      cap: 'round',
      join: 'round',
      isClosed,
      rawPoints: [...raw],
      segments: finalSegments,
      nodes: finalNodes,
      bounds,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onStrokeCompleted(newStroke);

    // Clean live state
    rawPointsRef.current = [];
    activeShapePreviewRef.current = null;
  };

  // Wheel Zoom Listener (Smooth trackpad pinch & Ctrl+Wheel)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cam = project.camera;
    const zoomFactor = e.ctrlKey ? 0.02 : 0.0015;
    const delta = -e.deltaY * zoomFactor;
    const newZoom = Math.max(0.05, Math.min(32, cam.zoom * (1 + delta)));

    // Zoom centered on cursor position
    const worldBefore = {
      x: (mouseX - cam.x) / cam.zoom,
      y: (mouseY - cam.y) / cam.zoom
    };

    const newCamX = mouseX - worldBefore.x * newZoom;
    const newCamY = mouseY - worldBefore.y * newZoom;

    onCameraChanged({
      x: newCamX,
      y: newCamY,
      zoom: newZoom
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-none"
      style={{ cursor: isSpacePanningRef.current || currentTool === 'pan' ? 'grab' : 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 block w-full h-full"
      />

      {/* Smart Shape Snap Pill Alert */}
      {snapEffect && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-full bg-cyan-600/90 text-white font-bold text-xs shadow-lg shadow-cyan-600/40 backdrop-blur-md animate-bounce"
          style={{ left: snapEffect.x, top: snapEffect.y - 12 }}
        >
          ✨ {snapEffect.text}
        </div>
      )}
    </div>
  );
};

// Helper: Draw Adaptive Dynamic Grid
function drawAdaptiveGrid(
  ctx: CanvasRenderingContext2D,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  grid: CanvasProject['grid'],
  zoom: number
) {
  let step = grid.size || 28;
  // Adaptive subdivision so grid doesn't overcrowd or vanish at extreme zoom
  while (step * zoom < 14) step *= 2;
  while (step * zoom > 80) step /= 2;

  ctx.save();
  ctx.fillStyle = grid.color || '#94a3b8';
  ctx.strokeStyle = grid.color || '#94a3b8';
  ctx.globalAlpha = Math.min(0.35, grid.opacity || 0.28);

  const startX = Math.floor(minX / step) * step;
  const startY = Math.floor(minY / step) * step;

  if (grid.type === 'dot') {
    const dotRadius = Math.max(0.8 / zoom, 1.2);
    for (let x = startX; x <= maxX; x += step) {
      for (let y = startY; y <= maxY; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (grid.type === 'line') {
    ctx.lineWidth = Math.max(0.8 / zoom, 0.75);
    ctx.beginPath();
    for (let x = startX; x <= maxX; x += step) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let y = startY; y <= maxY; y += step) {
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();
  } else if (grid.type === 'isometric') {
    ctx.lineWidth = Math.max(0.8 / zoom, 0.75);
    ctx.beginPath();
    const isoStep = step * 1.5;
    for (let x = startX - (maxY - minY); x <= maxX + (maxY - minY); x += isoStep) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x + (maxY - minY), maxY);
      ctx.moveTo(x, minY);
      ctx.lineTo(x - (maxY - minY), maxY);
    }
    ctx.stroke();
  }
  ctx.restore();
}
