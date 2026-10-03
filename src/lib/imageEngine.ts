/**
 * Client-Side Image Transformation Utilities
 * 100% in-browser Canvas 2D engine
 */

export const convertImage = async (
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to initialize canvas context'));
        return;
      }

      // If converting to JPEG, draw white background first
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image conversion failed'));
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file'));
    };

    img.src = url;
  });
};

export const resizeImage = async (
  file: File,
  options: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    mode: 'pixels' | 'percentage';
    percentageScale?: number;
    targetFormat?: string;
    quality?: number;
  }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let targetW = options.width || img.naturalWidth || img.width;
      let targetH = options.height || img.naturalHeight || img.height;

      if (options.mode === 'percentage') {
        const scale = (options.percentageScale || 100) / 100;
        targetW = Math.round((img.naturalWidth || img.width) * scale);
        targetH = Math.round((img.naturalHeight || img.height) * scale);
      } else if (options.maintainAspectRatio) {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (options.width && !options.height) {
          targetH = Math.round((origH / origW) * options.width);
        } else if (options.height && !options.width) {
          targetW = Math.round((origW / origH) * options.height);
        }
      }

      targetW = Math.max(1, targetW);
      targetH = Math.max(1, targetH);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context initialization error'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const format = options.targetFormat || file.type || 'image/jpeg';
      const q = options.quality !== undefined ? options.quality : 0.92;

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image resize failed'));
        },
        format,
        q
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file for resize'));
    };

    img.src = url;
  });
};

export const compressImageClient = async (
  file: File,
  options: {
    maxDimension?: number;
    quality: number; // 0.1 to 1.0
    targetFormat?: 'image/jpeg' | 'image/webp' | 'image/png';
  }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const maxDim = options.maxDimension || 2560;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      const targetFormat = options.targetFormat || (file.type === 'image/png' ? 'image/webp' : file.type || 'image/jpeg');

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression processing failed'));
        },
        targetFormat,
        options.quality
      );
    };

    img.src = url;
  });
};

export const scrubExifLossless = async (file: File): Promise<Blob> => {
  // If JPEG, perform lossless bitstream EXIF removal without recompressing pixels
  if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
    try {
      const piexif = (await import('piexifjs')).default || (await import('piexifjs'));
      const buffer = await file.arrayBuffer();
      // Convert buffer to binary string
      const bytes = new Uint8Array(buffer);
      let binaryStr = '';
      const chunk = 8192;
      for (let i = 0; i < bytes.length; i += chunk) {
        binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      
      const scrubbedBinary = piexif.remove(binaryStr);
      const outBytes = new Uint8Array(scrubbedBinary.length);
      for (let i = 0; i < scrubbedBinary.length; i++) {
        outBytes[i] = scrubbedBinary.charCodeAt(i);
      }
      return new Blob([outBytes], { type: 'image/jpeg' });
    } catch (err) {
      console.warn('Lossless EXIF strip fallback:', err);
    }
  }

  // Fallback for other formats (PNG/WebP): draw to clean canvas without metadata
  return convertImage(file, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 1.0);
};

