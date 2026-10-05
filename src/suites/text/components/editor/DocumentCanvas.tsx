// src/suites/text/components/editor/DocumentCanvas.tsx
import React, { useRef } from 'react';
import { useTextStore } from '../../store/textStore';
import { DocumentBlock } from '../../store/types';
import { Plus, Trash2, CheckSquare, Square, MessageSquare, Sparkles } from 'lucide-react';

export const DocumentCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const blocks = useTextStore((s) => s.blocks);
  const selectedBlockId = useTextStore((s) => s.selectedBlockId);
  const selectBlock = useTextStore((s) => s.selectBlock);
  const updateBlockContent = useTextStore((s) => s.updateBlockContent);
  const insertBlockAfter = useTextStore((s) => s.insertBlockAfter);
  const deleteBlock = useTextStore((s) => s.deleteBlock);
  const toggleChecklist = useTextStore((s) => s.toggleChecklist);
  const viewMode = useTextStore((s) => s.viewMode);
  const activeVariantId = useTextStore((s) => s.activeVariantId);
  const aiVariants = useTextStore((s) => s.aiVariants);

  const activeVariant = aiVariants.find((v) => v.id === activeVariantId);

  // Markdown Export representation for Raw View
  const markdownText = blocks
    .map((b) => {
      switch (b.type) {
        case 'title':
          return `# ${b.content}\n`;
        case 'heading1':
          return `\n## ${b.content}\n`;
        case 'heading2':
          return `\n### ${b.content}\n`;
        case 'heading3':
          return `\n#### ${b.content}\n`;
        case 'quote':
          return `> ${b.content}\n`;
        case 'callout':
          return `> [!NOTE]\n> ${b.content}\n`;
        case 'code':
          return `\`\`\`${b.language || 'typescript'}\n${b.content}\n\`\`\`\n`;
        case 'checklist':
          return `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
        case 'divider':
          return `\n---\n`;
        default:
          return `${b.content}\n`;
      }
    })
    .join('\n');

  if (viewMode === 'markdown') {
    return (
      <div className="w-full h-full p-6 md:p-12 overflow-y-auto bg-[#07090E] text-zinc-300 font-mono text-xs leading-relaxed">
        <div className="max-w-3xl mx-auto whitespace-pre-wrap bg-[#0D1017] p-8 rounded-xl border border-white/5 shadow-2xl">
          {markdownText}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto p-4 md:p-12 bg-[#090B10] flex justify-center select-text"
    >
      {/* Centered Document Page Sheet (A4 / Executive Proportions) */}
      <div className="w-full max-w-3xl min-h-full bg-[#0E1118] text-zinc-200 border border-white/[0.06] rounded-xl shadow-2xl p-6 sm:p-12 space-y-4 font-sans">
        {blocks.map((block) => {
          const isSelected = block.id === selectedBlockId;
          const isAiTarget = activeVariant?.targetBlockId === block.id;

          return (
            <div
              key={block.id}
              onClick={() => selectBlock(block.id)}
              className={`group relative rounded-lg p-2 transition-all border ${
                isSelected
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'border-transparent hover:border-white/10'
              }`}
            >
              {/* Contextual Block Action Toolbar (Insert after, Delete) */}
              <div className="opacity-0 group-hover:opacity-100 absolute -right-2 top-2 -translate-y-1/2 flex items-center gap-1 bg-[#151922] border border-white/10 rounded-md p-1 shadow-md z-10 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    insertBlockAfter(block.id, 'paragraph');
                  }}
                  className="p-1 hover:text-emerald-400 text-zinc-400 transition-colors"
                  title="Insert paragraph below"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {blocks.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    className="p-1 hover:text-red-400 text-zinc-400 transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Block Content Renderers by Type */}
              {block.type === 'title' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className="w-full bg-transparent font-extrabold text-2xl sm:text-3xl text-white outline-none resize-none font-sans leading-tight border-b border-transparent focus:border-emerald-500/30"
                  rows={2}
                />
              ) : block.type === 'heading1' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className="w-full bg-transparent font-bold text-xl text-emerald-400 outline-none resize-none font-sans border-b border-white/5 pb-1 focus:border-emerald-500/30"
                  rows={1}
                />
              ) : block.type === 'heading2' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className="w-full bg-transparent font-semibold text-lg text-white outline-none resize-none font-sans"
                  rows={1}
                />
              ) : block.type === 'callout' ? (
                <div className="p-3.5 bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-lg text-xs leading-relaxed text-emerald-200">
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    className="w-full bg-transparent outline-none resize-none font-sans text-xs"
                    rows={2}
                  />
                </div>
              ) : block.type === 'code' ? (
                <div className="p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-xs text-emerald-300">
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    className="w-full bg-transparent outline-none resize-none font-mono text-xs leading-relaxed"
                    rows={4}
                  />
                </div>
              ) : block.type === 'checklist' ? (
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleChecklist(block.id)}
                    className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {block.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    className={`w-full bg-transparent outline-none resize-none font-sans text-sm leading-relaxed ${
                      block.checked ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}
                    rows={1}
                  />
                </div>
              ) : (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className="w-full bg-transparent outline-none resize-none font-sans text-sm text-zinc-300 leading-relaxed font-normal"
                  rows={Math.max(2, Math.ceil(block.content.length / 75))}
                />
              )}

              {/* Non-Destructive AI Diff Proposal Highlight */}
              {isAiTarget && (
                <div className="mt-2 p-2.5 bg-purple-500/10 border border-purple-500/40 rounded-lg text-xs text-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Proposed: &quot;{activeVariant?.proposedContent.slice(0, 70)}...&quot;</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
