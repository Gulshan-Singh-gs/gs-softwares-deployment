/**
 * GS Softwares Suite - File & Memory Utilities
 * 100% Client-side privacy-first processing
 */

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export class MemoryManager {
  private static blobUrls: Set<string> = new Set();

  static trackBlobUrl(url: string): string {
    this.blobUrls.add(url);
    return url;
  }

  static revokeBlobUrl(url: string): void {
    if (this.blobUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(url);
    }
  }

  static cleanup(): void {
    this.blobUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    this.blobUrls.clear();
  }
}

/**
 * Validates and sanitizes archive entries against "Zip Slip" path traversal vulnerabilities.
 * Rejects absolute paths, drive letters, and paths containing ".." segments.
 */
export const sanitizeZipPath = (rawPath: string): { safe: boolean; path: string; error?: string } => {
  // Normalize slashes
  const normalized = rawPath.replace(/\\/g, '/').trim();

  // Block drive letters (e.g. C:) and absolute paths
  if (/^[a-zA-Z]:/.test(normalized) || normalized.startsWith('/')) {
    return { safe: false, path: '', error: 'Absolute archive paths are prohibited' };
  }

  // Split and inspect components
  const segments = normalized.split('/');
  for (const part of segments) {
    if (part === '..' || part === '.') {
      return { safe: false, path: '', error: 'Directory traversal segment ".." detected' };
    }
  }

  // Strip null bytes and control chars
  const sanitized = normalized.replace(/[\x00-\x1f\x7f]/g, '');
  return { safe: true, path: sanitized };
};
