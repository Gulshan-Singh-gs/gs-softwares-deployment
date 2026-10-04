/**
 * GS Softwares Platform — Global Storage & Asset Management
 * Implements Section 4 & 5 of GS Architecture Specification
 * - Unified Asset abstraction with stable IDs, lineage, tags, folders, and versions
 * - Multi-tiered storage: OPFS (large binaries) + IndexedDB (metadata/structured) + Memory fallback
 * - Decoupled from UI: apps consume getAsset, createAsset, listAssets, deleteAsset
 */

export type StorageTier = 'OPFS' | 'IndexedDB' | 'Memory';
export type AssetCategory = 'persistent' | 'temporary' | 'generated' | 'cache' | 'trash';

export interface AssetVersion {
  versionId: string;
  createdAt: number;
  size: number;
  producingTool?: string;
  description?: string;
}

export interface GlobalAsset {
  id: string;
  name: string;
  type: string;          // MIME type (e.g., 'image/png', 'application/pdf')
  size: number;
  category: AssetCategory;
  sourceApp: string;     // e.g., 'pixels', 'pdf', 'canvas'
  location: StorageTier;
  createdAt: number;
  modifiedAt: number;
  folderId?: string;
  tags: string[];
  lineage: string[];     // chain of tool IDs that produced/modified this asset
  checksum?: string;
  versions?: AssetVersion[];
  metadata?: Record<string, unknown>;
}

const DB_NAME = 'GS_Softwares_Global_Storage';
const DB_VERSION = 1;
const ASSETS_STORE = 'global_assets';
const BINARY_STORE = 'global_asset_blobs';

// Memory fallback store
const memoryBinaryStore = new Map<string, ArrayBuffer>();

// Broadcast channel for multi-tab sync
const storageBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gs-storage-sync')
  : null;

/**
 * Access OPFS root safely
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
 * Open IndexedDB database for metadata & fallback binary records
 */
function openGlobalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        const store = db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        store.createIndex('sourceApp', 'sourceApp', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
      if (!db.objectStoreNames.contains(BINARY_STORE)) {
        db.createObjectStore(BINARY_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Global Storage Service Interface & Implementation
 */
export const GlobalStorage = {
  /**
   * Create and store an asset from ArrayBuffer, Uint8Array, or Blob
   */
  async createAsset(
    params: {
      name: string;
      type: string;
      data: ArrayBuffer | Uint8Array | Blob;
      sourceApp: string;
      category?: AssetCategory;
      producingTool?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Promise<GlobalAsset> {
    const id = crypto.randomUUID();
    let buffer: ArrayBuffer;

    if (params.data instanceof Blob) {
      buffer = await params.data.arrayBuffer();
    } else if (params.data instanceof Uint8Array) {
      buffer = params.data.buffer.slice(params.data.byteOffset, params.data.byteOffset + params.data.byteLength) as ArrayBuffer;
    } else {
      buffer = params.data;
    }

    const size = buffer.byteLength;
    let location: StorageTier = 'Memory';

    // 1. Attempt OPFS for fast binary storage
    const opfs = await getOpfsRoot();
    if (opfs) {
      try {
        const fileHandle = await opfs.getFileHandle(id, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();
        location = 'OPFS';
      } catch (err) {
        console.warn('OPFS write failed, falling back to IndexedDB:', err);
      }
    }

    // 2. Fallback to IndexedDB Binary store if OPFS unavailable
    if (location !== 'OPFS') {
      try {
        const db = await openGlobalDB();
        const tx = db.transaction(BINARY_STORE, 'readwrite');
        tx.objectStore(BINARY_STORE).put({ id, data: buffer });
        await new Promise((res, rej) => {
          tx.oncomplete = () => res(null);
          tx.onerror = () => rej(tx.error);
        });
        location = 'IndexedDB';
      } catch (err) {
        console.warn('IndexedDB binary store failed, falling back to memory:', err);
        memoryBinaryStore.set(id, buffer);
        location = 'Memory';
      }
    }

    const asset: GlobalAsset = {
      id,
      name: params.name,
      type: params.type,
      size,
      category: params.category || 'persistent',
      sourceApp: params.sourceApp,
      location,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      tags: params.tags || [],
      lineage: params.producingTool ? [params.producingTool] : [],
      versions: [
        {
          versionId: crypto.randomUUID(),
          createdAt: Date.now(),
          size,
          producingTool: params.producingTool,
          description: 'Initial import',
        }
      ],
      metadata: params.metadata || {},
    };

    // Save metadata record into IndexedDB
    try {
      const db = await openGlobalDB();
      const tx = db.transaction(ASSETS_STORE, 'readwrite');
      tx.objectStore(ASSETS_STORE).put(asset);
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(null);
        tx.onerror = () => rej(tx.error);
      });
    } catch (err) {
      console.error('Failed to save asset metadata in IndexedDB:', err);
    }

    if (storageBroadcast) {
      storageBroadcast.postMessage({ type: 'asset_created', asset });
    }

    return asset;
  },

  /**
   * Retrieve asset binary data as Blob
   */
  async getAssetData(id: string): Promise<Blob> {
    const asset = await this.getAsset(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }

    // 1. Try OPFS
    if (asset.location === 'OPFS') {
      const opfs = await getOpfsRoot();
      if (opfs) {
        try {
          const fileHandle = await opfs.getFileHandle(id);
          const file = await fileHandle.getFile();
          return file.slice(0, file.size, asset.type);
        } catch (err) {
          console.warn('OPFS read failed:', err);
        }
      }
    }

    // 2. Try IndexedDB Binary store
    if (asset.location === 'IndexedDB') {
      try {
        const db = await openGlobalDB();
        const tx = db.transaction(BINARY_STORE, 'readonly');
        const req = tx.objectStore(BINARY_STORE).get(id);
        const record = await new Promise<any>((res, rej) => {
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
        if (record && record.data) {
          return new Blob([record.data], { type: asset.type });
        }
      } catch (err) {
        console.warn('IndexedDB binary read failed:', err);
      }
    }

    // 3. Try Memory store
    const memBuffer = memoryBinaryStore.get(id);
    if (memBuffer) {
      return new Blob([memBuffer], { type: asset.type });
    }

    throw new Error(`Asset binary data missing or inaccessible for id: ${id}`);
  },

  /**
   * Retrieve asset metadata
   */
  async getAsset(id: string): Promise<GlobalAsset | null> {
    try {
      const db = await openGlobalDB();
      const tx = db.transaction(ASSETS_STORE, 'readonly');
      const req = tx.objectStore(ASSETS_STORE).get(id);
      return new Promise((res, rej) => {
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => rej(req.error);
      });
    } catch {
      return null;
    }
  },

  /**
   * List assets with optional filtering
   */
  async listAssets(filter?: {
    sourceApp?: string;
    category?: AssetCategory;
    type?: string;
  }): Promise<GlobalAsset[]> {
    try {
      const db = await openGlobalDB();
      const tx = db.transaction(ASSETS_STORE, 'readonly');
      const store = tx.objectStore(ASSETS_STORE);

      let req: IDBRequest;
      if (filter?.sourceApp) {
        req = store.index('sourceApp').getAll(filter.sourceApp);
      } else if (filter?.category) {
        req = store.index('category').getAll(filter.category);
      } else {
        req = store.getAll();
      }

      const results = await new Promise<GlobalAsset[]>((res, rej) => {
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });

      if (filter?.type) {
        return results.filter((a) => a.type.startsWith(filter.type!));
      }
      return results;
    } catch (err) {
      console.error('List assets error:', err);
      return [];
    }
  },

  /**
   * Delete asset and binary bytes
   */
  async deleteAsset(id: string): Promise<void> {
    const asset = await this.getAsset(id);
    if (asset) {
      if (asset.location === 'OPFS') {
        const opfs = await getOpfsRoot();
        if (opfs) {
          try {
            await opfs.removeEntry(id);
          } catch {}
        }
      }
      memoryBinaryStore.delete(id);

      try {
        const db = await openGlobalDB();
        const tx = db.transaction([ASSETS_STORE, BINARY_STORE], 'readwrite');
        tx.objectStore(ASSETS_STORE).delete(id);
        tx.objectStore(BINARY_STORE).delete(id);
      } catch (e) {
        console.warn('DB delete error:', e);
      }

      if (storageBroadcast) {
        storageBroadcast.postMessage({ type: 'asset_deleted', id });
      }
    }
  },

  /**
   * Get total storage usage estimate
   */
  async getStorageUsage(): Promise<{ usedBytes: number; quotaBytes: number; percentage: number }> {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const used = est.usage || 0;
        const quota = est.quota || 1;
        return {
          usedBytes: used,
          quotaBytes: quota,
          percentage: Math.min(100, Math.round((used / quota) * 100)),
        };
      } catch {}
    }
    return { usedBytes: 0, quotaBytes: 0, percentage: 0 };
  }
};
