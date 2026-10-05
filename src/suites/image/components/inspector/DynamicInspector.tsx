// src/suites/image/components/inspector/DynamicInspector.tsx
import React from 'react';
import { useImageStore } from '../../store/imageStore';
import { StandardizedParams } from '../../store/types';
import { TOOL_CATEGORIES } from '../../registry/toolTaxonomy';
import { useHaptics } from '../../hooks/useHaptics';
import {
  Sliders,
  Sparkles,
  Layers,
  Wand2,
  Check,
  X,
  History,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Contrast,
  Eye
} from 'lucide-react';

const PARAM_DEFINITIONS: Array<{ key: keyof StandardizedParams; label: string; desc: string }> = [
  { key: 'strength', label: 'Strength', desc: 'Overall intensity of the transformation' },
  { key: 'influence', label: 'Influence', desc: 'Guidance alignment toward prompt/mask' },
  { key: 'creativity', label: 'Creativity', desc: 'Generative exploration vs strict adherence' },
  { key: 'similarity', label: 'Similarity', desc: 'Fidelity to base image composition' },
  { key: 'detail', label: 'Detail', desc: 'Micro-texture and edge reconstruction' },
  { key: 'preservation', label: 'Preservation', desc: 'Protection of original image features' },
];

export const DynamicInspector: React.FC = () => {
  const { triggerHaptic } = useHaptics();

  const activeCategory = useImageStore((s) => s.activeCategory);
  const activeToolId = useImageStore((s) => s.activeToolId);
  const setTool = useImageStore((s) => s.setTool);
  const params = useImageStore((s) => s.params);
  const setParam = useImageStore((s) => s.setParam);
  const promptText = useImageStore((s) => s.promptText);
  const setPromptText = useImageStore((s) => s.setPromptText);
  const lifecycleState = useImageStore((s) => s.lifecycleState);
  const startGeneration = useImageStore((s) => s.startGeneration);
  const variants = useImageStore((s) => s.variants);
  const activeVariantId = useImageStore((s) => s.activeVariantId);
  const acceptVariant = useImageStore((s) => s.acceptVariant);
  const rejectVariant = useImageStore((s) => s.rejectVariant);
  const isComparing = useImageStore((s) => s.isComparing);
  const setIsComparing = useImageStore((s) => s.setIsComparing);
  const applyCanvasTransform = useImageStore((s) => s.applyCanvasTransform);

  const currentCategoryGroup = TOOL_CATEGORIES.find((c) => c.id === activeCategory);
  const currentTool = currentCategoryGroup?.tools.find((t) => t.id === activeToolId) || currentCategoryGroup?.tools[0];

  return (
    <aside className="w-full h-full bg-[#0D0F14] border-l border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* Inspector Header */}
      <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Parameter Inspector</span>
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
            {currentCategoryGroup?.name}
            <span className="text-zinc-500 font-normal">/</span>
            <span className="text-zinc-200">{currentTool?.name || 'Active Tool'}</span>
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/[0.05] border border-white/5 text-zinc-400 uppercase">
          {lifecycleState}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Sub-Tool Selector Chips */}
        {currentCategoryGroup && currentCategoryGroup.tools.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Sub-Tools</label>
            <div className="grid grid-cols-2 gap-1.5">
              {currentCategoryGroup.tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTool(t.id);
                    triggerHaptic('light');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
                    activeToolId === t.id
                      ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300'
                      : 'bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <p className="truncate">{t.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input Block for Generative & Editing Categories */}
        {['generate', 'edit', 'design', 'typography', 'fashion', 'character'].includes(activeCategory) && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Guidance Prompt</label>
              <span className="text-[9px] text-zinc-500">Zero-Upload Local</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. dramatic rim lighting, cinematic 8k, photorealistic architectural glass..."
              rows={3}
              className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-400/50 resize-none font-sans placeholder:text-zinc-600"
            />
          </div>
        )}

        {/* Quick Canvas Transformation Actions */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Canvas Quick Ops</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { applyCanvasTransform('rotate90'); triggerHaptic('light'); }}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { applyCanvasTransform('flipH'); triggerHaptic('light'); }}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { applyCanvasTransform('flipV'); triggerHaptic('light'); }}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Flip Vertical"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { applyCanvasTransform('grayscale'); triggerHaptic('light'); }}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Grayscale"
            >
              <Contrast className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setIsComparing(!isComparing); triggerHaptic('light'); }}
              className={`p-2 rounded-lg border transition-colors ${
                isComparing ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' : 'bg-white/[0.03] border-white/5 text-zinc-300'
              }`}
              title="Toggle Before/After Comparison"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Standardized Professional Parameters (No slider graveyard) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Universal Sliders</span>
            <span className="text-[9px] text-cyan-400 font-mono">STANDARDIZED</span>
          </div>

          {PARAM_DEFINITIONS.map(({ key, label, desc }) => (
            <div key={key} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium group-hover:text-cyan-300 transition-colors">
                  {label}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">{params[key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={params[key]}
                onChange={(e) => {
                  setParam(key, Number(e.target.value));
                  triggerHaptic('tick');
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-zinc-500 leading-tight">{desc}</p>
            </div>
          ))}
        </div>

        {/* AI Variants Filmstrip (Non-destructive branching) */}
        {variants.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Branching Variants</span>
              <span className="text-[10px] text-zinc-500 font-mono">{variants.length} total</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    useImageStore.setState({ activeImage: variant.blobUrl, activeVariantId: variant.id });
                    triggerHaptic('light');
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeVariantId === variant.id ? 'border-cyan-400 scale-[1.02]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={variant.blobUrl} alt="Variant" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {activeVariantId && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    acceptVariant(activeVariantId);
                    triggerHaptic('success');
                  }}
                  className="flex-1 py-2 rounded-lg bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Commit Branch
                </button>
                <button
                  onClick={() => {
                    rejectVariant(activeVariantId);
                    triggerHaptic('boundary');
                  }}
                  className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Discard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Execution Footer Bar */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0A0C10] shrink-0">
        <button
          onClick={() => {
            triggerHaptic('success');
            startGeneration();
          }}
          disabled={lifecycleState === 'GENERATING'}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{lifecycleState === 'GENERATING' ? 'Synthesizing...' : 'Execute Operation'}</span>
        </button>
      </div>
    </aside>
  );
};
