/**
 * GS Softwares PWA - Early Install Prompt & Platform Detection Manager
 * Captures beforeinstallprompt prior to UI hydration, respects 7-day cooldown,
 * detects standalone display mode, and handles iOS Safari fallback sheet.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const STORAGE_KEY_DISMISSED = 'gs_pwa_install_dismissed_at';
const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

// Register beforeinstallprompt as early as possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent mini-infobar or automatic browser prompts
    e.preventDefault();
    deferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
    // Dispatch custom event for telemetry-free local celebration / toast
    window.dispatchEvent(new CustomEvent('gs-appinstalled'));
  });
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // safe fallback
    }
  }
}

export function subscribeInstallPrompt(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isMatchMedia = window.matchMedia?.('(display-mode: standalone)').matches;
  const isNavStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(isMatchMedia || isNavStandalone);
}

export function isIos(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isApple = /iphone|ipad|ipod/.test(ua);
  const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isApple || isMacTouch;
}

export function isInstallDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    if (isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
  } catch {
    // storage unavailable
  }
  notifyListeners();
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export async function triggerInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredPrompt = null;
      notifyListeners();
      return 'accepted';
    } else {
      dismissInstallBanner();
      return 'dismissed';
    }
  } catch {
    return 'unavailable';
  }
}
