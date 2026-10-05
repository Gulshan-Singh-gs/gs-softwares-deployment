// src/suites/qr/components/serial/SerialGeneratorPanel.tsx
import React from 'react';
import { useQrStore } from '../../store/qrStore';
import { downloadBlob } from '../../../../lib/fileUtils';
import { Binary, Plus, Download, Copy, Check, RefreshCw } from 'lucide-react';

export const SerialGeneratorPanel: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const serialConfig = useQrStore((s) => s.serialConfig);
  const setSerialConfig = useQrStore((s) => s.setSerialConfig);
  const generatedSerials = useQrStore((s) => s.generatedSerials);
  const generateSerialSequence = useQrStore((s) => s.generateSerialSequence);

  const handleCopySerials = async () => {
    await navigator.clipboard.writeText(generatedSerials.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = `Serial Number\n${generatedSerials.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `serials_${Date.now()}.csv`);
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#08090E] overflow-y-auto select-none">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Sequence Configuration Card */}
        <div className="p-6 rounded-2xl bg-[#0F121C] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Alphanumeric Serial Engine</h3>
            </div>
            <button
              onClick={generateSerialSequence}
              className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Sequence</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Prefix</label>
              <input
                type="text"
                value={serialConfig.prefix}
                onChange={(e) => setSerialConfig({ prefix: e.target.value })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Suffix</label>
              <input
                type="text"
                value={serialConfig.suffix}
                onChange={(e) => setSerialConfig({ suffix: e.target.value })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Start Value</label>
              <input
                type="number"
                value={serialConfig.startNumber}
                onChange={(e) => setSerialConfig({ startNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Batch Count</label>
              <input
                type="number"
                value={serialConfig.count}
                onChange={(e) => setSerialConfig({ count: parseInt(e.target.value, 10) || 10 })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Increment Step</label>
              <input
                type="number"
                value={serialConfig.step}
                onChange={(e) => setSerialConfig({ step: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Zero Padding</label>
              <input
                type="number"
                value={serialConfig.padding}
                onChange={(e) => setSerialConfig({ padding: parseInt(e.target.value, 10) || 4 })}
                className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Generated Serials Output Grid */}
        <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 uppercase">Generated Output ({generatedSerials.length} records)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySerials}
                className="py-1 px-2.5 rounded bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadCsv}
                className="py-1 px-2.5 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5 scrollbar-thin">
            {generatedSerials.map((sn, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between"
              >
                <span className="text-zinc-500 text-[10px]">#{idx + 1}</span>
                <span className="text-sky-300 font-semibold">{sn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
