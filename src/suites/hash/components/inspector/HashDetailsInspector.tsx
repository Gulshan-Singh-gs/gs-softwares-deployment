// src/suites/hash/components/inspector/HashDetailsInspector.tsx
import React from 'react';
import { useHashStore } from '../../store/hashStore';
import { HASH_ALGORITHM_SPECS } from '../../registry/hashTaxonomy';
import { Shield, ShieldAlert, Cpu, Award, BookOpen, Layers } from 'lucide-react';

export const HashDetailsInspector: React.FC = () => {
  const activeAlgorithm = useHashStore((s) => s.activeAlgorithm);
  const spec = HASH_ALGORITHM_SPECS[activeAlgorithm];

  return (
    <aside className="w-[300px] h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col p-4 space-y-5 shrink-0 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Algorithm Profile</h3>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">Cryptographic specifications &amp; NIST standards</p>
      </div>

      {/* Selected Spec Card */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-teal-300">{spec.id}</span>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              spec.securityStatus === 'Recommended'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {spec.category}
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{spec.description}</p>

        <div className="space-y-1.5 text-[11px] border-t border-white/5 pt-2.5">
          <div className="flex justify-between">
            <span className="text-zinc-500">Output Bits:</span>
            <span className="font-mono text-zinc-300">{spec.digestBits} bits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Hex Characters:</span>
            <span className="font-mono text-zinc-300">{spec.hexLength} chars</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Web Crypto Native:</span>
            <span className="text-teal-400 font-semibold">{spec.isWebCrypto ? 'Yes (Zero-Dep)' : 'WASM/JS Worker'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Collision Resistance:</span>
            <span className={spec.securityStatus === 'Recommended' ? 'text-emerald-400' : 'text-amber-400'}>
              {spec.securityStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Security Classification Guide */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Usage Classification
        </h4>
        <div className="space-y-2 text-[11px] text-zinc-400">
          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Cryptographic Integrity
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              SHA-256 and SHA-512 provide collision resistance required for security tokens and code signatures.
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Legacy Verification
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              MD5 and SHA-1 have known collision attacks. Use exclusively for legacy checksum matching, never authentication.
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Acceleration Note */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <Cpu className="w-3.5 h-3.5 text-teal-400" /> Web Worker Acceleration
        </div>
        <p className="text-[10px] text-zinc-500 leading-normal">
          Calculations are piped through dedicated Web Workers with 4MB memory buffers, keeping the UI at 60fps.
        </p>
      </div>
    </aside>
  );
};
