// src/suites/archive/registry/archiveTaxonomy.ts
import { ArchiveToolCapability, ArchiveSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: ArchiveSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const ARCHIVE_DOMAINS: DomainMeta[] = [
  { id: 'file', name: 'File Explorer', shortLabel: 'Files', iconName: 'Folder', description: 'Browse, import, create folders, rename, duplicate, delete and inspect entries' },
  { id: 'archive', name: 'Archive Studio', shortLabel: 'Archive', iconName: 'Archive', description: 'Create archives, append files/folders, update timestamps, and edit comments' },
  { id: 'extract', name: 'Extraction Engine', shortLabel: 'Extract', iconName: 'FolderOutput', description: 'Selective unpack, extract to folder, directory-free dump, overwrite policies' },
  { id: 'compress', name: 'Compression Intelligence', shortLabel: 'Compress', iconName: 'Minimize2', description: 'Tuning levels 0-9, Deflate/Store, dictionary windows, solid mode, memory limits' },
  { id: 'convert', name: 'Archive Transcoder', shortLabel: 'Convert', iconName: 'Repeat', description: 'ZIP ↔ TAR ↔ GZ recompression, repack optimization, format modernization' },
  { id: 'security', name: 'Security & Encryption', shortLabel: 'Security', iconName: 'ShieldLock', description: 'AES-256 header/data cipher, password strength auditor, PRNG key generator' },
  { id: 'integrity', name: 'Integrity & Recovery', shortLabel: 'Integrity', iconName: 'CheckCircle2', description: 'CRC32 / SHA-256 validation, bitrot detection, corruption diagnostics' },
  { id: 'split', name: 'Volume Splitting', shortLabel: 'Split', iconName: 'Layers', description: 'Multipart volume slicer (CD, DVD, FAT32 4GB, Mail 25MB), volume joining' },
  { id: 'manage', name: 'Organization & Search', shortLabel: 'Manage', iconName: 'Search', description: 'Archive-wide search, regex filters, extension sort, duplicate hash finder' },
  { id: 'preview', name: 'Content Inspector', shortLabel: 'Preview', iconName: 'Eye', description: 'Integrated viewer for text, images, PDF documents, and hex byte inspector' },
  { id: 'analyze', name: 'Entropy & Telemetry', shortLabel: 'Analyze', iconName: 'BarChart2', description: 'File-size distribution, compression ratios, uncompressed payload breakdown' },
  { id: 'batch', name: 'Batch Pipeline', shortLabel: 'Batch', iconName: 'ListOrdered', description: 'Parallel multi-file packaging, recursive archive queue, bulk unzipper' },
  { id: 'history', name: 'Audit & Rollback', shortLabel: 'History', iconName: 'History', description: 'Session operation timeline, recent archives cache, non-destructive undo' },
  { id: 'settings', name: 'Core Preferences', shortLabel: 'Settings', iconName: 'Sliders', description: 'Worker thread tuning, OPFS staging limits, memory ceiling, default extensions' },
  { id: 'export', name: 'Delivery & OPFS', shortLabel: 'Export', iconName: 'Download', description: 'Instant client download, OPFS persistence, manifest JSON generation' }
];

export const ARCHIVE_CAPABILITIES: ArchiveToolCapability[] = [
  // 01. FILE
  { id: 'file.open', name: 'Open Archive / Folder', domain: 'file', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Load archives or directory streams via HTML5 File System API' },
  { id: 'file.new_folder', name: 'Create Virtual Folder', domain: 'file', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Add virtual directories into current archive hierarchy' },
  { id: 'file.delete', name: 'Delete Virtual Entry', domain: 'file', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Remove file or directory branch non-destructively' },

  // 02. ARCHIVE
  { id: 'archive.create', name: 'Create Multi-File ZIP', domain: 'archive', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Pack files into standards-compliant ZIP with CRC32 checksums' },
  { id: 'archive.comment', name: 'Archive Global Comment', domain: 'archive', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Embed UTF-8 metadata comment in archive header' },

  // 03. EXTRACT
  { id: 'extract.all', name: 'Extract All Files', domain: 'extract', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Decompress all archive items into memory / download bundle' },
  { id: 'extract.selected', name: 'Extract Selected Items', domain: 'extract', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Decompress target files while preserving relative path structure' },
  { id: 'extract.zip_slip', name: 'Zip-Slip Traversal Guard', domain: 'extract', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Structural audit blocking malicious path traversal injections' },

  // 04. COMPRESS
  { id: 'compress.levels', name: 'Adaptive Deflate Levels (0-9)', domain: 'compress', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Tune between instant Store (Level 0) to Maximum Deflate (Level 9)' },
  { id: 'compress.presets', name: 'Application Presets', domain: 'compress', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Preset targets: Web, Email (25MB limit), Backup, Maximum' },

  // 05. CONVERT
  { id: 'convert.repack', name: 'Archive Repack & Optimize', domain: 'convert', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Strip redundant headers and recompress with maximum compression' },

  // 06. SECURITY
  { id: 'security.password', name: 'AES-256 Archive Encryption', domain: 'security', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Client-side password protection with entropy assessment' },
  { id: 'security.prng', name: 'High-Entropy Password Generator', domain: 'security', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Cryptographically secure 32-character token generator' },

  // 07. INTEGRITY
  { id: 'integrity.test', name: 'CRC32 Bit-Exact Test', domain: 'integrity', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Cycle through all uncompressed bytes to verify checksum matches' },

  // 08. SPLIT
  { id: 'split.multivolume', name: 'Multivolume Splitter', domain: 'split', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Slice large archives into discrete volumes (.z01, .z02...)' },

  // 09. MANAGE
  { id: 'manage.search', name: 'Instant Search & Filter', domain: 'manage', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Live fuzzy search across thousands of nested archive entries' },

  // 10. PREVIEW
  { id: 'preview.hex', name: 'Raw Hex & Byte Inspector', domain: 'preview', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Inspect magic bytes and uncompressed file stream in hex editor' },
  { id: 'preview.text', name: 'Instant Text / Code Viewer', domain: 'preview', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Render text, JSON, Markdown, and source code directly in browser' },

  // 11. ANALYZE
  { id: 'analyze.telemetry', name: 'Space Savings & Entropy', domain: 'analyze', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Real-time calculation of compression ratios and uncompressed distribution' },

  // 12. BATCH
  { id: 'batch.queue', name: 'Batch Archive Queue', domain: 'batch', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Process multi-archive extractions and creations in FIFO queue' },

  // 13. HISTORY
  { id: 'history.timeline', name: 'Session Operations Log', domain: 'history', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Chronological timeline of additions, extractions, and validations' },

  // 14. SETTINGS
  { id: 'settings.threads', name: 'Performance Tier Integration', domain: 'settings', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Dynamic concurrency scaling tied to hardware concurrency' },

  // 15. EXPORT
  { id: 'export.download', name: 'Zero-Upload Client Download', domain: 'export', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Trigger native browser save dialog for compiled archive blob' }
];
