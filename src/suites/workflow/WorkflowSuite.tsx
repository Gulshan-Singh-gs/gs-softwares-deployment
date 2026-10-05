// src/suites/workflow/WorkflowSuite.tsx
import React from 'react';
import { useWorkflowStore } from './store/workflowStore';
import { WorkflowLibraryView } from './components/library/WorkflowLibraryView';
import { WorkflowCanvas } from './components/builder/WorkflowCanvas';
import { WorkflowInspector } from './components/inspector/WorkflowInspector';
import { ExecutionView } from './components/execution/ExecutionView';
import {
  Workflow,
  Sparkles,
  Layers,
  Play,
  Plus,
  Compass,
  History,
  Shield,
  HelpCircle
} from 'lucide-react';

export const WorkflowSuite: React.FC = () => {
  const viewMode = useWorkflowStore((s) => s.viewMode);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);
  const createNewWorkflow = useWorkflowStore((s) => s.createNewWorkflow);
  const activeWorkflow = useWorkflowStore((s) => s.activeWorkflow);

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE NAVIGATION & BRAND BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#0C0E14] rounded-[6px] flex items-center justify-center">
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Workflow &amp; Automation</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">
              Cross-Suite Pipeline Orchestrator (99 Tools)
            </span>
          </div>
        </div>

        {/* Global Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'library'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'builder'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pipeline Builder</span>
          </button>

          <button
            onClick={() => setViewMode('execution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'execution'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Runner</span>
          </button>
        </div>

        {/* New Workflow Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={createNewWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Pipeline</span>
          </button>

          <span className="text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded font-mono hidden md:inline">
            Zero Server Upload
          </span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'library' && <WorkflowLibraryView />}
        {viewMode === 'builder' && (
          <>
            <WorkflowCanvas />
            <WorkflowInspector />
          </>
        )}
        {viewMode === 'execution' && <ExecutionView />}
      </div>

      {/* 3. STATUS BAR */}
      <footer className="h-[28px] bg-[#0A0C12] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Shield className="w-3 h-3" /> Client-Side Directed Acyclic Graph (DAG)
          </span>
          <span className="hidden sm:inline">· 40+ Prebuilt Automation Templates</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Active Pipeline: {activeWorkflow.name}</span>
        </div>
      </footer>
    </div>
  );
};
