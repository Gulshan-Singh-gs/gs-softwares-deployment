/**
 * Web Crypto API Security & Cryptography Module
 * 100% Client-side AES-256-GCM & SHA Hashing
 */

export const encryptFile = async (file: File, password: string): Promise<Blob> => {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  // Generate 16-byte random cryptographic salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key material from password
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
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Read file data
  const fileBuffer = await file.arrayBuffer();

  // Encrypt payload
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  // Pack header: [16 bytes salt] + [12 bytes iv] + [encrypted data]
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return new Blob([result], { type: 'application/octet-stream' });
};

export const decryptFile = async (encryptedBlob: Blob, password: string): Promise<Blob> => {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  const buffer = await encryptedBlob.arrayBuffer();
  if (buffer.byteLength < 28) {
    throw new Error('Invalid encrypted file format or corrupted header');
  }

  const data = new Uint8Array(buffer);

  // Unpack header
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const encrypted = data.slice(28);

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
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    return new Blob([decrypted]);
  } catch (err) {
    throw new Error('Decryption failed. Incorrect password or damaged file.');
  }
};

export const generateHash = async (
  file: File,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};
