import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image, 
  FileText, 
  Video, 
  Music, 
  FileCode, 
  Sun, 
  Moon, 
  CloudSun,
  Wifi, 
  WifiOff, 
  HelpCircle,
  Menu,
  X,
  Zap
} from 'lucide-react';

export type ThemeMode = 'light' | 'semi' | 'dark';

interface HeaderProps {
  currentApp: string;
  onNavigate: (app: string) => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentApp, onNavigate, onOpenAbout }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('gs_theme_mode') as ThemeMode) || 'dark';
  });

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
    { id: 'pdf', label: 'GS-PDF', icon: FileText, badge: 'PDF Tools' },
    { id: 'video', label: 'GS-Video', icon: Video, badge: 'WASM Video' },
    { id: 'audio', label: 'GS-Audio', icon: Music, badge: 'WebAudio' },
    { id: 'text', label: 'GS-Text', icon: FileCode, badge: 'Code & Diff' },
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <img src="/favicon.png" alt="GS Logo" className="w-full h-full rounded-[0.8rem] object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight truncate">
                  GS Softwares
                </span>
                <span className="hidden xs:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full neu-inset text-indigo-500 shrink-0">
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
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
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
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Dark Mode (Pitch Dark Neumorphism)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Offline Status Badge (Desktop only) */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'PWA Ready' : 'Offline'}</span>
            </div>

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
        <div className="lg:hidden neu-flat px-4 pt-3 pb-5 space-y-1.5 border-t border-slate-500/20">
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
                    ? 'bg-indigo-600 text-white shadow-lg'
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
