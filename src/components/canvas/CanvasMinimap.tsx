import React, { useRef, useEffect, useCallback } from 'react';
import { CanvasProject, CameraViewport } from '../../lib/canvas/types';
import { getProjectContentBounds } from '../../lib/canvas/exportEngine';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface CanvasMinimapProps {
  project: CanvasProject;
  onCameraChange: (camera: CameraViewport) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
}

export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({
  project,
  onCameraChange,
  onFitToScreen,
  onResetZoom
}) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const MINIMAP_WIDTH = 160;
  const MINIMAP_HEIGHT = 100;

  // Render Minimap Thumbnail
  const drawMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Compute bounding box
    const bounds = getProjectContentBounds(project, 80);

    // Determine scale to fit in minimap
    const scaleX = MINIMAP_WIDTH / bounds.width;
    const scaleY = MINIMAP_HEIGHT / bounds.height;
    const miniScale = Math.min(scaleX, scaleY);

    const offsetX = (MINIMAP_WIDTH - bounds.width * miniScale) / 2;
    const offsetY = (MINIMAP_HEIGHT - bounds.height * miniScale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(miniScale, miniScale);
    ctx.translate(-bounds.minX, -bounds.minY);

    // Draw strokes
    for (const stroke of project.strokes) {
      if (stroke.segments.length === 0) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(2 / miniScale, stroke.width);
      ctx.globalAlpha = stroke.opacity;

      ctx.beginPath();
      const first = stroke.segments[0];
      ctx.moveTo(first.p0.x, first.p0.y);
      for (const seg of stroke.segments) {
        ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.p1.x, seg.p1.y);
      }
      ctx.stroke();
    }

    // Draw Viewport Box
    const cam = project.camera;
    const viewW = window.innerWidth / cam.zoom;
    const viewH = window.innerHeight / cam.zoom;
    const viewX = -cam.x / cam.zoom;
    const viewY = -cam.y / cam.zoom;

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = Math.max(1.5 / miniScale, 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fillRect(viewX, viewY, viewW, viewH);
    ctx.strokeRect(viewX, viewY, viewW, viewH);

    ctx.restore();
  }, [project]);

  useEffect(() => {
    drawMinimap();
  }, [drawMinimap]);

  // Handle Minimap Click / Drag to Pan
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    panToMinimapPosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      panToMinimapPosition(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
  };

  const panToMinimapPosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bounds = getProjectContentBounds(project, 80);
    const scaleX = MINIMAP_WIDTH / bounds.width;
    const scaleY = MINIMAP_HEIGHT / bounds.height;
    const miniScale = Math.min(scaleX, scaleY);

    const offsetX = (MINIMAP_WIDTH - bounds.width * miniScale) / 2;
    const offsetY = (MINIMAP_HEIGHT - bounds.height * miniScale) / 2;

    const worldTargetX = bounds.minX + (clickX - offsetX) / miniScale;
    const worldTargetY = bounds.minY + (clickY - offsetY) / miniScale;

    // Pan camera so click is at center of screen
    const cam = project.camera;
    const newCamX = window.innerWidth / 2 - worldTargetX * cam.zoom;
    const newCamY = window.innerHeight / 2 - worldTargetY * cam.zoom;

    onCameraChange({
      ...cam,
      x: newCamX,
      y: newCamY
    });
  };

  return (
    <div className="fixed bottom-8 left-8 z-20 hidden md:flex flex-col gap-2 canvas-studio-panel p-2 rounded-2xl shadow-xl backdrop-blur-xl border border-slate-700/60 select-none">
      <div className="relative rounded-xl overflow-hidden canvas-studio-inset border border-slate-700/50">
        <canvas
          ref={minimapCanvasRef}
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="block cursor-pointer"
        />
        <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-400 font-bold backdrop-blur-sm">
          {Math.round(project.camera.zoom * 100)}%
        </div>
      </div>

      {/* Mini Controls */}
      <div className="flex items-center justify-between gap-1 px-1">
        <button
          onClick={() =>
            onCameraChange({
              ...project.camera,
              zoom: Math.min(32, project.camera.zoom * 1.3)
            })
          }
          className="p-1 rounded-lg canvas-studio-btn text-slate-300 hover:text-white"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() =>
            onCameraChange({
              ...project.camera,
              zoom: Math.max(0.05, project.camera.zoom / 1.3)
            })
          }
          className="p-1 rounded-lg canvas-studio-btn text-slate-300 hover:text-white"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onFitToScreen}
          className="p-1 rounded-lg canvas-studio-btn text-slate-300 hover:text-white"
          title="Fit All Content to Screen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          className="p-1 rounded-lg canvas-studio-btn text-slate-300 hover:text-white"
          title="Reset Zoom to 100%"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
