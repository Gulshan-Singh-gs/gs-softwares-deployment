import React, { useState } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { PixelsApp } from './pages/PixelsApp';
import { CanvasApp } from './pages/CanvasApp';
import { PdfApp } from './pages/PdfApp';
import { VideoApp } from './pages/VideoApp';
import { AudioApp } from './pages/AudioApp';
import { TextApp } from './pages/TextApp';
import { SecurityApp } from './pages/SecurityApp';
import { HashApp } from './pages/HashApp';
import { BridgeApp } from './pages/BridgeApp';
import { ArchiveApp } from './pages/ArchiveApp';
import { QrApp } from './pages/QrApp';
import { SpreadsheetApp } from './pages/SpreadsheetApp';
import { EbookApp } from './pages/EbookApp';
import { PresentationApp } from './pages/PresentationApp';
import { SettingsModal } from './components/settings/SettingsModal';
import { PerformanceToast } from './components/settings/PerformanceToast';
import { PerformanceProvider, usePerformanceTier } from './context/PerformanceContext';
import { ToolLandingPage } from './components/ToolLandingPage';
import { TOOLS_LANDING_DATA } from './lib/seoLandingData';
import { Shield, Sparkles, X, Code2, MessageSquare, Info, FileQuestion, Sliders, Zap } from 'lucide-react';

function AppContent() {
  const [currentApp, setCurrentApp] = useState<string>('home');
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const { isSettingsOpen, setIsSettingsOpen, tier, config } = usePerformanceTier();

  const handleLaunchTool = (appId: string) => {
    setLandingSlug(null);
    setCurrentApp(appId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 selection:bg-indigo-500/30 selection:text-indigo-500">
      {/* Global Navigation Header */}
      <Header
        currentApp={landingSlug ? '' : currentApp}
        onNavigate={(app) => {
          setLandingSlug(null);
          setCurrentApp(app);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {landingSlug && TOOLS_LANDING_DATA[landingSlug] ? (
          <ToolLandingPage
            content={TOOLS_LANDING_DATA[landingSlug]}
            onLaunchTool={(toolId) => handleLaunchTool(toolId)}
            onBackToHome={() => {
              setLandingSlug(null);
              setCurrentApp('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {currentApp === 'home' && <Home onSelectApp={(app) => setCurrentApp(app)} onSelectLanding={(slug) => { setLandingSlug(slug); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
            {currentApp === 'pixels' && <PixelsApp />}
            {currentApp === 'canvas' && <CanvasApp onNavigate={(app) => setCurrentApp(app)} />}
            {currentApp === 'pdf' && <PdfApp />}
            {currentApp === 'video' && <VideoApp />}
            {currentApp === 'audio' && <AudioApp />}
            {currentApp === 'text' && <TextApp />}
            {currentApp === 'security' && <SecurityApp />}
            {currentApp === 'hash' && <HashApp />}
            {currentApp === 'bridge' && <BridgeApp />}
            {currentApp === 'archive' && <ArchiveApp />}
            {currentApp === 'qr' && <QrApp />}
            {currentApp === 'spreadsheet' && <SpreadsheetApp />}
            {currentApp === 'ebook' && <EbookApp />}
            {currentApp === 'presentation' && <PresentationApp />}
          </>
        )}
      </main>

      {/* Global Performance Toast Notification */}
      <PerformanceToast />

      {/* Global Settings & Performance Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Rich Footer (Hidden in GS-Canvas for maximum creative real estate) */}
      {currentApp !== 'canvas' && (
        <footer className="border-t border-slate-500/20 mt-8">
          {/* Main Footer Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center lg:text-left lg:justify-items-center">
              
              {/* Col 1: Logo + Tagline + About Us */}
              <div className="space-y-4 sm:col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-3">
                  <img
                    src="/favicon.png"
                    alt="GS Softwares Logo"
                    className="w-12 h-12 rounded-2xl shadow-lg shadow-cyan-500/20 object-cover"
                  />
                  <div>
                    <p className="text-sm font-extrabold tracking-tight">GS Softwares</p>
                    <p className="text-[11px] text-cyan-500 font-semibold">Your 100% private suite</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold opacity-80">About Us</p>
                  <p className="text-xs opacity-60 leading-relaxed max-w-xs">
                    GS Softwares is a 100% client-side Progressive Web App — your files never leave your device. 
                    Powered by WebAssembly &amp; Web Workers, it delivers professional-grade image, PDF, video, audio 
                    and text tools that run entirely in your browser, fully offline, with zero server uploads.
                  </p>
                </div>
              </div>

              {/* Col 2: Information */}
              <div className="space-y-4 flex flex-col items-center lg:items-start">
                <p className="text-sm font-extrabold text-cyan-500 tracking-wide uppercase">Information</p>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      onClick={() => {
                        setLandingSlug('metadata-scrubber');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium text-left"
                    >
                      <Shield className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      Metadata Scrubber (EXIF)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setLandingSlug('pdf-merger');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium text-left"
                    >
                      <FileQuestion className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      Private PDF Merger
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setLandingSlug('image-compressor');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      Local Image Compressor
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setLandingSlug('audio-trimmer');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium text-left"
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      Audio Waveform Trimmer
                    </button>
                  </li>
                  <li className="pt-1">
                    <button
                      onClick={() => setAboutModalOpen(true)}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium"
                    >
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      About Us &amp; Mission
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Helpful Links / Quick Actions */}
              <div className="space-y-4 flex flex-col items-center lg:items-start">
                <p className="text-sm font-extrabold text-cyan-500 tracking-wide uppercase">Helpful Links</p>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://gulshan-singh-gs.github.io/Feedback/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      Send Feedback
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Gulshan-Singh-gs/gs-softwares"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium"
                    >
                      <Code2 className="w-4 h-4 shrink-0" />
                      Source Code
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-cyan-500 transition-all font-medium text-left"
                    >
                      <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                      Tier: {config.label.split(' / ')[0]}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 4: Feedback CTA */}
              <div className="space-y-4 flex flex-col items-center lg:items-start">
                <p className="text-sm font-extrabold text-cyan-500 tracking-wide uppercase">Feedback</p>
                <p className="text-xs opacity-60 leading-relaxed max-w-xs">
                  Help us improve! Share your thoughts, report bugs, or suggest new features.
                </p>
                <a
                  href="https://gulshan-singh-gs.github.io/Feedback/"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="footer-feedback-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4" />
                  Give Feedback
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-500/15" />

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            {/* Social / Tech Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/gulshan-singh-gs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full neu-inset flex items-center justify-center hover:text-cyan-500 transition-colors opacity-70 hover:opacity-100"
                title="GitHub"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href="https://gulshan-singh-gs.github.io/Feedback/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full neu-inset flex items-center justify-center hover:text-cyan-500 transition-colors opacity-70 hover:opacity-100"
                title="Feedback"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 rounded-full neu-inset flex items-center justify-center hover:text-cyan-400 transition-colors opacity-70 hover:opacity-100"
                title="Performance Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs opacity-50">
              © 2026 GS Softwares. Engineered for privacy, speed &amp; offline workflows. Zero server uploads.
            </p>
          </div>
        </footer>
      )}

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

export function App() {
  return (
    <PerformanceProvider>
      <AppContent />
    </PerformanceProvider>
  );
}

export default App;
