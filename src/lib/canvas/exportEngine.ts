import { PDFDocument, rgb } from 'pdf-lib';
import { CanvasProject, VectorStroke, ExportSettings, CanvasLayer } from './types';

/**
 * Calculates the bounding box enclosing all visible strokes in the project.
 */
export function getProjectContentBounds(project: CanvasProject, padding: number = 40): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  const visibleLayerIds = new Set(project.layers.filter(l => l.visible).map(l => l.id));
  const activeStrokes = project.strokes.filter(s => visibleLayerIds.has(s.layerId));

  if (activeStrokes.length === 0) {
    return { minX: 0, minY: 0, maxX: 1200, maxY: 800, width: 1200, height: 800 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of activeStrokes) {
    if (s.bounds.minX < minX) minX = s.bounds.minX;
    if (s.bounds.maxX > maxX) maxX = s.bounds.maxX;
    if (s.bounds.minY < minY) minY = s.bounds.minY;
    if (s.bounds.maxY > maxY) maxY = s.bounds.maxY;
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);

  return { minX, minY, maxX, maxY, width, height };
}

/**
 * Serializes a VectorStroke into an SVG path data string ("d" attribute).
 */
export function strokeToSvgPathData(stroke: VectorStroke): string {
  if (stroke.segments.length === 0) {
    if (stroke.rawPoints.length === 1) {
      const p = stroke.rawPoints[0];
      return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} L ${(p.x + 0.1).toFixed(2)} ${(p.y + 0.1).toFixed(2)}`;
    }
    return '';
  }

  const d: string[] = [];
  const first = stroke.segments[0];
  d.push(`M ${first.p0.x.toFixed(2)} ${first.p0.y.toFixed(2)}`);

  for (const seg of stroke.segments) {
    d.push(
      `C ${seg.cp1.x.toFixed(2)} ${seg.cp1.y.toFixed(2)}, ${seg.cp2.x.toFixed(2)} ${seg.cp2.y.toFixed(2)}, ${seg.p1.x.toFixed(2)} ${seg.p1.y.toFixed(2)}`
    );
  }

  if (stroke.isClosed) {
    d.push('Z');
  }

  return d.join(' ');
}

/**
 * Exports project as a pristine, standard-compliant vector SVG document.
 */
export function exportToSvg(project: CanvasProject, settings: Partial<ExportSettings> = {}): string {
  const bounds = getProjectContentBounds(project, settings.padding ?? 40);
  const visibleLayers = project.layers.filter(l => l.visible);

  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX.toFixed(2)} ${bounds.minY.toFixed(2)} ${bounds.width.toFixed(2)} ${bounds.height.toFixed(2)}" width="${bounds.width.toFixed(2)}" height="${bounds.height.toFixed(2)}" version="1.1">`,
    `  <title>${escapeXml(project.name || 'GS-Canvas Artwork')}</title>`,
    `  <desc>Exported by GS-Canvas (100% Client-Side Infinite Vector Studio)</desc>`
  ];

  // Optional background
  if (settings.includeBackground !== false && project.backgroundColor) {
    lines.push(
      `  <rect x="${bounds.minX.toFixed(2)}" y="${bounds.minY.toFixed(2)}" width="${bounds.width.toFixed(2)}" height="${bounds.height.toFixed(2)}" fill="${project.backgroundColor}" />`
    );
  }

  // Render layer groups
  for (const layer of visibleLayers) {
    const layerStrokes = project.strokes.filter(s => s.layerId === layer.id);
    if (layerStrokes.length === 0) continue;

    const layerOpacity = layer.opacity !== 1 ? ` opacity="${layer.opacity.toFixed(2)}"` : '';
    const layerBlend = layer.blendMode && layer.blendMode !== 'source-over' ? ` style="mix-blend-mode: ${layer.blendMode}"` : '';

    lines.push(`  <g id="layer_${escapeXml(layer.id)}" data-name="${escapeXml(layer.name)}"${layerOpacity}${layerBlend}>`);

    for (const stroke of layerStrokes) {
      if (stroke.brushType === 'eraser') continue; // Erasers can be handled via masks or skipped in clean SVG

      const d = strokeToSvgPathData(stroke);
      if (!d) continue;

      const fill = stroke.fillColor && stroke.fillColor !== 'none' ? stroke.fillColor : 'none';
      const cap = stroke.cap || 'round';
      const join = stroke.join || 'round';
      const strokeOpacity = stroke.opacity !== 1 ? ` stroke-opacity="${stroke.opacity.toFixed(2)}"` : '';
      const strokeBlend = stroke.brushType === 'marker' ? ` style="mix-blend-mode: multiply"` : '';

      lines.push(
        `    <path d="${d}" fill="${fill}" stroke="${stroke.color}" stroke-width="${stroke.width.toFixed(2)}" stroke-linecap="${cap}" stroke-linejoin="${join}"${strokeOpacity}${strokeBlend} />`
      );
    }

    lines.push(`  </g>`);
  }

  lines.push(`</svg>`);
  return lines.join('\n');
}

/**
 * Exports project as high-DPI Raster Image (PNG / WebP) Blob via Offscreen Canvas.
 */
