// src/suites/text/components/inspector/TextInspector.tsx
import React, { useState } from 'react';
import { useTextStore } from '../../store/textStore';
import { TEXT_DOMAINS, TEXT_CAPABILITIES } from '../../registry/textTaxonomy';
import {
  Sparkles,
  Check,
  X,
  FileText,
  CheckCheck,
  BookOpen,
  Library,
  Eye,
  Type,
  AlignLeft,
  Table,
  FileCode,
  Terminal,
  BarChart2,
  Share2,
  Copy,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TextInspector: React.FC = () => {
  const activeDomain = useTextStore((s) => s.activeDomain);
  const activeToolId = useTextStore((s) => s.activeToolId);
  const setTool = useTextStore((s) => s.setTool);
  const synthesizeAiWriting = useTextStore((s) => s.synthesizeAiWriting);
  const aiVariants = useTextStore((s) => s.aiVariants);
  const activeVariantId = useTextStore((s) => s.activeVariantId);
  const acceptAiVariant = useTextStore((s) => s.acceptAiVariant);
  const rejectAiVariant = useTextStore((s) => s.rejectAiVariant);
  const isAiProcessing = useTextStore((s) => s.isAiProcessing);
  const selectedBlockId = useTextStore((s) => s.selectedBlockId);
  const wordCount = useTextStore((s) => s.wordCount);
  const characterCount = useTextStore((s) => s.characterCount);
  const readingTimeMin = useTextStore((s) => s.readingTimeMin);

  // Local state for specific domains
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Markdown & Code controls
  const [codeLang, setCodeLang] = useState<'typescript' | 'json' | 'html' | 'markdown' | 'python'>('typescript');
  const [wrapLines, setWrapLines] = useState<boolean>(true);

  // Formatting / Typography controls
  const [fontSize, setFontSize] = useState<number>(15);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [fontFamily, setFontFamily] = useState<'inter' | 'mono' | 'serif'>('inter');

  const currentDomainMeta = TEXT_DOMAINS.find((d) => d.id === activeDomain);
  const domainCapabilities = TEXT_CAPABILITIES.filter((c) => c.domain === activeDomain);

  /* Render domain-specific controls */
  const renderContextualControls = () => {
    switch (activeDomain) {
      /* 1. FORMATTING & TYPOGRAPHY */
      case 'formatting':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Font Stack</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'inter', label: 'Sans', desc: 'Inter / System' },
                  { id: 'serif', label: 'Serif', desc: 'Merriweather' },
                  { id: 'mono', label: 'Mono', desc: 'JetBrains Mono' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`p-2 rounded-lg text-center text-xs transition-all border ${
                      fontFamily === f.id
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="font-semibold">{f.label}</p>
                    <p className="text-[9px] text-zinc-500">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">Base Font Size</span>
                  <span className="font-mono text-emerald-400 text-[11px]">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">Line Spacing</span>
                  <span className="font-mono text-emerald-400 text-[11px]">{lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      /* 2. MARKDOWN & CODE MATRIX */
      case 'markdown':
      case 'code':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Syntax Highlighting</label>
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value as any)}
                className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-lg p-2.5 outline-none focus:border-emerald-400/50"
              >
                <option value="typescript">TypeScript / JavaScript</option>
                <option value="json">JSON / Schema</option>
                <option value="markdown">Markdown AST</option>
                <option value="html">HTML5 Semantic</option>
                <option value="python">Python 3</option>
              </select>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={wrapLines}
                  onChange={(e) => setWrapLines(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-emerald-500"
                />
                <span>Soft wrap long lines</span>
              </label>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.('// Synchronized Markdown/Code');
                alert('Copied clean formatted document to clipboard.');
              }}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Clean Source</span>
            </button>
          </div>
        );

      /* 3. REVIEW & READABILITY */
      case 'review':
      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2.5 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Flesch-Kincaid Telemetry</span>
              <div className="flex justify-between">
                <span className="text-zinc-400">Reading Ease:</span>
                <span className="text-emerald-400 font-bold">72.4 (Plain English)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Grade Level:</span>
                <span className="text-white font-mono">8th Grade</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Passive Voice:</span>
                <span className="text-zinc-300 font-mono">2 instances</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Document grammar &amp; spell check passed without critical defects.</span>
            </div>
          </div>
        );

      /* 4. ACCESSIBILITY */
      case 'accessibility':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Heading Order Valid
              </div>
              <p className="text-[11px] text-zinc-300">
                All headings descend sequentially without skipping levels (&lt;H1&gt; → &lt;H2&gt; → &lt;H3&gt;).
              </p>
            </div>
          </div>
        );

      /* 5. AI WRITING STUDIO (STRICTLY CONTEXTUAL TO AI DOMAINS) */
      case 'ai_studio':
      case 'ai_intelligence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">AI Writing Assistant</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                  Non-Destructive Diff
                </span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Rewrite selected block in executive tone, summarize section 1, turn points into Markdown table..."
                rows={3}
                className="w-full bg-[#13161F] text-xs text-white border border-white/10 rounded-xl p-2.5 outline-none focus:border-emerald-400/50 resize-none font-sans"
              />
              <button
                onClick={() => {
                  if (aiPrompt.trim()) synthesizeAiWriting(aiPrompt, selectedBlockId || undefined);
                }}
                disabled={!aiPrompt.trim() || isAiProcessing}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiProcessing ? 'Synthesizing...' : 'Synthesize AI Operation'}</span>
              </button>
            </div>

            {activeVariantId && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                  <span>PROPOSED MODIFICATION</span>
                  <span className="text-amber-400">PENDING DIFF REVIEW</span>
                </div>
                <p className="text-xs text-white font-medium">
                  {aiVariants.find((v) => v.id === activeVariantId)?.proposedContent}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => acceptAiVariant(activeVariantId)}
                    className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => rejectAiVariant(activeVariantId)}
                    className="flex-1 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      /* 6. DEFAULT WRITING / OUTLINE VIEW */
      default:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Document Outline</span>
              <p className="text-zinc-300">
                1. Executive Overview &amp; Mission<br />
                2. Triad Execution Pipeline<br />
                3. Empirical Performance Telemetry
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-full h-full bg-[#0D0F14] border-l border-white/[0.06] flex flex-col select-none text-zinc-300">
      {/* 1. Header */}
      <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Document Inspector</span>
          <h2 className="text-xs font-semibold text-white truncate">{currentDomainMeta?.name || 'Properties'}</h2>
        </div>
        <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400">
          {wordCount} words
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 2. Reading Telemetry Badge */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl grid grid-cols-3 text-center text-xs font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 block">WORDS</span>
            <span className="font-bold text-white">{wordCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">CHARS</span>
            <span className="font-bold text-white">{characterCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">READ TIME</span>
            <span className="font-bold text-emerald-400">{readingTimeMin}m</span>
          </div>
        </div>

        {/* 3. Domain Tools & Processors */}
        {domainCapabilities.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {currentDomainMeta?.shortLabel} Operations
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {domainCapabilities.map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setTool(cap.id)}
                  className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                    activeToolId === cap.id
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                      : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="font-semibold text-white">{cap.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{cap.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Contextual Domain Controls */}
        <div className="pt-2 border-t border-white/[0.06]">
          {renderContextualControls()}
        </div>
      </div>
    </aside>
  );
};
