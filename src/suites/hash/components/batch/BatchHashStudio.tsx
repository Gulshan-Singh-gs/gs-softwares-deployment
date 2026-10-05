// src/suites/hash/components/batch/BatchHashStudio.tsx
import React, { useRef } from 'react';
import { useHashStore } from '../../store/hashStore';
import { formatBytes } from '../../../../lib/fileUtils';
import { Files, Upload, Trash2, Download, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export const BatchHashStudio: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFiles = useHashStore((s) => s.batchFiles);
  const addBatchFiles = useHashStore((s) => s.addBatchFiles);
  const processBatchQueue = useHashStore((s) => s.processBatchQueue);
  const clearBatch = useHashStore((s) => s.clearBatch);

  const handleExportCSV = () => {
    if (batchFiles.length === 0) return;
    let csv = 'Filename,Size_Bytes,SHA256,Status\n';
    for (const item of batchFiles) {
      csv += `"${item.file.name}",${item.file.size},"${item.hashes['SHA-256'] || ''}","${item.status}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'checksums_manifest.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Upload & Actions Bar */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Files className="w-4 h-4 text-blue-400" /> Multi-File Batch Checksum Processor
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Queue multiple files to compute digests in parallel with structured table export.
          </p>
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) addBatchFiles(Array.from(e.target.files));
          }}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Add Files
          </button>
          {batchFiles.length > 0 && (
            <>
              <button
                onClick={() => processBatchQueue('SHA-256')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Hash All (SHA-256)
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={clearBatch}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-transparent transition-colors"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Files Table */}
      {batchFiles.length > 0 ? (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-zinc-400 border-b border-white/5 font-mono text-[11px]">
              <tr>
                <th className="p-3">File Name</th>
                <th className="p-3">Size</th>
                <th className="p-3">SHA-256 Digest</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {batchFiles.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">{b.file.name}</td>
                  <td className="p-3 font-mono text-zinc-400">{formatBytes(b.file.size)}</td>
                  <td className="p-3 font-mono text-[11px] text-teal-300 select-all break-all">
                    {b.hashes['SHA-256'] || (b.status === 'processing' ? 'Hashing...' : 'Pending')}
                  </td>
                  <td className="p-3">
                    {b.status === 'done' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : b.status === 'processing' ? (
                      <span className="text-teal-400 animate-pulse font-semibold">Running</span>
                    ) : (
                      <span className="text-zinc-500">Idle</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          <Files className="w-10 h-10 text-zinc-600 mb-2" />
          <h4 className="text-sm font-semibold text-zinc-300">Queue is empty</h4>
          <p className="text-xs text-zinc-500 mt-0.5">Click or drag multiple files here to start batch hashing.</p>
        </div>
      )}
    </div>
  );
};
