import React, { useState, useEffect } from 'react';
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
  Hash
} from 'lucide-react';
import { usePerformanceTier } from '../context/PerformanceContext';

export type ThemeMode = 'light' | 'semi' | 'dark';

interface HeaderProps {
  currentApp: string;
  onNavigate: (app: string) => void;
  onOpenAbout: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentApp, onNavigate, onOpenAbout, onOpenSettings }) => {
  const { tier, setIsSettingsOpen } = usePerformanceTier();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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
    { id: 'home', label: 'Suite Hub', icon: Sparkles },
    { id: 'pixels', label: 'GS-Pixels', icon: Image, badge: 'Image Studio' },
    { id: 'canvas', label: 'GS-Canvas', icon: PenTool, badge: 'Vector Canvas' },
    { id: 'pdf', label: 'GS-PDF', icon: FileText, badge: 'PDF Tools' },
    { id: 'video', label: 'GS-Video', icon: Video, badge: 'WASM Video' },
    { id: 'audio', label: 'GS-Audio', icon: Music, badge: 'WebAudio' },
    { id: 'text', label: 'GS-Text', icon: FileCode, badge: 'Code & Diff' },
    { id: 'bridge', label: 'GS-Bridge', icon: Sparkles, badge: 'Transmutation' },
    { id: 'security', label: 'GS-Security', icon: Lock, badge: 'AES-256' },
    { id: 'hash', label: 'GS-Hash', icon: Sliders, badge: 'Checksum' },
  ];

  return (
    <header className="sticky top-0 z-50 neu-flat backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo - Compact on mobile */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
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
              <p className="text-[10px] opacity-70 font-medium truncate hidden sm:block">100% Private</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 neu-inset p-1.5 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentApp === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'opacity-70 hover:opacity-100 hover:bg-slate-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

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
