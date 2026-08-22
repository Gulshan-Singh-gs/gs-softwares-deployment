import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { PixelsApp } from './pages/PixelsApp';
import { PdfApp } from './pages/PdfApp';
import { VideoApp } from './pages/VideoApp';
import { AudioApp } from './pages/AudioApp';
import { TextApp } from './pages/TextApp';
import { PWALoadingScreen } from './components/PWALoadingScreen';
import { Shield, Sparkles, X, RefreshCw } from 'lucide-react';

export function App() {
  const [currentApp, setCurrentApp] = useState<string>('home');
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [showPwaLoader, setShowPwaLoader] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('gs_pwa_loaded_session');
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 selection:bg-indigo-500/30 selection:text-indigo-500">
      {/* PWA Loading Screen & Pre-warmer */}
      {showPwaLoader && (
        <PWALoadingScreen
          onComplete={() => setShowPwaLoader(false)}
        />
      )}

      {/* Global Navigation Header */}
      <Header
        currentApp={currentApp}
        onNavigate={(app) => {
          setCurrentApp(app);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentApp === 'home' && <Home onSelectApp={(app) => setCurrentApp(app)} />}
        {currentApp === 'pixels' && <PixelsApp />}
        {currentApp === 'pdf' && <PdfApp />}
        {currentApp === 'video' && <VideoApp />}
        {currentApp === 'audio' && <AudioApp />}
        {currentApp === 'text' && <TextApp />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-500/20 py-8 text-center text-xs opacity-75 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Zero Server Uploads • Client-Side WebAssembly</span>
          </div>
          <span>•</span>
          <button
            onClick={() => setShowPwaLoader(true)}
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>PWA Engine Status</span>
          </button>
        </div>
        <p>© 2026 GS Softwares. Engineered for privacy, speed, and high-throughput offline workflows.</p>
      </footer>

      {/* About & Privacy Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="neu-card p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg opacity-70 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">About GS Softwares Suite</h3>
                <p className="text-xs text-indigo-500 font-semibold">100% Private Client-Side Tools</p>
              </div>
            </div>

            <div className="text-xs opacity-90 space-y-3 leading-relaxed">
              <p>
                GS Softwares Suite runs completely inside your web browser. When you process an image, merge a PDF, convert a video, or edit audio, <strong>the data is never sent to any remote server</strong>.
              </p>
              <p>
                By leveraging <strong>WebAssembly (WASM)</strong>, <strong>Web Workers</strong>, and modern hardware acceleration, your CPU & GPU perform all computations locally at full native speed.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-500/20 flex justify-end">
              <button
                onClick={() => setAboutModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Got It, Let's Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
