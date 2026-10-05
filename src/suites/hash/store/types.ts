// src/suites/hash/store/types.ts

export type HashDomain =
  | 'text'        // Text multi-algorithm hasher
  | 'file'        // Single file streaming hash calculation
  | 'multi'       // Compute SHA-256, SHA-512, MD5, SHA-1 simultaneously
  | 'verify'      // Hash compare & integrity validation (Expected vs Actual)
  | 'hmac'        // Keyed-Hash Message Authentication Code (HMAC-SHA256/512)
  | 'checksum'    // Non-cryptographic CRC32, Adler32, Checksum suite
  | 'batch'       // Multi-file batch hashing & comparison table
  | 'manifest'    // Checksum manifest generator (.sha256, .md5, .txt, .json)
  | 'inspector'   // Hash length & algorithm identifier / ambiguity estimator
  | 'encoding'    // Byte & text encoding conversions (Hex, Base64, Base64URL, Binary)
  | 'history';    // Local session hash history

export type HashAlgorithmType =
  | 'SHA-256'
  | 'SHA-512'
  | 'SHA-384'
  | 'SHA-1'
  | 'MD5'
  | 'CRC32';

export interface HashAlgorithmSpec {
  id: HashAlgorithmType;
  name: string;
  category: 'Cryptographic' | 'Legacy' | 'Checksum';
  digestBits: number;
  hexLength: number;
  securityStatus: 'Recommended' | 'Legacy Insecure' | 'Non-Cryptographic Checksum';
  description: string;
  isWebCrypto: boolean;
}

export interface HashHistoryItem {
  id: string;
  timestamp: number;
  inputLabel: string;
  inputType: 'text' | 'file';
  algorithm: string;
  digest: string;
  executionMs: number;
  fileSizeBytes?: number;
}

export interface BatchFileHashItem {
  id: string;
  file: File;
  hashes: Partial<Record<HashAlgorithmType, string>>;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
}
