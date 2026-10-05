// src/suites/presentation/components/markdown/MarkdownEditorView.tsx
import React, { useEffect, useState } from 'react';
import { usePresentationStore } from '../../store/presentationStore';
import { SlideCanvasStage } from '../canvas/SlideCanvasStage';
import { FileCode, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MarkdownEditorView: React.FC = () => {
  const markdownSource = usePresentationStore((s) => s.markdownSource);
  const syncFromMarkdown = usePresentationStore((s) => s.syncFromMarkdown);
  const [localMd, setLocalMd] = useState(markdownSource);
  const [isSynced, setIsSynced] = useState(true);

  useEffect(() => {
    setLocalMd(markdownSource);
  }, [markdownSource]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalMd(val);
    setIsSynced(false);
  };

  const handleApply = () => {
    syncFromMarkdown(localMd);
    setIsSynced(true);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#07080D]">
      {/* Left: Markdown Source Editor */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full border-r border-white/[0.06] flex flex-col bg-[#0A0C14]">
        <div className="h-10 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0C0E16]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-zinc-200">Markdown Source</span>
            <span className="text-[10px] font-mono text-zinc-500">('---' separates slides)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              disabled={isSynced}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                isSynced
                  ? 'bg-white/5 text-zinc-500 border border-white/5 cursor-default'
                  : 'bg-sky-500 hover:bg-sky-400 text-black shadow-md shadow-sky-500/20'
              }`}
            >
              {isSynced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Synced</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Compile Slides</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 flex flex-col overflow-hidden">
          <textarea
            value={localMd}
            onChange={handleChange}
            placeholder="# Slide Title&#10;&#10;Bullet points here&#10;&#10;---&#10;&#10;# Next Slide Title"
            className="flex-1 w-full p-3 font-mono text-xs bg-[#07080E] text-zinc-200 border border-white/10 rounded-lg focus:outline-none focus:border-sky-500/50 resize-none leading-relaxed selection:bg-sky-500/30"
            spellCheck={false}
          />
          <div className="mt-2 text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Syntax: # Title, - Bullet, Notes: speaker cue</span>
            <span>{localMd.split(/\r?\n---\r?\n/).length} slide section(s) detected</span>
          </div>
        </div>
      </div>

      {/* Right: Synchronized Live Slide Canvas Preview */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-[#07080A] overflow-hidden">
        <div className="h-10 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0C0E16]">
          <span className="text-xs font-semibold text-zinc-300">Live Stage Preview</span>
          <span className="text-[10px] font-mono text-indigo-400">16:9 Viewport</span>
        </div>
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2">
          <SlideCanvasStage />
        </div>
      </div>
    </div>
  );
};
