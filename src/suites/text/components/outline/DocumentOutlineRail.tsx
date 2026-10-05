// src/suites/text/components/outline/DocumentOutlineRail.tsx
import React from 'react';
import { useTextStore } from '../../store/textStore';
import { AlignLeft, Hash } from 'lucide-react';

export const DocumentOutlineRail: React.FC = () => {
  const blocks = useTextStore((s) => s.blocks);
  const selectedBlockId = useTextStore((s) => s.selectedBlockId);
  const selectBlock = useTextStore((s) => s.selectBlock);

  // Extract outline headings (title, h1, h2, h3)
  const headings = blocks.filter((b) =>
    ['title', 'heading1', 'heading2', 'heading3'].includes(b.type)
  );

  return (
    <div className="w-full h-full bg-[#0A0C11] border-r border-white/[0.06] flex flex-col select-none text-zinc-300">
      <div className="h-11 px-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Outline ({headings.length})</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {headings.map((h) => {
          const isSelected = h.id === selectedBlockId;
          const indent =
            h.type === 'title'
              ? 'pl-2 font-bold text-white'
              : h.type === 'heading1'
              ? 'pl-3 font-semibold text-zinc-200'
              : h.type === 'heading2'
              ? 'pl-5 text-zinc-400'
              : 'pl-7 text-zinc-500';

          return (
            <button
              key={h.id}
              onClick={() => selectBlock(h.id)}
              className={`w-full text-left py-1.5 pr-2 rounded text-xs transition-colors truncate block ${indent} ${
                isSelected
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {h.content || 'Untitled Section'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
