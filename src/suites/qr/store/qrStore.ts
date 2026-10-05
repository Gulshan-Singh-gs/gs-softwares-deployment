// src/suites/qr/store/qrStore.ts
import { create } from 'zustand';
import {
  QrSuiteDomain,
  QRPayloadType,
  BarcodeSymbology,
  ErrorCorrectionLevel,
  VCardData,
  WifiData,
  LabelConfig,
  SerialConfig,
  ScanResultRecord
} from './types';

interface QrStoreState {
  // Navigation
  activeDomain: QrSuiteDomain;
  setDomain: (domain: QrSuiteDomain) => void;

  // Mode Selection
  codeCategory: 'qr' | 'barcode';
  setCodeCategory: (cat: 'qr' | 'barcode') => void;

  // QR Parameters
  qrType: QRPayloadType;
  setQrType: (type: QRPayloadType) => void;
  rawText: string;
  setRawText: (text: string) => void;
  urlPayload: string;
  setUrlPayload: (url: string) => void;
  wifiData: WifiData;
  setWifiData: (data: Partial<WifiData>) => void;
  vcardData: VCardData;
  setVcardData: (data: Partial<VCardData>) => void;
  emailTo: string;
  setEmailTo: (email: string) => void;
  emailSubject: string;
  setEmailSubject: (sub: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;

  // QR Styling & Design
  fgColor: string;
  setFgColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;
  margin: number;
  setMargin: (margin: number) => void;
  eccLevel: ErrorCorrectionLevel;
  setEccLevel: (ecc: ErrorCorrectionLevel) => void;

  // Barcode Parameters
  barcodeSymbology: BarcodeSymbology;
  setBarcodeSymbology: (sym: BarcodeSymbology) => void;
  barcodeValue: string;
  setBarcodeValue: (val: string) => void;
  barcodeHeight: number;
  setBarcodeHeight: (h: number) => void;
  barcodeWidthScale: number;
  setBarcodeWidthScale: (scale: number) => void;
  showBarcodeText: boolean;
  setShowBarcodeText: (show: boolean) => void;

  // Label Studio Parameters
  labelConfig: LabelConfig;
  setLabelConfig: (config: Partial<LabelConfig>) => void;

  // Serial Generator Parameters
  serialConfig: SerialConfig;
  setSerialConfig: (config: Partial<SerialConfig>) => void;
  generatedSerials: string[];
  generateSerialSequence: () => void;

  // Scanner & OCR Ingestion State
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scannedImage: string | null;
  setScannedImage: (url: string | null) => void;
  ocrRunning: boolean;
  ocrText: string;
  ocrConfidence: number;
  runOcrOnImage: (imageElement: HTMLImageElement | HTMLCanvasElement) => Promise<void>;

  // History Log
  history: ScanResultRecord[];
  addHistoryRecord: (record: Omit<ScanResultRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  // Helpers
  getComputedQrPayload: () => string;
  statusMessage: string;
  setStatusMessage: (msg: string) => void;
}

export const useQrStore = create<QrStoreState>((set, get) => ({
  activeDomain: 'create',
  setDomain: (domain) => set({ activeDomain: domain }),

  codeCategory: 'qr',
  setCodeCategory: (cat) => set({ codeCategory: cat }),

  qrType: 'url',
  setQrType: (type) => set({ qrType: type }),
  rawText: 'GS-Softwares: Zero-Upload Local File Suite',
  setRawText: (text) => set({ rawText: text }),
  urlPayload: 'https://gs-softwares.pages.dev',
  setUrlPayload: (url) => set({ urlPayload: url }),
  wifiData: {
    ssid: 'Office_HighSpeed_5G',
    password: 'securePassword2026',
    encryption: 'WPA',
    hidden: false
  },
  setWifiData: (data) => set((s) => ({ wifiData: { ...s.wifiData, ...data } })),
  vcardData: {
    firstName: 'Gulshan',
    lastName: 'Singh',
    organization: 'GS Softwares Platform',
    phone: '+1 (555) 234-5678',
    email: 'contact@gs-softwares.dev',
    url: 'https://gs-softwares.pages.dev',
    note: 'Software Engineer & Architecture Lead'
  },
  setVcardData: (data) => set((s) => ({ vcardData: { ...s.vcardData, ...data } })),
  emailTo: 'team@gs-softwares.dev',
  setEmailTo: (email) => set({ emailTo: email }),
  emailSubject: 'Platform Feedback & Support',
  setEmailSubject: (sub) => set({ emailSubject: sub }),
  phoneNumber: '+1-555-0199',
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),

  fgColor: '#38bdf8',
  setFgColor: (color) => set({ fgColor: color }),
  bgColor: '#000000',
  setBgColor: (color) => set({ bgColor: color }),
  size: 320,
  setSize: (size) => set({ size }),
  margin: 2,
  setMargin: (margin) => set({ margin }),
  eccLevel: 'M',
  setEccLevel: (ecc) => set({ eccLevel: ecc }),

  barcodeSymbology: 'CODE128',
  setBarcodeSymbology: (sym) => set({ barcodeSymbology: sym }),
  barcodeValue: 'GS-PROD-98241',
  setBarcodeValue: (val) => set({ barcodeValue: val }),
  barcodeHeight: 80,
  setBarcodeHeight: (h) => set({ barcodeHeight: h }),
  barcodeWidthScale: 2,
  setBarcodeWidthScale: (scale) => set({ barcodeWidthScale: scale }),
  showBarcodeText: true,
  setShowBarcodeText: (show) => set({ showBarcodeText: show }),

  labelConfig: {
    widthMm: 50,
    heightMm: 30,
    title: 'Precision Microcontroller',
    sku: 'MCU-X99-PRO',
    price: '$45.00',
    includeText: true
  },
  setLabelConfig: (config) => set((s) => ({ labelConfig: { ...s.labelConfig, ...config } })),

  serialConfig: {
    prefix: 'SN-',
    suffix: '-2026',
    startNumber: 1001,
    count: 10,
    step: 1,
    padding: 4
  },
  setSerialConfig: (config) => set((s) => ({ serialConfig: { ...s.serialConfig, ...config } })),
  generatedSerials: [
    'SN-1001-2026',
    'SN-1002-2026',
    'SN-1003-2026',
    'SN-1004-2026',
    'SN-1005-2026'
  ],
  generateSerialSequence: () => {
    const { serialConfig } = get();
    const list: string[] = [];
    for (let i = 0; i < serialConfig.count; i++) {
      const num = serialConfig.startNumber + i * serialConfig.step;
      const padded = String(num).padStart(serialConfig.padding, '0');
      list.push(`${serialConfig.prefix}${padded}${serialConfig.suffix}`);
    }
    set({
      generatedSerials: list,
      statusMessage: `Generated ${list.length} serial numbers`
    });
  },

  isScanning: false,
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  scannedImage: null,
  setScannedImage: (url) => set({ scannedImage: url }),
  ocrRunning: false,
  ocrText: '',
  ocrConfidence: 0,

  runOcrOnImage: async (imageElement) => {
    set({ ocrRunning: true, statusMessage: 'Initializing on-device OCR engine...' });
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(imageElement);
      await worker.terminate();

      const text = ret.data.text.trim();
      const confidence = Math.round(ret.data.confidence);

      set({
        ocrText: text || 'No readable text detected.',
        ocrConfidence: confidence,
        ocrRunning: false,
        statusMessage: `OCR completed (${confidence}% confidence)`
      });

      if (text) {
        get().addHistoryRecord({
          type: 'ocr',
          format: 'TESSERACT_OCR',
          content: text,
          confidence
        });
      }
    } catch (err: any) {
      set({
        ocrRunning: false,
        ocrText: `OCR Error: ${err.message}`,
        statusMessage: 'OCR process halted.'
      });
    }
  },

  history: [
    {
      id: 'hist_1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'qr',
      format: 'QR_CODE',
      content: 'https://gs-softwares.pages.dev',
      confidence: 100
    },
    {
      id: 'hist_2',
      timestamp: new Date(Date.now() - 1800000),
      type: 'barcode',
      format: 'CODE128',
      content: 'GS-INV-44019',
      confidence: 100
    }
  ],

  addHistoryRecord: (record) => {
    const newEntry: ScanResultRecord = {
      ...record,
      id: `record_${Date.now()}`,
      timestamp: new Date()
    };
    set((s) => ({ history: [newEntry, ...s.history] }));
  },

  clearHistory: () => set({ history: [] }),

  getComputedQrPayload: () => {
    const s = get();
    switch (s.qrType) {
      case 'wifi':
        return `WIFI:T:${s.wifiData.encryption};S:${s.wifiData.ssid};P:${s.wifiData.password};${s.wifiData.hidden ? 'H:true;' : ''};`;
      case 'vcard':
        return (
          `BEGIN:VCARD\n` +
          `VERSION:3.0\n` +
          `N:${s.vcardData.lastName};${s.vcardData.firstName};;;\n` +
          `FN:${s.vcardData.firstName} ${s.vcardData.lastName}\n` +
          `ORG:${s.vcardData.organization}\n` +
          `TEL;TYPE=CELL:${s.vcardData.phone}\n` +
          `EMAIL:${s.vcardData.email}\n` +
          `URL:${s.vcardData.url}\n` +
          `NOTE:${s.vcardData.note}\n` +
          `END:VCARD`
        );
      case 'email':
        return `mailto:${s.emailTo}?subject=${encodeURIComponent(s.emailSubject)}`;
      case 'phone':
        return `tel:${s.phoneNumber}`;
      case 'sms':
        return `smsto:${s.phoneNumber}:${encodeURIComponent(s.rawText)}`;
      case 'url':
        return s.urlPayload;
      case 'text':
      default:
        return s.rawText;
    }
  },

  statusMessage: 'Ready (Zero Upload, Client-side Engine)',
  setStatusMessage: (msg) => set({ statusMessage: msg })
}));
