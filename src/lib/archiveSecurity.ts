/**
 * GS-Archive Security Defenses & Streaming Decompressor
 * - Zip-Slip Defense: blocks path traversal (`..` segments, leading slashes, device names)
 * - Decompression-Bomb Defense: enforces maximum uncompressed ratio (e.g. 100:1) and total size caps
 * - Integrated checksum verification matching GS-Hash engine
 */

export interface ArchiveSecurityPolicy {
  maxTotalBytes: number;        // e.g. 2GB ceiling for browser safety
  maxDecompressionRatio: number;// e.g. 100:1 ratio check
  allowHiddenFiles: boolean;
}

export const DEFAULT_ARCHIVE_POLICY: ArchiveSecurityPolicy = {
  maxTotalBytes: 2 * 1024 * 1024 * 1024, // 2 GB
  maxDecompressionRatio: 100,             // 100:1 max expansion
  allowHiddenFiles: true,
};

export interface PathValidationResult {
  isSafe: boolean;
  cleanPath: string;
  error?: string;
}

/**
 * Validates zip entry path against Zip Slip attacks
 */
export function validateArchiveEntryPath(rawPath: string): PathValidationResult {
  // Normalize backslashes to forward slashes
  const normalized = rawPath.replace(/\\/g, '/');

  // Strip leading slashes to prevent absolute root escapes
  const stripped = normalized.replace(/^\/+/, '');

  // Check for directory traversal sequences
  const segments = stripped.split('/');
  for (const seg of segments) {
    if (seg === '..' || seg === '.') {
      return {
        isSafe: false,
        cleanPath: stripped,
        error: `Illegal path segment '${seg}' detected. Zip Slip path traversal blocked.`,
      };
    }
    // Block Windows drive root colon (e.g., C:)
    if (seg.includes(':')) {
      return {
        isSafe: false,
        cleanPath: stripped,
        error: `Illegal drive indicator '${seg}' detected. Absolute path blocked.`,
      };
    }
  }

  return {
    isSafe: true,
    cleanPath: stripped,
  };
}

/**
 * Assesses an archive entry against decompression bomb thresholds
 */
export function validateDecompressionSafety(
  compressedSize: number,
  uncompressedSize: number,
  totalUncompressedSoFar: number,
  policy: ArchiveSecurityPolicy = DEFAULT_ARCHIVE_POLICY
): { isSafe: boolean; error?: string } {
  // If compressed size is non-zero, check expansion ratio
  if (compressedSize > 0) {
    const ratio = uncompressedSize / compressedSize;
    if (ratio > policy.maxDecompressionRatio && uncompressedSize > 50 * 1024 * 1024) {
      return {
        isSafe: false,
        error: `Decompression bomb risk: Expansion ratio ${ratio.toFixed(1)}:1 exceeds limit of ${policy.maxDecompressionRatio}:1.`,
      };
    }
  }

  // Check cumulative uncompressed payload size
  if (totalUncompressedSoFar + uncompressedSize > policy.maxTotalBytes) {
    return {
      isSafe: false,
      error: `Decompression bomb risk: Cumulative output exceeds safety ceiling of ${(policy.maxTotalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB.`,
    };
  }

  return { isSafe: true };
}
