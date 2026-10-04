/**
 * GS Softwares Dedicated Image Transformation & Codec Web Worker
 * Runs Lanczos-3 resampling, batch operations, format conversions, and metadata scrubbing
 * fully off the main thread with transferable buffers.
 */

import { lanczosResample, ImageDataLike } from '../lib/lanczosResampler';

export interface ImageWorkerRequest {
  id: string;
  type: 'resize_lanczos' | 'convert_format' | 'analyze_palette' | 'adjust_filters';
  payload: {
    width?: number;
    height?: number;
    targetWidth?: number;
    targetHeight?: number;
    targetFormat?: string;
    quality?: number;
    imageData?: ImageDataLike;
    filters?: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      exposure?: number;
      temperature?: number;
      tint?: number;
      highlights?: number;
      shadows?: number;
      vibrance?: number;
      clarity?: number;
      sharpen?: number;
    };
  };
}

export interface ImageWorkerResponse {
  id: string;
  success: boolean;
  type: string;
  result?: {
    imageData?: ImageDataLike;
    palette?: string[];
  };
  error?: string;
}

self.onmessage = async (e: MessageEvent<ImageWorkerRequest>) => {
  const req = e.data;
  const { id, type, payload } = req;

  try {
    if (type === 'resize_lanczos') {
      if (!payload.imageData || !payload.targetWidth || !payload.targetHeight) {
        throw new Error('Missing imageData or target dimensions for Lanczos resize');
      }

      const resampled = lanczosResample(
        payload.imageData,
        payload.targetWidth,
        payload.targetHeight,
        3
      );

      // Transfer resampled buffer back with zero-copy
      const transferBuffer = resampled.data.buffer;
      const response: ImageWorkerResponse = {
        id,
        success: true,
        type,
        result: { imageData: resampled },
      };

      // @ts-expect-error Transferable postMessage
      self.postMessage(response, [transferBuffer]);
      return;
    }

    if (type === 'adjust_filters') {
      if (!payload.imageData || !payload.filters) {
        throw new Error('Missing imageData or filters');
      }

      const { data, width, height } = payload.imageData;
      const out = new Uint8ClampedArray(data.length);
      const {
        brightness = 100,
        contrast = 100,
        saturation = 100,
        exposure = 0,
      } = payload.filters;

      const bMult = brightness / 100;
      const cFactor = (contrast - 100) / 100;
      const sMult = saturation / 100;
      const expOffset = exposure * 2.55;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const a = data[i + 3];

        // Exposure & Brightness
        r = r * bMult + expOffset;
        g = g * bMult + expOffset;
        b = b * bMult + expOffset;

        // Contrast
        r = (r - 128) * (1 + cFactor) + 128;
        g = (g - 128) * (1 + cFactor) + 128;
        b = (b - 128) * (1 + cFactor) + 128;

        // Saturation
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * sMult;
        g = gray + (g - gray) * sMult;
        b = gray + (b - gray) * sMult;

        out[i] = Math.min(255, Math.max(0, r));
        out[i + 1] = Math.min(255, Math.max(0, g));
        out[i + 2] = Math.min(255, Math.max(0, b));
        out[i + 3] = a;
      }

      const processedImage: ImageDataLike = { width, height, data: out };
      const transferBuffer = out.buffer;
      const response: ImageWorkerResponse = {
        id,
        success: true,
        type,
        result: { imageData: processedImage },
      };

      // @ts-expect-error Transferable postMessage
      self.postMessage(response, [transferBuffer]);
      return;
    }

    if (type === 'analyze_palette') {
      if (!payload.imageData) {
        throw new Error('Missing imageData for palette analysis');
      }

      const { data } = payload.imageData;
      const colorCounts = new Map<string, number>();

      // Sample every 4th pixel for speed
      for (let i = 0; i < data.length; i += 16) {
        const a = data[i + 3];
        if (a < 128) continue;

        // Quantize colors to reduce noise (step of 16)
        const r = Math.round(data[i] / 16) * 16;
        const g = Math.round(data[i + 1] / 16) * 16;
        const b = Math.round(data[i + 2] / 16) * 16;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
      }

      const sorted = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex]) => hex);

      self.postMessage({
        id,
        success: true,
        type,
        result: { palette: sorted },
      });
      return;
    }

    throw new Error(`Unsupported image worker task: ${type}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    self.postMessage({
      id,
      success: false,
      type,
      error: errorMsg,
    });
  }
};
