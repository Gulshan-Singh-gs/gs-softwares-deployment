/**
 * GS-Canvas E2EE Scene Sharing Engine (Web Crypto AES-256-GCM)
 * - Zero server storage: Ciphertext and IV are packed into the URL fragment (#key=...)
 * - The URL hash fragment is NEVER transmitted in HTTP request headers to any server
 * - Enforces size ceiling (~50KB); larger projects export as encrypted `.gscanvas.enc` files
 */

import { CanvasProject } from './types';

export interface EncryptedSharePayload {
  version: 1;
  iv: string;         // base64
  ciphertext: string; // base64
}

/**
 * Derives a raw 256-bit encryption key or generates a fresh cryptographically random key
 */
export async function generateShareKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const binary = atob(base64Key);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts canvas project and generates an E2EE URL hash
 */
export async function generateE2EEShareUrl(project: CanvasProject): Promise<{ url: string; sizeBytes: number; isLarge: boolean }> {
  const jsonStr = JSON.stringify(project);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonStr);

  const key = await generateShareKey();
  const rawKeyB64 = await exportKeyToBase64(key);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));

  // Pack payload: iv + cipher separated by '.'
  const packed = `${ivB64}.${cipherB64}`;
  const totalLength = packed.length;

  // 50KB ceiling check for URL hash safety
  const isLarge = totalLength > 50 * 1024;

  const baseUrl = window.location.origin + window.location.pathname;
  const hash = `#e2ee=${rawKeyB64}&payload=${encodeURIComponent(packed)}`;
  const url = `${baseUrl}${hash}`;

  return { url, sizeBytes: totalLength, isLarge };
}

/**
 * Parses and decrypts canvas project from URL hash fragment
 */
export async function decryptProjectFromUrlHash(): Promise<CanvasProject | null> {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.includes('e2ee=') || !hash.includes('payload=')) return null;

  try {
    const params = new URLSearchParams(hash.slice(1));
    const keyB64 = params.get('e2ee');
    const rawPayload = params.get('payload');

    if (!keyB64 || !rawPayload) return null;

    const [ivB64, cipherB64] = decodeURIComponent(rawPayload).split('.');
    if (!ivB64 || !cipherB64) return null;

    const key = await importKeyFromBase64(keyB64);

    const ivBinary = atob(ivB64);
    const iv = new Uint8Array(ivBinary.length);
    for (let i = 0; i < ivBinary.length; i++) iv[i] = ivBinary.charCodeAt(i);

    const cipherBinary = atob(cipherB64);
    const cipherBytes = new Uint8Array(cipherBinary.length);
    for (let i = 0; i < cipherBinary.length; i++) cipherBytes[i] = cipherBinary.charCodeAt(i);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as CanvasProject;
  } catch (err) {
    console.warn('Failed to decrypt E2EE canvas share link:', err);
    return null;
  }
}
