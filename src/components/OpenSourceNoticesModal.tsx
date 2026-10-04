import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Award } from 'lucide-react';

export interface OpenSourceNotice {
  name: string;
  version: string;
  license: string;
  spdx: string;
  sourceUrl: string;
  purpose: string;
  localVendoring: string;
}

export const OPEN_SOURCE_NOTICES: OpenSourceNotice[] = [
  {
    name: '@cantoo/pdf-lib',
    version: '2.0.7',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/cantoo/pdf-lib',
    purpose: 'Zero-server client-side PDF document manipulation, merging, encryption & vector exports',
    localVendoring: 'Bundled locally in PWA application bundle (Zero CDN leak)'
  },
  {
    name: 'pdfjs-dist',
    version: '6.2.108',
    license: 'Apache-2.0',
    spdx: 'Apache-2.0',
    sourceUrl: 'https://github.com/mozilla/pdf.js',
    purpose: 'Mozilla high-fidelity PDF rendering engine in local Web Worker',
    localVendoring: 'Precached in PWA service worker with SRI'
  },
  {
    name: 'perfect-freehand',
    version: '1.2.2',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/steveruizok/perfect-freehand',
    purpose: 'Pressure-sensitive fluid vector Bézier polygon stroke rendering for GS-Canvas',
    localVendoring: 'Bundled locally in application bundle'
  },
  {
    name: 'piexifjs',
    version: '1.0.6',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/hMatoba/piexifjs',
    purpose: 'Lossless JPEG/WebP EXIF metadata stripping without image quality re-compression loss',
    localVendoring: 'Bundled locally in application bundle'
  },
  {
    name: 'jszip',
    version: '3.10.1',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/Stuk/jszip',
    purpose: 'Universal streaming ZIP archive creation, extraction, and Zip Slip path traversal defense',
    localVendoring: 'Bundled locally in application bundle'
  },
  {
    name: 'tesseract.js',
    version: '7.0.0',
    license: 'Apache-2.0',
    spdx: 'Apache-2.0',
    sourceUrl: 'https://github.com/naptha/tesseract.js',
    purpose: 'Client-side WebAssembly Optical Character Recognition (OCR) neural engine',
    localVendoring: 'Offline WASM binaries cached in IndexedDB/OPFS'
  },
  {
    name: 'React & React-DOM',
    version: '19.0.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/facebook/react',
    purpose: 'High-performance reactive user interface runtime',
    localVendoring: 'Bundled locally in application bundle'
  },
  {
    name: 'Lucide Icons',
    version: '1.51.0',
    license: 'ISC',
    spdx: 'ISC',
    sourceUrl: 'https://github.com/lucide-icons/lucide',
    purpose: 'Clean, accessible SVG iconography for all 14 studio suites',
    localVendoring: 'Inline SVG tree-shaken assets'
  },
  {
    name: 'GS-Streaming-Crypto & MD5 Engine',
    version: '2.1.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Off-thread streaming chunked MD5 & AES-256-GCM authenticated container with flat memory',
    localVendoring: 'Self-hosted dedicated Web Workers (hash.worker.ts, crypto.worker.ts)'
  },
  {
    name: 'GS-Lanczos-3 Resampler & Image Worker Pool',
    version: '2.2.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Off-thread 2-pass Lanczos-3 separable sinc downsampling with AbortSignal worker pool',
    localVendoring: 'Self-hosted image.worker.ts & lanczosResampler.ts'
  },
  {
    name: 'GS-GIF89a NeuQuant/Median-Cut Quantizer',
    version: '2.2.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Pure client-side color quantization and multi-frame animated GIF89a binary encoder',
    localVendoring: 'Self-hosted gifEncoder.ts & videoRemux.ts with OPFS cleanup'
  },
  {
    name: 'GS-ITU-R BS.1770 EBU R128 Loudness DSP',
    version: '2.3.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Cleanroom reimplementation of K-weighting filters, gated integrated LUFS metering & normalization',
    localVendoring: 'Self-hosted ebuLoudness.ts'
  },
  {
    name: 'GS-Canvas E2EE Web Crypto AES-GCM Engine',
    version: '2.3.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Zero-server peer URL hash encrypted scene serialization and decryption',
    localVendoring: 'Self-hosted e2eeSharing.ts'
  },
  {
    name: 'GS-ReDoS Defense & Archive Security Guard',
    version: '2.3.0',
    license: 'MIT',
    spdx: 'MIT',
    sourceUrl: 'https://github.com/gulshan-singh-gs/gs-softwares-deployment',
    purpose: 'Time-bounded regex execution and Zip Slip / decompression-bomb path validation',
    localVendoring: 'Self-hosted safeRegexEngine.ts & archiveSecurity.ts'
  }
];

interface OpenSourceNoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenSourceNoticesModal: React.FC<OpenSourceNoticesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="neu-card p-6 sm:p-8 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl opacity-70 hover:opacity-100 hover:bg-slate-800 transition-all text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">Open Source Notices &amp; Provenance</h3>
            <p className="text-xs text-cyan-400 font-semibold">
              Section 11.5 Governance · Zero Third-Party CDN Leaks · Full SPDX Compliance
            </p>
          </div>
        </div>

        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          <p className="text-slate-300 leading-relaxed">
            GS Softwares is proudly built on open-source standards. In compliance with our <strong>Prime Directives (Zero Upload &amp; Offline-Capable)</strong>, all third-party libraries and WASM components are vendored directly into local bundles with zero runtime calls to external CDNs.
          </p>

          <div className="space-y-3">
            {OPEN_SOURCE_NOTICES.map((notice) => (
              <div
                key={notice.name}
                className="p-4 rounded-2xl neu-inset border border-slate-800/80 space-y-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{notice.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">v{notice.version}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    SPDX: {notice.spdx}
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{notice.purpose}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {notice.localVendoring}
                  </span>
                  <a
                    href={notice.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Repository Source ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
          >
            Close Notices
          </button>
        </div>
      </div>
    </div>
  );
};
