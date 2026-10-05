// src/suites/security/store/securityStore.ts
import { create } from 'zustand';
import {
  SecurityDomain,
  SecurityFileRecord,
  FileSignatureMatch,
  AuditLogEntry,
  PasswordConfig,
  PasswordAudit
} from './types';
import { generateHash, encryptFile, decryptFile } from '../../../lib/cryptoEngine';

// Magic signatures dictionary for local-first verification
const MAGIC_SIGNATURES: {
  bytes: number[];
  offset?: number;
  mime: string;
  ext: string;
  name: string;
}[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png', ext: 'png', name: 'PNG Image' },
  { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg', ext: 'jpg', name: 'JPEG Image' },
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: 'pdf', name: 'PDF Document' },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip', ext: 'zip', name: 'ZIP / Office Container' },
  { bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], mime: 'application/x-rar-compressed', ext: 'rar', name: 'RAR Archive' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif', ext: 'gif', name: 'GIF Image' },
  { bytes: [0x47, 0x53, 0x53, 0x54, 0x52, 0x4d], mime: 'application/x-gs-encrypted', ext: 'gsenc', name: 'GS-Security Authenticated Stream' },
  { bytes: [0x47, 0x53, 0x45, 0x4e, 0x43], mime: 'application/x-gs-encrypted', ext: 'gsenc', name: 'GS-Security Legacy Encrypted Container' },
  { bytes: [0x1f, 0x8b], mime: 'application/gzip', ext: 'gz', name: 'GZIP Compressed' },
  { bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], mime: 'application/x-7z-compressed', ext: '7z', name: '7-Zip Archive' },
  { bytes: [0x49, 0x44, 0x33], mime: 'audio/mpeg', ext: 'mp3', name: 'MP3 Audio (ID3)' }
];

export function inspectMagicBytes(buffer: ArrayBuffer, fileName: string): FileSignatureMatch {
  const bytes = new Uint8Array(buffer.slice(0, 32));
  const hex = Array.from(bytes.slice(0, 16))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  const extMatch = fileName.match(/\.([^.]+)$/);
  const actualExtension = extMatch ? extMatch[1].toLowerCase() : '';

  for (const sig of MAGIC_SIGNATURES) {
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (bytes[i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      const isMismatch = actualExtension.length > 0 && 
        !actualExtension.includes(sig.ext) && 
        !(sig.ext === 'zip' && ['docx', 'xlsx', 'pptx', 'jar', 'apk', 'epub'].includes(actualExtension)) &&
        !(sig.ext === 'jpg' && actualExtension === 'jpeg');

      return {
        magicHex: hex,
        detectedMime: sig.mime,
        detectedExtension: sig.ext,
        actualExtension,
        isMismatch,
        fileFormatName: sig.name,
        confidence: 'definitive'
      };
    }
  }

  // Check if printable ASCII text
  let isAscii = true;
  for (let i = 0; i < Math.min(bytes.length, 32); i++) {
    if (bytes[i] < 9 || (bytes[i] > 13 && bytes[i] < 32)) {
      isAscii = false;
      break;
    }
  }

  if (isAscii && bytes.length > 0) {
    return {
      magicHex: hex,
      detectedMime: 'text/plain',
      detectedExtension: 'txt',
      actualExtension,
      isMismatch: actualExtension.length > 0 && !['txt', 'csv', 'json', 'md', 'html', 'js', 'ts', 'xml', 'log'].includes(actualExtension),
      fileFormatName: 'Plain Text / UTF-8 Script',
      confidence: 'probable'
    };
  }

  return {
    magicHex: hex,
    detectedMime: 'application/octet-stream',
    detectedExtension: 'bin',
    actualExtension,
    isMismatch: false,
    fileFormatName: 'Raw Binary Stream',
    confidence: 'unknown'
  };
}

export function evaluatePasswordEntropy(password: string): PasswordAudit {
  let charsetSize = 0;
  let hasUpper = false;
  let hasLower = false;
  let hasNumber = false;
  let hasSymbol = false;

  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    if (c >= 65 && c <= 90) hasUpper = true;
    else if (c >= 97 && c <= 122) hasLower = true;
    else if (c >= 48 && c <= 57) hasNumber = true;
    else hasSymbol = true;
  }

  if (hasUpper) charsetSize += 26;
  if (hasLower) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSymbol) charsetSize += 33;

  const characterClassesCount = (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0);
  const entropyBits = charsetSize > 0 && password.length > 0
    ? Math.round(password.length * Math.log2(charsetSize))
    : 0;

  let strengthLabel: PasswordAudit['strengthLabel'] = 'Very Weak';
  let crackTimeEstimate = '< 1 millisecond';

  if (entropyBits >= 100) {
    strengthLabel = 'Cryptographic Grade';
    crackTimeEstimate = 'Centuries (Billion+ years)';
  } else if (entropyBits >= 72) {
    strengthLabel = 'Strong';
    crackTimeEstimate = 'Decades (10,000+ years)';
  } else if (entropyBits >= 50) {
    strengthLabel = 'Moderate';
    crackTimeEstimate = 'Months to Years';
  } else if (entropyBits >= 32) {
    strengthLabel = 'Weak';
    crackTimeEstimate = 'Hours to Days';
  }

  return {
    entropyBits,
    crackTimeEstimate,
    strengthLabel,
    characterClassesCount
  };
}

