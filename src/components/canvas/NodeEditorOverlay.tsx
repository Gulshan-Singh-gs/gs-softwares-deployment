import React, { useState, useRef } from 'react';
import { VectorStroke, VectorNode, CameraViewport, CanvasPoint } from '../../lib/canvas/types';
import { nodesToBezierSegments, computeBounds } from '../../lib/canvas/bezierMath';

interface NodeEditorOverlayProps {
  selectedStrokes: VectorStroke[];
  camera: CameraViewport;
  onStrokeUpdated: (stroke: VectorStroke) => void;
}

export const NodeEditorOverlay: React.FC<NodeEditorOverlayProps> = ({
  selectedStrokes,
  camera,
  onStrokeUpdated
}) => {
  const [activeDrag, setActiveDrag] = useState<{
    strokeId: string;
    nodeIndex: number;
    target: 'point' | 'handleIn' | 'handleOut';
  } | null>(null);

  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  if (selectedStrokes.length === 0) return null;

  const worldToScreen = (x: number, y: number) => ({
    x: x * camera.zoom + camera.x,
    y: y * camera.zoom + camera.y
  });

  const screenToWorld = (screenX: number, screenY: number): CanvasPoint => ({
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom
  });

  const handlePointerDown = (
    e: React.PointerEvent,
    strokeId: string,
    nodeIndex: number,
    target: 'point' | 'handleIn' | 'handleOut'
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDrag({ strokeId, nodeIndex, target });
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    e.stopPropagation();

    const targetStroke = selectedStrokes.find(s => s.id === activeDrag.strokeId);
    if (!targetStroke) return;

    const overlayRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentScreenX = e.clientX - overlayRect.left;
    const currentScreenY = e.clientY - overlayRect.top;
    const worldPoint = screenToWorld(currentScreenX, currentScreenY);

    const updatedNodes = targetStroke.nodes.map((node, idx) => {
      if (idx !== activeDrag.nodeIndex) return node;

      if (activeDrag.target === 'point') {
        const dx = worldPoint.x - node.point.x;
        const dy = worldPoint.y - node.point.y;
        return {
          ...node,
          point: { ...worldPoint, pressure: node.point.pressure },
          handleIn: node.handleIn ? { x: node.handleIn.x + dx, y: node.handleIn.y + dy } : undefined,
          handleOut: node.handleOut ? { x: node.handleOut.x + dx, y: node.handleOut.y + dy } : undefined
        };
      } else if (activeDrag.target === 'handleIn') {
        return {
          ...node,
          handleIn: { ...worldPoint }
        };
      } else {
        return {
          ...node,
          handleOut: { ...worldPoint }
        };
      }
    });

    const newSegments = nodesToBezierSegments(updatedNodes, targetStroke.width, targetStroke.brushType);
    const newBounds = computeBounds(newSegments, targetStroke.rawPoints, targetStroke.width);

    onStrokeUpdated({
      ...targetStroke,
      nodes: updatedNodes,
      segments: newSegments,
      bounds: newBounds,
      updatedAt: Date.now()
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      e.stopPropagation();
      setActiveDrag(null);
      dragStartPosRef.current = null;
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 pointer-events-auto z-10 select-none overflow-hidden"
    >
      <svg className="w-full h-full">
        {selectedStrokes.map(stroke => {
          return (
            <g key={stroke.id}>
              {stroke.nodes.map((node, idx) => {
                const pt = worldToScreen(node.point.x, node.point.y);
                const hIn = node.handleIn ? worldToScreen(node.handleIn.x, node.handleIn.y) : null;
                const hOut = node.handleOut ? worldToScreen(node.handleOut.x, node.handleOut.y) : null;

                return (
                  <g key={node.id || idx}>
                    {/* Handle In Line & Circle */}
                    {hIn && (
                      <>
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={hIn.x}
                          y2={hIn.y}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={hIn.x}
                          cy={hIn.y}
                          r="5"
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:scale-125 transition-transform"
                          onPointerDown={e => handlePointerDown(e, stroke.id, idx, 'handleIn')}
                        />
                      </>
                    )}

                    {/* Handle Out Line & Circle */}
                    {hOut && (
                      <>
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={hOut.x}
                          y2={hOut.y}
                          stroke="#ec4899"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={hOut.x}
                          cy={hOut.y}
                          r="5"
                          fill="#ec4899"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:scale-125 transition-transform"
                          onPointerDown={e => handlePointerDown(e, stroke.id, idx, 'handleOut')}
                        />
                      </>
                    )}

                    {/* Anchor Node Square */}
                    <rect
                      x={pt.x - 6}
                      y={pt.y - 6}
                      width="12"
                      height="12"
                      rx="2"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-move hover:scale-125 transition-transform shadow-md"
                      onPointerDown={e => handlePointerDown(e, stroke.id, idx, 'point')}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