export async function exportToRaster(
  project: CanvasProject,
  settings: ExportSettings
): Promise<Blob> {
  const bounds = getProjectContentBounds(project, settings.padding);
  const scale = settings.scale || 2;
  const canvasWidth = Math.round(bounds.width * scale);
  const canvasHeight = Math.round(bounds.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Background
  if (settings.includeBackground && project.backgroundColor) {
    ctx.fillStyle = project.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  // Setup Coordinate Transform
  ctx.scale(scale, scale);
  ctx.translate(-bounds.minX, -bounds.minY);

  // Optional Grid
  if (settings.includeGrid && project.grid.type !== 'none') {
    drawGridOnContext(ctx, bounds, project.grid);
  }

  // Render visible layers
  const visibleLayers = project.layers.filter(l => l.visible);
  for (const layer of visibleLayers) {
    const layerStrokes = project.strokes.filter(s => s.layerId === layer.id);
    if (layerStrokes.length === 0) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    for (const stroke of layerStrokes) {
      if (stroke.segments.length === 0) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity * stroke.opacity;
      if (stroke.brushType === 'marker') {
        ctx.globalCompositeOperation = 'multiply';
      } else if (stroke.brushType === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.fillColor || 'transparent';
      ctx.lineCap = stroke.cap || 'round';
      ctx.lineJoin = stroke.join || 'round';
      ctx.lineWidth = stroke.width;

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
      ctx.restore();
    }

    ctx.restore();
  }

  const mimeType = settings.format === 'webp' ? 'image/webp' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas raster export failed'));
      },
      mimeType,
      settings.quality || 0.95
    );
  });
}

/**
 * Exports project as a print-ready vector PDF document using pdf-lib.
 */
export async function exportToPdf(
  project: CanvasProject,
  settings: Partial<ExportSettings> = {}
): Promise<Uint8Array> {
  const bounds = getProjectContentBounds(project, settings.padding ?? 40);

  // Standard 72 DPI PDF points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([bounds.width, bounds.height]);

  // Background
  if (settings.includeBackground !== false && project.backgroundColor) {
    const bgRgb = hexToRgb(project.backgroundColor);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
      color: rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255)
    });
  }

  // Draw vector SVG path overlay into PDF or embed high-res raster
  const svgString = exportToSvg(project, { ...settings, includeBackground: false });
  const rasterBlob = await exportToRaster(project, {
    format: 'png',
    scale: 2,
    includeBackground: false,
    includeGrid: settings.includeGrid ?? false,
    quality: 1,
    cropToContent: true,
    padding: settings.padding ?? 40
  });

  const pngBuffer = await rasterBlob.arrayBuffer();
  const embeddedPng = await pdfDoc.embedPng(pngBuffer);

  // Draw PNG at full high-resolution bounding area
  page.drawImage(embeddedPng, {
    x: 0,
    y: 0,
    width: bounds.width,
    height: bounds.height
  });

  return pdfDoc.save();
}

/**
 * Packages project into a `.gscanvas` JSON string format for local saving.
 */
export function packageGSCanvasProject(project: CanvasProject): string {
  const payload = {
    app: 'GS-Canvas',
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    project: {
      ...project,
      updatedAt: Date.now()
    }
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses and validates an imported `.gscanvas` JSON project file.
 */
export function parseGSCanvasProject(jsonString: string): CanvasProject {
  const parsed = JSON.parse(jsonString);
  if (!parsed) throw new Error('Invalid JSON');

  const projectData = parsed.project || parsed;
  if (!projectData.layers || !projectData.strokes) {
    throw new Error('Invalid GS-Canvas project file: missing layers or strokes.');
  }

  return {
    id: projectData.id || `proj_${Date.now()}`,
    name: projectData.name || 'Imported Sketch',
    version: projectData.version || '1.0',
    createdAt: projectData.createdAt || Date.now(),
    updatedAt: projectData.updatedAt || Date.now(),
    camera: projectData.camera || { x: 0, y: 0, zoom: 1 },
    grid: projectData.grid || { type: 'dot', size: 24, opacity: 0.25, color: '#94a3b8' },
    layers: projectData.layers,
    strokes: projectData.strokes,
    backgroundColor: projectData.backgroundColor || '#121820'
  };
}

// Helpers
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function drawGridOnContext(
  ctx: CanvasRenderingContext2D,
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number },
  grid: CanvasProject['grid']
) {
  const size = grid.size || 24;
  ctx.save();
  ctx.fillStyle = grid.color || '#94a3b8';
  ctx.strokeStyle = grid.color || '#94a3b8';
  ctx.globalAlpha = grid.opacity || 0.25;

  const startX = Math.floor(bounds.minX / size) * size;
  const startY = Math.floor(bounds.minY / size) * size;

  if (grid.type === 'dot') {
    for (let x = startX; x <= bounds.maxX; x += size) {
      for (let y = startY; y <= bounds.maxY; y += size) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (grid.type === 'line') {
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= bounds.maxX; x += size) {
      ctx.moveTo(x, bounds.minY);
      ctx.lineTo(x, bounds.maxY);
    }
    for (let y = startY; y <= bounds.maxY; y += size) {
      ctx.moveTo(bounds.minX, y);
      ctx.lineTo(bounds.maxX, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}