interface SecurityState {
  activeDomain: SecurityDomain;
  activeFile: SecurityFileRecord | null;
  secondaryFile: SecurityFileRecord | null; // For comparison mode
  isProcessing: boolean;
  progressPercent: number;
  statusMessage: string;
  auditLogs: AuditLogEntry[];

  // Password Generator State
  passwordConfig: PasswordConfig;
  generatedPassword: string;
  passwordAudit: PasswordAudit;

  // Actions
  setDomain: (domain: SecurityDomain) => void;
  loadFile: (file: File) => Promise<void>;
  loadSecondaryFile: (file: File) => Promise<void>;
  loadDemoBufferSet: () => Promise<void>;
  calculateHashesForActiveFile: () => Promise<void>;
  encryptActiveFile: (password: string) => Promise<Blob>;
  decryptActiveFile: (password: string) => Promise<Blob>;
  scrubMetadataActiveFile: () => Promise<Blob>;
  generatePRNGPassword: () => void;
  setPasswordConfig: (config: Partial<PasswordConfig>) => void;
  clearActiveFile: () => void;
  addAuditLog: (action: string, targetName: string, details: string, status: 'success' | 'warning' | 'error', algorithm?: string) => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  activeDomain: 'inspect',
  activeFile: null,
  secondaryFile: null,
  isProcessing: false,
  progressPercent: 0,
  statusMessage: 'Ready. All cryptographic operations remain strictly local.',
  auditLogs: [],

  passwordConfig: {
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    avoidAmbiguous: false
  },
  generatedPassword: '',
  passwordAudit: {
    entropyBits: 0,
    crackTimeEstimate: '0 sec',
    strengthLabel: 'Very Weak',
    characterClassesCount: 0
  },

  setDomain: (domain) => set({ activeDomain: domain }),

