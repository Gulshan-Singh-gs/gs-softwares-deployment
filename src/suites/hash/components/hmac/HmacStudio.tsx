// src/suites/hash/components/hmac/HmacStudio.tsx
import React, { useEffect, useState } from 'react';
import { useHashStore } from '../../store/hashStore';
import { Key, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';

export const HmacStudio: React.FC = () => {
  const hmacMessage = useHashStore((s) => s.hmacMessage);
  const setHmacMessage = useHashStore((s) => s.setHmacMessage);
  const hmacKey = useHashStore((s) => s.hmacKey);
  const setHmacKey = useHashStore((s) => s.setHmacKey);
  const hmacAlgorithm = useHashStore((s) => s.hmacAlgorithm);
  const setHmacAlgorithm = useHashStore((s) => s.setHmacAlgorithm);
  const hmacResult = useHashStore((s) => s.hmacResult);
  const computeHmacResult = useHashStore((s) => s.computeHmacResult);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    computeHmacResult();
  }, []);

  const handleCopy = () => {
    if (!hmacResult) return;
    navigator.clipboard.writeText(hmacResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Keyed-Hash Message Authentication (HMAC)</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cryptographic MAC verification calculated entirely via browser <code className="text-amber-300">crypto.subtle.sign</code>.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          RFC 2104
        </span>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Message Input */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Payload / Message</label>
          <textarea
            value={hmacMessage}
            onChange={(e) => setHmacMessage(e.target.value)}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
            placeholder="Payload data to authenticate..."
          />
        </div>

        {/* Secret Key Input */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Shared Secret Key</label>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
              placeholder="Secret key..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">HMAC Algorithm</label>
            <select
              value={hmacAlgorithm}
              onChange={(e) => setHmacAlgorithm(e.target.value as any)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="SHA-256">HMAC-SHA-256 (256-bit)</option>
              <option value="SHA-512">HMAC-SHA-512 (512-bit)</option>
              <option value="SHA-384">HMAC-SHA-384 (384-bit)</option>
              <option value="SHA-1">HMAC-SHA-1 (Legacy)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Result */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
          <span>HMAC Output Digest (Hex)</span>
          <span className="text-[11px] font-mono text-zinc-500">{hmacResult.length * 4} bits</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
          <span className="font-mono text-xs text-amber-300 break-all select-all flex-1">
            {hmacResult || 'Enter message and secret key to compute MAC'}
          </span>
          {hmacResult && (
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Copy HMAC"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
