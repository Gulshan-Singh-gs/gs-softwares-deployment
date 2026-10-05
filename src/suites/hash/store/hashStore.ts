// src/suites/hash/store/hashStore.ts
import { create } from 'zustand';
import {
  HashDomain,
  HashAlgorithmType,
  HashHistoryItem,
  BatchFileHashItem
} from './types';
import { generateHash, HashProgressCallback } from '../../../lib/cryptoEngine';

// Fast pure in-browser CRC32 implementation
export function computeCRC32(bytes: Uint8Array): string {
  let table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
  }
  return ((crc ^ (-1)) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

// Compute WebCrypto-based HMAC
export async function computeHMAC(
  message: string,
  keyString: string,
  algorithm: 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1'
): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(keyString);
  const msgData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: algorithm } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface HashState {
  activeDomain: HashDomain;
  activeAlgorithm: HashAlgorithmType;

  // Text Hashing
  textInput: string;
  textDigests: Partial<Record<HashAlgorithmType, string>>;

  // File Hashing
  selectedFile: File | null;
  fileDigests: Partial<Record<HashAlgorithmType, string>>;
  isProcessing: boolean;
  progressPercent: number;
  throughputMBs: number;

  // Integrity Verification
  expectedHash: string;
  verificationResult: 'match' | 'mismatch' | 'none';

  // HMAC
  hmacMessage: string;
  hmacKey: string;
  hmacAlgorithm: 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1';
  hmacResult: string;

  // Batch
  batchFiles: BatchFileHashItem[];

  // Manifest Studio
  manifestText: string;
  manifestEntries: { filename: string; expected: string; actual?: string; status: 'match' | 'mismatch' | 'pending' | 'missing' }[];

  // Inspector
  inspectorInput: string;

  // History
  history: HashHistoryItem[];

  // Actions
  setDomain: (domain: HashDomain) => void;
  setAlgorithm: (algo: HashAlgorithmType) => void;
  setTextInput: (text: string) => void;
  computeTextHashes: () => Promise<void>;
  setSelectedFile: (file: File) => void;
  computeFileHash: (algo?: HashAlgorithmType) => Promise<void>;
  computeAllFileHashes: () => Promise<void>;
  setExpectedHash: (hash: string) => void;
  verifyActiveDigest: () => void;
  setHmacMessage: (msg: string) => void;
  setHmacKey: (key: string) => void;
  setHmacAlgorithm: (algo: 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1') => void;
  computeHmacResult: () => Promise<void>;
  addBatchFiles: (files: File[]) => void;
  processBatchQueue: (algo: HashAlgorithmType) => Promise<void>;
  clearBatch: () => void;
  setManifestText: (text: string) => void;
  verifyManifestFiles: (files: File[]) => Promise<void>;
  setInspectorInput: (val: string) => void;
  clearHistory: () => void;
}

export const useHashStore = create<HashState>((set, get) => ({
  activeDomain: 'text',
  activeAlgorithm: 'SHA-256',

  textInput: 'GS Softwares — 100% Client-Side Privacy Operating System',
  textDigests: {},

  selectedFile: null,
  fileDigests: {},
  isProcessing: false,
  progressPercent: 0,
  throughputMBs: 0,

  expectedHash: '',
  verificationResult: 'none',

  hmacMessage: 'Authorization-Token-Session-GS-7721',
  hmacKey: 'secret_key_gs_softwares_super_safe',
  hmacAlgorithm: 'SHA-256',
  hmacResult: '',

  batchFiles: [],
  manifestText: '',
  manifestEntries: [],
  inspectorInput: '',
  history: [],

  setDomain: (domain) => set({ activeDomain: domain }),
  setAlgorithm: (algo) => set({ activeAlgorithm: algo }),

  setTextInput: (text) => {
    set({ textInput: text });
    get().computeTextHashes();
  },

  computeTextHashes: async () => {
    const text = get().textInput;
    if (!text) {
      set({ textDigests: {} });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const textBlob = new File([data], 'text.txt', { type: 'text/plain' });

    try {
      const [sha256, sha512, md5, sha1] = await Promise.all([
        generateHash(textBlob, 'SHA-256'),
        generateHash(textBlob, 'SHA-512'),
        generateHash(textBlob, 'MD5'),
        generateHash(textBlob, 'SHA-1')
      ]);

      const crc32 = computeCRC32(data);

      set({
        textDigests: {
          'SHA-256': sha256,
          'SHA-512': sha512,
          'MD5': md5,
          'SHA-1': sha1,
          'CRC32': crc32
        }
      });
    } catch (e) {
      console.error(e);
    }
  },

  setSelectedFile: (file) => {
    set({ selectedFile: file, fileDigests: {}, verificationResult: 'none', progressPercent: 0 });
    get().computeAllFileHashes();
  },

  computeFileHash: async (algo) => {
    const file = get().selectedFile;
    const targetAlgo = algo || get().activeAlgorithm;
    if (!file) return;

    set({ isProcessing: true, progressPercent: 0, throughputMBs: 0 });
    const startTime = performance.now();

    try {
      let digest = '';
      if (targetAlgo === 'CRC32') {
        const buf = await file.arrayBuffer();
        digest = computeCRC32(new Uint8Array(buf));
      } else {
        digest = await generateHash(
          file,
          targetAlgo as 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
          (p: { percent: number; throughputMBs: number }) => set({ progressPercent: p.percent, throughputMBs: p.throughputMBs })
        );
      }

      const elapsed = Math.round(performance.now() - startTime);

      set((s) => ({
        fileDigests: { ...s.fileDigests, [targetAlgo]: digest },
        isProcessing: false,
        progressPercent: 100,
        history: [
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            inputLabel: file.name,
            inputType: 'file',
            algorithm: targetAlgo,
            digest,
            executionMs: elapsed,
            fileSizeBytes: file.size
          },
          ...s.history.slice(0, 99)
        ]
      }));

      get().verifyActiveDigest();
    } catch (e) {
      console.error(e);
      set({ isProcessing: false });
    }
  },

  computeAllFileHashes: async () => {
    const file = get().selectedFile;
    if (!file) return;

    set({ isProcessing: true, progressPercent: 20 });
    try {
      const [sha256, md5, sha512, sha1] = await Promise.all([
        generateHash(file, 'SHA-256'),
        generateHash(file, 'MD5'),
        generateHash(file, 'SHA-512'),
        generateHash(file, 'SHA-1')
      ]);

      // Calculate CRC32 if small or in memory
      let crc32 = '';
      if (file.size < 50 * 1024 * 1024) {
        const buf = await file.arrayBuffer();
        crc32 = computeCRC32(new Uint8Array(buf));
      }

      set((s) => ({
        fileDigests: {
          'SHA-256': sha256,
          'MD5': md5,
          'SHA-512': sha512,
          'SHA-1': sha1,
          ...(crc32 ? { CRC32: crc32 } : {})
        },
        isProcessing: false,
        progressPercent: 100
      }));

      get().verifyActiveDigest();
    } catch (e) {
      console.error(e);
      set({ isProcessing: false });
    }
  },

  setExpectedHash: (hash) => {
    set({ expectedHash: hash });
    get().verifyActiveDigest();
  },

  verifyActiveDigest: () => {
    const exp = get().expectedHash.trim().toLowerCase();
    if (!exp) {
      set({ verificationResult: 'none' });
      return;
    }

    const digests = get().fileDigests;
    const match = Object.values(digests).some((d) => d?.toLowerCase() === exp);
    set({ verificationResult: match ? 'match' : 'mismatch' });
  },

  setHmacMessage: (msg) => {
    set({ hmacMessage: msg });
    get().computeHmacResult();
  },

  setHmacKey: (key) => {
    set({ hmacKey: key });
    get().computeHmacResult();
  },

  setHmacAlgorithm: (algo) => {
    set({ hmacAlgorithm: algo });
    get().computeHmacResult();
  },

  computeHmacResult: async () => {
    const { hmacMessage, hmacKey, hmacAlgorithm } = get();
    if (!hmacMessage || !hmacKey) {
      set({ hmacResult: '' });
      return;
    }

    try {
      const res = await computeHMAC(hmacMessage, hmacKey, hmacAlgorithm);
      set({ hmacResult: res });
    } catch (e) {
      console.error(e);
    }
  },

  addBatchFiles: (files) => {
    const items: BatchFileHashItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      hashes: {},
      status: 'idle',
      progress: 0
    }));
    set((s) => ({ batchFiles: [...s.batchFiles, ...items] }));
  },

  processBatchQueue: async (algo) => {
    const items = get().batchFiles;
    for (const item of items) {
      if (item.status === 'done') continue;

      set((s) => ({
        batchFiles: s.batchFiles.map((b) =>
          b.id === item.id ? { ...b, status: 'processing', progress: 50 } : b
        )
      }));

      try {
        const hash = await generateHash(item.file, algo as any);
        set((s) => ({
          batchFiles: s.batchFiles.map((b) =>
            b.id === item.id
              ? { ...b, status: 'done', progress: 100, hashes: { ...b.hashes, [algo]: hash } }
              : b
          )
        }));
      } catch (e) {
        set((s) => ({
          batchFiles: s.batchFiles.map((b) =>
            b.id === item.id ? { ...b, status: 'error', progress: 0 } : b
          )
        }));
      }
    }
  },

  clearBatch: () => set({ batchFiles: [] }),

  setManifestText: (text) => set({ manifestText: text }),

  verifyManifestFiles: async (files) => {
    const lines = get().manifestText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: { hash: string; name: string }[] = [];

    for (const line of lines) {
      const match = line.trim().match(/^([a-fA-F0-9]{32,128})\s+[\*]?(.+)$/);
      if (match) {
        parsed.push({ hash: match[1].toLowerCase(), name: match[2].trim() });
      }
    }

    const results: HashState['manifestEntries'] = [];

    for (const entry of parsed) {
      const matched = files.find(
        (f) => f.name.toLowerCase() === entry.name.toLowerCase() || entry.name.endsWith('/' + f.name)
      );

      if (!matched) {
        results.push({ filename: entry.name, expected: entry.hash, status: 'missing' });
        continue;
      }

      try {
        const algo = entry.hash.length === 64 ? 'SHA-256' : entry.hash.length === 128 ? 'SHA-512' : 'MD5';
        const actual = await generateHash(matched, algo);
        const matchStatus = actual.toLowerCase() === entry.hash ? 'match' : 'mismatch';
        results.push({ filename: entry.name, expected: entry.hash, actual, status: matchStatus });
      } catch (e) {
        results.push({ filename: entry.name, expected: entry.hash, status: 'mismatch' });
      }
    }

    set({ manifestEntries: results });
  },

  setInspectorInput: (val) => set({ inspectorInput: val }),

  clearHistory: () => set({ history: [] })
}));
