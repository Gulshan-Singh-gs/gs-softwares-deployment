// src/suites/security/store/types.ts

export type SecurityDomain =
  | 'inspect'       // File info, headers, magic numbers, mime match
  | 'hex'           // Binary & hex viewer with ASCII decode
  | 'hash'          // MD5, SHA-1, SHA-256, SHA-384, SHA-512 digests & verify
  | 'compare'       // Side-by-side file integrity & diff analysis
  | 'encrypt'       // AES-256-GCM symmetric encryption (.gsenc open container)
  | 'decrypt'       // Authenticated decryption & key derivation
  | 'container'     // Multi-file secure project container builder
  | 'privacy'       // EXIF, GPS, author & metadata scrubber
  | 'password'      // Cryptographic PRNG generator & entropy scoring
  | 'audit';        // Local cryptographic audit log & integrity certificates

export interface FileSignatureMatch {
  magicHex: string;
  detectedMime: string;
  detectedExtension: string;
  actualExtension: string;
  isMismatch: boolean;
  fileFormatName: string;
  confidence: 'definitive' | 'probable' | 'unknown';
}

export interface SecurityFileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
  hashes?: {
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
  };
  signature?: FileSignatureMatch;
  metadata?: Record<string, string | number | boolean>;
  isEncryptedPackage?: boolean;
}

export interface HashRecord {
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
  digest: string;
  calculatedAt: number;
  executionMs: number;
  verifiedMatch?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  targetFileName: string;
  algorithm?: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidAmbiguous: boolean;
}

export interface PasswordAudit {
  entropyBits: number;
  crackTimeEstimate: string;
  strengthLabel: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Cryptographic Grade';
  characterClassesCount: number;
}
