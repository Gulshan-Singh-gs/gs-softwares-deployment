/**
 * GS Softwares Minimal Zero-Dependency Internationalization (i18n) Runtime
 * Implements Layer 18 of GS Architecture Specification
 * - Zero third-party runtime frameworks (pure native Intl API)
 * - Locale negotiation from navigator.languages
 * - RTL direction management ('ltr' | 'rtl')
 * - Pluralization and variable interpolation
 */

export type SupportedLocale = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

let currentLocale: SupportedLocale = 'en';
const dictionaries: Record<SupportedLocale, Record<string, string>> = {
  en: {},
  ar: {},
};

const listeners = new Set<(locale: SupportedLocale, isRtl: boolean) => void>();

/**
 * Negotiates initial locale from browser preferences
 */
export function detectInitialLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages || [navigator.language || 'en'];
  for (const lang of langs) {
    const code = lang.toLowerCase().split('-')[0];
    if (code === 'ar') return 'ar';
    if (code === 'en') return 'en';
  }
  return 'en';
}

/**
 * Initializes i18n runtime with bundled translations
 */
export function initI18n(initialLocale?: SupportedLocale, initialDictionaries?: { en?: Record<string, string>; ar?: Record<string, string> }) {
  if (initialDictionaries) {
    if (initialDictionaries.en) dictionaries.en = { ...dictionaries.en, ...initialDictionaries.en };
    if (initialDictionaries.ar) dictionaries.ar = { ...dictionaries.ar, ...initialDictionaries.ar };
  }

  const selected = initialLocale || detectInitialLocale();
  setLocale(selected);
}

export function getLocale(): SupportedLocale {
  return currentLocale;
}

export function isRtl(): boolean {
  return currentLocale === 'ar';
}

export function setLocale(locale: SupportedLocale) {
  currentLocale = locale;
  const rtl = isRtl();

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }

  for (const listener of listeners) {
    try {
      listener(currentLocale, rtl);
    } catch {
      // safe
    }
  }
}

export function subscribeLocale(callback: (locale: SupportedLocale, isRtl: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Key lookup with parameter interpolation
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  let text = dict[key] || dictionaries.en[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }
  }

  return text;
}

/**
 * Format bytes using locale-aware units
 */
export function formatBytesLocale(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${new Intl.NumberFormat(currentLocale).format(val)} ${sizes[i]}`;
}
