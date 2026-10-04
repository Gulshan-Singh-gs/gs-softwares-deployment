import React, { useState, useEffect } from 'react';
import { 
  isStandalone, 
  isIos, 
  isInstallDismissedRecently, 
  dismissInstallBanner, 
  triggerInstallPrompt, 
  subscribeInstallPrompt,
  getDeferredPrompt 
} from '../lib/pwa/installPrompt';
import { requestNotificationPermission } from '../lib/feedbackRouter';
import { Download, Share2, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);

  useEffect(() => {
    // If running in standalone PWA, never show install banner
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (isInstallDismissedRecently()) {
      return;
    }

    const checkState = () => {
      const prompt = getDeferredPrompt();
      setHasPrompt(Boolean(prompt));
    };

    checkState();
    const unsubscribe = subscribeInstallPrompt(checkState);

    // After 1.5s delay to prevent layout shift during page load
    const timer = setTimeout(() => {
      if (!isStandalone() && !isInstallDismissedRecently()) {
        if (getDeferredPrompt() || isIos()) {
          setVisible(true);
        }
      }
    }, 1500);

    const onAppInstalled = () => {
      setInstalled(true);
      setVisible(false);
      // Soft offer local notifications upon installation
      setTimeout(() => {
        requestNotificationPermission().catch(() => {});
      }, 1000);
    };

    window.addEventListener('gs-appinstalled', onAppInstalled);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('gs-appinstalled', onAppInstalled);
    };
  }, []);

  if (installed || !visible) return null;

  const handleInstallClick = async () => {
    if (isIos()) {
      setShowIosSheet(true);
      return;
    }

    const res = await triggerInstallPrompt();
    if (res === 'accepted') {
      setVisible(false);
    } else if (res === 'dismissed') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissInstallBanner();
    setVisible(false);
  };

  return (
    <>
      <div 
        role="region"
        aria-label="App installation banner"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">
          {/* Subtle gradient background glow */}
          <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Install GS Softwares
              </h4>
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                Run 100% offline with zero latency, native haptics, and instant access from your home screen.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isIos() ? 'How to Install' : 'Install PWA'}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="absolute top-1 right-1 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS instruction modal sheet */}
      {showIosSheet && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Install on iOS / Safari</h3>
              <button
                type="button"
                onClick={() => setShowIosSheet(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Apple Safari requires adding to home screen manually:
            </p>

            <ol className="mt-4 space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-indigo-400">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button <Share2 className="inline h-3.5 w-3.5 text-indigo-400 mx-0.5" /> in your Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-indigo-400">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-indigo-400">
                  3
                </span>
                <span>
                  Confirm <strong className="text-white">Add</strong> in the top right corner.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIosSheet(false);
                handleDismiss();
              }}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
