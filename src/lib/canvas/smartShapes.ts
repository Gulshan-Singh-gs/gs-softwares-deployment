import { CanvasPoint, BezierSegment, VectorNode, ShapeKind, BrushType } from './types';
import { distance, computeBounds, calculateDynamicWidth } from './bezierMath';

export interface RecognizedShape {
  kind: ShapeKind;
  confidence: number; // 0 to 1
  segments: BezierSegment[];
  nodes: VectorNode[];
  rawPoints: CanvasPoint[];
  isClosed: boolean;
}

/**
 * Evaluates raw sampled points to detect if the user sketched a geometric shape
 * and returns geometrically synthesized Bézier curves and nodes.
 */
export function recognizeSmartShape(
  points: CanvasPoint[],
  baseWidth: number,
  brushType: BrushType
): RecognizedShape | null {
  if (points.length < 5) return null;

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = distance(startPt, endPt);

  // Approximate total path length
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += distance(points[i], points[i + 1]);
  }

  // 1. STRAIGHT LINE RECOGNITION
  // If start and end are far apart and path deviation is minimal
  if (startEndDist > 20 && totalLength / startEndDist < 1.12) {
    let maxDeviation = 0;
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const lenSq = dx * dx + dy * dy;

    for (const p of points) {
      const t = Math.max(0, Math.min(1, ((p.x - startPt.x) * dx + (p.y - startPt.y) * dy) / lenSq));
      const projX = startPt.x + t * dx;
      const projY = startPt.y + t * dy;
      const dev = distance(p, { x: projX, y: projY });
      if (dev > maxDeviation) maxDeviation = dev;
    }

    if (maxDeviation < Math.max(12, startEndDist * 0.08)) {
      // Perfect straight line
      const seg: BezierSegment = {
        p0: { ...startPt },
        cp1: {
          x: startPt.x + (endPt.x - startPt.x) / 3,
          y: startPt.y + (endPt.y - startPt.y) / 3
        },
        cp2: {
          x: startPt.x + (2 * (endPt.x - startPt.x)) / 3,
          y: startPt.y + (2 * (endPt.y - startPt.y)) / 3
        },
        p1: { ...endPt },
        startWidth: calculateDynamicWidth(baseWidth, startPt.pressure ?? 0.5, brushType),
        endWidth: calculateDynamicWidth(baseWidth, endPt.pressure ?? 0.5, brushType)
      };

      const nodes: VectorNode[] = [
        { id: `node_s_${Date.now()}`, point: { ...startPt }, isCorner: true },
        { id: `node_e_${Date.now()}`, point: { ...endPt }, isCorner: true }
      ];

      return {
        kind: 'line',
        confidence: 0.95,
        segments: [seg],
        nodes,
        rawPoints: [startPt, endPt],
        isClosed: false
      };
    }
  }

  // Check if stroke is roughly closed (start & end within 25% of total perimeter)
  const isLoop = startEndDist < Math.max(35, totalLength * 0.25);

  if (!isLoop) return null;

  // Calculate centroid and bounding box
  let sumX = 0;
  let sumY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const cx = sumX / points.length;
  const cy = sumY / points.length;
  const width = Math.max(10, maxX - minX);
  const height = Math.max(10, maxY - minY);

  // 2. CIRCLE / ELLIPSE RECOGNITION
  // Check radial distance variance from centroid
  const radii: number[] = points.map(p => distance(p, { x: cx, y: cy }));
  const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
  const variance = radii.reduce((acc, r) => acc + Math.pow(r - avgRadius, 2), 0) / radii.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgRadius;

  const aspectRatio = width / height;

  if (coefficientOfVariation < 0.18) {
    // Highly circular or elliptical
    const rx = width / 2;
    const ry = height / 2;
    const isPerfectCircle = Math.abs(aspectRatio - 1) < 0.2;
    const finalRx = isPerfectCircle ? (rx + ry) / 2 : rx;
    const finalRy = isPerfectCircle ? (rx + ry) / 2 : ry;

    // Construct 4-cubic-Bézier circle approximation (kappa = 0.5522847498307935)
    const k = 0.5522847498307935;
    const ox = finalRx * k;
    const oy = finalRy * k;

    const top = { x: cx, y: cy - finalRy };
    const right = { x: cx + finalRx, y: cy };
    const bottom = { x: cx, y: cy + finalRy };
    const left = { x: cx - finalRx, y: cy };

    const w = calculateDynamicWidth(baseWidth, 0.5, brushType);

    const segments: BezierSegment[] = [
      {
        p0: top,
        cp1: { x: cx + ox, y: cy - finalRy },
        cp2: { x: cx + finalRx, y: cy - oy },
        p1: right,
        startWidth: w,
        endWidth: w
      },
      {
        p0: right,
        cp1: { x: cx + finalRx, y: cy + oy },
        cp2: { x: cx + ox, y: cy + finalRy },
        p1: bottom,
        startWidth: w,
        endWidth: w
      },
      {
        p0: bottom,
        cp1: { x: cx - ox, y: cy + finalRy },
        cp2: { x: cx - finalRx, y: cy + oy },
        p1: left,
        startWidth: w,
        endWidth: w
      },
      {
        p0: left,
        cp1: { x: cx - finalRx, y: cy - oy },
        cp2: { x: cx - ox, y: cy - finalRy },
        p1: top,
        startWidth: w,
        endWidth: w
      }
    ];

    const nodes: VectorNode[] = [
      { id: `node_t_${Date.now()}`, point: top, handleOut: { x: cx + ox, y: cy - finalRy }, handleIn: { x: cx - ox, y: cy - finalRy } },
      { id: `node_r_${Date.now()}`, point: right, handleOut: { x: cx + finalRx, y: cy + oy }, handleIn: { x: cx + finalRx, y: cy - oy } },
      { id: `node_b_${Date.now()}`, point: bottom, handleOut: { x: cx - ox, y: cy + finalRy }, handleIn: { x: cx + ox, y: cy + finalRy } },
      { id: `node_l_${Date.now()}`, point: left, handleOut: { x: cx - finalRx, y: cy - oy }, handleIn: { x: cx - finalRx, y: cy + oy } }
    ];

    return {
      kind: isPerfectCircle ? 'circle' : 'ellipse',
      confidence: 1 - coefficientOfVariation,
      segments,
      nodes,
      rawPoints: [top, right, bottom, left, top],
      isClosed: true
    };
  }

  // 3. RECTANGLE / POLYGON RECOGNITION
  // Check corner detection
  const corners = findPolygonCorners(points);

  if (corners.length === 4) {
    // 4-corner rectangle
    const [c0, c1, c2, c3] = corners;
    const w = calculateDynamicWidth(baseWidth, 0.5, brushType);

    const makeEdge = (pA: CanvasPoint, pB: CanvasPoint): BezierSegment => ({
      p0: pA,
      cp1: { x: pA.x + (pB.x - pA.x) / 3, y: pA.y + (pB.y - pA.y) / 3 },
      cp2: { x: pA.x + (2 * (pB.x - pA.x)) / 3, y: pA.y + (2 * (pB.y - pA.y)) / 3 },
      p1: pB,
      startWidth: w,
      endWidth: w
    });

    const segments: BezierSegment[] = [
      makeEdge(c0, c1),
      makeEdge(c1, c2),
      makeEdge(c2, c3),
      makeEdge(c3, c0)
    ];

    const nodes: VectorNode[] = [
      { id: `node_c0_${Date.now()}`, point: c0, isCorner: true },
      { id: `node_c1_${Date.now()}`, point: c1, isCorner: true },
      { id: `node_c2_${Date.now()}`, point: c2, isCorner: true },
      { id: `node_c3_${Date.now()}`, point: c3, isCorner: true }
    ];

    return {
      kind: 'rectangle',
      confidence: 0.88,
      segments,
      nodes,
      rawPoints: [c0, c1, c2, c3, c0],
      isClosed: true
    };
  } else if (corners.length === 3) {
    // 3-corner triangle
    const [c0, c1, c2] = corners;
    const w = calculateDynamicWidth(baseWidth, 0.5, brushType);

    const makeEdge = (pA: CanvasPoint, pB: CanvasPoint): BezierSegment => ({
      p0: pA,
      cp1: { x: pA.x + (pB.x - pA.x) / 3, y: pA.y + (pB.y - pA.y) / 3 },
      cp2: { x: pA.x + (2 * (pB.x - pA.x)) / 3, y: pA.y + (2 * (pB.y - pA.y)) / 3 },
      p1: pB,
      startWidth: w,
      endWidth: w
    });

    const segments: BezierSegment[] = [
      makeEdge(c0, c1),
      makeEdge(c1, c2),
      makeEdge(c2, c0)
    ];

    const nodes: VectorNode[] = [
      { id: `node_t0_${Date.now()}`, point: c0, isCorner: true },
      { id: `node_t1_${Date.now()}`, point: c1, isCorner: true },
      { id: `node_t2_${Date.now()}`, point: c2, isCorner: true }
    ];

    return {
      kind: 'triangle',
      confidence: 0.85,
      segments,
      nodes,
      rawPoints: [c0, c1, c2, c0],
      isClosed: true
    };
  }

  return null;
}

/**
 * Identifies prominent corner vertices in a polygon stroke.
 */
function findPolygonCorners(points: CanvasPoint[]): CanvasPoint[] {
  const step = Math.max(2, Math.floor(points.length / 24));
  const corners: { index: number; angle: number; point: CanvasPoint }[] = [];

  for (let i = step; i < points.length - step; i += step) {
    const prev = points[i - step];
    const curr = points[i];
    const next = points[i + step];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 > 0 && mag2 > 0) {
      const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

      // Sharp direction change (> 45 degrees)
      if (angleDeg > 42) {
        corners.push({ index: i, angle: angleDeg, point: curr });
      }
    }
  }

  // Filter corners that are clustered too close to each other
  const filtered: CanvasPoint[] = [];
  const minCornerDist = 20;

  for (const c of corners) {
    const isDuplicate = filtered.some(fc => distance(fc, c.point) < minCornerDist);
    if (!isDuplicate) {
      filtered.push(c.point);
    }
  }

  return filtered;
}