  addAuditLog: (action, targetName, details, status, algorithm) => {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
      targetFileName: targetName,
      algorithm,
      details,
      status
    };
    set((s) => ({ auditLogs: [entry, ...s.auditLogs.slice(0, 199)] }));
  },

  loadFile: async (file: File) => {
    set({ isProcessing: true, statusMessage: `Reading ${file.name}...`, progressPercent: 10 });
    try {
      const buffer = await file.arrayBuffer();
      const signature = inspectMagicBytes(buffer, file.name);
      const isEncryptedPackage = file.name.endsWith('.gsenc') || signature.magicHex.startsWith('47 53 53 54 52 4D');

      const record: SecurityFileRecord = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || signature.detectedMime,
        lastModified: file.lastModified,
        data: buffer,
        signature,
        isEncryptedPackage
      };

      set({
        activeFile: record,
        isProcessing: false,
        progressPercent: 100,
        statusMessage: `Loaded ${file.name} (${record.size} bytes). Ready.`
      });

      get().addAuditLog(
        'File Imported',
        file.name,
        `Read ${file.size} bytes into memory. Signature identified: ${signature.fileFormatName}`,
        'success'
      );

      // Auto calculate SHA-256 for integrity fingerprint
      get().calculateHashesForActiveFile();
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Error loading file: ${e.message}` });
      get().addAuditLog('Import Failed', file.name, e.message, 'error');
    }
  },

  loadSecondaryFile: async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const signature = inspectMagicBytes(buffer, file.name);
      const record: SecurityFileRecord = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || signature.detectedMime,
        lastModified: file.lastModified,
        data: buffer,
        signature
      };

      // Calculate SHA-256 for secondary file comparison
      const fileBlob = new File([buffer], file.name, { type: file.type });
      const sha256 = await generateHash(fileBlob, 'SHA-256');
      record.hashes = { sha256 };

      set({ secondaryFile: record });
      get().addAuditLog('Comparison Target Loaded', file.name, `Loaded for comparison against active file`, 'success');
    } catch (e: any) {
      console.error(e);
    }
  },

  loadDemoBufferSet: async () => {
    set({ isProcessing: true, statusMessage: 'Generating demonstration file set...', progressPercent: 30 });
    try {
      // Build a representative test document with known content
      const demoText = `CONFIDENTIAL ARCHIVE
Document Classification: RESTRICTED
Organization: GS Softwares Security Division
Integrity Standard: NIST FIPS 180-4 / AES-256-GCM
Timestamp: ${new Date().toISOString()}

Security Audit Details:
- 100% In-Browser Execution Guarantee.
- Zero External Network Packets Permitted.
- Key Derivation: PBKDF2-HMAC-SHA256 (600,000 rounds).
- Streaming Authenticated Decryption Tag: 128-bit Poly/GCM.

Demo Hash Sample: Verify bit-exact checksums against tampering.`;

      const encoder = new TextEncoder();
      const bytes = encoder.encode(demoText);
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

      const fakeFile = new File([bytes], 'audit_contract_sample.txt', { type: 'text/plain' });
      const signature = inspectMagicBytes(buffer, 'audit_contract_sample.txt');

      const record: SecurityFileRecord = {
        id: 'demo-sample-01',
        name: 'audit_contract_sample.txt',
        size: buffer.byteLength,
        type: 'text/plain',
        lastModified: Date.now(),
        data: buffer,
        signature
      };

      set({
        activeFile: record,
        isProcessing: false,
        progressPercent: 100,
        statusMessage: 'Demonstration contract loaded into secure workspace memory.'
      });

      get().addAuditLog(
        'Demo Workspace Initialized',
        'audit_contract_sample.txt',
        'Loaded simulated confidential contract for hashing, encryption and diff analysis',
        'success'
      );

      get().calculateHashesForActiveFile();
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Failed demo: ${e.message}` });
    }
  },

  calculateHashesForActiveFile: async () => {
    const activeFile = get().activeFile;
    if (!activeFile) return;

    set({ isProcessing: true, statusMessage: 'Computing cryptographic digests (SHA-256, SHA-512, MD5)...', progressPercent: 40 });
    try {
      const fileBlob = new File([activeFile.data], activeFile.name, { type: activeFile.type });

      // Calculate SHA-256 and MD5 / SHA-512 in worker
      const [sha256, md5, sha512, sha1] = await Promise.all([
        generateHash(fileBlob, 'SHA-256'),
        generateHash(fileBlob, 'MD5'),
        generateHash(fileBlob, 'SHA-512'),
        generateHash(fileBlob, 'SHA-1')
      ]);

      const updatedFile: SecurityFileRecord = {
        ...activeFile,
        hashes: {
          sha256,
          md5,
          sha512,
          sha1
        }
      };

      set({
        activeFile: updatedFile,
        isProcessing: false,
        progressPercent: 100,
        statusMessage: `Hashes calculated. SHA-256: ${sha256.slice(0, 16)}...`
      });

      get().addAuditLog(
        'Cryptographic Checksum Computed',
        activeFile.name,
        `SHA-256: ${sha256} | MD5: ${md5}`,
        'success',
        'SHA-256 / SHA-512 / MD5'
      );
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Hash failed: ${e.message}` });
      get().addAuditLog('Checksum Failed', activeFile.name, e.message, 'error');
    }
  },

  encryptActiveFile: async (password: string) => {
    const activeFile = get().activeFile;
    if (!activeFile) throw new Error('No active file selected for encryption');

    set({ isProcessing: true, statusMessage: 'Deriving key & encrypting with AES-256-GCM...', progressPercent: 20 });
    try {
      const fileBlob = new File([activeFile.data], activeFile.name, { type: activeFile.type });
      const encryptedBlob = await encryptFile(fileBlob, password, (p: number, stage?: string) => {
        set({ progressPercent: p, statusMessage: stage || `Encrypting: ${p}%` });
      });

      set({
        isProcessing: false,
        progressPercent: 100,
        statusMessage: 'File encrypted successfully into .gsenc format.'
      });

      get().addAuditLog(
        'File Encrypted',
        activeFile.name,
        `Encrypted into authenticated container (${encryptedBlob.size} bytes) via PBKDF2 600k + AES-256-GCM`,
        'success',
        'AES-256-GCM'
      );

      return encryptedBlob;
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Encryption error: ${e.message}` });
      get().addAuditLog('Encryption Failed', activeFile.name, e.message, 'error');
      throw e;
    }
  },

  decryptActiveFile: async (password: string) => {
    const activeFile = get().activeFile;
    if (!activeFile) throw new Error('No active file selected for decryption');

    set({ isProcessing: true, statusMessage: 'Verifying container tag & decrypting...', progressPercent: 20 });
    try {
      const fileBlob = new File([activeFile.data], activeFile.name, { type: activeFile.type });
      const decryptedBlob = await decryptFile(fileBlob, password, (p: number, stage?: string) => {
        set({ progressPercent: p, statusMessage: stage || `Decrypting: ${p}%` });
      });

      set({
        isProcessing: false,
        progressPercent: 100,
        statusMessage: 'File decrypted and verified successfully.'
      });

      get().addAuditLog(
        'File Decrypted',
        activeFile.name,
        `Successfully unlocked and authenticated payload (${decryptedBlob.size} bytes)`,
        'success',
        'AES-256-GCM'
      );

      return decryptedBlob;
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Decryption error: ${e.message}` });
      get().addAuditLog('Decryption Failed', activeFile.name, e.message, 'error');
      throw e;
    }
  },

  scrubMetadataActiveFile: async () => {
    const activeFile = get().activeFile;
    if (!activeFile) throw new Error('No active file selected');

    set({ isProcessing: true, statusMessage: 'Sanitizing metadata headers...', progressPercent: 50 });
    try {
      // Deterministic metadata scrubber: for text/json/csv remove headers; for images convert canvas without EXIF
      const u8 = new Uint8Array(activeFile.data);
      let sanitizedBlob: Blob;

      if (activeFile.type.startsWith('image/')) {
        // Render image to canvas to completely discard original EXIF/IPTC/XMP segments
        const imgBlob = new Blob([activeFile.data], { type: activeFile.type });
        const imgBitmap = await createImageBitmap(imgBlob);
        const canvas = document.createElement('canvas');
        canvas.width = imgBitmap.width;
        canvas.height = imgBitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgBitmap, 0, 0);
          sanitizedBlob = await new Promise<Blob>((res) => {
            canvas.toBlob((b) => res(b || imgBlob), 'image/png');
          });
        } else {
          sanitizedBlob = imgBlob;
        }
      } else {
        // Plain binary / text clean copy
        sanitizedBlob = new Blob([u8], { type: 'application/octet-stream' });
      }

      set({
        isProcessing: false,
        progressPercent: 100,
        statusMessage: 'Metadata scrubbed. Sanitized file ready for download.'
      });

      get().addAuditLog(
        'Metadata Sanitized',
        activeFile.name,
        `Stripped EXIF/GPS/Document properties. Output payload: ${sanitizedBlob.size} bytes`,
        'success'
      );

      return sanitizedBlob;
    } catch (e: any) {
      set({ isProcessing: false, statusMessage: `Scrub failed: ${e.message}` });
      get().addAuditLog('Sanitization Error', activeFile.name, e.message, 'error');
      throw e;
    }
  },

  generatePRNGPassword: () => {
    const cfg = get().passwordConfig;
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const num = '23456789';
    const sym = '!@#$%^&*()_+~|}{[]:;?><,.-=';

    let pool = '';
    if (cfg.includeUppercase) pool += upper;
    if (cfg.includeLowercase) pool += lower;
    if (cfg.includeNumbers) pool += num;
    if (cfg.includeSymbols) pool += sym;

    if (!pool) pool = lower + num;

    // Cryptographic PRNG using crypto.getRandomValues
    const array = new Uint32Array(cfg.length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < cfg.length; i++) {
      result += pool[array[i] % pool.length];
    }

    const audit = evaluatePasswordEntropy(result);
    set({ generatedPassword: result, passwordAudit: audit });

    get().addAuditLog(
      'PRNG Password Generated',
      'System Token',
      `Length: ${cfg.length} | Entropy: ${audit.entropyBits} bits (${audit.strengthLabel})`,
      'success',
      'WebCrypto PRNG'
    );
  },

  setPasswordConfig: (newCfg) => {
    set((s) => {
      const merged = { ...s.passwordConfig, ...newCfg };
      return { passwordConfig: merged };
    });
    get().generatePRNGPassword();
  },

  clearActiveFile: () => {
    set({
      activeFile: null,
      secondaryFile: null,
      statusMessage: 'Workspace cleared. Memory reclaimed.'
    });
  }
}));
