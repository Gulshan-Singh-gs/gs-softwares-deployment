import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image, 
  FileText, 
  Video, 
  Music, 
  FileCode, 
  PenTool,
  Sun, 
  Moon, 
  CloudSun,
  Wifi, 
  WifiOff, 
  HelpCircle,
  Menu,
  X,
  Zap,
  Download,
  Sliders,
  Lock,
  Hash,
  Archive,
  QrCode,
  Table,
  BookOpen,
  Presentation,
  ChevronDown,
  Layers,
  Check
} from 'lucide-react';
import { usePerformanceTier } from '../context/PerformanceContext';

export type ThemeMode = 'light' | 'semi' | 'dark';

interface HeaderProps {
  currentApp: string;
  showFooter?: boolean;
  onToggleFooter?: () => void;
  onNavigate: (app: string) => void;
  onOpenAbout: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentApp, showFooter = true, onToggleFooter, onNavigate, onOpenAbout, onOpenSettings }) => {
  const { tier, setIsSettingsOpen } = usePerformanceTier();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('gs_theme_mode') as ThemeMode) || 'dark';
  });

  const handleOpenSettingsModal = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setIsSettingsOpen(true);
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('PWA install prompt is ready. Look for the install icon in your address bar or browser menu!');
    }
  };

  useEffect(() => {
    const classes = ['theme-light', 'theme-semi', 'theme-dark'];
    document.documentElement.classList.remove(...classes);
    document.body.classList.remove(...classes);
    
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('gs_theme_mode', theme);
  }, [theme]);

  const navItems = [
    { id: 'home', label: 'Suite Hub', icon: Sparkles, badge: 'Overview', group: 'Core' },
    { id: 'pixels', label: 'GS-Pixels', icon: Image, badge: 'Image Studio', group: 'Media & Creative' },
    { id: 'canvas', label: 'GS-Canvas', icon: PenTool, badge: 'Vector Canvas', group: 'Media & Creative' },
    { id: 'video', label: 'GS-Video', icon: Video, badge: 'WASM Video', group: 'Media & Creative' },
    { id: 'audio', label: 'GS-Audio', icon: Music, badge: 'WebAudio', group: 'Media & Creative' },
    { id: 'pdf', label: 'GS-PDF', icon: FileText, badge: 'PDF Tools', group: 'Documents & Data' },
    { id: 'spreadsheet', label: 'GS-Sheets', icon: Table, badge: 'CSV & Grid', group: 'Documents & Data' },
    { id: 'presentation', label: 'GS-Slides', icon: Presentation, badge: 'Deck Studio', group: 'Documents & Data' },
    { id: 'ebook', label: 'GS-EBook', icon: BookOpen, badge: 'EPUB Studio', group: 'Documents & Data' },
    { id: 'text', label: 'GS-Text', icon: FileCode, badge: 'Code & Diff', group: 'Developer & System' },
    { id: 'archive', label: 'GS-Archive', icon: Archive, badge: 'ZIP & TAR', group: 'Developer & System' },
    { id: 'qr', label: 'GS-QR', icon: QrCode, badge: 'QR & Barcode', group: 'Developer & System' },
    { id: 'security', label: 'GS-Security', icon: Lock, badge: 'AES-256', group: 'Security & Integrity' },
    { id: 'hash', label: 'GS-Hash', icon: Sliders, badge: 'Checksum', group: 'Security & Integrity' },
    { id: 'bridge', label: 'GS-Bridge', icon: Sparkles, badge: 'Transmutation', group: 'Security & Integrity' },
  ];

  const currentActiveItem = navItems.find((item) => item.id === currentApp) || navItems[0];
  const CurrentIcon = currentActiveItem.icon;

  return (
    <header className="sticky top-0 z-50 neu-flat backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Current Suite Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div 
              onClick={() => {
                onNavigate('home');
                setDropdownOpen(false);
              }} 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <img src="/favicon.png" alt="GS Logo" className="w-full h-full rounded-[0.8rem] object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight truncate">
                    GS Softwares
                  </span>
                  <span className="hidden xs:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full neu-inset text-cyan-400 shrink-0">
                    2.0
                  </span>
                </div>
                <p className="text-[10px] opacity-70 font-medium truncate hidden sm:block">100% Private Client-Side</p>
              </div>
            </div>
          </div>

          {/* Clean Dropdown Menu for Tool Suite Selection */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                dropdownOpen 
                  ? 'neu-inset border-cyan-500/40 text-cyan-400 shadow-inner' 
                  : 'neu-btn border-slate-500/20 hover:border-cyan-500/30'
              }`}
              title="Select Tool Suite"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center text-white shadow-sm">
                <CurrentIcon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[10px] opacity-60 font-semibold uppercase tracking-wider leading-none">
                  Active Suite
                </span>
                <span className="text-xs font-extrabold tracking-tight mt-0.5">
                  {currentActiveItem.label}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-200 ml-1 ${dropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {dropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[480px] neu-flat rounded-2xl p-3 shadow-2xl border border-slate-500/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-slate-500/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Select Tool Suite (14 Dedicated Tools)
                  </span>
                  <button
                    onClick={() => {
                      onNavigate('home');
                      setDropdownOpen(false);
                    }}
                    className="text-[10px] font-bold text-cyan-500 hover:underline px-2 py-0.5 rounded-md"
                  >
                    View All in Hub
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentApp === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-left transition-all duration-150 group ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30'
                            : 'hover:bg-slate-500/10 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            isActive ? 'bg-white/20 text-white' : 'neu-inset text-cyan-400'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate text-[12px]">{item.label}</p>
                            <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'opacity-60'}`}>
                              {item.badge}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 shrink-0 text-white ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Controls & Action Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 3-Mode Soft Neumorphic Theme Switcher */}
            <div className="flex items-center gap-0.5 sm:gap-1 neu-inset p-0.5 sm:p-1 rounded-xl sm:rounded-2xl">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'light' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Light Mode (Off-White Neumorphism)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => setTheme('semi')}
                className={`p-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'semi' 
                    ? 'bg-slate-600 text-white shadow-md' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Semi-Dark Mode (Slate Grey Neumorphism)"
              >
                <CloudSun className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'dark' 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Dark Mode (Pitch Dark Neumorphism)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic Install PWA Button (Hidden if PWA is installed or in standalone mode) */}
            {!isInstalled && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-all"
                title="Install PWA to Desktop / Mobile"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}

            {/* Settings & Performance Action Button */}
            <button
              onClick={handleOpenSettingsModal}
              className="p-1.5 sm:p-2 neu-btn rounded-xl transition-colors relative group"
              title="Settings & Performance Mode"
            >
              <Sliders className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-200" />
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                  tier === 'eco'
                    ? 'bg-emerald-400'
                    : tier === 'balanced'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
            </button>

            {/* Footer Visibility Toggle */}
            {onToggleFooter && (
              <button
                onClick={onToggleFooter}
                className={`p-1.5 sm:p-2 rounded-xl transition-all ${
                  showFooter ? 'neu-btn opacity-80 hover:opacity-100' : 'neu-inset text-cyan-400 opacity-100 shadow-inner'
                }`}
                title={showFooter ? 'Hide Page Footer' : 'Show Page Footer'}
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Privacy Guarantee Icon */}
            <button
              onClick={onOpenAbout}
              className="p-1.5 sm:p-2 neu-btn rounded-xl transition-colors"
              title="About & Privacy Guarantee"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 neu-btn rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden neu-flat px-4 pt-3 pb-5 space-y-2 border-t border-slate-500/20">
          {/* Settings & Performance Tier button in Mobile Drawer */}
          <button
            onClick={() => {
              handleOpenSettingsModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold neu-inset transition-all mb-2 border border-slate-500/20"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Settings &amp; Performance</span>
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              tier === 'eco'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : tier === 'balanced'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {tier}
            </span>
          </button>

          {/* Install PWA Mobile Action Button */}
          {!isInstalled && (
            <button
              onClick={() => {
                handleInstallPWA();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/30 transition-all mb-2 border border-emerald-400/30"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-emerald-200 animate-bounce" />
                <span>Install PWA Application</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Install App
              </span>
            </button>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentApp === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'opacity-75 hover:opacity-100 hover:bg-slate-500/10 neu-btn'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] opacity-60 font-normal">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
