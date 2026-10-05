// src/suites/security/components/inspector/SecurityInspector.tsx
import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { Shield, ShieldAlert, Cpu, Lock, CheckCircle2, FileCheck, Layers } from 'lucide-react';
import { formatBytes } from '../../../../lib/fileUtils';

export const SecurityInspector: React.FC = () => {
  const activeFile = useSecurityStore((s) => s.activeFile);
  const activeDomain = useSecurityStore((s) => s.activeDomain);

  return (
    <aside className="w-[300px] h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col p-4 space-y-5 shrink-0 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Security State</h3>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">Sandbox guarantees &amp; file integrity</p>
      </div>

      {/* Target File Properties */}
      {activeFile ? (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white truncate max-w-[170px]">{activeFile.name}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
              {formatBytes(activeFile.size)}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-zinc-400 border-t border-white/5 pt-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">MIME Signature:</span>
              <span className="font-mono text-zinc-300">{activeFile.signature?.detectedExtension || 'unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">SHA-256 Digest:</span>
              <span className="font-mono text-teal-400 text-[10px]">
                {activeFile.hashes?.sha256 ? `${activeFile.hashes.sha256.slice(0, 8)}...` : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Container Type:</span>
              <span className="font-medium text-zinc-300">
                {activeFile.isEncryptedPackage ? '.gsenc stream' : 'Plain file'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-500 text-center">
          No file actively loaded in workspace memory.
        </div>
      )}

      {/* Non-AI & Zero-Upload Boundary */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Platform Boundary
        </h4>
        <div className="space-y-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Client-Only Sandbox
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Zero outbound network packets. All cryptography executes in Web Workers using native SubtleCrypto.
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="font-bold text-blue-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Open .gsenc Standard
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Containers use open-source streaming AES-256-GCM + PBKDF2 (600k rounds) to guarantee zero vendor lock-in.
            </div>
          </div>
        </div>
      </div>

      {/* Browser Limitations Notice (tools/gs-security.txt mandate) */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Security Honesty
        </div>
        <p className="text-[10px] text-zinc-500 leading-normal">
          Browsers operate inside a strict sandbox. Operating system-level disk wiping, kernel monitoring, and filesystem permissions are not claimed or simulated.
        </p>
      </div>
    </aside>
  );
};
