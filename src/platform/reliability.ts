/**
 * GS Softwares Platform - Diagnostic & Local Reliability Ring Buffer
 * Implements Layer 17 of GS Architecture Specification
 * - In-memory ring buffer (fixed size 50 entries)
 * - Records error codes, studio IDs, timestamps, and browser subsystem versions
 * - ZERO file names, zero file contents, zero user inputs, zero network telemetry
 */

export interface DiagnosticEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  studioId: string;
  code: string;
  message: string;
}

export interface DiagnosticsReport {
  version: string;
  platform: string;
  userAgent: string;
  timestamp: number;
  crossOriginIsolated: boolean;
  cores: number;
  memoryCeilingEstimateMB: number;
  recentLogs: DiagnosticEntry[];
}

const BUFFER_LIMIT = 50;
const ringBuffer: DiagnosticEntry[] = [];

export function logDiagnostic(
  studioId: string,
  code: string,
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  // Enforce zero user data: sanitize potential file paths
  const cleanMessage = message.replace(/[a-zA-Z]:\\[^\s]+/g, '[REDACTED_PATH]').replace(/\/[^\s]+\.[a-zA-Z0-9]+/g, '[REDACTED_FILE]');

  ringBuffer.push({
    timestamp: Date.now(),
    level,
    studioId,
    code,
    message: cleanMessage,
  });

  if (ringBuffer.length > BUFFER_LIMIT) {
    ringBuffer.shift();
  }
}

/**
 * Builds user-initiated diagnostic bundle for export
 */
export function buildDiagnosticsExport(): DiagnosticsReport {
  return {
    version: '2.5.0',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: Date.now(),
    crossOriginIsolated: typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false,
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    memoryCeilingEstimateMB: typeof performance !== 'undefined' && (performance as any).memory ? Math.round((performance as any).memory.jsHeapSizeLimit / 1048576) : 2048,
    recentLogs: [...ringBuffer],
  };
}

/**
 * Dispatches diagnostic JSON download
 */
export function downloadDiagnosticsReport(): void {
  const report = buildDiagnosticsExport();
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gs-diagnostics-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
