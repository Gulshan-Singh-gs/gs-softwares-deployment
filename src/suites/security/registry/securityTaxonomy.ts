// src/suites/security/registry/securityTaxonomy.ts
import { SecurityDomain } from '../store/types';

export interface SecurityDomainMeta {
  id: SecurityDomain;
  label: string;
  shortDesc: string;
  category: 'Inspect' | 'Verify' | 'Protect' | 'Privacy' | 'Audit';
  icon: string;
  badge?: string;
  color: string;
}

export const SECURITY_DOMAINS: SecurityDomainMeta[] = [
  {
    id: 'inspect',
    label: 'File Inspector',
    shortDesc: 'Magic bytes, header parser & MIME mismatch detection',
    category: 'Inspect',
    icon: 'Search',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'hex',
    label: 'Hex / Binary',
    shortDesc: 'Offset hexadecimal viewer & raw byte analyzer',
    category: 'Inspect',
    icon: 'Binary',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'hash',
    label: 'Checksum & Hash',
    shortDesc: 'SHA-256, SHA-512, MD5, SHA-1 bit-level verification',
    category: 'Verify',
    icon: 'Hash',
    badge: 'WebCrypto',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'compare',
    label: 'File Compare',
    shortDesc: 'Cryptographic side-by-side integrity & diff matrix',
    category: 'Verify',
    icon: 'GitCompare',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'encrypt',
    label: 'Encrypt File',
    shortDesc: 'AES-256-GCM authenticated cipher with PBKDF2 600k',
    category: 'Protect',
    icon: 'Lock',
    badge: 'AES-256',
    color: 'from-amber-500 to-emerald-500'
  },
  {
    id: 'decrypt',
    label: 'Decrypt File',
    shortDesc: 'Authenticate and unlock .gsenc secure containers',
    category: 'Protect',
    icon: 'Unlock',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'container',
    label: 'Secure Vault',
    shortDesc: 'Encrypted multi-file project archives with manifest',
    category: 'Protect',
    icon: 'FolderLock',
    badge: 'Open Format',
    color: 'from-rose-500 to-orange-500'
  },
  {
    id: 'privacy',
    label: 'Metadata Scrubber',
    shortDesc: 'Strip EXIF, GPS, author info & privacy sanitization',
    category: 'Privacy',
    icon: 'ShieldOff',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'password',
    label: 'PRNG Password',
    shortDesc: 'Cryptographic token generator & Shannon entropy audit',
    category: 'Protect',
    icon: 'KeyRound',
    color: 'from-indigo-500 to-cyan-500'
  },
  {
    id: 'audit',
    label: 'Security Audit Log',
    shortDesc: 'Local tamper-evident cryptographic session journal',
    category: 'Audit',
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-green-500'
  }
];
