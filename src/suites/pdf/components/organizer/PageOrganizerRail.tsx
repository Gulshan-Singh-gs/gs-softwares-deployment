// src/suites/pdf/components/organizer/PageOrganizerRail.tsx
import React from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { RotateCw, Copy, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

export const PageOrganizerRail: React.FC = () => {
  const pages = usePdfStore((s) => s.pages);
  const currentPage = usePdfStore((s) => s.currentPage);
  const setCurrentPage = usePdfStore((s) => s.setCurrentPage);
  const rotatePage = usePdfStore((s) => s.rotatePage);
  const deletePage = usePdfStore((s) => s.deletePage);
  const duplicatePage = usePdfStore((s) => s.duplicatePage);
  const reorderPage = usePdfStore((s) => s.reorderPage);

  return (
    <div className="w-full h-full bg-[#0A0C11] border-r border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* Header */}
      <div className="h-11 px-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <span className="text-[11px] font-mono uppercase text-rose-400 font-bold tracking-wider">
          Pages ({pages.length})
        </span>
        <button
          onClick={() => duplicatePage(currentPage)}
          className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors"
          title="Add / Duplicate Page"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail Stack Viewport */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((p, idx) => {
          const isSelected = idx === currentPage;
          return (
            <div
              key={p.id}
              onClick={() => setCurrentPage(idx)}
              className={`group relative rounded-lg p-2 transition-all cursor-pointer border flex flex-col items-center ${
                isSelected
                  ? 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {/* Thumbnail Miniature Card */}
              <div
                className="w-full aspect-[1/1.3] bg-white rounded shadow-sm overflow-hidden flex flex-col p-2 text-[5px] text-zinc-700 leading-tight border transition-transform group-hover:scale-[1.02]"
                style={{
                  transform: `rotate(${p.rotation}deg)`
                }}
              >
                <div className="font-bold text-[6px] text-zinc-900 border-b pb-0.5 mb-1 truncate">
                  PAGE #{idx + 1}
                </div>
                <div className="line-clamp-6 opacity-75 whitespace-pre-wrap font-serif">
                  {p.extractedText || 'Blank Page Content'}
                </div>
              </div>

              {/* Page Number & Contextual Quick Actions */}
              <div className="w-full mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className={`font-semibold ${isSelected ? 'text-rose-400' : 'text-zinc-500'}`}>
                  Page {idx + 1}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderPage(idx, idx - 1);
                      }}
                      className="p-1 hover:text-white transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {idx < pages.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderPage(idx, idx + 1);
                      }}
                      className="p-1 hover:text-white transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(idx);
                    }}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(idx);
                    }}
                    className="p-1 hover:text-indigo-400 transition-colors"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(idx);
                      }}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
