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
  CanvasImageItem,
  CanvasSheet
} from '../../lib/canvas/types';
import {
  simplifyPointsRDP,
  pointsToBezierSegments,
  computeBounds,
  isPointNearStroke,
  isStrokeInLasso
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
  onUndo: () => void;
  onImageAdded?: (image: CanvasImageItem) => void;
  onImageUpdated?: (image: CanvasImageItem) => void;
  onImageDeleted?: (imageId: string) => void;
  onSheetSelect?: (sheetIndex: number) => void;
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
  onCameraChanged,
  onUndo,
  onImageAdded,
  onImageUpdated,
  onImageDeleted,
  onSheetSelect
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

  // Precision Pan / Zoom dual-touch state
  const touchesRef = useRef<Map<number, { x: number; y: number; time: number }>>(new Map());
  const twoTouchStateRef = useRef<{
    isActive: boolean;
    startTime: number;
    startDist: number;
    startZoom: number;
    startCam: CameraViewport;
    startCenter: { x: number; y: number };
    lastCenter: { x: number; y: number };
    movedDist: number;
  }>({
    isActive: false,
    startTime: 0,
    startDist: 0,
    startZoom: 1,
    startCam: { x: 0, y: 0, zoom: 1 },
    startCenter: { x: 0, y: 0 },
    lastCenter: { x: 0, y: 0 },
    movedDist: 0
  });

  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const isSpacePanningRef = useRef<boolean>(false);

  // Image Element & Selection / Drag state
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const draggingImageRef = useRef<{
    imageId: string;
    startWorld: CanvasPoint;
    imgStartPos: { x: number; y: number };
  } | null>(null);
  const resizingImageRef = useRef<{
    imageId: string;
    handle: 'nw' | 'ne' | 'se' | 'sw';
    startWorld: CanvasPoint;
    startBounds: { x: number; y: number; width: number; height: number };
    aspectRatio: number;
  } | null>(null);

  // Lasso / Box selection points
  const lassoPointsRef = useRef<CanvasPoint[]>([]);

  // Snap feedback state (for animation ripple / gesture toast)
  const [snapEffect, setSnapEffect] = useState<{ x: number; y: number; text: string } | null>(null);

  // Preload Image Elements
  useEffect(() => {
    if (!project.images) return;
    for (const item of project.images) {
      if (!imageCacheRef.current.has(item.id)) {
        const img = new Image();
        img.src = item.src;
        img.onload = () => {
          imageCacheRef.current.set(item.id, img);
        };
      }
    }
  }, [project.images]);

  // Convert Screen Coordinates to World Coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): CanvasPoint => {
    const cam = project.camera;
    return {
      x: (screenX - cam.x) / cam.zoom,
      y: (screenY - cam.y) / cam.zoom
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

    // 1. Clear background (Studio Desk)
    ctx.fillStyle = project.aspectRatio !== 'infinite' ? '#080c10' : (project.backgroundColor || '#0c1015');
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

    // 3. Render Sheets if Aspect Ratio Constraint is active
    if (project.aspectRatio !== 'infinite' && project.sheets && project.sheets.length > 0) {
      project.sheets.forEach((sheet, sIdx) => {
        const isActiveSheet = sIdx === project.activeSheetIndex;

        // Paper Drop Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 32 / cam.zoom;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 12 / cam.zoom;

        // Paper Sheet Body
        ctx.fillStyle = project.backgroundColor || '#0f172a';
        ctx.fillRect(sheet.x, sheet.y, sheet.width, sheet.height);
        ctx.restore();

        // Sheet Border Outline
        ctx.save();
        ctx.strokeStyle = isActiveSheet ? '#06b6d4' : '#334155';
        ctx.lineWidth = (isActiveSheet ? 2.5 : 1) / cam.zoom;
        ctx.strokeRect(sheet.x, sheet.y, sheet.width, sheet.height);

        // Sheet Label Header (Page N Badge)
        ctx.fillStyle = isActiveSheet ? '#06b6d4' : '#64748b';
        ctx.font = `bold ${Math.max(12, 14 / cam.zoom)}px Inter, sans-serif`;
        ctx.fillText(
          `${sheet.name} • ${sheet.aspectRatio.toUpperCase()} (${sheet.width} × ${sheet.height})`,
          sheet.x + 8,
          sheet.y - 12 / cam.zoom
        );
        ctx.restore();
      });
    }

    // 4. Render Dynamic Adaptive Grid
    if (project.grid && project.grid.type !== 'none') {
      drawAdaptiveGrid(ctx, viewMinX, viewMinY, viewMaxX, viewMaxY, project.grid, cam.zoom);
    }

    // 5. Render Placed Images
    if (project.images && project.images.length > 0) {
      for (const imgItem of project.images) {
        const cached = imageCacheRef.current.get(imgItem.id);
        if (cached && cached.complete) {
          ctx.save();
          ctx.globalAlpha = imgItem.opacity ?? 1;
          ctx.drawImage(cached, imgItem.x, imgItem.y, imgItem.width, imgItem.height);

          // Selection border & resize handles on image
          if (selectedStrokeIds.includes(imgItem.id)) {
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2 / cam.zoom;
            ctx.setLineDash([4 / cam.zoom, 4 / cam.zoom]);
            ctx.strokeRect(imgItem.x - 2, imgItem.y - 2, imgItem.width + 4, imgItem.height + 4);
            ctx.setLineDash([]);

            // Draw 4 corner resize handles
            const handleRadius = 5 / cam.zoom;
            const corners = [
              { x: imgItem.x - 2, y: imgItem.y - 2 }, // nw
              { x: imgItem.x + imgItem.width + 2, y: imgItem.y - 2 }, // ne
              { x: imgItem.x + imgItem.width + 2, y: imgItem.y + imgItem.height + 2 }, // se
              { x: imgItem.x - 2, y: imgItem.y + imgItem.height + 2 } // sw
            ];

            for (const c of corners) {
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(c.x, c.y, handleRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#0891b2';
              ctx.lineWidth = 2 / cam.zoom;
              ctx.stroke();
            }

            // Size badge
            ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
            ctx.font = `bold ${Math.max(10, 11 / cam.zoom)}px monospace`;
            ctx.fillText(
              `${Math.round(imgItem.width)} × ${Math.round(imgItem.height)}px`,
              imgItem.x,
              imgItem.y + imgItem.height + 16 / cam.zoom
            );
          }
          ctx.restore();
        }
      }
    }

    // 6. Render Visible Layers and Strokes with Viewport Culling
    for (const layer of project.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      const layerStrokes = project.strokes.filter(s => s.layerId === layer.id);

      for (const stroke of layerStrokes) {
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

        if (isSelected) {
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = Math.max(1.5 / cam.zoom, 1.2);
          ctx.setLineDash([4 / cam.zoom, 4 / cam.zoom]);

          ctx.strokeRect(b.minX - 4, b.minY - 4, b.width + 8, b.height + 8);

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

    // 7. Render Active Live Drawing Stroke / Shape Preview
    if (activeShapePreviewRef.current) {
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

    // 8. Render Lasso Selection Outline
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

  // Request Animation Frame Loop
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      renderCanvas();
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [renderCanvas]);

  // Resize Listener
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

  // CLIPBOARD PASTE IMAGE HANDLER (Ctrl+V Image stamping)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              const img = new Image();
              img.src = src;
              img.onload = () => {
                const centerWorld = screenToWorld(
                  (canvasRef.current?.width || 800) / 4,
                  (canvasRef.current?.height || 600) / 4
                );
                const maxDim = 500;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                  const r = Math.min(maxDim / w, maxDim / h);
                  w = Math.round(w * r);
                  h = Math.round(h * r);
                }

                const newImg: CanvasImageItem = {
                  id: `img_${Date.now()}`,
                  layerId: activeLayerId,
                  src,
                  name: file.name || 'Pasted Image',
                  x: centerWorld.x - w / 2,
                  y: centerWorld.y - h / 2,
                  width: w,
                  height: h,
                  opacity: 1,
                  createdAt: Date.now()
                };
                if (onImageAdded) onImageAdded(newImg);
              };
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeLayerId, onImageAdded, screenToWorld]);

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

    // Register active touch point
    touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, time: Date.now() });

    // DUAL TOUCH INITIATION (Pan & Pinch Zoom)
    if (touchesRef.current.size >= 2) {
      const touchArr = Array.from(touchesRef.current.values());
      const dist = Math.hypot(touchArr[0].x - touchArr[1].x, touchArr[0].y - touchArr[1].y);
      const mid = {
        x: (touchArr[0].x + touchArr[1].x) / 2,
        y: (touchArr[0].y + touchArr[1].y) / 2
      };

      twoTouchStateRef.current = {
        isActive: true,
        startTime: Date.now(),
        startDist: Math.max(dist, 1),
        startZoom: project.camera.zoom,
        startCam: { ...project.camera },
        startCenter: mid,
        lastCenter: mid,
        movedDist: 0
      };

      // Discard any accidental single-finger stroke
      rawPointsRef.current = [];
      activeShapePreviewRef.current = null;
      if (smartShapeTimerRef.current) {
        clearTimeout(smartShapeTimerRef.current);
      }
      return;
    }

    if (isSpacePanningRef.current || currentTool === 'pan' || e.button === 1) {
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Check if clicking on an image corner resize handle or body in select mode
    if (currentTool === 'select' && project.images) {
      const handleHitDist = 12 / project.camera.zoom;

      // 1. Check if clicking a corner resize handle of any currently selected image
      for (const imgId of selectedStrokeIds) {
        const selImg = project.images.find(im => im.id === imgId);
        if (selImg) {
          const corners: { handle: 'nw' | 'ne' | 'se' | 'sw'; x: number; y: number }[] = [
            { handle: 'nw', x: selImg.x, y: selImg.y },
            { handle: 'ne', x: selImg.x + selImg.width, y: selImg.y },
            { handle: 'se', x: selImg.x + selImg.width, y: selImg.y + selImg.height },
            { handle: 'sw', x: selImg.x, y: selImg.y + selImg.height }
          ];

          for (const c of corners) {
            if (Math.hypot(worldPt.x - c.x, worldPt.y - c.y) <= handleHitDist) {
              resizingImageRef.current = {
                imageId: selImg.id,
                handle: c.handle,
                startWorld: worldPt,
                startBounds: { x: selImg.x, y: selImg.y, width: selImg.width, height: selImg.height },
                aspectRatio: selImg.width / Math.max(1, selImg.height)
              };
              return;
            }
          }
        }
      }

      // 2. Check if clicking inside image body
      const clickedImg = [...project.images].reverse().find(
        (img) =>
          worldPt.x >= img.x &&
          worldPt.x <= img.x + img.width &&
          worldPt.y >= img.y &&
          worldPt.y <= img.y + img.height
      );
      if (clickedImg) {
        onSelectionChanged([clickedImg.id]);
        draggingImageRef.current = {
          imageId: clickedImg.id,
          startWorld: worldPt,
          imgStartPos: { x: clickedImg.x, y: clickedImg.y }
        };
        return;
      }
    }

    if (currentTool === 'draw') {
      rawPointsRef.current = [worldPt];
      lastSampleTimeRef.current = Date.now();
      activeShapePreviewRef.current = null;
    } else if (currentTool === 'eraser') {
      eraseAtPoint(worldPt);
    } else if (currentTool === 'select' || currentTool === 'lasso') {
      const clickedStroke = [...project.strokes].reverse().find((s) => isPointNearStroke(worldPt, s, 12));
      if (clickedStroke) {
        onSelectionChanged([clickedStroke.id]);
      } else {
        lassoPointsRef.current = [worldPt];
        onSelectionChanged([]);
      }
    }
  };

  // POINTER MOVE HANDLER
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;

    touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, time: Date.now() });

    // DUAL TOUCH PAN & PINCH ZOOM PROCESSING
    if (touchesRef.current.size >= 2 && twoTouchStateRef.current.isActive) {
      const touchArr = Array.from(touchesRef.current.values());
      const currentDist = Math.hypot(touchArr[0].x - touchArr[1].x, touchArr[0].y - touchArr[1].y);
      const currentCenter = {
        x: (touchArr[0].x + touchArr[1].x) / 2,
        y: (touchArr[0].y + touchArr[1].y) / 2
      };

      const { startDist, startZoom, startCam, startCenter, lastCenter } = twoTouchStateRef.current;
      const scaleDelta = currentDist / Math.max(1, startDist);
      const targetZoom = Math.max(0.05, Math.min(32, startZoom * scaleDelta));

      // Calculate center pan movement
      const panDeltaX = currentCenter.x - startCenter.x;
      const panDeltaY = currentCenter.y - startCenter.y;

      const stepDist = Math.hypot(currentCenter.x - lastCenter.x, currentCenter.y - lastCenter.y);
      twoTouchStateRef.current.movedDist += stepDist;
      twoTouchStateRef.current.lastCenter = currentCenter;

      // Screen to world center conversion
      const worldCenter = {
        x: (startCenter.x - startCam.x) / startCam.zoom,
        y: (startCenter.y - startCam.y) / startCam.zoom
      };

      const newCamX = currentCenter.x - worldCenter.x * targetZoom;
      const newCamY = currentCenter.y - worldCenter.y * targetZoom;

      onCameraChanged({
        x: newCamX,
        y: newCamY,
        zoom: targetZoom
      });
      return;
    }

    // Spacebar / Pan tool single finger drag
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

    // Resize placed image item
    if (resizingImageRef.current && project.images) {
      const { imageId, handle, startWorld, startBounds, aspectRatio } = resizingImageRef.current;
      const dx = worldPt.x - startWorld.x;
      const dy = worldPt.y - startWorld.y;
      const targetImg = project.images.find((im) => im.id === imageId);

      if (targetImg && onImageUpdated) {
        let newX = startBounds.x;
        let newY = startBounds.y;
        let newWidth = startBounds.width;
        let newHeight = startBounds.height;

        if (handle === 'se') {
          newWidth = Math.max(30, startBounds.width + dx);
          newHeight = Math.max(30, newWidth / aspectRatio);
        } else if (handle === 'sw') {
          newWidth = Math.max(30, startBounds.width - dx);
          newHeight = Math.max(30, newWidth / aspectRatio);
          newX = startBounds.x + (startBounds.width - newWidth);
        } else if (handle === 'ne') {
          newWidth = Math.max(30, startBounds.width + dx);
          newHeight = Math.max(30, newWidth / aspectRatio);
          newY = startBounds.y + (startBounds.height - newHeight);
        } else if (handle === 'nw') {
          newWidth = Math.max(30, startBounds.width - dx);
          newHeight = Math.max(30, newWidth / aspectRatio);
          newX = startBounds.x + (startBounds.width - newWidth);
          newY = startBounds.y + (startBounds.height - newHeight);
        }

        onImageUpdated({
          ...targetImg,
          x: newX,
          y: newY,
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        });
      }
      return;
    }

    // Drag placed image item
    if (draggingImageRef.current && project.images) {
      const { imageId, startWorld, imgStartPos } = draggingImageRef.current;
      const dx = worldPt.x - startWorld.x;
      const dy = worldPt.y - startWorld.y;
      const targetImg = project.images.find((im) => im.id === imageId);
      if (targetImg && onImageUpdated) {
        onImageUpdated({
          ...targetImg,
          x: imgStartPos.x + dx,
          y: imgStartPos.y + dy
        });
      }
      return;
    }

    if (currentTool === 'draw') {
      rawPointsRef.current.push(worldPt);

      if (smartShapeTimerRef.current) {
        clearTimeout(smartShapeTimerRef.current);
      }

      if (smartShapeEnabled && rawPointsRef.current.length > 8) {
        smartShapeTimerRef.current = setTimeout(() => {
          if (isPointerDownRef.current && touchesRef.current.size < 2) {
            const detected = recognizeSmartShape(rawPointsRef.current, currentWidth, currentBrush);
            if (detected) {
              activeShapePreviewRef.current = detected;
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
    const wasDualTouch = twoTouchStateRef.current.isActive;
    const dualStartTime = twoTouchStateRef.current.startTime;
    const dualMoved = twoTouchStateRef.current.movedDist;

    touchesRef.current.delete(e.pointerId);

    if (touchesRef.current.size === 0) {
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      lastPanPointRef.current = null;
      draggingImageRef.current = null;
      resizingImageRef.current = null;
    }

    if (smartShapeTimerRef.current) {
      clearTimeout(smartShapeTimerRef.current);
      smartShapeTimerRef.current = null;
    }

    // TWO-FINGER QUICK TAP GESTURE -> UNDO!
    if (wasDualTouch) {
      const elapsed = Date.now() - dualStartTime;
      if (elapsed < 320 && dualMoved < 18) {
        onUndo();
        const rect = e.currentTarget.getBoundingClientRect();
        setSnapEffect({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          text: 'Undo ↺'
        });
        setTimeout(() => setSnapEffect(null), 1000);
      }
      twoTouchStateRef.current.isActive = false;
      rawPointsRef.current = [];
      activeShapePreviewRef.current = null;
      return;
    }

    if (currentTool === 'draw' && rawPointsRef.current.length > 0) {
      finalizeStroke();
    } else if (lassoPointsRef.current.length > 2) {
      const enclosed = project.strokes.filter((s) => isStrokeInLasso(s, lassoPointsRef.current));
      onSelectionChanged(enclosed.map((s) => s.id));
      lassoPointsRef.current = [];
    } else {
      lassoPointsRef.current = [];
    }
  };

  // Erase Stroke at Point
  const eraseAtPoint = (point: CanvasPoint) => {
    const hits = project.strokes.filter((s) => isPointNearStroke(point, s, currentWidth * 1.5));
    if (hits.length > 0) {
      onStrokesDeleted(hits.map((s) => s.id));
    }
  };

  // Finalize Stroke
  const finalizeStroke = () => {
    const raw = rawPointsRef.current;
    if (raw.length === 0) return;

    let finalSegments: BezierSegment[];
    let finalNodes: VectorNode[];
    let isClosed = false;
    let shapeKind: RecognizedShape['kind'] | undefined = undefined;

    if (activeShapePreviewRef.current) {
      finalSegments = activeShapePreviewRef.current.segments;
      finalNodes = activeShapePreviewRef.current.nodes;
      isClosed = activeShapePreviewRef.current.isClosed;
      shapeKind = activeShapePreviewRef.current.kind;
    } else {
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
    rawPointsRef.current = [];
    activeShapePreviewRef.current = null;
  };

  // Wheel Zoom Listener
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cam = project.camera;
    const zoomFactor = e.ctrlKey ? 0.02 : 0.0015;
    const delta = -e.deltaY * zoomFactor;
    const newZoom = Math.max(0.05, Math.min(32, cam.zoom * (1 + delta)));

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

  // Drag & Drop File Upload Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropWorld = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();
          img.src = src;
          img.onload = () => {
            const maxDim = 600;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              const r = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * r);
              h = Math.round(h * r);
            }
            const newImage: CanvasImageItem = {
              id: `img_${Date.now()}_${i}`,
              layerId: activeLayerId,
              src,
              name: file.name,
              x: dropWorld.x - w / 2,
              y: dropWorld.y - h / 2,
              width: w,
              height: h,
              opacity: 1,
              createdAt: Date.now()
            };
            if (onImageAdded) onImageAdded(newImage);
          };
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Prevent Native Browser Context Menu (Save image, Inspect, etc.) on multi-touch / right-click
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const preventMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    container.addEventListener('contextmenu', preventMenu, { capture: true });
    canvas.addEventListener('contextmenu', preventMenu, { capture: true });

    return () => {
      container.removeEventListener('contextmenu', preventMenu, { capture: true });
      canvas.removeEventListener('contextmenu', preventMenu, { capture: true });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="relative w-full h-full select-none overflow-hidden touch-none"
      style={{
        cursor: isSpacePanningRef.current || currentTool === 'pan' ? 'grab' : 'crosshair',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 block w-full h-full"
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          touchAction: 'none'
        }}
      />

      {/* Dynamic Feedback Toast (Smart Shape & 2-Finger Undo) */}
      {snapEffect && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3.5 py-1.5 rounded-full bg-cyan-600/95 text-white font-black text-xs shadow-xl shadow-cyan-600/40 backdrop-blur-md animate-in fade-in zoom-in duration-200"
          style={{ left: snapEffect.x, top: snapEffect.y - 12 }}
        >
          {snapEffect.text}
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
