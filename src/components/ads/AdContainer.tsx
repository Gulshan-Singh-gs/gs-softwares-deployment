import React, { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export type AdSlotType = 'banner' | 'sidebar' | 'processing-modal' | 'inline-card';

interface AdContainerProps {
  slotType: AdSlotType;
  network?: 'carbon' | 'custom' | 'none';
  customClass?: string;
}

/**
 * Standardized Ad & Ethical Monetization Container
 * Complies with Prime Directive D1 (Zero Upload / Zero User Data Exfiltration).
 * Renders privacy-first sponsorship or native placeholder when offline/adblocked.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  slotType,
  network = 'carbon',
  customClass = ''
}) => {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Responsive styling mapping based on slot specification
  const containerClasses = {
    'banner': 'w-full max-w-4xl mx-auto py-3 px-4 min-h-[90px] flex items-center justify-center',
    'sidebar': 'w-full max-w-xs min-h-[250px] p-4 flex flex-col items-center justify-center',
    'processing-modal': 'w-full max-w-md my-4 p-4 min-h-[140px] flex flex-col items-center justify-center rounded-2xl neu-inset bg-slate-900/60 border border-slate-700/50',
    'inline-card': 'w-full p-4 min-h-[110px] rounded-2xl neu-card flex items-center justify-between gap-4 my-6'
  }[slotType];

  return (
    <aside 
      aria-label="Sponsorship & Ethical Ad Slot" 
      className={`ad-slot-container transition-all duration-300 relative select-none ${containerClasses} ${customClass}`}
      data-ad-type={slotType}
    >
      {/* Privacy & Ethical Disclosure Badge */}
      <div className="absolute top-1.5 right-2 flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase text-slate-500 hover:text-slate-400">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
        <span>Privacy-Guaranteed Slot</span>
      </div>

      {/* Target injection area for Carbon Ads / BuySellAds script hook */}
      <div id={`ad-target-${slotType}`} className="w-full h-full flex flex-col items-center justify-center text-center">
        {/* Offline or Zero-Tracker Fallback Display */}
        {!isOnline ? (
          <div className="text-xs text-slate-500 flex flex-col items-center gap-1 py-2">
            <span className="font-semibold text-slate-400">Operating Offline in Air-Gapped Mode</span>
            <span className="text-[10px]">Third-party network requests are halted.</span>
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
                GS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Support 100% Client-Side Free Software</p>
                <p className="text-[11px] text-slate-400">No servers. No data collection. Zero file retention.</p>
              </div>
            </div>

            <a
              href="https://github.com/Gulshan-Singh-gs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-all border border-cyan-500/30 shrink-0"
            >
              <span>Explore Ecosystem</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
