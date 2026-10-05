// src/suites/security/components/hex/HexViewer.tsx
import React, { useState, useMemo } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { Binary, Search, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 512; // 512 bytes per page (32 lines of 16 bytes)

export const HexViewer: React.FC = () => {
  const activeFile = useSecurityStore((s) => s.activeFile);
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);

  const bytes = useMemo(() => {
    if (!activeFile?.data) return new Uint8Array(0);
    return new Uint8Array(activeFile.data);
  }, [activeFile]);

  const totalPages = Math.max(1, Math.ceil(bytes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const pageBytes = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return bytes.slice(start, start + PAGE_SIZE);
  }, [bytes, currentPage]);

  const lines = useMemo(() => {
    const result = [];
    const baseOffset = currentPage * PAGE_SIZE;
    for (let i = 0; i < pageBytes.length; i += 16) {
      const chunk = pageBytes.slice(i, i + 16);
      const hexParts = [];
      const asciiParts = [];

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const b = chunk[j];
          hexParts.push(b.toString(16).padStart(2, '0').toUpperCase());
          // Printable ASCII: 32 to 126
          if (b >= 32 && b <= 126) {
            asciiParts.push(String.fromCharCode(b));
          } else {
            asciiParts.push('.');
          }
        } else {
          hexParts.push('  ');
          asciiParts.push(' ');
        }
      }

      const offsetHex = (baseOffset + i).toString(16).padStart(8, '0').toUpperCase();
      result.push({
        offsetHex,
        hexCol1: hexParts.slice(0, 8).join(' '),
        hexCol2: hexParts.slice(8, 16).join(' '),
        ascii: asciiParts.join('')
      });
    }
    return result;
  }, [pageBytes, currentPage]);

  const handleCopyPage = () => {
    let str = '';
    for (const l of lines) {
      str += `${l.offsetHex}  ${l.hexCol1}  ${l.hexCol2}  |${l.ascii}|\n`;
    }
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <Binary className="w-12 h-12 mb-3 text-zinc-600" />
        <h3 className="text-sm font-semibold text-zinc-400">No File Loaded</h3>
        <p className="text-xs text-zinc-600 max-w-sm mt-1">
          Open a file to inspect offset addresses, raw hexadecimal representations, and printable ASCII data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
      {/* Top Controls */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-violet-400" /> Hexadecimal &amp; ASCII Viewer
          </span>
          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
            {bytes.length} bytes total
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 disabled:opacity-40"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-400 px-1">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 disabled:opacity-40"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyPage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Block</span>
          </button>
        </div>
      </div>

      {/* Hex Stream Display */}
      <div className="flex-1 bg-[#090A0E] border border-white/[0.08] rounded-xl p-4 overflow-x-auto font-mono text-xs select-text">
        <div className="text-zinc-600 border-b border-white/5 pb-2 mb-2 flex">
          <span className="w-24 shrink-0 font-bold">OFFSET</span>
          <span className="w-56 shrink-0 font-bold">00 01 02 03 04 05 06 07</span>
          <span className="w-56 shrink-0 font-bold">08 09 0A 0B 0C 0D 0E 0F</span>
          <span className="shrink-0 font-bold pl-4">ASCII DECODE</span>
        </div>

        <div className="space-y-1">
          {lines.map((l, idx) => (
            <div key={idx} className="flex hover:bg-white/[0.03] py-0.5 rounded px-1 transition-colors">
              <span className="w-24 shrink-0 text-violet-400/80 font-bold">{l.offsetHex}</span>
              <span className="w-56 shrink-0 text-amber-300/90 tracking-wider">{l.hexCol1}</span>
              <span className="w-56 shrink-0 text-amber-300/90 tracking-wider">{l.hexCol2}</span>
              <span className="shrink-0 text-teal-300/90 pl-4 border-l border-white/10">{l.ascii}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
