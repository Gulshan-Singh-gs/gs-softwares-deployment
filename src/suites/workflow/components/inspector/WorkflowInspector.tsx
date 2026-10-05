// src/suites/workflow/components/inspector/WorkflowInspector.tsx
import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sliders, Settings, Layers, Trash2, Shield, Info } from 'lucide-react';

export const WorkflowInspector: React.FC = () => {
  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const updateNodeParameters = useWorkflowStore((s) => s.updateNodeParameters);
  const removeNode = useWorkflowStore((s) => s.removeNode);

  const selectedNode = activeWorkflow.nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-[300px] h-full bg-[#0C0E14] border-l border-white/[0.06] p-4 flex flex-col items-center justify-center text-center text-zinc-500 shrink-0">
        <Sliders className="w-8 h-8 mb-2 text-zinc-600" />
        <h4 className="text-xs font-semibold text-zinc-400">No Node Selected</h4>
        <p className="text-[11px] text-zinc-600 max-w-[200px] mt-1">
          Click any step in the pipeline canvas to configure parameters, format targets, and options.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-[300px] h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col p-4 space-y-5 shrink-0 overflow-y-auto">
      {/* Node Title */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            {selectedNode.suite || selectedNode.type}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> 100% Local
          </span>
        </div>
        <h3 className="text-sm font-bold text-white mt-1">{selectedNode.name}</h3>
      </div>

      {/* Configuration Form */}
      <div className="space-y-4 text-xs">
        {selectedNode.type === 'tool' && (
          <>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold">Execution Mode</label>
              <select className="w-full bg-[#12141C] border border-white/10 rounded-lg p-2 text-zinc-200">
                <option value="worker">Dedicated WebWorker</option>
                <option value="wasm">Direct WebAssembly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold">Quality Profile</label>
              <input
                type="range"
                min={20}
                max={100}
                defaultValue={80}
                onChange={(e) => updateNodeParameters(selectedNode.id, { quality: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </>
        )}

        {selectedNode.type === 'output' && (
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold">Output Filename Pattern</label>
            <input
              type="text"
              defaultValue="{{name}}-processed"
              onChange={(e) => updateNodeParameters(selectedNode.id, { filenameFormat: e.target.value })}
              className="w-full bg-[#12141C] border border-white/10 rounded-lg p-2 text-zinc-200 font-mono text-[11px]"
            />
            <p className="text-[10px] text-zinc-500">Variables: {'{{name}}'}, {'{{date}}'}</p>
          </div>
        )}

        {/* Node Delete Action */}
        {selectedNode.type !== 'input' && selectedNode.type !== 'output' && (
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => removeNode(selectedNode.id)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Step
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
