/**
 * GS Softwares Platform: Tiered Workspace & Global Asset Store (OPFS + IndexedDB)
 * Implements Section 11.1 AssetHandle Specification & Local Storage Tiers
 */

export type AssetLocation = 'OPFS' | 'IndexedDB' | 'Memory' | 'FileSystemAccess';

export interface AssetHandle {
  id: string;
  name: string;
  type: string; // MIME type or custom taxonomy e.g. gs/video/mp4
  location: AssetLocation;
  size: number;
  hash?: string; // SHA-256 digest computed lazily via GS-Hash
  lineage: string[]; // Array of Tool IDs that produced/modified this asset
  createdAt: number;
}

/**
 * Section 11.1 & Page 22: Typed Workspace Asset Taxonomy
 */
export interface WorkspaceAsset extends AssetHandle {
  metadata?: Record<string, unknown>;
}

export interface WorkspaceImage extends WorkspaceAsset {
  width?: number;
  height?: number;
  colorSpace?: string;
}

export interface WorkspaceVideo extends WorkspaceAsset {
  duration?: number;
  fps?: number;
  hasAudio?: boolean;
}

export interface WorkspaceAudio extends WorkspaceAsset {
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

export interface WorkspaceText extends WorkspaceAsset {
  encoding?: string;
  lineCount?: number;
}

// Cross-tab synchronization via BroadcastChannel (Page 24)
const workspaceBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gs-workspace-sync')
  : null;

// In-memory fallback if OPFS and IndexedDB are unavailable
const memoryAssetStore = new Map<string, ArrayBuffer>();

/**
 * Access the OPFS root directory handle safely
 */
async function getOpfsRoot(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage?.getDirectory) {
    try {
      return await navigator.storage.getDirectory();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store raw bytes into OPFS scratchpad with fallback to IndexedDB or memory.
 */
export async function storeAsset(
  name: string,
  type: string,
  data: ArrayBuffer | Uint8Array | Blob,
  producingToolId: string,
  existingLineage: string[] = []
): Promise<AssetHandle> {
  const id = crypto.randomUUID();
  const lineage = [...existingLineage, producingToolId];
  let buffer: ArrayBuffer;

  if (data instanceof Blob) {
    buffer = await data.arrayBuffer();
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    buffer = data;
  }

  const size = buffer.byteLength;

  // 1. Try OPFS first (High Performance Scratchpad)
  const opfs = await getOpfsRoot();
  if (opfs) {
    try {
      const fileHandle = await opfs.getFileHandle(id, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(buffer);
      await writable.close();

      return {
        id,
        name,
        type,
        location: 'OPFS',
        size,
        lineage,
        createdAt: Date.now(),
      };
    } catch (err) {
      console.warn('OPFS store failed, falling back to memory/IndexedDB:', err);
    }
  }

  // 2. Fallback to in-memory store
  memoryAssetStore.set(id, buffer);
  const handle: AssetHandle = {
    id,
    name,
    type,
    location: 'Memory',
    size,
    lineage,
    createdAt: Date.now(),
  };

  if (workspaceBroadcast) {
    try {
      workspaceBroadcast.postMessage({ type: 'asset_stored', handle });
    } catch {
      // Ignored if channel fails
    }
  }

  return handle;
}

/**
 * Retrieve an asset's data as a standard Blob by its handle.
 */
export async function retrieveAssetBlob(handle: AssetHandle): Promise<Blob> {
  if (handle.location === 'OPFS') {
    const opfs = await getOpfsRoot();
    if (opfs) {
      try {
        const fileHandle = await opfs.getFileHandle(handle.id);
        const file = await fileHandle.getFile();
        return file.slice(0, file.size, handle.type);
      } catch (err) {
        console.warn('OPFS read failed, falling back to memory store:', err);
      }
    }
  }

  const memBuffer = memoryAssetStore.get(handle.id);
  if (memBuffer) {
    return new Blob([memBuffer], { type: handle.type });
  }

  throw new Error(`Asset not found or expired from storage tier: ${handle.id}`);
}

/**
 * Clean up an asset from OPFS or memory to enforce memory ceilings.
 */
export async function releaseAsset(handle: AssetHandle): Promise<void> {
  if (handle.location === 'OPFS') {
    const opfs = await getOpfsRoot();
    if (opfs) {
      try {
        await opfs.removeEntry(handle.id);
      } catch {
        // Entry may already be removed
      }
    }
  }
  memoryAssetStore.delete(handle.id);

  if (workspaceBroadcast) {
    try {
      workspaceBroadcast.postMessage({ type: 'asset_released', id: handle.id });
    } catch {
      // Ignore
    }
  }
}
