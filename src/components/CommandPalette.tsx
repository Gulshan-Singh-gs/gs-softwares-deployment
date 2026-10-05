import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Image, 
  FileText, 
  Video, 
  Music, 
  FileCode, 
  PenTool, 
  Lock, 
  Sliders, 
  Archive, 
  QrCode, 
  Table, 
  BookOpen, 
  Presentation, 
  Sparkles,
  X,
  CornerDownLeft
} from 'lucide-react';
import { ToolRegistry } from '../platform';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Image,
  PenTool,
  FileText,
  Video,
  Music,
  FileCode,
  Archive,
  QrCode,
  Table,
  BookOpen,
  Presentation,
  Lock,
  Sliders,
  Sparkles
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  suite: string;
  description: string;
  keywords: string[];
  icon: React.ComponentType<any>;
  category: 'Media' | 'Documents' | 'Developer' | 'Security';
}

const COMMAND_ITEMS: CommandItem[] = ToolRegistry.listStudios().map((studio) => {
  let cat: 'Media' | 'Documents' | 'Developer' | 'Security' = 'Media';
  if (studio.category === 'documents') cat = 'Documents';
  else if (studio.category === 'developer') cat = 'Developer';
  else if (studio.category === 'security') cat = 'Security';

  const toolKeywords = studio.tools.flatMap((t) => [t.name.toLowerCase(), t.slug.toLowerCase(), ...t.inputs.map(i => i.type.toLowerCase())]);
  const keywords = Array.from(new Set([
    studio.name.toLowerCase(),
    studio.badge.toLowerCase(),
    ...toolKeywords
  ]));

  return {
    id: studio.id,
    title: `${studio.name} (${studio.badge})`,
    suite: studio.name,
    description: studio.description,
    keywords,
    icon: ICON_MAP[studio.iconName] || Sparkles,
    category: cat
  };
});

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectApp }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.suite.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectApp(filtered[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-2 sm:px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85dvh' }}
        className="w-full max-w-2xl neu-flat rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, formats, or workflows (e.g. compress, merge pdf, sha256)..."
            className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-500 font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 rounded neu-inset">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching tools or workflows found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectApp(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-500/10 opacity-80 hover:opacity-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-500 text-black font-bold' : 'neu-inset text-cyan-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight truncate">{item.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-semibold">
                        Open <CornerDownLeft className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-900/40 border-t border-slate-700/30 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded neu-inset font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded neu-inset font-mono text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded neu-inset font-mono text-[10px]">↵</kbd> Select</span>
          </div>
          <span>100% Client-Side • Zero Upload</span>
        </div>
      </div>
    </div>
  );
};
