// src/suites/hash/components/inspector/HashInspector.tsx
import React, { useState } from 'react';
import { useHashStore } from '../../store/hashStore';
import { HASH_ALGORITHM_SPECS } from '../../registry/hashTaxonomy';
import { Search, AlertCircle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const HashInspector: React.FC = () => {
  const inspectorInput = useHashStore((s) => s.inspectorInput);
  const setInspectorInput = useHashStore((s) => s.setInspectorInput);

  const clean = inspectorInput.trim().replace(/^0x/i, '');
  const len = clean.length;
  const isHex = /^[0-9a-fA-F]+$/.test(clean);

  // Determine potential algorithms based on length
  const candidates: { algo: string; status: string; confidence: string }[] = [];

  if (isHex) {
    if (len === 32) {
      candidates.push({ algo: 'MD5', status: 'Legacy Broken', confidence: 'Probable (128-bit)' });
      candidates.push({ algo: 'NTLM', status: 'Legacy', confidence: 'Possible (128-bit)' });
    } else if (len === 40) {
      candidates.push({ algo: 'SHA-1', status: 'Legacy Insecure', confidence: 'Probable (160-bit)' });
      candidates.push({ algo: 'RIPEMD-160', status: 'Cryptographic', confidence: 'Possible (160-bit)' });
    } else if (len === 64) {
      candidates.push({ algo: 'SHA-256', status: 'Recommended Secure', confidence: 'Highly Probable (256-bit)' });
      candidates.push({ algo: 'SHA3-256', status: 'Recommended Secure', confidence: 'Possible (256-bit)' });
      candidates.push({ algo: 'BLAKE2s-256', status: 'Modern Secure', confidence: 'Possible (256-bit)' });
    } else if (len === 96) {
      candidates.push({ algo: 'SHA-384', status: 'Recommended Secure', confidence: 'Highly Probable (384-bit)' });
    } else if (len === 128) {
      candidates.push({ algo: 'SHA-512', status: 'Recommended Secure', confidence: 'Highly Probable (512-bit)' });
      candidates.push({ algo: 'Whirlpool', status: 'Legacy', confidence: 'Possible (512-bit)' });
    } else if (len === 8) {
      candidates.push({ algo: 'CRC32 / Adler32', status: 'Checksum (Non-Crypto)', confidence: 'Exact 32-bit' });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Input Field */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-400" /> Analyze Unknown Hash / Digest
        </label>
        <input
          type="text"
          value={inspectorInput}
          onChange={(e) => setInspectorInput(e.target.value)}
          placeholder="Paste hex digest (e.g. 5d41402abc4b2a76b9719d911017c592)..."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Analysis Results */}
      {clean.length > 0 && (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold text-white">Digest Metrics</span>
            <span className="text-xs font-mono text-zinc-400">
              Length: {len} hex characters ({len * 4} bits)
            </span>
          </div>

          {!isHex ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Input contains non-hexadecimal characters. Valid hex digests contain only [0-9, a-f].</span>
            </div>
          ) : candidates.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">Matching Candidate Algorithms:</div>
              <div className="grid grid-cols-1 gap-2">
                {candidates.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-300">{c.algo}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                        {c.confidence}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        c.status.includes('Secure')
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Uncommon length ({len} chars). Does not match standard 32, 40, 64, 96, or 128-char digests.</span>
            </div>
          )}

          {/* Academic disclaimer */}
          <p className="text-[11px] text-zinc-500 italic pt-2">
            * Note: Hashing is a one-way mathematical function. Multiple algorithms share digest lengths (e.g. SHA-256 and BLAKE2s both output 256 bits). Digest length alone does not guarantee a single algorithm.
          </p>
        </div>
      )}
    </div>
  );
};
