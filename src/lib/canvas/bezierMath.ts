import { CanvasPoint, BezierSegment, VectorNode, VectorStroke, BrushType } from './types';

/**
 * Calculates Euclidean distance between two points.
 */
export function distance(p1: CanvasPoint, p2: CanvasPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates perpendicular distance from point p to line segment (p1, p2).
 */
export function perpendicularDistance(p: CanvasPoint, p1: CanvasPoint, p2: CanvasPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return distance(p, p1);
  }

  // Projection scalar
  const t = Math.max(0, Math.min(1, ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq));
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;

  return distance(p, { x: projX, y: projY });
}

/**
 * Ramer-Douglas-Peucker (RDP) point decimation algorithm.
 * Reduces raw sampled pointer points while preserving critical curve features and eliminating jitter.
 */
export function simplifyPointsRDP(points: CanvasPoint[], epsilon: number = 1.2): CanvasPoint[] {
  if (points.length <= 2) return [...points];

  let maxDist = 0;
  let maxIndex = 0;
  const last = points.length - 1;

  for (let i = 1; i < last; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[last]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPointsRDP(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPointsRDP(points.slice(maxIndex), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[last]];
  }
}

/**
 * Converts simplified raw points into smooth cubic Bézier segments using Catmull-Rom spline tangents.
 */
export function pointsToBezierSegments(
  points: CanvasPoint[],
  baseWidth: number,
  brushType: BrushType
): { segments: BezierSegment[]; nodes: VectorNode[] } {
  if (points.length < 2) {
    if (points.length === 1) {
      // Dot / Single tap stroke
      const p = points[0];
      const p2 = { x: p.x + 0.1, y: p.y + 0.1, pressure: p.pressure ?? 0.5 };
      const seg: BezierSegment = {
        p0: p,
        cp1: p,
        cp2: p2,
        p1: p2,
        startWidth: calculateDynamicWidth(baseWidth, p.pressure ?? 0.5, brushType),
        endWidth: calculateDynamicWidth(baseWidth, p2.pressure ?? 0.5, brushType)
      };
      const node: VectorNode = {
        id: `node_0`,
        point: p,
        isCorner: true
      };
      return { segments: [seg], nodes: [node] };
    }
    return { segments: [], nodes: [] };
  }

  const segments: BezierSegment[] = [];
  const nodes: VectorNode[] = [];

  // Generate nodes for post-stroke editing
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    nodes.push({
      id: `node_${i}_${Math.random().toString(36).substring(2, 7)}`,
      point: { ...pt },
      isCorner: i === 0 || i === points.length - 1
    });
  }

  // Generate smooth cubic Bézier curve segments through Catmull-Rom conversion (tension = 0.5)
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    const startWidth = calculateDynamicWidth(baseWidth, p1.pressure ?? 0.5, brushType);
    const endWidth = calculateDynamicWidth(baseWidth, p2.pressure ?? 0.5, brushType);

    segments.push({
      p0: { ...p1 },
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y },
      p1: { ...p2 },
      startWidth,
      endWidth
    });

    // Populate handles on nodes
    if (nodes[i]) {
      nodes[i].handleOut = { x: cp1x, y: cp1y };
    }
    if (nodes[i + 1]) {
      nodes[i + 1].handleIn = { x: cp2x, y: cp2y };
    }
  }

  return { segments, nodes };
}

/**
 * Computes stroke width based on brush type and stylus pressure.
 */
export function calculateDynamicWidth(baseWidth: number, pressure: number, brushType: BrushType): number {
  const normPressure = Math.max(0.05, Math.min(1.0, pressure));
  switch (brushType) {
    case 'pen':
      // Dynamic pressure: 0.3x to 2.0x base width
      return baseWidth * (0.35 + 1.65 * Math.pow(normPressure, 1.2));
    case 'marker':
      // Markers maintain semi-consistent chisel width with light pressure sensitivity
      return baseWidth * (0.75 + 0.5 * normPressure);
    case 'pencil':
      // Pencil stays fine, pressure affects grain opacity more than width
      return baseWidth * (0.6 + 0.4 * normPressure);
    case 'eraser':
      return baseWidth * 1.5;
    default:
      return baseWidth;
  }
}

/**
 * Recomputes Bézier segments from an updated array of VectorNodes.
 */
export function nodesToBezierSegments(nodes: VectorNode[], baseWidth: number, brushType: BrushType): BezierSegment[] {
  if (nodes.length < 2) return [];

  const segments: BezierSegment[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const n1 = nodes[i];
    const n2 = nodes[i + 1];

    const cp1 = n1.handleOut || {
      x: n1.point.x + (n2.point.x - n1.point.x) / 3,
      y: n1.point.y + (n2.point.y - n1.point.y) / 3
    };

    const cp2 = n2.handleIn || {
      x: n2.point.x - (n2.point.x - n1.point.x) / 3,
      y: n2.point.y - (n2.point.y - n1.point.y) / 3
    };

    const startWidth = calculateDynamicWidth(baseWidth, n1.point.pressure ?? 0.5, brushType);
    const endWidth = calculateDynamicWidth(baseWidth, n2.point.pressure ?? 0.5, brushType);

    segments.push({
      p0: { ...n1.point },
      cp1: { ...cp1 },
      cp2: { ...cp2 },
      p1: { ...n2.point },
      startWidth,
      endWidth
    });
  }

  return segments;
}

