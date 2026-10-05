import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

export type ActionTier = 'primary' | 'secondary' | 'overflow';

export interface StudioActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: ActionTier; // primary: visible on phone (<=4), secondary: visible >=768px, overflow: in "More" menu
  category: 'file' | 'edit' | 'view' | 'export'; // Platform-wide order: File -> Edit -> View -> Export/Share
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  title?: string;
  shortcut?: string;
}

interface StudioToolbarProps {
  studioTitle: string;
  actions: StudioActionItem[];
  centerContent?: React.ReactNode;
  leftContent?: React.ReactNode;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  studioTitle,
  actions,
  centerContent,
  leftContent,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close overflow menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && moreMenuOpen) {
        setMoreMenuOpen(false);
      }
    };

    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen]);

  // Order actions platform-wide: File -> Edit -> View -> Export
  const categoryOrder: Record<string, number> = { file: 1, edit: 2, view: 3, export: 4 };
  const sortedActions = [...actions].sort(
    (a, b) => (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99)
  );

  // Primary visible actions on phone: max 4
  const primaryActions = sortedActions.filter((a) => a.tier === 'primary').slice(0, 4);
  const secondaryActions = sortedActions.filter(
    (a) => a.tier === 'secondary' || (a.tier === 'primary' && !primaryActions.includes(a))
  );
  const overflowActions = sortedActions.filter(
    (a) => a.tier === 'overflow' || secondaryActions.includes(a)
  );

  return (
    <header
      aria-label="Studio workstation toolbar"
      className="h-12 px-2 sm:px-4 flex items-center justify-between text-xs z-30 shrink-0 gap-1.5 sm:gap-2 select-none border-b border-slate-500/20 backdrop-blur-xl bg-slate-900/40 relative overflow-hidden"
    >
      {/* Left Area: Title / Custom Left Area */}
      <div className="flex items-center gap-2 min-w-0 shrink overflow-hidden">
        {leftContent}
        <span className="font-extrabold tracking-tight text-[11px] sm:text-xs text-white truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
          {studioTitle}
        </span>
      </div>

      {/* Center Area: (e.g. Asset Tabs, Zoom or View Controls) */}
      {centerContent && (
        <div className="flex-1 flex items-center min-w-0 overflow-hidden mx-1">
          {centerContent}
        </div>
      )}

      {/* Right Area: Priority Action Cluster */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
        {/* Primary Actions (visible <=4 on phone) */}
        {primaryActions.map((action) => {
          const Icon = action.icon;
          const isPrimaryBtn = action.variant === 'primary';
          const isSuccessBtn = action.variant === 'success';

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title || action.label}
              aria-label={action.label}
              className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 rounded-xl text-[11px] font-bold transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                isPrimaryBtn
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-600/20 disabled:opacity-30'
                  : isSuccessBtn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-30'
                  : 'bg-slate-900/60 hover:bg-slate-800 border border-slate-500/20 text-slate-200 hover:text-white disabled:opacity-30'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}

        {/* Secondary Actions (Visible on tablets and desktop >=768px) */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.title || action.label}
                aria-label={action.label}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-500/20 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors disabled:opacity-30"
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overflow Menu ("More" button: ARIA menu, touch friendly, keyboard accessible) */}
        {overflowActions.length > 0 && (
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="flex items-center justify-center p-2 rounded-xl neu-btn text-slate-300 hover:text-white transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              title="More actions"
              aria-label="More actions"
              aria-haspopup="true"
              aria-expanded={moreMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4 text-cyan-400" />
            </button>

            {moreMenuOpen && (
              <div
                role="menu"
                aria-label="Studio overflow actions"
                className="absolute right-0 top-full mt-1.5 w-52 neu-flat rounded-2xl p-1.5 shadow-2xl border border-slate-500/20 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider border-b border-slate-500/15 mb-1">
                  Actions
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {overflowActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        role="menuitem"
                        disabled={action.disabled}
                        onClick={() => {
                          action.onClick();
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                          action.variant === 'danger'
                            ? 'text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-200 hover:bg-slate-500/15 hover:text-white'
                        } disabled:opacity-30 min-h-[44px]`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                          <span className="truncate">{action.label}</span>
                        </div>
                        {action.shortcut && (
                          <kbd className="text-[9px] font-mono opacity-50 neu-inset px-1 py-0.5 rounded">
                            {action.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
