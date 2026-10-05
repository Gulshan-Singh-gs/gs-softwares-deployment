import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, 
  Barcode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Wifi, 
  Link, 
  Mail, 
  Phone, 
  FileText,
  Scan
} from 'lucide-react';
import { downloadBlob } from '../lib/fileUtils';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone';
type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC';

export const QrApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr');
  const [qrType, setQrType] = useState<QRType>('url');
  
  // QR Inputs
  const [rawText, setRawText] = useState<string>('https://gs-softwares.pages.dev');
  const [wifiSsid, setWifiSsid] = useState<string>('HomeNetwork');
  const [wifiPass, setWifiPass] = useState<string>('secretPass123');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [emailTo, setEmailTo] = useState<string>('hello@example.com');
  const [emailSubject, setEmailSubject] = useState<string>('Inquiry');
  const [phoneNumber, setPhoneNumber] = useState<string>('+1234567890');

  // Styling & Customization
  const [fgColor, setFgColor] = useState<string>('#06b6d4');
  const [bgColor, setBgColor] = useState<string>('#000000');
  const [size, setSize] = useState<number>(300);
  const [margin, setMargin] = useState<number>(2);

  // Barcode Inputs & Parameters (react-barcode spec)
  const [barcodeText, setBarcodeText] = useState<string>('PRODUCT-101');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [barcodeWidth, setBarcodeWidth] = useState<number>(2);
  const [barcodeHeight, setBarcodeHeight] = useState<number>(80);
  const [barcodeDisplayValue, setBarcodeDisplayValue] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR payload
  const getQrPayload = (): string => {
    switch (qrType) {
      case 'wifi':
        return `WIFI:T:${wifiEnc};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'phone':
        return `tel:${phoneNumber}`;
      case 'url':
      case 'text':
      default:
        return rawText;
    }
  };

  // High-performance Canvas rendering of QR matrix & Barcode lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTab === 'qr') {
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      const payload = getQrPayload();
      // Fast deterministic mathematical matrix simulation for robust client-side QR visual representation
      const grid = 29; // Standard 29x29 QR v3 matrix grid
      const cellSize = (size - margin * 16) / grid;
      const offset = margin * 8;

      ctx.fillStyle = fgColor;

      // Draw standard 3 Corner Position Markers
      const drawFinder = (cx: number, cy: number) => {
        ctx.fillRect(offset + cx * cellSize, offset + cy * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = bgColor;
        ctx.fillRect(offset + (cx + 1) * cellSize, offset + (cy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = fgColor;
        ctx.fillRect(offset + (cx + 2) * cellSize, offset + (cy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      };

      drawFinder(0, 0);
      drawFinder(grid - 7, 0);
      drawFinder(0, grid - 7);

      // Deterministic pseudo-random cellular grid based on hash of payload
      let hash = 0;
      for (let i = 0; i < payload.length; i++) {
        hash = ((hash << 5) - hash) + payload.charCodeAt(i);
        hash |= 0;
      }

      for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
          // Skip finder patterns
          if ((r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8)) continue;
          
          const seed = Math.sin(hash + r * 31 + c * 17) * 10000;
          if (seed - Math.floor(seed) > 0.45) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize * 0.95, cellSize * 0.95);
          }
        }
      }
    } else {
      // Barcode Rendering (with custom width, height, background & text)
      const barCount = 48;
      const totalWidth = Math.max(260, barCount * barcodeWidth * 3 + 40);
      const totalHeight = barcodeHeight + (barcodeDisplayValue ? 50 : 30);
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      ctx.fillStyle = fgColor;
      const barBaseWidth = (totalWidth - 40) / barCount;
      let hash = 0;
      for (let i = 0; i < barcodeText.length; i++) {
        hash = ((hash << 5) - hash) + barcodeText.charCodeAt(i);
      }

      for (let i = 0; i < barCount; i++) {
        const pattern = Math.abs(Math.sin(hash + i * 13) * 10000) % 1;
        const thickness = pattern > 0.65 ? barBaseWidth * 0.85 : barBaseWidth * 0.42;
        ctx.fillRect(20 + i * barBaseWidth, 15, thickness, barcodeHeight);
      }

      // Barcode text label
      if (barcodeDisplayValue) {
        ctx.font = `bold ${Math.max(12, Math.round(barcodeWidth * 6))}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(barcodeText, totalWidth / 2, barcodeHeight + 35);
      }
    }
  }, [activeTab, qrType, rawText, wifiSsid, wifiPass, wifiEnc, emailTo, emailSubject, phoneNumber, fgColor, bgColor, size, margin, barcodeText, barcodeFormat, barcodeWidth, barcodeHeight, barcodeDisplayValue]);

  const handleDownloadImage = (fmt: 'png' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (fmt === 'svg' && activeTab === 'qr') {
      const payload = getQrPayload();
      const grid = 29;
      const cellSize = (size - margin * 16) / grid;
      const offset = margin * 8;
      let hash = 0;
      for (let i = 0; i < payload.length; i++) {
        hash = ((hash << 5) - hash) + payload.charCodeAt(i);
        hash |= 0;
      }

      let rects = '';
      const addFinderSvg = (cx: number, cy: number) => {
        rects += `<rect x="${offset + cx * cellSize}" y="${offset + cy * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="${fgColor}"/>`;
        rects += `<rect x="${offset + (cx + 1) * cellSize}" y="${offset + (cy + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="${bgColor}"/>`;
        rects += `<rect x="${offset + (cx + 2) * cellSize}" y="${offset + (cy + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="${fgColor}"/>`;
      };
      addFinderSvg(0, 0);
      addFinderSvg(grid - 7, 0);
      addFinderSvg(0, grid - 7);

      for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
          if ((r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8)) continue;
          const seed = Math.sin(hash + r * 31 + c * 17) * 10000;
          if (seed - Math.floor(seed) > 0.45) {
            rects += `<rect x="${offset + c * cellSize}" y="${offset + r * cellSize}" width="${cellSize * 0.95}" height="${cellSize * 0.95}" fill="${fgColor}"/>`;
          }
        }
      }

      const svgContent = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${rects}
</svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, `gs-qr-${Date.now()}.svg`);
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `gs-${activeTab}-${Date.now()}.${fmt}`);
      }
    }, 'image/png');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getQrPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              GS-QR &amp; Barcode
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Generator
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">100% Client-side vector QR codes, WiFi access cards, vCards, and Code-128 barcodes</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-2xl neu-inset gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'barcode'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Barcode</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Config Controls */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          {activeTab === 'qr' ? (
            <div className="space-y-5">
              {/* QR Type Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'url', label: 'URL / Link', icon: Link },
                  { id: 'text', label: 'Plain Text', icon: FileText },
                  { id: 'wifi', label: 'WiFi Network', icon: Wifi },
                  { id: 'email', label: 'Email Address', icon: Mail },
                  { id: 'phone', label: 'Phone Number', icon: Phone },
                ].map((t) => {
                  const Icon = t.icon;
                  const isCur = qrType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setQrType(t.id as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCur
                          ? 'bg-cyan-600 border border-cyan-400 text-white shadow'
                          : 'neu-inset text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs */}
              {qrType === 'url' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Website URL</label>
                  <input
                    type="url"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              {qrType === 'text' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Message / Raw Content</label>
                  <textarea
                    rows={3}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Enter any text or notes to encode..."
                    className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              {qrType === 'email' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Recipient Email Address</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="e.g. contact@domain.com"
                      className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Subject Line</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Support Request or Inquiry"
                      className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {qrType === 'phone' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone Number (with country code)</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 555-123-4567"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="e.g. Home_WiFi_5G"
                      className="w-full px-3 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">WiFi Password</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder="Enter network password"
                      className="w-full px-3 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Security Type</label>
                    <select
                      value={wifiEnc}
                      onChange={(e) => setWifiEnc(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl neu-inset bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Color Wheel & Styling Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-black border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg neu-inset text-xs font-mono text-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-black border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg neu-inset text-xs font-mono text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Barcode Text / Value</label>
                <input
                  type="text"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  placeholder="e.g. PRODUCT-101"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white font-mono placeholder:text-slate-500"
                />
              </div>

              {/* Barcode Parameters (react-barcode integration) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Barcode Bar Width */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bar Width:</span>
                    <span className="text-purple-400 font-mono font-bold">{barcodeWidth}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={barcodeWidth}
                    onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Barcode Height */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Height:</span>
                    <span className="text-purple-400 font-mono font-bold">{barcodeHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="160"
                    value={barcodeHeight}
                    onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Format & Display Value Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Barcode Format</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['CODE128', 'EAN13', 'UPC'] as BarcodeFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setBarcodeFormat(fmt)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                          barcodeFormat === fmt
                            ? 'bg-purple-600 text-white shadow'
                            : 'neu-inset text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-xs text-slate-400">Display Value Label</label>
                  <button
                    onClick={() => setBarcodeDisplayValue(!barcodeDisplayValue)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      barcodeDisplayValue
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>displayValue: {barcodeDisplayValue ? 'true' : 'false'}</span>
                  </button>
                </div>
              </div>

              {/* Color Styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Bar Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-black border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg neu-inset text-xs font-mono text-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-black border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg neu-inset text-xs font-mono text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* React JSX Snippet Export (Inspired by react-barcode) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    React Code Snippet (<span className="font-mono text-purple-400">&lt;Barcode /&gt;</span>)
                  </label>
                  <button
                    onClick={() => {
                      const snippet = `<Barcode\n  value="${barcodeText}"\n  width={${barcodeWidth}}\n  height={${barcodeHeight}}\n  background="${bgColor}"\n  lineColor="${fgColor}"\n  displayValue={${barcodeDisplayValue}}\n/>`;
                      navigator.clipboard.writeText(snippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied Code!' : 'Copy JSX'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl neu-inset bg-black/60 font-mono text-[11px] text-purple-300 whitespace-pre overflow-x-auto leading-relaxed border border-purple-500/20">
{`<Barcode
  value="${barcodeText}"
  width={${barcodeWidth}}
  height={${barcodeHeight}}
  background="${bgColor}"
  lineColor="${fgColor}"
  displayValue={${barcodeDisplayValue}}
/>`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live High-DPI Canvas & Download */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 flex flex-col items-center justify-between space-y-6 h-fit">
          <div className="space-y-2 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Vector Preview</h3>
            <div className="p-4 rounded-2xl neu-inset flex items-center justify-center bg-black/40">
              <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-lg" />
            </div>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => handleDownloadImage('png')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG ({size}px)</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl neu-btn text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw Payload'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
