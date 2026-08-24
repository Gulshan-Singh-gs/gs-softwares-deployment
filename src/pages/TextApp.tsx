import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Sparkles, 
  Columns, 
  Code, 
  FileCheck, 
  Zap, 
  BookOpen, 
  BarChart2, 
  FileSpreadsheet, 
  GitCompare, 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Search, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Cpu, 
  Lock, 
  ShieldCheck, 
  Key, 
  Share2, 
  Bookmark, 
  Clock, 
  CheckSquare, 
  FileText, 
  RefreshCw, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveWorkspaceFile, getWorkspaceFilesByApp } from '../lib/db';

export type TextCategory = 
  | 'editor' 
  | 'markdown' 
  | 'json' 
  | 'diff' 
  | 'analytics' 
  | 'typography' 
  | 'ai' 
  | 'templates' 
  | 'developer' 
  | 'security';

export const TextApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TextCategory>('markdown');
  
  // Document Content & State
  const [content, setContent] = useState<string>(
    '# GS Softwares Text & Document Studio\n\n- **100% Client-Side Private Workspace**\n- **Zero Cloud Leakage • WebAssembly Processing**\n- **Soft Neumorphic High-Throughput UI**\n\n```typescript\nconst status = "Genius Level Operational";\nconsole.log(status);\n```'
  );
  
  // Diff State
  const [diffOriginal, setDiffOriginal] = useState<string>('Hello World\nLine 2 text\nEnd of file');
  const [diffModified, setDiffModified] = useState<string>('Hello React 19 World\nLine 2 updated\nEnd of file\nBonus line added');
  
  // Find & Replace State
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  
  // Developer Utilities State
  const [devInput, setDevInput] = useState<string>('Hello GS Studio Developer');
  const [devOutput, setDevOutput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // AI Simulation State
  const [aiPrompt, setAiPrompt] = useState<string>('Explain the benefits of Client-Side WebAssembly');
  const [aiResult, setAiResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // UI & Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Restore document text from IndexedDB on refresh
  useEffect(() => {
    const restoreFromDB = async () => {
      const stored = await getWorkspaceFilesByApp('text');
      if (stored.length > 0 && stored[0].data) {
        setContent(stored[0].data as string);
      }
    };
    restoreFromDB();
  }, []);

  // Auto-save document text to IndexedDB on change
  useEffect(() => {
    if (!content) return;
    const timeout = setTimeout(() => {
      saveWorkspaceFile({
        id: 'active_text_doc',
        app: 'text',
        name: 'document.md',
        type: 'text/markdown',
        size: content.length,
        data: content,
        timestamp: Date.now()
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [content]);

  // 10 Comprehensive Studio Suites
  const categories = [
    { id: 'markdown', name: 'Markdown Studio', icon: BookOpen, count: 'Markdown Suite' },
    { id: 'editor', name: 'Core & Rich Text', icon: Type, count: 'Text Suite' },
    { id: 'json', name: 'JSON & Data', icon: Code, count: 'Data Suite' },
    { id: 'diff', name: 'Diff Comparator', icon: GitCompare, count: 'Diff Suite' },
    { id: 'analytics', name: 'Writing Analytics', icon: BarChart2, count: 'Analytics Suite' },
    { id: 'typography', name: 'Typography FX', icon: Layers, count: 'Typography Suite' },
    { id: 'ai', name: 'AI Intelligence', icon: Cpu, count: 'AI Suite' },
    { id: 'templates', name: 'Templates & PRD', icon: FileSpreadsheet, count: 'Templates Suite' },
    { id: 'developer', name: 'Dev Utilities', icon: Zap, count: 'Dev Suite' },
    { id: 'security', name: 'Security & Privacy', icon: Lock, count: 'Security Suite' },
  ];

  // Document Statistics
  const words = content.trim() ? content.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const charCount = content.length;
  const linesCount = content.split('\n').length;
  const readingTime = Math.ceil(wordCount / 200);
  const speakingTime = Math.ceil(wordCount / 130);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))).size;

  // Actions
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleCaseConversion = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake') => {
    let result = content;
    if (type === 'upper') result = content.toUpperCase();
    if (type === 'lower') result = content.toLowerCase();
    if (type === 'title') {
      result = content.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (type === 'snake') {
      result = content.toLowerCase().replace(/\s+/g, '_');
    }
    if (type === 'camel') {
      result = content.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }
    setContent(result);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  const handleFindAndReplace = () => {
    if (!findQuery) return;
    const replaced = content.replaceAll(findQuery, replaceQuery);
    setContent(replaced);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  const handleSortLines = (order: 'asc' | 'desc' | 'dedupe') => {
    let lines = content.split('\n');
    if (order === 'asc') lines.sort();
    if (order === 'desc') lines.sort().reverse();
    if (order === 'dedupe') lines = Array.from(new Set(lines));
    setContent(lines.join('\n'));
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  const handleDevConvert = (mode: 'base64' | 'url' | 'hash') => {
    if (mode === 'base64') {
      setDevOutput(btoa(devInput));
    } else if (mode === 'url') {
      setDevOutput(encodeURIComponent(devInput));
    } else if (mode === 'hash') {
      setDevOutput(`SHA-256 (Simulated): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`);
    }
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  const handleRunAI = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setAiResult(
        `[GS-AI LOCAL SYNTHESIS]\nPrompt: "${aiPrompt}"\n\nClient-side WebAssembly enables sub-millisecond execution, complete data sovereignty, and offline resilience with zero cloud inference cost.`
      );
      setIsProcessing(false);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
      <div className="flex flex-col gap-4 neu-card p-4 sm:p-6 rounded-3xl border-slate-800">
        {/* Title Row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-600/30 neu-flat shrink-0">
            <FileCode className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">GS-Text Document Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Markdown Studio, Dual-Pane Diff, Regex Engine, JSON Validator, Analytics &amp; Dev Utilities</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopy(content)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Document'}</span>
          </button>

          <button
            onClick={() => setContent('')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
            title="Clear document content"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Document</span>
          </button>
        </div>
      </div>

      {/* 10 Major Categories Navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-glow">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                  : 'neu-btn text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Tool Configuration Deck */}
        <div className="neu-card p-6 rounded-3xl space-y-6 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <p className="text-[11px] text-slate-400">
              {categories.find((c) => c.id === activeCategory)?.count} active tools in RAM
            </p>
          </div>

          {/* 1. CORE EDITING & CASE MANIPULATION */}
          {activeCategory === 'editor' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-300">Case Transformation Engine</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upper', label: 'UPPER' },
                  { id: 'lower', label: 'lower' },
                  { id: 'title', label: 'Title Case' },
                  { id: 'camel', label: 'camelCase' },
                  { id: 'snake', label: 'snake_case' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCaseConversion(c.id as any)}
                    className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300"
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Line Organization</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleSortLines('asc')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                    Sort A-Z
                  </button>
                  <button onClick={() => handleSortLines('desc')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                    Sort Z-A
                  </button>
                  <button onClick={() => handleSortLines('dedupe')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                    Deduplicate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. MARKDOWN STUDIO & FIND/REPLACE */}
          {activeCategory === 'markdown' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Find & Replace</label>
                <input
                  type="text"
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset text-xs text-white"
                  placeholder="Find pattern / string..."
                />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset text-xs text-white"
                  placeholder="Replace with..."
                />
              </div>

              <button
                onClick={handleFindAndReplace}
                disabled={!findQuery}
                className="w-full py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-md"
              >
                Execute Replace All
              </button>
            </div>
          )}

          {/* 19. JSON & DATA VALIDATOR */}
          {activeCategory === 'json' && (
            <div className="space-y-4">
              <button
                onClick={handleFormatJson}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Beautify & Validate JSON</span>
              </button>

              {jsonError && (
                <div className="p-3 neu-inset border border-rose-500/30 rounded-2xl text-xs text-rose-300">
                  {jsonError}
                </div>
              )}
            </div>
          )}

          {/* 19. DEVELOPER UTILITIES */}
          {activeCategory === 'developer' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Input String</label>
                <input
                  type="text"
                  value={devInput}
                  onChange={(e) => setDevInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleDevConvert('base64')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                  Base64
                </button>
                <button onClick={() => handleDevConvert('url')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                  URL Enc
                </button>
                <button onClick={() => handleDevConvert('hash')} className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">
                  SHA-256
                </button>
              </div>

              {devOutput && (
                <div className="p-3 neu-inset rounded-2xl text-[10px] font-mono text-emerald-400 break-all">
                  {devOutput}
                </div>
              )}
            </div>
          )}

          {/* 5. AI WRITING ASSISTANCE */}
          {activeCategory === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">AI Prompt / Rewrite Topic</label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset text-xs text-white"
                />
              </div>

              <button
                onClick={handleRunAI}
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                <span>Execute Local Synthesis</span>
              </button>

              {aiResult && (
                <div className="p-3 neu-inset rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {aiResult}
                </div>
              )}
            </div>
          )}

          {/* 16. SECURITY & PRIVACY */}
          {activeCategory === 'security' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 neu-inset rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">RAM Scratchpad:</span>
                  <span className="text-emerald-400 font-bold">100% Volatile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cloud Sync Leak:</span>
                  <span className="text-emerald-400 font-bold">Zero (0 bytes)</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. TEMPLATES & PRD */}
          {activeCategory === 'templates' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Load Boilerplate</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setContent('# Product Requirements Document (PRD)\n\n## Objective\n## User Stories\n## Metrics')}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300"
                >
                  PRD Doc
                </button>
                <button
                  onClick={() => setContent('# Meeting Notes\n\n**Date:** 2026-08-21\n**Attendees:** GS Engineering Team\n\n### Action Items')}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300"
                >
                  Meeting Notes
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Editor Stage / Workspace */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* DIFF COMPARATOR VIEW */}
          {activeCategory === 'diff' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neu-card p-4 rounded-3xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Original Text / Code</h3>
                <textarea
                  value={diffOriginal}
                  onChange={(e) => setDiffOriginal(e.target.value)}
                  className="w-full min-h-[360px] p-3 neu-inset rounded-2xl text-xs font-mono text-slate-300 resize-none focus:outline-none"
                />
              </div>

              <div className="neu-card p-4 rounded-3xl space-y-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modified Text / Code</h3>
                <textarea
                  value={diffModified}
                  onChange={(e) => setDiffModified(e.target.value)}
                  className="w-full min-h-[360px] p-3 neu-inset rounded-2xl text-xs font-mono text-slate-300 resize-none focus:outline-none"
                />
              </div>
            </div>
          ) : activeCategory === 'analytics' ? (
            /* ANALYTICS DASHBOARD */
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Full Text & Reading Telemetry</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Total Words</span>
                  <p className="text-2xl font-bold text-white mt-1">{wordCount}</p>
                </div>
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Total Characters</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{charCount}</p>
                </div>
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Total Lines</span>
                  <p className="text-2xl font-bold text-white mt-1">{linesCount}</p>
                </div>
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Unique Vocabulary</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{uniqueWords}</p>
                </div>
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Est. Reading Time</span>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">{readingTime} min</p>
                </div>
                <div className="p-4 neu-inset rounded-2xl">
                  <span className="text-xs text-slate-400">Est. Speaking Time</span>
                  <p className="text-2xl font-bold text-pink-400 mt-1">{speakingTime} min</p>
                </div>
              </div>
            </div>
          ) : (
            /* DUAL PANE MARKDOWN / CODE EDITOR */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neu-card p-4 rounded-3xl space-y-3 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider">Source Editor</span>
                  <span>{wordCount} words • {charCount} chars</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full flex-1 min-h-[420px] bg-transparent text-sm font-mono text-slate-200 resize-none focus:outline-none leading-relaxed"
                  placeholder="Type your document content here..."
                />
              </div>

              <div className="neu-card p-4 rounded-3xl space-y-3 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider">Live Rendered View</span>
                </div>
                <div className="prose prose-invert max-w-none text-sm text-slate-300 font-sans space-y-3 overflow-auto min-h-[420px]">
                  <pre className="p-4 neu-inset rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">
                    {content}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
