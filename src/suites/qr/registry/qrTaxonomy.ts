// src/suites/qr/registry/qrTaxonomy.ts
import { QrToolCapability, QrSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: QrSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const QR_DOMAINS: DomainMeta[] = [
  { id: 'create', name: 'Code Generator', shortLabel: 'Create', iconName: 'QrCode', description: 'Interactive generator for QR codes, 1D barcodes (Code 128, EAN, UPC), and 2D matrices' },
  { id: 'scan', name: 'Live & Image Scanner', shortLabel: 'Scan', iconName: 'Camera', description: 'Zero-latency camera scanner, uploaded photo analysis, multi-code detection overlay' },
  { id: 'read', name: 'Read & Inspect', shortLabel: 'Inspect', iconName: 'ScanText', description: 'Deconstruct detected payload: domain/query parameters, RFC vCard, Wi-Fi keys, raw bytes' },
  { id: 'validate', name: 'Syntax & Checksum', shortLabel: 'Validate', iconName: 'CheckCircle2', description: 'Barcode modulo-10 check digit verification, GS1 format rules, length validation' },
  { id: 'design', name: 'Visual Customizer', shortLabel: 'Design', iconName: 'Palette', description: 'Custom foreground/background palettes, module styles, margins, quiet zone margins' },
  { id: 'label', name: 'Print Label Studio', shortLabel: 'Labels', iconName: 'Tag', description: 'Thermal barcode labels (50x30mm, 100x150mm), A4 multi-label sheets, product SKUs' },
  { id: 'batch', name: 'Batch Synthesizer', shortLabel: 'Batch', iconName: 'ListOrdered', description: 'Bulk CSV / JSON import, automated barcode matrix generation, contact sheets' },
  { id: 'serial', name: 'Serial Sequence Engine', shortLabel: 'Serials', iconName: 'Binary', description: 'Generate alphanumeric inventory sequences with custom prefixes, suffixes, and padding' },
  { id: 'convert', name: 'Format Converter', shortLabel: 'Convert', iconName: 'RefreshCw', description: 'Instant conversion between text, URL, JSON, vCard, Wi-Fi, and barcode symbologies' },
  { id: 'diagnose', name: 'Quality Diagnostics', shortLabel: 'Diagnose', iconName: 'Activity', description: 'Readability inspection, quiet zone width check, contrast ratio, print suitability audit' },
  { id: 'history', name: 'Audit & Scan History', shortLabel: 'History', iconName: 'History', description: 'Local offline history of generated and scanned codes with instant copy & export' },
  { id: 'export', name: 'Vector & Print Export', shortLabel: 'Export', iconName: 'Download', description: 'Lossless SVG vector export, high-res PNG, PDF print layouts, CSV mappings' }
];

export const QR_CAPABILITIES: QrToolCapability[] = [
  // 01. CREATE
  { id: 'create.qr', name: 'Multi-Payload QR Generator', domain: 'create', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'URL, text, Wi-Fi, vCard, email, and phone code synthesis' },
  { id: 'create.barcode', name: '1D Industrial Barcode', domain: 'create', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Code 128, EAN-13, UPC-A, Code 39, and ITF-14 barcode rendering' },

  // 02. SCAN
  { id: 'scan.camera', name: 'WebRTC Camera Stream', domain: 'scan', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Continuous camera ingestion with native BarcodeDetector API' },
  { id: 'scan.image', name: 'Static Image / Screenshot Sniffer', domain: 'scan', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Detect codes from uploaded photos, screenshots, and clipboard drops' },

  // 03. READ & INSPECT
  { id: 'read.parser', name: 'Structured Payload Deconstruct', domain: 'read', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Parse vCard fields, Wi-Fi passwords, and URLs into clean actionable fields' },

  // 04. VALIDATE
  { id: 'validate.checksum', name: 'Modulo-10 Check Digit Audit', domain: 'validate', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Audit mathematical validity of EAN-13, UPC-A, and Code 128 barcodes' },

  // 05. DESIGN
  { id: 'design.palette', name: 'High-Contrast Palette Studio', domain: 'design', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Ensure ISO compliance with sufficient contrast ratios' },

  // 06. LABEL STUDIO
  { id: 'label.thermal', name: 'Thermal & Inventory Label Builder', domain: 'label', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Format barcode labels with SKU, product title, and pricing for thermal printers' },

  // 07. BATCH
  { id: 'batch.csv', name: 'CSV to Multi-Code Generator', domain: 'batch', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Process hundreds of lines into downloadable barcode packages' },

  // 08. SERIAL
  { id: 'serial.generator', name: 'Alphanumeric Serial Generator', domain: 'serial', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Sequential counter with zero-padding (e.g. SN-0001 to SN-1000)' },

  // 09. CONVERT
  { id: 'convert.symbology', name: 'Symbology Transcoder', domain: 'convert', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Switch between QR and Barcode representations instantly' },

  // 10. DIAGNOSE
  { id: 'diagnose.quiet_zone', name: 'Quiet Zone & Readability Audit', domain: 'diagnose', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Inspect optical margins and warn of printing scan issues' },

  // 11. HISTORY
  { id: 'history.log', name: 'Local Scan & Generation Vault', domain: 'history', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-upload offline storage of all processed codes' },

  // 12. EXPORT
  { id: 'export.svg', name: 'Crisp Vector SVG Export', domain: 'export', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Infinitely scalable vector files for commercial packaging printing' }
];
