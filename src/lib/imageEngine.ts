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