/**
 * Evaluates point on a cubic Bézier curve at parameter t (0 <= t <= 1).
 */
export function evaluateCubicBezier(p0: CanvasPoint, cp1: CanvasPoint, cp2: CanvasPoint, p1: CanvasPoint, t: number): CanvasPoint {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p1.x,
    y: mt3 * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p1.y
  };
}

/**
 * Minimum distance from a point to a cubic Bézier segment (using discrete parameter search).
 */
export function distanceToCubicBezier(point: CanvasPoint, seg: BezierSegment, samples: number = 16): number {
  let minDist = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const ptOnCurve = evaluateCubicBezier(seg.p0, seg.cp1, seg.cp2, seg.p1, t);
    const d = distance(point, ptOnCurve);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}

/**
 * Checks if a click / tap point hits a vector stroke within tolerance.
 */
export function isPointNearStroke(point: CanvasPoint, stroke: VectorStroke, tolerance: number = 10): boolean {
  // First check coarse bounding box
  const b = stroke.bounds;
  const pad = Math.max(tolerance, stroke.width / 2 + 5);
  if (
    point.x < b.minX - pad ||
    point.x > b.maxX + pad ||
    point.y < b.minY - pad ||
    point.y > b.maxY + pad
  ) {
    return false;
  }

  // Test against individual segments
  const effectiveTolerance = Math.max(tolerance, stroke.width / 2 + 4);
  for (const seg of stroke.segments) {
    if (distanceToCubicBezier(point, seg, 12) <= effectiveTolerance) {
      return true;
    }
  }

  return false;
}

/**
 * Computes tight axis-aligned bounding box for a set of points / segments.
 */
export function computeBounds(segments: BezierSegment[], rawPoints: CanvasPoint[], strokeWidth: number = 2): VectorStroke['bounds'] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (segments.length > 0) {
    for (const seg of segments) {
      // Check segment anchors and control points
      const pts = [seg.p0, seg.cp1, seg.cp2, seg.p1];
      for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
  } else if (rawPoints.length > 0) {
    for (const p of rawPoints) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  } else {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const halfWidth = strokeWidth / 2;
  minX -= halfWidth;
  minY -= halfWidth;
  maxX += halfWidth;
  maxY += halfWidth;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY)
  };
}

/**
 * Checks if a point is inside a polygon (Ray casting algorithm).
 */
export function isPointInPolygon(p: CanvasPoint, polygon: CanvasPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > p.y) !== (yj > p.y)) &&
      (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if a stroke is contained inside a lasso selection polygon.
 */
export function isStrokeInLasso(stroke: VectorStroke, lasso: CanvasPoint[]): boolean {
  if (lasso.length < 3) return false;
  // Center check or all raw points check
  const b = stroke.bounds;
  const center = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
  if (isPointInPolygon(center, lasso)) return true;

  for (const pt of stroke.rawPoints) {
    if (isPointInPolygon(pt, lasso)) return true;
  }
  return false;
}

/**
 * Transforms a vector stroke by translating, scaling, and rotating.
 */
export function transformStroke(
  stroke: VectorStroke,
  dx: number,
  dy: number,
  scaleX: number = 1,
  scaleY: number = 1,
  originX?: number,
  originY?: number,
  angleRad: number = 0
): VectorStroke {
  const ox = originX ?? (stroke.bounds.minX + stroke.bounds.maxX) / 2;
  const oy = originY ?? (stroke.bounds.minY + stroke.bounds.maxY) / 2;

  const transformPoint = (p: CanvasPoint): CanvasPoint => {
    // Translate relative to origin
    let x = p.x - ox;
    let y = p.y - oy;

    // Scale
    x *= scaleX;
    y *= scaleY;

    // Rotate
    if (angleRad !== 0) {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      x = rx;
      y = ry;
    }

    // Translate back and apply delta
    return {
      ...p,
      x: x + ox + dx,
      y: y + oy + dy
    };
  };

  const newRawPoints = stroke.rawPoints.map(transformPoint);
  const newNodes = stroke.nodes.map(n => ({
    ...n,
    point: transformPoint(n.point),
    handleIn: n.handleIn ? transformPoint(n.handleIn) : undefined,
    handleOut: n.handleOut ? transformPoint(n.handleOut) : undefined
  }));

  const newSegments = stroke.segments.map(seg => ({
    ...seg,
    p0: transformPoint(seg.p0),
    cp1: transformPoint(seg.cp1),
    cp2: transformPoint(seg.cp2),
    p1: transformPoint(seg.p1)
  }));

  const newBounds = computeBounds(newSegments, newRawPoints, stroke.width);

  return {
    ...stroke,
    rawPoints: newRawPoints,
    nodes: newNodes,
    segments: newSegments,
    bounds: newBounds,
    updatedAt: Date.now()
  };
}
