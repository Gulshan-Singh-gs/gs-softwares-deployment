import React, { useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  snapPoints?: ('peek' | 'half' | 'full')[];
  initialSnap?: 'peek' | 'half' | 'full';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 100) {
      dragStartY.current = null;
      onClose();
    }
  };

  const handleTouchEnd = () => {
    dragStartY.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          maxHeight: '85dvh',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        }}
        className="w-full neu-flat rounded-t-3xl border-t border-slate-500/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 bg-slate-950/95"
      >
        {/* Drag handle */}
        <div className="w-full flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none">
          <div className="w-12 h-1.5 rounded-full bg-slate-500/40" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2 border-b border-slate-500/20 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn text-slate-400 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Close sheet"
          >
            <ChevronDown className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
