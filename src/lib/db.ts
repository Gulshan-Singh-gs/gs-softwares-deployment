// Lightweight IndexedDB Persistent Workspace Storage Helper
const DB_NAME = 'GS_Softwares_DB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_files';

export interface StoredFileRecord {
  id: string;
  app: 'pdf' | 'pixels' | 'audio' | 'video' | 'text' | 'canvas';
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer | string;
  metadata?: Record<string, any>;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('app', 'app', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveWorkspaceFile = async (record: StoredFileRecord): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB Save Error:', err);
  }
};

export const getWorkspaceFilesByApp = async (
  app: 'pdf' | 'pixels' | 'audio' | 'video' | 'text' | 'canvas'
): Promise<StoredFileRecord[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('app');
    const request = index.getAll(app);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Load Error:', err);
    return [];
  }
};

export const deleteWorkspaceFile = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB Delete Error:', err);
  }
};

export const clearWorkspaceAppFiles = async (
  app: 'pdf' | 'pixels' | 'audio' | 'video' | 'text' | 'canvas'
): Promise<void> => {
  try {
    const files = await getWorkspaceFilesByApp(app);
    for (const f of files) {
      await deleteWorkspaceFile(f.id);
    }
  } catch (err) {
    console.error('IndexedDB Clear App Files Error:', err);
  }
};
