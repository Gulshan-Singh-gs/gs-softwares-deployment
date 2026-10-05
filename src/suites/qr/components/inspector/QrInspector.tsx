// src/suites/qr/components/inspector/QrInspector.tsx
import React from 'react';
import { useQrStore } from '../../store/qrStore';
import {
  Sliders,
  QrCode,
  Barcode,
  Wifi,
  User,
  Mail,
  Phone,
  Link,
  Type,
  Palette,
  ShieldAlert,
  Maximize2
} from 'lucide-react';
import { QRPayloadType, BarcodeSymbology, ErrorCorrectionLevel } from '../../store/types';

export const QrInspector: React.FC = () => {
  const codeCategory = useQrStore((s) => s.codeCategory);
  const setCodeCategory = useQrStore((s) => s.setCodeCategory);

  const qrType = useQrStore((s) => s.qrType);
  const setQrType = useQrStore((s) => s.setQrType);

  const rawText = useQrStore((s) => s.rawText);
  const setRawText = useQrStore((s) => s.setRawText);
  const urlPayload = useQrStore((s) => s.urlPayload);
  const setUrlPayload = useQrStore((s) => s.setUrlPayload);

  const wifiData = useQrStore((s) => s.wifiData);
  const setWifiData = useQrStore((s) => s.setWifiData);

  const vcardData = useQrStore((s) => s.vcardData);
  const setVcardData = useQrStore((s) => s.setVcardData);

  const emailTo = useQrStore((s) => s.emailTo);
  const setEmailTo = useQrStore((s) => s.setEmailTo);
  const emailSubject = useQrStore((s) => s.emailSubject);
  const setEmailSubject = useQrStore((s) => s.setEmailSubject);

  const phoneNumber = useQrStore((s) => s.phoneNumber);
  const setPhoneNumber = useQrStore((s) => s.setPhoneNumber);

  const fgColor = useQrStore((s) => s.fgColor);
  const setFgColor = useQrStore((s) => s.setFgColor);
  const bgColor = useQrStore((s) => s.bgColor);
  const setBgColor = useQrStore((s) => s.setBgColor);

  const size = useQrStore((s) => s.size);
  const setSize = useQrStore((s) => s.setSize);
  const margin = useQrStore((s) => s.margin);
  const setMargin = useQrStore((s) => s.setMargin);
  const eccLevel = useQrStore((s) => s.eccLevel);
  const setEccLevel = useQrStore((s) => s.setEccLevel);

  const barcodeSymbology = useQrStore((s) => s.barcodeSymbology);
  const setBarcodeSymbology = useQrStore((s) => s.setBarcodeSymbology);
  const barcodeValue = useQrStore((s) => s.barcodeValue);
  const setBarcodeValue = useQrStore((s) => s.setBarcodeValue);
  const barcodeHeight = useQrStore((s) => s.barcodeHeight);
  const setBarcodeHeight = useQrStore((s) => s.setBarcodeHeight);
  const showBarcodeText = useQrStore((s) => s.showBarcodeText);
  const setShowBarcodeText = useQrStore((s) => s.setShowBarcodeText);

  return (
    <aside className="w-80 h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col overflow-hidden text-xs text-zinc-300 select-none">
      {/* Header */}
      <div className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0F111A]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            Synthesis Parameters
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* 1. Category Switcher (QR vs Barcode) */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Symbology Engine</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
            <button
              onClick={() => setCodeCategory('qr')}
              className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${
                codeCategory === 'qr' ? 'bg-sky-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setCodeCategory('barcode')}
              className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${
                codeCategory === 'barcode' ? 'bg-sky-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
          </div>
        </div>

        {/* 2. QR Payload Configuration */}
        {codeCategory === 'qr' ? (
          <div className="space-y-4">
            {/* Payload Type Chips */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Payload Type</label>
              <div className="grid grid-cols-3 gap-1">
                {(['url', 'text', 'wifi', 'vcard', 'email', 'phone'] as QRPayloadType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQrType(type)}
                    className={`py-1 rounded text-[11px] font-mono border capitalize transition-colors ${
                      qrType === type
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-semibold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs per type */}
            {qrType === 'url' && (
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Target URL</label>
                <input
                  type="url"
                  value={urlPayload}
                  onChange={(e) => setUrlPayload(e.target.value)}
                  className="w-full bg-[#141722] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {qrType === 'text' && (
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Raw Text</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#141722] border border-white/10 rounded p-2 text-xs text-zinc-200 focus:outline-none resize-none"
                  placeholder="Enter custom plain text..."
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">SSID Network Name</label>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData({ ssid: e.target.value })}
                    className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifiData.password}
                    onChange={(e) => setWifiData({ password: e.target.value })}
                    className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={vcardData.firstName}
                    onChange={(e) => setVcardData({ firstName: e.target.value })}
                    className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={vcardData.lastName}
                    onChange={(e) => setVcardData({ lastName: e.target.value })}
                    className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Organization"
                  value={vcardData.organization}
                  onChange={(e) => setVcardData({ organization: e.target.value })}
                  className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={vcardData.phone}
                  onChange={(e) => setVcardData({ phone: e.target.value })}
                  className="w-full bg-[#141722] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                />
              </div>
            )}

            {/* Error Correction Selection */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">
                Error Correction (Reed-Solomon)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setEccLevel(level)}
                    className={`py-1 rounded text-center font-mono text-xs border ${
                      eccLevel === level
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 3. Barcode Configuration */
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Symbology Format</label>
              <select
                value={barcodeSymbology}
                onChange={(e) => setBarcodeSymbology(e.target.value as BarcodeSymbology)}
                className="w-full bg-[#141722] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="CODE128">Code 128 (Alphanumeric)</option>
                <option value="EAN13">EAN-13 (13 Digits)</option>
                <option value="UPCA">UPC-A (12 Digits)</option>
                <option value="CODE39">Code 39 (Standard)</option>
                <option value="ITF14">ITF-14 (Packaging)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Payload Content</label>
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                className="w-full bg-[#141722] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">Bar Height</label>
                <span className="font-mono text-sky-400">{barcodeHeight}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={barcodeHeight}
                onChange={(e) => setBarcodeHeight(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 bg-white/10 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. Global Styling & Color Controls */}
        <div className="pt-2 border-t border-white/[0.06] space-y-3">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block">Color & Geometry</span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Foreground</label>
              <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 rounded p-1">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300 uppercase">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Background</label>
              <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 rounded p-1">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300 uppercase">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
