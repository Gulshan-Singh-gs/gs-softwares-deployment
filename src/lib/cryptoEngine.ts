/**
 * Web Crypto API Security & Cryptography Module
 * 100% Client-side Streaming AES-256-GCM & Streaming Multi-Algorithm Hashing
 * Powered by Dedicated Web Workers with flat memory ceiling (<64MB).
 */

import type { HashAlgorithm, HashWorkerRequest, HashWorkerProgress, HashWorkerSuccess, HashWorkerError } from '../workers/hash.worker';
import type { CryptoWorkerRequest, CryptoWorkerProgress, CryptoWorkerSuccess, CryptoWorkerError } from '../workers/crypto.worker';

// Re-export standards
export const OWASP_PBKDF2_ITERATIONS = 600000;
export const LEGACY_PBKDF2_ITERATIONS = 100000;

export interface HashProgressCallback {
  (progress: { percent: number; throughputMBs: number; bytesProcessed: number; totalBytes: number }): void;
}

export interface CryptoProgressCallback {
  (percent: number, stage?: string): void;
}

/**
 * High-Performance Streaming Hasher (Off-main-thread Web Worker)
 * Flat memory footprint, supports files from 1KB to 100GB+.
 */
export const generateHash = async (
  file: File,
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  onProgress?: HashProgressCallback,
  signal?: AbortSignal
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/hash.worker.ts', import.meta.url), { type: 'module' });
    const id = crypto.randomUUID();

    const cleanup = () => {
      worker.terminate();
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new DOMException('Hash operation cancelled by user', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new DOMException('Hash operation cancelled by user', 'AbortError'));
      });
    }

    worker.onmessage = (e: MessageEvent<HashWorkerProgress | HashWorkerSuccess | HashWorkerError>) => {
      const msg = e.data;
      if (msg.id !== id) return;

      if (msg.type === 'progress') {
        if (onProgress) {
          onProgress({
            percent: msg.percent,
            throughputMBs: msg.throughputMBs,
            bytesProcessed: msg.bytesProcessed,
            totalBytes: msg.totalBytes
          });
        }
      } else if (msg.type === 'complete') {
        cleanup();
        resolve(msg.hash);
      } else if (msg.type === 'error') {
        cleanup();
        reject(new Error(msg.error));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(err.message || 'Hash worker execution error'));
    };

    const req: HashWorkerRequest = {
      id,
      file,
      algorithm: algorithm as HashAlgorithm,
      chunkSize: 4 * 1024 * 1024 // 4MB stream chunks
    };

    worker.postMessage(req);
  });
};

/**
 * High-Performance Streaming Authenticated Encryption (AES-256-GCM + PBKDF2)
 * Produces standardized streaming container (.gsenc / GSSTRM).
 */
export const encryptFile = async (
  file: File | Blob,
  password: string,
  onProgress?: CryptoProgressCallback,
  signal?: AbortSignal
): Promise<Blob> => {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/crypto.worker.ts', import.meta.url), { type: 'module' });
    const id = crypto.randomUUID();

    const cleanup = () => {
      worker.terminate();
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new DOMException('Encryption cancelled by user', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new DOMException('Encryption cancelled by user', 'AbortError'));
      });
    }

    worker.onmessage = (e: MessageEvent<CryptoWorkerProgress | CryptoWorkerSuccess | CryptoWorkerError>) => {
      const msg = e.data;
      if (msg.id !== id) return;

      if (msg.type === 'progress') {
        if (onProgress) onProgress(msg.percent, msg.stage);
      } else if (msg.type === 'complete') {
        cleanup();
        resolve(msg.result);
      } else if (msg.type === 'error') {
        cleanup();
        reject(new Error(msg.error));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(err.message || 'Crypto worker failure'));
    };

    const req: CryptoWorkerRequest = {
      id,
      mode: 'encrypt',
      file,
      password
    };

    worker.postMessage(req);
  });
};

/**
 * High-Performance Streaming Decryption
 * Verifies authenticated container headers and yields plaintext with flat memory.
 */
export const decryptFile = async (
  encryptedBlob: Blob,
  password: string,
  onProgress?: CryptoProgressCallback,
  signal?: AbortSignal
): Promise<Blob> => {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/crypto.worker.ts', import.meta.url), { type: 'module' });
    const id = crypto.randomUUID();

    const cleanup = () => {
      worker.terminate();
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new DOMException('Decryption cancelled by user', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new DOMException('Decryption cancelled by user', 'AbortError'));
      });
    }

    worker.onmessage = (e: MessageEvent<CryptoWorkerProgress | CryptoWorkerSuccess | CryptoWorkerError>) => {
      const msg = e.data;
      if (msg.id !== id) return;

      if (msg.type === 'progress') {
        if (onProgress) onProgress(msg.percent, msg.stage);
      } else if (msg.type === 'complete') {
        cleanup();
        resolve(msg.result);
      } else if (msg.type === 'error') {
        cleanup();
        reject(new Error(msg.error));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(err.message || 'Crypto worker failure'));
    };

    const req: CryptoWorkerRequest = {
      id,
      mode: 'decrypt',
      file: encryptedBlob,
      password
    };

    worker.postMessage(req);
  });
};