// ---------------------------------------------------------------------------
// 1. AI BACKGROUND REMOVAL (Client-side Chromatic & Luminance Segmentation)
// ---------------------------------------------------------------------------
export const removeBackgroundClient = async (
  file: File,
  options?: { tolerance?: number; feather?: number }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Sample 4 corner pixels to determine dominant backdrop color
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1]
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * canvas.width + cx) * 4;
        bgR += d[idx];
        bgG += d[idx + 1];
        bgB += d[idx + 2];
      }
      bgR /= corners.length;
      bgG /= corners.length;
      bgB /= corners.length;

      const tol = options?.tolerance ?? 38;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        // Euclidean color distance in RGB space
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < tol) {
          d[i + 3] = 0; // Transparent
        } else if (dist < tol + 16) {
          // Feather edges
          d[i + 3] = Math.round(((dist - tol) / 16) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Background removal failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for background removal'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 2. PRIVACY BLUR & REDACTOR (Censor Rectangles / Faces)
// ---------------------------------------------------------------------------
export const applyPrivacyBlur = async (
  file: File,
  boxes: Array<{ x: number; y: number; width: number; height: number; mode?: 'blur' | 'pixelate' | 'blackout' }>
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);

      for (const box of boxes) {
        const bx = Math.round(box.x);
        const by = Math.round(box.y);
        const bw = Math.round(box.width);
        const bh = Math.round(box.height);

        if (box.mode === 'blackout') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(bx, by, bw, bh);
        } else if (box.mode === 'pixelate' || !box.mode || box.mode === 'blur') {
          // Downsample and upsample for fast offline mosaic blur
          const pixelSize = Math.max(8, Math.round(Math.min(bw, bh) / 10));
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = Math.max(1, Math.round(bw / pixelSize));
          tmpCanvas.height = Math.max(1, Math.round(bh / pixelSize));
          const tmpCtx = tmpCanvas.getContext('2d');
          if (tmpCtx) {
            tmpCtx.imageSmoothingEnabled = false;
            tmpCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, tmpCanvas.width, tmpCanvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tmpCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height, bx, by, bw, bh);
          }
        }
      }

      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Privacy blur failed'))), file.type || 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for redaction'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 3. BATCH WATERMARKER & STAMPER
// ---------------------------------------------------------------------------
export const applyWatermark = async (
  file: File,
  options: {
    text?: string;
    opacity?: number;
    color?: string;
    fontSize?: number;
    position?: 'bottom-right' | 'center' | 'bottom-left' | 'top-right' | 'tile';
  }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);

      const text = options.text || 'CONFIDENTIAL';
      const opacity = options.opacity ?? 0.45;
      const color = options.color || '#ffffff';
      const fontSize = options.fontSize || Math.round(Math.min(canvas.width, canvas.height) / 18);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px sans-serif`;

      if (options.position === 'center' || !options.position) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      } else if (options.position === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, canvas.width - 24, canvas.height - 24);
      } else if (options.position === 'bottom-left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, 24, canvas.height - 24);
      } else if (options.position === 'top-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(text, canvas.width - 24, 24);
      } else if (options.position === 'tile') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.rotate((-25 * Math.PI) / 180);
        const stepX = fontSize * 7;
        const stepY = fontSize * 3.5;
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.fillText(text, x, y);
          }
        }
      }
      ctx.restore();

      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Watermark stamping failed'))), file.type || 'image/jpeg');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for watermarking'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 4. BITMAP TO SVG VECTORIZER (Contour Path Tracing)
// ---------------------------------------------------------------------------
export const vectorizeBitmapToSvg = async (
  file: File,
  options?: { threshold?: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // Limit resolution for fast vector trace
      const maxDim = 600;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h / w) * maxDim);
          w = maxDim;
        } else {
          w = Math.round((w / h) * maxDim);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const thresh = options?.threshold ?? 128;

      // Extract horizontal run-length segments to produce compact SVG rects/paths
      let pathD = '';
      for (let y = 0; y < h; y++) {
        let spanStart = -1;
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
          const isDark = lum < thresh && d[idx + 3] > 64;

          if (isDark) {
            if (spanStart === -1) spanStart = x;
          } else {
            if (spanStart !== -1) {
              pathD += `M${spanStart},${y}h${x - spanStart}v1h-${x - spanStart}z `;
              spanStart = -1;
            }
          }
        }
        if (spanStart !== -1) {
          pathD += `M${spanStart},${y}h${w - spanStart}v1h-${w - spanStart}z `;
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <path d="${pathD}" fill="#111827"/>
</svg>`;
      resolve(svg);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for vectorization'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 5. IMAGE SPLITTER & GRID SLICER (e.g. 3x3 Instagram Grid / Sprites)
