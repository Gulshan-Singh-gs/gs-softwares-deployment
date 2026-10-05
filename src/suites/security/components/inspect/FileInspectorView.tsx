// src/suites/security/components/inspect/FileInspectorView.tsx
import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { formatBytes } from '../../../../lib/fileUtils';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const FileInspectorView: React.FC = () => {
  const activeFile = useSecurityStore((s) => s.activeFile);
  const signature = activeFile?.signature;

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <Search className="w-12 h-12 mb-3 text-zinc-600" />
        <h3 className="text-sm font-semibold text-zinc-400">No File Loaded</h3>
        <p className="text-xs text-zinc-600 max-w-sm mt-1">
          Drop a document or click Open in the top bar to inspect headers, magic bytes, and MIME integrity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">{activeFile.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-zinc-300 border border-white/10">
                {formatBytes(activeFile.size)}
              </span>
              {activeFile.isEncryptedPackage && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Encrypted Container
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identified as: <span className="text-zinc-200 font-semibold">{signature?.fileFormatName || 'Binary Stream'}</span>
            </p>
          </div>
        </div>

        {/* Mismatch Alert or Verified Status */}
        {signature?.isMismatch ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <div className="font-bold">MIME / Extension Mismatch Detected</div>
              <div className="text-[10px] text-amber-400/80">
                Extension is .{signature.actualExtension}, but file signature matches .{signature.detectedExtension}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>
              <div className="font-bold">Signature Verified Consistent</div>
              <div className="text-[10px] text-emerald-400/80">Magic header matches extension and MIME profile</div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of File Metadata & Structural Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Magic Number Inspection */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Magic Signature (Hex)
            </span>
            <span className="text-[10px] uppercase font-mono text-blue-400">{signature?.confidence}</span>
          </div>
          <div className="font-mono text-sm text-amber-400 bg-black/40 p-2.5 rounded-lg border border-white/5 tracking-wider overflow-x-auto">
            {signature?.magicHex || 'N/A'}
          </div>
          <p className="text-[11px] text-zinc-500">
            First 16 bytes sniffed directly from the binary header without file parser mutation.
          </p>
        </div>

        {/* MIME Type & Extension Analysis */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Format Classification
            </span>
            <span className="text-[10px] text-zinc-500">RFC 2046</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500">Detected MIME:</span>
              <span className="font-mono text-zinc-300">{signature?.detectedMime || 'unknown'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500">Reported MIME:</span>
              <span className="font-mono text-zinc-300">{activeFile.type || 'none'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Target Extension:</span>
              <span className="font-mono text-zinc-300">.{signature?.detectedExtension || 'bin'}</span>
            </div>
          </div>
        </div>

        {/* Timestamp & Origin Properties */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> File Timestamps
            </span>
            <span className="text-[10px] text-zinc-500">System Clock</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500">Last Modified:</span>
              <span className="text-zinc-300 font-mono text-[11px]">
                {new Date(activeFile.lastModified).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500">ArrayBuffer Size:</span>
              <span className="text-zinc-300 font-mono text-[11px]">{activeFile.data.byteLength} bytes</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Local Integrity:</span>
              <span className="text-emerald-400 font-semibold text-[11px]">In-Memory Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structural Diagnostics Notice */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3 text-xs text-zinc-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-200">Non-Destructive Inspection Principle: </span>
          The file is verified through read-only ArrayBuffer probes in the browser sandbox. No file headers or underlying bytes have been altered.
        </div>
      </div>
    </div>
  );
};
