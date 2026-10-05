// src/suites/workflow/components/builder/WorkflowCanvas.tsx
import React, { useRef, useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { WorkflowNode } from '../../store/types';
import {
  Sparkles,
  Play,
  Save,
  Plus,
  Trash2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const WorkflowCanvas: React.FC = () => {
  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const updateNodePosition = useWorkflowStore((s) => s.updateNodePosition);
  const addNode = useWorkflowStore((s) => s.addNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const addEdge = useWorkflowStore((s) => s.addEdge);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);
  const saveCurrentWorkflow = useWorkflowStore((s) => s.saveCurrentWorkflow);

  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('text/plain');
    if (!nodeId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(20, e.clientX - rect.left - 80);
    const y = Math.max(20, e.clientY - rect.top - 30);

    updateNodePosition(nodeId, x, y);
  };

  const handlePortClick = (nodeId: string, portType: 'in' | 'out') => {
    if (portType === 'out') {
      setConnectingNodeId(nodeId);
    } else if (portType === 'in' && connectingNodeId && connectingNodeId !== nodeId) {
      addEdge(connectingNodeId, 'out', nodeId, 'in');
      setConnectingNodeId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#07080A] overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {activeWorkflow.name}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {activeWorkflow.nodes.length} Nodes · {activeWorkflow.edges.length} Connections
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              addNode({
                type: 'tool',
                name: 'Compressor',
                toolId: 'image.compressor',
                suite: 'pixels',
                position: { x: 320, y: 160 }
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Step
          </button>

          <button
            onClick={saveCurrentWorkflow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/10 border border-white/10 text-xs font-medium"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>

          <button
            onClick={() => setViewMode('execution')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5" /> Test Pipeline
          </button>
        </div>
      </div>

      {/* Grid Canvas Stage */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          setSelectedNodeId(null);
          setConnectingNodeId(null);
        }}
        className="flex-1 relative overflow-auto bg-[#07080A] bg-[radial-gradient(#1f2430_1px,transparent_1px)] [background-size:20px_20px]"
      >
        {/* Render Connection Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {activeWorkflow.edges.map((e) => {
            const src = activeWorkflow.nodes.find((n) => n.id === e.sourceNodeId);
            const tgt = activeWorkflow.nodes.find((n) => n.id === e.targetNodeId);
            if (!src || !tgt) return null;

            const x1 = src.position.x + 180;
            const y1 = src.position.y + 45;
            const x2 = tgt.position.x;
            const y2 = tgt.position.y + 45;

            const dx = Math.abs(x2 - x1) * 0.5;

            return (
              <path
                key={e.id}
                d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="opacity-70 animate-pulse"
              />
            );
          })}
        </svg>

        {/* Render Nodes */}
        {activeWorkflow.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              style={{
                transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`
              }}
              className={`absolute w-44 rounded-2xl bg-[#12141C] border p-3.5 transition-shadow cursor-grab active:cursor-grabbing shadow-xl z-10 ${
                isSelected
                  ? 'border-cyan-400 shadow-cyan-950/40'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Node Top Header */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {node.suite || node.type}
                </span>
                {node.type !== 'input' && node.type !== 'output' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    className="text-zinc-600 hover:text-rose-400"
                    title="Remove node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-white mt-1 truncate">{node.name}</div>

              {/* Input / Output Ports */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                {/* In Port */}
                {node.type !== 'input' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortClick(node.id, 'in');
                    }}
                    className={`w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center hover:scale-125 transition-transform ${
                      connectingNodeId ? 'bg-cyan-400 animate-ping' : 'bg-zinc-800'
                    }`}
                    title="Connect input port"
                  />
                ) : (
                  <span />
                )}

                {/* Out Port */}
                {node.type !== 'output' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortClick(node.id, 'out');
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/30 hover:scale-125 transition-transform"
                    title="Connect output port"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
