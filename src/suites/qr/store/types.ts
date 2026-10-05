// src/suites/qr/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant JS/Canvas/Camera stream
  | 'CLASS_B_LOCAL_COMPUTE'        // Local Worker, OCR WASM, Image DSP filters
  | 'CLASS_C_AI_REMOTE'            // Remote enterprise/cloud scanning
  | 'CLASS_D_HYBRID';              // Local capture + smart extraction

export type QrSuiteDomain =
  | 'create'      // 01: QR, 1D Barcode, 2D Barcode generation
  | 'scan'        // 02: Camera scanner, image upload, screenshot scan, multi-code detection
  | 'read'        // 03: Read & inspect parsed fields (URL breakdown, vCard, Wi-Fi parsing)
  | 'validate'    // 04: Checksum audit, modulo-10 parity, GS1 length/character rules
  | 'design'      // 05: Foreground/background colors, module styles, margins, quiet zone
  | 'label'       // 06: Label studio (Thermal label, A4 sheet, custom dimensions, SKU, barcode + text)
  | 'batch'       // 07: Bulk CSV/JSON generation, contact sheets, batch zip package
  | 'serial'      // 08: Sequential generator (Prefix, suffix, increment, zero-padding)
  | 'convert'     // 09: Transformation workspace (CSV -> Barcode, Wi-Fi -> QR, Text -> Code)
  | 'diagnose'    // 10: Quality inspection (quiet zone, contrast, readability analysis)
  | 'history'     // 11: Scan & creation history, favorites, copyable records
  | 'export';     // 12: SVG, PNG, WebP, PDF print sheet, CSV/JSON metadata export

export interface QrToolCapability {
  id: string;
  name: string;
  domain: QrSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export type QRPayloadType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms'
  | 'event'
  | 'payment';

export type BarcodeSymbology =
  | 'CODE128'
  | 'EAN13'
  | 'EAN8'
  | 'UPCA'
  | 'UPCE'
  | 'CODE39'
  | 'ITF14'
  | 'DATAMATRIX'
  | 'PDF417'
  | 'AZTEC';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  email: string;
  url: string;
  note: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface LabelConfig {
  widthMm: number;
  heightMm: number;
  title: string;
  sku: string;
  price: string;
  includeText: boolean;
}

export interface SerialConfig {
  prefix: string;
  suffix: string;
  startNumber: number;
  count: number;
  step: number;
  padding: number;
}

export interface ScanResultRecord {
  id: string;
  timestamp: Date;
  type: 'qr' | 'barcode' | 'ocr';
  format: string;
  content: string;
  confidence?: number;
  metadata?: Record<string, any>;
}
