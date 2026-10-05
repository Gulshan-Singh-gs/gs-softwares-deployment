// src/suites/workflow/components/library/WorkflowLibraryView.tsx
import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { PREBUILT_WORKFLOWS } from '../../registry/workflowTemplates';
import { WorkflowTemplate } from '../../store/types';
import {
  Sparkles,
  Play,
  Copy,
  Star,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Shield,
  FileText,
  Video,
  Music,
  Image,
  Archive,
  Database
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Image',
  'PDF',
  'Video',
  'Audio',
  'Data',
  'Archive',
  'Security',
  'Cross-Media',
  'Custom'
];

export const WorkflowLibraryView: React.FC = () => {
  const selectedCategory = useWorkflowStore((s) => s.selectedCategory);
  const setSelectedCategory = useWorkflowStore((s) => s.setSelectedCategory);
  const searchQuery = useWorkflowStore((s) => s.searchQuery);
  const setSearchQuery = useWorkflowStore((s) => s.setSearchQuery);
  const userWorkflows = useWorkflowStore((s) => s.userWorkflows);
  const favoriteIds = useWorkflowStore((s) => s.favoriteIds);
  const toggleFavorite = useWorkflowStore((s) => s.toggleFavorite);
  const useAsTemplate = useWorkflowStore((s) => s.useAsTemplate);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);

  const allWorkflows = [...userWorkflows, ...PREBUILT_WORKFLOWS];

  const filteredWorkflows = allWorkflows.filter((wf) => {
    const matchesCat =
      selectedCategory === 'All' ||
      wf.category === selectedCategory ||
      (selectedCategory === 'Custom' && wf.isCustom);
    const matchesQuery =
      searchQuery.trim() === '' ||
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleQuickRun = (wf: WorkflowTemplate) => {
    loadWorkflow(wf);
    setViewMode('execution');
  };

  const handleOpenBuilder = (wf: WorkflowTemplate) => {
    loadWorkflow(wf);
    setViewMode('builder');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 40+ prebuilt automation workflows, tools or tags..."
            className="w-full pl-10 pr-4 py-2 bg-[#12141C] border border-white/10 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((wf) => {
          const isFav = favoriteIds.includes(wf.id);

          return (
            <div
              key={wf.id}
              className="bg-[#12141C] border border-white/[0.08] hover:border-cyan-500/30 transition-all rounded-2xl p-5 flex flex-col justify-between group space-y-4 shadow-lg hover:shadow-cyan-950/20"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-cyan-400 border border-white/10">
                    {wf.category}
                  </span>

                  <button
                    onClick={() => toggleFavorite(wf.id)}
                    className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
                    title="Bookmark workflow"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {wf.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>

                {/* Node Pipeline Preview Ribbon */}
                <div className="flex items-center gap-1.5 py-1 overflow-x-auto text-[11px] text-zinc-500 font-mono scrollbar-none">
                  {wf.nodes.map((n, i) => (
                    <React.Fragment key={n.id}>
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-zinc-300 whitespace-nowrap">
                        {n.name}
                      </span>
                      {i < wf.nodes.length - 1 && <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickRun(wf)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Run
                  </button>
                  <button
                    onClick={() => useAsTemplate(wf)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
                    title="Clone as customizable template"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Use Template</span>
                  </button>
                </div>

                <button
                  onClick={() => handleOpenBuilder(wf)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Edit Graph →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