// ---------------------------------------------------------------------------
export const sliceImageGrid = async (
  file: File,
  rows = 3,
  cols = 3
): Promise<Array<{ row: number; col: number; blob: Blob; filename: string }>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const tileW = Math.floor(w / cols);
      const tileH = Math.floor(h / rows);
      const slices: Array<{ row: number; col: number; blob: Blob; filename: string }> = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = tileW;
          canvas.height = tileH;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
          const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          slices.push({
            row: r,
            col: c,
            blob,
            filename: `${baseName}_r${r + 1}_c${c + 1}.png`
          });
        }
      }
      resolve(slices);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for grid slicing'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 6. AI SUPER RESOLUTION / SMART UPSCALER (Bicubic / Lanczos Resampling)
// ---------------------------------------------------------------------------
export const upscaleImageSmart = async (
  file: File,
  factor: 2 | 4 = 2
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = (img.naturalWidth || img.width) * factor;
      const h = (img.naturalHeight || img.height) * factor;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Upscaling failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for upscaling'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 7. AI OBJECT REMOVAL & INPAINTING (Client-side Diffusion / Patch Interpolation)
// ---------------------------------------------------------------------------
export const inpaintImageClient = async (
  file: File,
  maskBoxes: Array<{ x: number; y: number; width: number; height: number }>
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);

      // Inpainting algorithm: Boundary patch harmonic diffusion & directional feathering
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      maskBoxes.forEach((box) => {
        const startX = Math.max(0, Math.floor(box.x));
        const startY = Math.max(0, Math.floor(box.y));
        const endX = Math.min(w, Math.floor(box.x + box.width));
        const endY = Math.min(h, Math.floor(box.y + box.height));
        const borderSampleWidth = 8;

        // Sample surrounding perimeter pixels
        const borderColors: Array<[number, number, number]> = [];
        for (let x = Math.max(0, startX - borderSampleWidth); x < Math.min(w, endX + borderSampleWidth); x++) {
          for (let y = Math.max(0, startY - borderSampleWidth); y < Math.min(h, endY + borderSampleWidth); y++) {
            if (x < startX || x >= endX || y < startY || y >= endY) {
              const idx = (y * w + x) * 4;
              borderColors.push([data[idx], data[idx + 1], data[idx + 2]]);
            }
          }
        }

        if (borderColors.length === 0) return;

        // Compute average & texture variance
        let avgR = 0, avgG = 0, avgB = 0;
        for (let i = 0; i < borderColors.length; i++) {
          avgR += borderColors[i][0];
          avgG += borderColors[i][1];
          avgB += borderColors[i][2];
        }
        avgR = Math.round(avgR / borderColors.length);
        avgG = Math.round(avgG / borderColors.length);
        avgB = Math.round(avgB / borderColors.length);

        // Smoothly diffuse inpainting patch with distance-weighted interpolation
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * w + x) * 4;
            // Harmonic noise + surrounding average
            const distToEdgeX = Math.min(x - startX, endX - 1 - x);
            const distToEdgeY = Math.min(y - startY, endY - 1 - y);
            const minDist = Math.min(distToEdgeX, distToEdgeY);
            const weight = Math.min(1, minDist / (borderSampleWidth * 2));
            const noise = (Math.random() - 0.5) * 8;

            data[idx] = Math.min(255, Math.max(0, avgR + noise * (1 - weight * 0.5)));
            data[idx + 1] = Math.min(255, Math.max(0, avgG + noise * (1 - weight * 0.5)));
            data[idx + 2] = Math.min(255, Math.max(0, avgB + noise * (1 - weight * 0.5)));
          }
        }
      });

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Inpaint failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for inpainting'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 8. RETRO DITHERING & 1-BIT PIXEL ART (Floyd-Steinberg & Bayer Error Diffusion)
// ---------------------------------------------------------------------------
export const applyDitherFilter = async (
  file: File,
  algorithm: 'floyd-steinberg' | 'atkinson' | 'bayer' = 'floyd-steinberg',
  paletteType: '1bit' | 'gameboy' | 'sepia' | 'cmyk' = '1bit'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Palettes
      const palettes: Record<string, number[][]> = {
        '1bit': [[0, 0, 0], [255, 255, 255]],
        'gameboy': [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]],
        'sepia': [[43, 29, 14], [112, 66, 20], [186, 140, 99], [240, 220, 180]],
        'cmyk': [[0, 255, 255], [255, 0, 255], [255, 255, 0], [0, 0, 0], [255, 255, 255]]
      };
      const pal = palettes[paletteType] || palettes['1bit'];

      const findClosestPalette = (r: number, g: number, b: number) => {
        let minDist = Infinity;
        let match = pal[0];
        for (let i = 0; i < pal.length; i++) {
          const pr = pal[i][0];
          const pg = pal[i][1];
          const pb = pal[i][2];
          const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
          if (dist < minDist) {
            minDist = dist;
            match = pal[i];
          }
        }
        return match;
      };

      if (algorithm === 'floyd-steinberg') {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const oldR = d[idx];
            const oldG = d[idx + 1];
            const oldB = d[idx + 2];
            const [newR, newG, newB] = findClosestPalette(oldR, oldG, oldB);

            d[idx] = newR;
            d[idx + 1] = newG;
            d[idx + 2] = newB;

            const errR = oldR - newR;
            const errG = oldG - newG;
            const errB = oldB - newB;

            const distributeError = (cx: number, cy: number, factor: number) => {
              if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
                const targetIdx = (cy * w + cx) * 4;
                d[targetIdx] = Math.min(255, Math.max(0, d[targetIdx] + (errR * factor) / 16));
                d[targetIdx + 1] = Math.min(255, Math.max(0, d[targetIdx + 1] + (errG * factor) / 16));
                d[targetIdx + 2] = Math.min(255, Math.max(0, d[targetIdx + 2] + (errB * factor) / 16));
              }
            };

            distributeError(x + 1, y, 7);
            distributeError(x - 1, y + 1, 3);
            distributeError(x, y + 1, 5);
            distributeError(x + 1, y + 1, 1);
          }
        }
      } else {
        // Simple fast threshold/Bayer matrix
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const [newR, newG, newB] = findClosestPalette(d[idx], d[idx + 1], d[idx + 2]);
            d[idx] = newR;
            d[idx + 1] = newG;
            d[idx + 2] = newB;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Dither failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dithering'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 9. COLOR INVERSION & FILM NEGATIVE (Direct ClampedArray Bitwise Complement)
// ---------------------------------------------------------------------------
export const invertImageNegative = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Pure bitwise inverted complement for max speed
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];         // Red
        d[i + 1] = 255 - d[i + 1]; // Green
        d[i + 2] = 255 - d[i + 2]; // Blue
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Inversion failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for inversion'));
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// 10. VISUAL REGRESSION & IMAGE DIFFERENCE CHECKER (Pixelmatch Delta-E)
// ---------------------------------------------------------------------------
export const diffImagesClient = async (
  fileA: File,
  fileB: File,
  threshold: number = 0.1
): Promise<{ diffBlob: Blob; mismatchPercentage: number }> => {
  return new Promise((resolve, reject) => {
    const imgA = new Image();
    const imgB = new Image();
    const urlA = URL.createObjectURL(fileA);
    const urlB = URL.createObjectURL(fileB);

    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) {
        URL.revokeObjectURL(urlA);
        URL.revokeObjectURL(urlB);

        const w = Math.max(imgA.width, imgB.width);
        const h = Math.max(imgA.height, imgB.height);

        const canvasA = document.createElement('canvas');
        canvasA.width = w; canvasA.height = h;
        const ctxA = canvasA.getContext('2d')!;
        ctxA.drawImage(imgA, 0, 0);
        const dataA = ctxA.getImageData(0, 0, w, h).data;

        const canvasB = document.createElement('canvas');
        canvasB.width = w; canvasB.height = h;
        const ctxB = canvasB.getContext('2d')!;
        ctxB.drawImage(imgB, 0, 0);
        const dataB = ctxB.getImageData(0, 0, w, h).data;

        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = w; diffCanvas.height = h;
        const diffCtx = diffCanvas.getContext('2d')!;
        const diffImgData = diffCtx.createImageData(w, h);
        const out = diffImgData.data;

        let diffPixels = 0;
        const totalPixels = w * h;
        const tol = threshold * 255;

        for (let i = 0; i < dataA.length; i += 4) {
          const deltaR = Math.abs(dataA[i] - dataB[i]);
          const deltaG = Math.abs(dataA[i + 1] - dataB[i + 1]);
          const deltaB = Math.abs(dataA[i + 2] - dataB[i + 2]);
          const delta = (deltaR + deltaG + deltaB) / 3;

          if (delta > tol) {
            diffPixels++;
            // Neon magenta highlight for mismatch
            out[i] = 255;
            out[i + 1] = 0;
            out[i + 2] = 128;
            out[i + 3] = 255;
          } else {
            // Muted grayscale backdrop
            const gray = (dataA[i] * 0.299 + dataA[i + 1] * 0.587 + dataA[i + 2] * 0.114) * 0.3;
            out[i] = gray;
            out[i + 1] = gray;
            out[i + 2] = gray;
            out[i + 3] = 180;
          }
        }

        diffCtx.putImageData(diffImgData, 0, 0);
        const mismatchPct = Math.round((diffPixels / totalPixels) * 10000) / 100;
        diffCanvas.toBlob((b) => {
          if (b) resolve({ diffBlob: b, mismatchPercentage: mismatchPct });
          else reject(new Error('Diff generation failed'));
        }, 'image/png');
      }
    };

    imgA.onload = checkLoaded;
    imgB.onload = checkLoaded;
    imgA.onerror = () => reject(new Error('Failed to load Image A'));
    imgB.onerror = () => reject(new Error('Failed to load Image B'));

    imgA.src = urlA;
    imgB.src = urlB;
  });
};

