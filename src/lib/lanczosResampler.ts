/**
 * Pure TypeScript Lanczos-3 Kernel & High-Precision Image Resampler
 * - Off main thread capable (Web Worker / OffscreenCanvas)
 * - Anti-aliasing with sinc windowed Lanczos kernel (a = 3)
 * - Preserves RGBA subpixel channels and alpha blending
 * - Avoids standard canvas bilinear blur on high-ratio downscaling
 */

function sinc(x: number): number {
  if (x === 0) return 1.0;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

function lanczosKernel(x: number, a: number = 3): number {
  const absX = Math.abs(x);
  if (absX === 0) return 1.0;
  if (absX >= a) return 0.0;
  return sinc(absX) * sinc(absX / a);
}

export interface ImageDataLike {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

/**
 * High-performance separable 2-pass Lanczos-3 resampling
 */
export function lanczosResample(
  src: ImageDataLike,
  targetWidth: number,
  targetHeight: number,
  a: number = 3
): ImageDataLike {
  const srcWidth = src.width;
  const srcHeight = src.height;
  const srcData = src.data;

  if (srcWidth === targetWidth && srcHeight === targetHeight) {
    return {
      width: targetWidth,
      height: targetHeight,
      data: new Uint8ClampedArray(srcData),
    };
  }

  // Pre-calculate horizontal scale and filters
  const scaleX = targetWidth / srcWidth;
  const scaleY = targetHeight / srcHeight;

  // Horizontal filter parameters
  const filterRadiusX = scaleX < 1.0 ? a / scaleX : a;
  const filterRadiusY = scaleY < 1.0 ? a / scaleY : a;

  // Intermediate buffer: width = targetWidth, height = srcHeight (Pass 1: Horizontal)
  const tempBuf = new Float32Array(targetWidth * srcHeight * 4);

  // Pass 1: Horizontal pass
  for (let x = 0; x < targetWidth; x++) {
    const centerSrcX = (x + 0.5) / scaleX - 0.5;
    const startX = Math.max(0, Math.floor(centerSrcX - filterRadiusX));
    const endX = Math.min(srcWidth - 1, Math.ceil(centerSrcX + filterRadiusX));

    // Precalculate weights for column x
    const weights: number[] = [];
    let weightSum = 0;
    for (let sx = startX; sx <= endX; sx++) {
      const distance = (sx - centerSrcX) * (scaleX < 1.0 ? scaleX : 1.0);
      const w = lanczosKernel(distance, a);
      weights.push(w);
      weightSum += w;
    }

    const norm = weightSum !== 0 ? 1.0 / weightSum : 1.0;

    for (let y = 0; y < srcHeight; y++) {
      let r = 0, g = 0, b = 0, alpha = 0;
      const srcRowOffset = y * srcWidth * 4;

      for (let i = 0; i < weights.length; i++) {
        const sx = startX + i;
        const w = weights[i] * norm;
        const offset = srcRowOffset + sx * 4;

        r += srcData[offset] * w;
        g += srcData[offset + 1] * w;
        b += srcData[offset + 2] * w;
        alpha += srcData[offset + 3] * w;
      }

      const tempOffset = (y * targetWidth + x) * 4;
      tempBuf[tempOffset] = r;
      tempBuf[tempOffset + 1] = g;
      tempBuf[tempOffset + 2] = b;
      tempBuf[tempOffset + 3] = alpha;
    }
  }

  // Pass 2: Vertical pass (tempBuf -> dstData)
  const dstData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y++) {
    const centerSrcY = (y + 0.5) / scaleY - 0.5;
    const startY = Math.max(0, Math.floor(centerSrcY - filterRadiusY));
    const endY = Math.min(srcHeight - 1, Math.ceil(centerSrcY + filterRadiusY));

    const weights: number[] = [];
    let weightSum = 0;
    for (let sy = startY; sy <= endY; sy++) {
      const distance = (sy - centerSrcY) * (scaleY < 1.0 ? scaleY : 1.0);
      const w = lanczosKernel(distance, a);
      weights.push(w);
      weightSum += w;
    }

    const norm = weightSum !== 0 ? 1.0 / weightSum : 1.0;

    for (let x = 0; x < targetWidth; x++) {
      let r = 0, g = 0, b = 0, alpha = 0;

      for (let i = 0; i < weights.length; i++) {
        const sy = startY + i;
        const w = weights[i] * norm;
        const offset = (sy * targetWidth + x) * 4;

        r += tempBuf[offset] * w;
        g += tempBuf[offset + 1] * w;
        b += tempBuf[offset + 2] * w;
        alpha += tempBuf[offset + 3] * w;
      }

      const dstOffset = (y * targetWidth + x) * 4;
      dstData[dstOffset] = Math.min(255, Math.max(0, Math.round(r)));
      dstData[dstOffset + 1] = Math.min(255, Math.max(0, Math.round(g)));
      dstData[dstOffset + 2] = Math.min(255, Math.max(0, Math.round(b)));
      dstData[dstOffset + 3] = Math.min(255, Math.max(0, Math.round(alpha)));
    }
  }

  return {
    width: targetWidth,
    height: targetHeight,
    data: dstData,
  };
}
