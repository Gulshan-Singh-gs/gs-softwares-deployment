/**
 * Web Crypto API Security & Cryptography Module
 * 100% Client-side AES-256-GCM & SHA Hashing
 */

// Standardized Open .gsenc File Specification (SEC-N-01):
// GSENC2 (OWASP 2024+ Compliant):
// [6 bytes Magic: "GSENC2"]
// [16 bytes PBKDF2 Salt]
// [12 bytes AES-GCM IV]
// [Remaining bytes: AES-256-GCM authenticated ciphertext + 16-byte auth tag]
// Derived using PBKDF2-HMAC-SHA256 with 600,000 iterations.
//
// Legacy GSENC1 & unversioned headers use 100,000 iterations and remain fully supported on decryption.

const GSENC2_MAGIC = new Uint8Array([0x47, 0x53, 0x45, 0x4e, 0x43, 0x32]); // "GSENC2"
const GSENC1_MAGIC = new Uint8Array([0x47, 0x53, 0x45, 0x4e, 0x43, 0x31]); // "GSENC1"
export const OWASP_PBKDF2_ITERATIONS = 600000;
export const LEGACY_PBKDF2_ITERATIONS = 100000;

export const encryptFile = async (
  file: File,
  password: string,
  onProgress?: (percent: number, stage?: string) => void
): Promise<Blob> => {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (onProgress) onProgress(10, 'Deriving AES-256 key via PBKDF2 (600k rounds)...');

  // Generate 16-byte random cryptographic salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key material from password using PBKDF2-HMAC-SHA256 (600,000 iterations per OWASP standard)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: OWASP_PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  if (onProgress) onProgress(45, 'Encrypting data with AES-256-GCM...');

  // Generate 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Read file data
  const fileBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(75, 'Authenticating ciphertext & assembling .gsenc container...');

  // Encrypt payload (AES-256-GCM authenticated)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  // Pack open container header: [6 bytes Magic GSENC2] + [16 bytes salt] + [12 bytes iv] + [encrypted data]
  const totalLength = GSENC2_MAGIC.length + salt.length + iv.length + encrypted.byteLength;
  const result = new Uint8Array(totalLength);
  result.set(GSENC2_MAGIC, 0);
  result.set(salt, GSENC2_MAGIC.length);
  result.set(iv, GSENC2_MAGIC.length + salt.length);
  result.set(new Uint8Array(encrypted), GSENC2_MAGIC.length + salt.length + iv.length);

  // Securely zero out raw salt and iv buffers from memory
  salt.fill(0);
  iv.fill(0);

  if (onProgress) onProgress(100, 'Complete');
  return new Blob([result], { type: 'application/octet-stream' });
};

export const decryptFile = async (
  encryptedBlob: Blob,
  password: string,
  onProgress?: (percent: number, stage?: string) => void
): Promise<Blob> => {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (onProgress) onProgress(15, 'Reading encrypted package header...');

  const buffer = await encryptedBlob.arrayBuffer();
  const data = new Uint8Array(buffer);

  let saltBuffer: ArrayBuffer;
  let ivBuffer: ArrayBuffer;
  let encryptedBuffer: ArrayBuffer;
  let iterations = OWASP_PBKDF2_ITERATIONS;

  // Check for GSENC2 header (6 bytes)
  const isGSENC2 =
    data.length >= GSENC2_MAGIC.length &&
    data[0] === 0x47 && data[1] === 0x53 && data[2] === 0x45 &&
    data[3] === 0x4e && data[4] === 0x43 && data[5] === 0x32;

  // Check for GSENC1 header (6 bytes)
  const isGSENC1 =
    data.length >= GSENC1_MAGIC.length &&
    data[0] === 0x47 && data[1] === 0x53 && data[2] === 0x45 &&
    data[3] === 0x4e && data[4] === 0x43 && data[5] === 0x31;

  if (isGSENC2) {
    if (buffer.byteLength < 6 + 16 + 12 + 16) {
      throw new Error('Corrupted or truncated .gsenc encrypted package');
    }
    saltBuffer = buffer.slice(6, 22);
    ivBuffer = buffer.slice(22, 34);
    encryptedBuffer = buffer.slice(34);
    iterations = OWASP_PBKDF2_ITERATIONS;
  } else if (isGSENC1) {
    if (buffer.byteLength < 6 + 16 + 12 + 16) {
      throw new Error('Corrupted or truncated .gsenc encrypted package');
    }
    saltBuffer = buffer.slice(6, 22);
    ivBuffer = buffer.slice(22, 34);
    encryptedBuffer = buffer.slice(34);
    iterations = LEGACY_PBKDF2_ITERATIONS;
  } else {
    // Legacy container compatibility: [16 bytes salt] + [12 bytes iv] + [ciphertext]
    if (buffer.byteLength < 28) {
      throw new Error('Invalid encrypted file format or corrupted header');
    }
    saltBuffer = buffer.slice(0, 16);
    ivBuffer = buffer.slice(16, 28);
    encryptedBuffer = buffer.slice(28);
    iterations = LEGACY_PBKDF2_ITERATIONS;
  }

  if (onProgress) onProgress(35, `Deriving key with PBKDF2 (${iterations.toLocaleString()} rounds)...`);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  if (onProgress) onProgress(75, 'Authenticating & decrypting ciphertext (AES-256-GCM)...');

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      encryptedBuffer
    );
    // Securely wipe sensitive intermediate buffers
    new Uint8Array(saltBuffer).fill(0);
    new Uint8Array(ivBuffer).fill(0);

    if (onProgress) onProgress(100, 'Complete');
    return new Blob([decrypted]);
  } catch {
    new Uint8Array(saltBuffer).fill(0);
    new Uint8Array(ivBuffer).fill(0);
    throw new Error('Decryption failed. Incorrect password or damaged ciphertext.');
  }
};

// Fast client-side MD5 implementation for non-cryptographic legacy checksums
function md5(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = md5ff(a, b, c, d, words[i + 0] || 0, 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = md5gg(b, c, d, a, words[i + 0] || 0, 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = md5hh(d, a, b, c, words[i + 0] || 0, 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = md5ii(a, b, c, d, words[i + 0] || 0, 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const out = [a, b, c, d];
  let hex = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hex += ((out[i] >> (j * 8)) & 0xff).toString(16).padStart(2, '0');
    }
  }
  return hex;
}

export const generateHash = async (
  file: File,
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> => {
  const buffer = await file.arrayBuffer();
  if (algorithm === 'MD5') {
    return md5(new Uint8Array(buffer));
  }
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};
