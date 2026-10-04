/**
 * GS Softwares Concurrency & Memory Budget Pool for Heavy Image Batches
 * Runs tasks across navigator.hardwareConcurrency workers with AbortSignal cancellation
 */

import { ImageWorkerRequest, ImageWorkerResponse } from '../workers/image.worker';

export interface BatchItemProgress {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'aborted';
  resultBlob?: Blob;
  error?: string;
}

export type BatchItemProcessor = (
  file: File,
  signal: AbortSignal,
  onProgress: (p: number) => void
) => Promise<Blob>;

export class ImageBatchPool {
  private concurrency: number;
  private queue: Array<() => Promise<void>> = [];
  private activeCount = 0;
  private aborted = false;

  constructor(maxConcurrency?: number) {
    const hw = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    // Cap at 8 to preserve RAM headroom under 4GB constrained systems
    this.concurrency = maxConcurrency || Math.min(Math.max(2, hw), 8);
  }

  public async runBatch(
    items: Array<{ file: File; id: string }>,
    processor: BatchItemProcessor,
    abortSignal: AbortSignal,
    onItemUpdate: (update: BatchItemProgress) => void
  ): Promise<Map<string, Blob>> {
    const results = new Map<string, Blob>();
    this.aborted = false;

    abortSignal.addEventListener('abort', () => {
      this.aborted = true;
      this.queue = [];
    });

    const promises = items.map((item) => {
      return new Promise<void>((resolve) => {
        const task = async () => {
          if (this.aborted || abortSignal.aborted) {
            onItemUpdate({
              id: item.id,
              name: item.file.name,
              progress: 0,
              status: 'aborted',
            });
            resolve();
            return;
          }

          onItemUpdate({
            id: item.id,
            name: item.file.name,
            progress: 10,
            status: 'processing',
          });

          try {
            const outBlob = await processor(item.file, abortSignal, (prog) => {
              onItemUpdate({
                id: item.id,
                name: item.file.name,
                progress: Math.min(99, Math.max(10, Math.round(prog))),
                status: 'processing',
              });
            });

            if (!abortSignal.aborted) {
              results.set(item.id, outBlob);
              onItemUpdate({
                id: item.id,
                name: item.file.name,
                progress: 100,
                status: 'completed',
                resultBlob: outBlob,
              });
            }
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            onItemUpdate({
              id: item.id,
              name: item.file.name,
              progress: 0,
              status: abortSignal.aborted ? 'aborted' : 'error',
              error: errMsg,
            });
          } finally {
            this.activeCount--;
            this.next();
            resolve();
          }
        };

        this.queue.push(task);
      });
    });

    // Start running tasks up to capacity
    for (let i = 0; i < this.concurrency; i++) {
      this.next();
    }

    await Promise.all(promises);
    return results;
  }

  private next() {
    if (this.activeCount >= this.concurrency || this.queue.length === 0 || this.aborted) {
      return;
    }
    const nextTask = this.queue.shift();
    if (nextTask) {
      this.activeCount++;
      nextTask();
    }
  }
}

/**
 * Worker-backed Lanczos Resample Helper
 */
let sharedImageWorker: Worker | null = null;
const pendingWorkerRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getImageWorker(): Worker {
  if (!sharedImageWorker) {
    sharedImageWorker = new Worker(
      new URL('../workers/image.worker.ts', import.meta.url),
      { type: 'module' }
    );
    sharedImageWorker.onmessage = (e: MessageEvent<ImageWorkerResponse>) => {
      const { id, success, result, error } = e.data;
      const handler = pendingWorkerRequests.get(id);
      if (!handler) return;
      pendingWorkerRequests.delete(id);

      if (success) handler.resolve(result);
      else handler.reject(new Error(error || 'Worker task failed'));
    };
  }
  return sharedImageWorker;
}

export async function resizeImageLanczosWorker(
  imageData: { width: number; height: number; data: Uint8ClampedArray },
  targetWidth: number,
  targetHeight: number
): Promise<{ width: number; height: number; data: Uint8ClampedArray }> {
  const worker = getImageWorker();
  const id = `lanczos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return new Promise((resolve, reject) => {
    pendingWorkerRequests.set(id, { resolve, reject });

    // Zero-copy transfer
    const copyBuffer = new Uint8ClampedArray(imageData.data);
    const req: ImageWorkerRequest = {
      id,
      type: 'resize_lanczos',
      payload: {
        imageData: {
          width: imageData.width,
          height: imageData.height,
          data: copyBuffer,
        },
        targetWidth,
        targetHeight,
      },
    };

    worker.postMessage(req, [copyBuffer.buffer]);
  }).then((res: any) => res.imageData);
}
