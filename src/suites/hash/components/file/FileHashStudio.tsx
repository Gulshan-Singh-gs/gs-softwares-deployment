// src/suites/hash/components/file/FileHashStudio.tsx
import React, { useRef, useState } from 'react';
import { useHashStore } from '../../store/hashStore';
import { formatBytes } from '../../../../lib/fileUtils';
import { HASH_ALGORITHM_SPECS } from '../../registry/hashTaxonomy';
import {
  FileCode,
  Upload,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Gauge
} from 'lucide-react';

export const FileHashStudio: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useHashStore((s) => s.selectedFile);
  const setSelectedFile = useHashStore((s) => s.setSelectedFile);
  const fileDigests = useHashStore((s) => s.fileDigests);
  const isProcessing = useHashStore((s) => s.isProcessing);
  const progressPercent = useHashStore((s) => s.progressPercent);
  const throughputMBs = useHashStore((s) => s.throughputMBs);
  const expectedHash = useHashStore((s) => s.expectedHash);
  const setExpectedHash = useHashStore((s) => s.setExpectedHash);
  const verificationResult = useHashStore((s) => s.verificationResult);
  const computeAllFileHashes = useHashStore((s) => s.computeAllFileHashes);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* File Drop and Status Bar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {selectedFile ? (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{selectedFile.name}</h3>
                <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                {selectedFile.type || 'application/octet-stream'} · Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => computeAllFileHashes()}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              Re-Calculate
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors"
            >
              Choose Another
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-teal-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-teal-500/[0.02]"
        >
          <Upload className="w-10 h-10 text-teal-400 mb-3" />
          <h3 className="text-sm font-semibold text-white">Select or drop a file to compute hashes</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Streaming Web Workers process files of any size without loading the entire payload into main thread memory.
          </p>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-[#12141C] border border-teal-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-teal-400 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> Streaming worker execution: {progressPercent}%
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">{throughputMBs.toFixed(1)} MB/s</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Integrity Matcher Input */}
      {selectedFile && (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Verify Against Expected Checksum
            </label>
            {verificationResult === 'match' && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> CHECKSUM MATCHED (VERIFIED)
              </span>
            )}
            {verificationResult === 'mismatch' && (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> MISMATCH DETECTED
              </span>
            )}
          </div>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste expected SHA-256, SHA-512 or MD5 checksum here to test for match..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500/50"
          />
        </div>
      )}

      {/* Calculated Digests Matrix */}
      {selectedFile && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-zinc-400 px-1">File Digests Matrix</div>
          <div className="grid grid-cols-1 gap-3">
            {(['SHA-256', 'SHA-512', 'MD5', 'SHA-1'] as const).map((algo) => {
              const spec = HASH_ALGORITHM_SPECS[algo];
              const digest = fileDigests[algo];
              const isCopied = copiedKey === algo;

              return (
                <div
                  key={algo}
                  className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-white/[0.06] text-zinc-200 border border-white/10">
                      {algo}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">{spec.name}</div>
                      <div className="text-[10px] text-zinc-500">{spec.hexLength} hex characters</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                    <span className="font-mono text-xs text-teal-300 break-all select-all flex-1">
                      {digest || (isProcessing ? 'Streaming calculations...' : 'Not calculated')}
                    </span>
                    {digest && (
                      <button
                        onClick={() => handleCopy(algo, digest)}
                        className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                        title="Copy digest"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
