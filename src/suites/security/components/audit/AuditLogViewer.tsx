// src/suites/security/components/audit/AuditLogViewer.tsx
import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, FileText } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const auditLogs = useSecurityStore((s) => s.auditLogs);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Local Cryptographic Audit Journal</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tamper-evident ephemeral operation log stored only in client memory. Never transmitted externally.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded border border-white/5">
          {auditLogs.length} Events Logged
        </span>
      </div>

      {/* Log Feed */}
      {auditLogs.length > 0 ? (
        <div className="space-y-3">
          {auditLogs.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {entry.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : entry.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{entry.action}</span>
                    {entry.algorithm && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                        {entry.algorithm}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                      [{entry.targetFileName}]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono break-all">{entry.details}</p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-zinc-500">
          <FileText className="w-10 h-10 mb-2 text-zinc-600" />
          <h4 className="text-sm font-semibold text-zinc-400">No cryptographic operations logged yet</h4>
          <p className="text-xs text-zinc-600 max-w-sm mt-1">
            Actions such as file imports, checksum computations, and encryptions will register tamper-evident journal events here.
          </p>
        </div>
      )}
    </div>
  );
};
