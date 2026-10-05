// src/suites/workflow/components/execution/ExecutionView.tsx
import React, { useRef } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { formatBytes } from '../../../../lib/fileUtils';
import {
  Play,
  StopCircle,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';

export const ExecutionView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const inputFiles = useWorkflowStore((s) => s.inputFiles);
  const setInputFiles = useWorkflowStore((s) => s.setInputFiles);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const overallProgress = useWorkflowStore((s) => s.overallProgress);
  const runWorkflow = useWorkflowStore((s) => s.runWorkflow);
  const stopExecution = useWorkflowStore((s) => s.stopExecution);
  const executionLogs = useWorkflowStore((s) => s.executionLogs);
  const outputBlobs = useWorkflowStore((s) => s.outputBlobs);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);

  const handleDownload = (item: { name: string; url: string }) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Workflow Header */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">{activeWorkflow.name}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Pipeline Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">{activeWorkflow.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('builder')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium"
          >
            Customize Pipeline
          </button>
          <button
            onClick={isExecuting ? stopExecution : runWorkflow}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-colors ${
              isExecuting
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/40'
            }`}
          >
            {isExecuting ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isExecuting ? 'Stop Execution' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Input File Drop Bar */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) setInputFiles(Array.from(e.target.files));
          }}
          className="hidden"
        />

        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Pipeline Payload Input ({activeWorkflow.inputType})
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
          >
            <Upload className="w-3.5 h-3.5" /> Select Files
          </button>
        </div>

        {inputFiles.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            {inputFiles.map((f, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                {f.name} ({formatBytes(f.size)})
              </span>
            ))}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <p className="text-xs text-zinc-400 font-medium">Click or drop payload files to feed into pipeline</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Or execute immediately using built-in virtual buffer</p>
          </div>
        )}
      </div>

      {/* Progress & Live Execution Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Step Nodes Status */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
            <span>Pipeline Steps</span>
            <span className="font-mono text-cyan-400">{overallProgress}%</span>
          </div>

          <div className="space-y-2">
            {activeWorkflow.nodes.map((n, i) => (
              <div
                key={n.id}
                className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-500 text-[10px]">0{i + 1}</span>
                  <div>
                    <div className="font-semibold text-white">{n.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{n.suite || n.type}</div>
                  </div>
                </div>

                <div>
                  {n.status === 'success' && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                  {n.status === 'running' && (
                    <span className="text-cyan-400 animate-pulse font-semibold text-[11px]">
                      Running...
                    </span>
                  )}
                  {n.status === 'queued' && (
                    <span className="text-zinc-500 text-[11px]">Queued</span>
                  )}
                  {n.status === 'idle' && (
                    <span className="text-zinc-600 text-[11px]">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Logs */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col space-y-3">
          <span className="text-xs font-bold text-zinc-300">Live Execution Log</span>
          <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-[11px] overflow-y-auto max-h-[220px] space-y-1 text-zinc-400">
            {executionLogs.length > 0 ? (
              executionLogs.map((l) => (
                <div key={l.id} className="flex items-start gap-2">
                  <span className="text-zinc-600">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                  <span
                    className={
                      l.level === 'success'
                        ? 'text-emerald-400'
                        : l.level === 'error'
                        ? 'text-rose-400'
                        : 'text-zinc-300'
                    }
                  >
                    {l.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-zinc-600 italic">No execution events recorded yet. Click Run to start.</div>
            )}
          </div>
        </div>
      </div>

      {/* Output Artifacts Download Shelf */}
      {outputBlobs.length > 0 && (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Generated Outputs
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outputBlobs.map((out, i) => (
              <div
                key={i}
                className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white font-mono">{out.name}</div>
                  <div className="text-[10px] text-zinc-500">{formatBytes(out.size)} · In-Memory Ready</div>
                </div>
                <button
                  onClick={() => handleDownload(out)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
