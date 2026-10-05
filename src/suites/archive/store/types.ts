// src/suites/archive/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant JS/Stream/DOM execution
  | 'CLASS_B_LOCAL_COMPUTE'        // Local Worker, in-memory compression/CRC32 calculation
  | 'CLASS_C_AI_REMOTE'            // Remote cloud/enterprise optional layer
  | 'CLASS_D_HYBRID';              // Local storage + optional server sync

export type ArchiveSuiteDomain =
  | 'file'        // 01: Open, Import, New Folder, Rename, Delete, Duplicate, Properties
  | 'archive'     // 02: New Archive, Add Files/Folder, Update, Remove, Entry Rename, Comments
  | 'extract'     // 03: Extract All, Extract Selected, Extract Here/To, Preview, Overwrite Rules
  | 'compress'    // 04: Compression Level, Format, Method, Dictionary, Solid Mode, Presets
  | 'convert'     // 05: Archive-to-Archive Recompression, Format Change, Batch Conversion
  | 'security'    // 06: AES Encryption, Password Generator, Keyfile, Hash (SHA-256), Checksums
  | 'integrity'   // 07: Test Archive, Verify Checksum, Corruption Diagnostics, Recovery Record
  | 'split'       // 08: Split Archive Volumes, Custom Size, Join Volumes, Validation
  | 'manage'      // 09: Search, Filter, Sort, Selection, Batch Rename, Duplicate Detection
  | 'preview'     // 10: Integrated Text, Image, Hex/Binary, PDF Preview
  | 'analyze'     // 11: Size Distribution, Compression Ratio Calculation, Entropy Analysis
  | 'batch'       // 12: Bulk Compression, Multi-Archive Queue, Batch Extract
  | 'history'     // 13: Operation Log, Recent Archives, Undoable Session Actions
  | 'settings'    // 14: Threading, Memory Ceilings, Overwrite Rules, Default Formats
  | 'export';     // 15: Download Archive, Save to OPFS, Export Manifest

export interface ArchiveToolCapability {
  id: string;
  name: string;
  domain: ArchiveSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export type ArchiveFormat = 'zip' | 'tar' | 'gz' | '7z' | 'bz2' | 'xz' | 'zst' | 'rar' | 'iso';

export type CompressionPreset =
  | 'FAST'
  | 'BALANCED'
  | 'MAXIMUM'
  | 'STORAGE'
  | 'WEB'
  | 'EMAIL'
  | 'BACKUP'
  | 'CUSTOM';

export type OverwritePolicy = 'overwrite' | 'skip' | 'rename' | 'keep_newer';

export interface ArchiveItem {
  id: string;
  name: string;               // e.g. "report.pdf" or "assets"
  path: string;               // e.g. "documents/report.pdf" or "assets/"
  parentPath: string;         // e.g. "documents" or ""
  isDirectory: boolean;
  size: number;               // Uncompressed bytes
  compressedSize: number;     // Compressed bytes
  modified: Date;
  crc32?: string;
  comment?: string;
  encrypted?: boolean;
  isSafe?: boolean;
  securityNotice?: string;
  blob?: Blob;
  mimeType?: string;
}

export interface ArchiveMetadata {
  name: string;
  format: ArchiveFormat;
  totalItems: number;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: number;   // % savings: (1 - compressed/uncompressed) * 100
  comment: string;
  isEncrypted: boolean;
  encryptionMethod?: 'AES-256' | 'ZipCrypto' | 'None';
  created: Date;
}

export interface ArchiveTask {
  id: string;
  name: string;
  type: 'compress' | 'extract' | 'convert' | 'test' | 'split';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;           // 0 to 100
  bytesProcessed: number;
  totalBytes: number;
  message?: string;
  error?: string;
}
