// src/suites/hash/components/text/TextHashStudio.tsx
import React, { useEffect, useState } from 'react';
import { useHashStore } from '../../store/hashStore';
import { HASH_ALGORITHM_SPECS } from '../../registry/hashTaxonomy';
import { Copy, Check, Type, Sparkles, Shield, AlertTriangle } from 'lucide-react';

export const TextHashStudio: React.FC = () => {
  const textInput = useHashStore((s) => s.textInput);
  const setTextInput = useHashStore((s) => s.setTextInput);
  const textDigests = useHashStore((s) => s.textDigests);
  const computeTextHashes = useHashStore((s) => s.computeTextHashes);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    computeTextHashes();
  }, []);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Input Text Box */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4 text-teal-400" /> Input String (UTF-8)
          </label>
          <span className="text-[11px] font-mono text-zinc-500">
            {textInput.length} chars · {new TextEncoder().encode(textInput).length} bytes
          </span>
        </div>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type or paste plain text here to compute simultaneous cryptographic digests..."
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 resize-y"
        />
      </div>

      {/* Digests Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
          <span>Simultaneous Cryptographic &amp; Checksum Digests</span>
          <span className="text-[11px] font-normal text-zinc-500">NIST Standard Formats</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {(['SHA-256', 'SHA-512', 'MD5', 'SHA-1', 'CRC32'] as const).map((algo) => {
            const spec = HASH_ALGORITHM_SPECS[algo];
            const digest = textDigests[algo] || 'Computing...';
            const isCopied = copiedKey === algo;

            return (
              <div
                key={algo}
                className="bg-[#12141C] border border-white/[0.08] hover:border-white/20 transition-colors rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
                      spec.category === 'Cryptographic'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : spec.category === 'Legacy'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {algo}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">{spec.name}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      {spec.securityStatus === 'Recommended' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Secure
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> {spec.securityStatus}
                        </span>
                      )}
                      <span>· {spec.hexLength} hex chars</span>
                    </div>
                  </div>
                </div>

                {/* Digest Value with Copy Action */}
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                  <span className="font-mono text-xs text-teal-300 break-all select-all flex-1">
                    {digest}
                  </span>
                  <button
                    onClick={() => handleCopy(algo, digest)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
                    title="Copy hex digest"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
