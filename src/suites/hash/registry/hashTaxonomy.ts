// src/suites/hash/registry/hashTaxonomy.ts
import { HashDomain, HashAlgorithmSpec, HashAlgorithmType } from '../store/types';

export interface HashDomainMeta {
  id: HashDomain;
  label: string;
  shortDesc: string;
  category: 'Generate' | 'Verify' | 'Advanced' | 'Analyze';
  icon: string;
  badge?: string;
  color: string;
}

export const HASH_DOMAINS: HashDomainMeta[] = [
  {
    id: 'text',
    label: 'Text Hasher',
    shortDesc: 'Instant multi-algorithm hashing of UTF-8 strings',
    category: 'Generate',
    icon: 'Type',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'file',
    label: 'File Hasher',
    shortDesc: 'Worker streaming hash engine for large files (up to 100GB+)',
    category: 'Generate',
    icon: 'FileCode',
    badge: 'Streaming',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'multi',
    label: 'Simultaneous Hashes',
    shortDesc: 'Parallel SHA-256, SHA-512, MD5, SHA-1 matrix computation',
    category: 'Generate',
    icon: 'Layers',
    badge: 'Multi-Core',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'verify',
    label: 'Integrity Matcher',
    shortDesc: 'Constant-time comparison against expected checksum',
    category: 'Verify',
    icon: 'CheckCircle2',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'hmac',
    label: 'Keyed HMAC',
    shortDesc: 'Secret-key authenticated digests via WebCrypto API',
    category: 'Advanced',
    icon: 'Key',
    badge: 'WebCrypto',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'checksum',
    label: 'Checksum Suite',
    shortDesc: 'CRC32, Adler-32 fast data integrity checks',
    category: 'Advanced',
    icon: 'Sliders',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'batch',
    label: 'Batch Hashing',
    shortDesc: 'Multi-file queue processing with tabular export',
    category: 'Generate',
    icon: 'Files',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'manifest',
    label: 'Manifest Studio',
    shortDesc: 'Generate and verify sha256sum / md5sum manifests',
    category: 'Verify',
    icon: 'FileSpreadsheet',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'inspector',
    label: 'Digest Inspector',
    shortDesc: 'Analyze hash lengths, detect algorithm types & ambiguity',
    category: 'Analyze',
    icon: 'Search',
    color: 'from-indigo-500 to-cyan-500'
  },
  {
    id: 'encoding',
    label: 'Encoding Converter',
    shortDesc: 'Raw bytes, Hex, Base64, Base64URL, and binary matrix',
    category: 'Analyze',
    icon: 'Binary',
    color: 'from-rose-500 to-amber-500'
  },
  {
    id: 'history',
    label: 'Session History',
    shortDesc: 'Local audit trail of computed digests & benchmarks',
    category: 'Analyze',
    icon: 'History',
    color: 'from-zinc-500 to-zinc-400'
  }
];

export const HASH_ALGORITHM_SPECS: Record<HashAlgorithmType, HashAlgorithmSpec> = {
  'SHA-256': {
    id: 'SHA-256',
    name: 'Secure Hash Algorithm 256',
    category: 'Cryptographic',
    digestBits: 256,
    hexLength: 64,
    securityStatus: 'Recommended',
    description: 'NIST FIPS 180-4 standard. Collision-resistant cryptographic backbone.',
    isWebCrypto: true
  },
  'SHA-512': {
    id: 'SHA-512',
    name: 'Secure Hash Algorithm 512',
    category: 'Cryptographic',
    digestBits: 512,
    hexLength: 128,
    securityStatus: 'Recommended',
    description: 'High-security 512-bit digest optimized for 64-bit architectures.',
    isWebCrypto: true
  },
  'SHA-384': {
    id: 'SHA-384',
    name: 'Secure Hash Algorithm 384',
    category: 'Cryptographic',
    digestBits: 384,
    hexLength: 96,
    securityStatus: 'Recommended',
    description: 'Truncated SHA-512 providing strong defense against length extension.',
    isWebCrypto: true
  },
  'SHA-1': {
    id: 'SHA-1',
    name: 'Secure Hash Algorithm 1',
    category: 'Legacy',
    digestBits: 160,
    hexLength: 40,
    securityStatus: 'Legacy Insecure',
    description: 'Cryptographically broken due to collision vulnerabilities. Retained for legacy verification.',
    isWebCrypto: true
  },
  'MD5': {
    id: 'MD5',
    name: 'Message Digest Algorithm 5',
    category: 'Legacy',
    digestBits: 128,
    hexLength: 32,
    securityStatus: 'Legacy Insecure',
    description: 'Broken for cryptographic security; suitable solely for non-adversarial checksums.',
    isWebCrypto: false
  },
  'CRC32': {
    id: 'CRC32',
    name: 'Cyclic Redundancy Check 32',
    category: 'Checksum',
    digestBits: 32,
    hexLength: 8,
    securityStatus: 'Non-Cryptographic Checksum',
    description: 'Fast error-detecting code designed for hardware/network transmission verification.',
    isWebCrypto: false
  }
};
