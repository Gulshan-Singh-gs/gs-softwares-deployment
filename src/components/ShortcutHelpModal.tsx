import React, { useState } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { SHORTCUT_REGISTRY, formatShortcutKey, ShortcutDefinition } from '../platform/commands';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSuiteId?: string;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
  currentSuiteId
}) => {
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

  const categories: ShortcutDefinition['category'][] = [
    'Application',
    'File',
    'Editing',
    'Navigation',
    'View',
    'Playback',
    'Tools'
  ];

  const filtered = SHORTCUT_REGISTRY.filter((s: ShortcutDefinition) => {
    // Show global shortcuts OR shortcuts belonging to current suite
    const matchesScope = s.scope === 'global' || !currentSuiteId || s.suiteId === currentSuiteId;
    if (!matchesScope) return false;

    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      s.keys.some((k: string) => formatShortcutKey(k).toLowerCase().includes(q))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl neu-card bg-slate-950/95 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcut-help-title" className="text-lg font-black text-slate-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-400">
                Predictable, standard keybindings across GS Softwares
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-button text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Filter */}
        <div className="p-4 border-b border-slate-800/50 bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter shortcuts by name or key..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable Shortcut List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map((category) => {
            const inCat = filtered.filter((s: ShortcutDefinition) => s.category === category);
            if (inCat.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold px-1">
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inCat.map((s: ShortcutDefinition) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">{s.title}</p>
                        {s.description && (
                          <p className="text-[10px] text-slate-400 truncate">{s.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {s.keys.slice(0, 1).map((k: string, idx: number) => (
                          <kbd
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700/80 text-[10px] font-mono font-semibold text-cyan-300 shadow-sm"
                          >
                            {formatShortcutKey(k)}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-center text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">?</kbd> anywhere to open this menu, or <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">Esc</kbd> to exit.
        </div>
      </div>
    </div>
  );
};