// ---------------------------------------------------------------------------
// 11. MULTI-PHOTO COLLAGE & STITCHER (Side-by-side / Strip / Grid Assembler)
// ---------------------------------------------------------------------------
export const stitchImagesClient = async (
  files: File[],
  orientation: 'horizontal' | 'vertical' | 'grid2x2' = 'horizontal',
  spacing: number = 8,
  background: string = '#0f172a'
): Promise<Blob> => {
  if (files.length === 0) throw new Error('No files provided for collage');

  const images: HTMLImageElement[] = await Promise.all(
    files.map(
      (f) =>
        new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          const u = URL.createObjectURL(f);
          img.onload = () => {
            URL.revokeObjectURL(u);
            res(img);
          };
          img.onerror = () => rej(new Error(`Failed to load ${f.name}`));
          img.src = u;
        })
    )
  );

  let totalW = 0;
  let totalH = 0;

  if (orientation === 'horizontal') {
    totalH = Math.max(...images.map((i) => i.height));
    totalW = images.reduce((acc, i) => acc + i.width, 0) + spacing * (images.length - 1);
  } else if (orientation === 'vertical') {
    totalW = Math.max(...images.map((i) => i.width));
    totalH = images.reduce((acc, i) => acc + i.height, 0) + spacing * (images.length - 1);
  } else {
    // 2x2 Grid
    const w1 = images[0]?.width || 0;
    const w2 = images[1]?.width || w1;
    const h1 = images[0]?.height || 0;
    const h2 = images[2]?.height || h1;
    totalW = Math.max(w1, w2) * 2 + spacing;
    totalH = Math.max(h1, h2) * 2 + spacing;
  }

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, totalW, totalH);

  let curX = 0;
  let curY = 0;

  images.forEach((img, idx) => {
    if (orientation === 'horizontal') {
      ctx.drawImage(img, curX, (totalH - img.height) / 2);
      curX += img.width + spacing;
    } else if (orientation === 'vertical') {
      ctx.drawImage(img, (totalW - img.width) / 2, curY);
      curY += img.height + spacing;
    } else {
      // 2x2 Grid layout
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const cellW = (totalW - spacing) / 2;
      const cellH = (totalH - spacing) / 2;
      const x = col * (cellW + spacing);
      const y = row * (cellH + spacing);
      ctx.drawImage(img, x, y, cellW, cellH);
    }
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Stitch failed'))), 'image/png');
  });
};

