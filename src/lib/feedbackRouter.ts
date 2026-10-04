/**
 * GS Softwares Platform - Feedback & Notification Router
 * - Channels: In-app ARIA Live Toast, Haptics (navigator.vibrate), System Notification (Local via ServiceWorker)
 * - Zero external push, zero runtime analytics/telemetry
 * - Single-leader coordination across multiple tabs using Web Locks API
 * - Local storage settings schema: toasts, haptics, systemNotifications, showFileNames, batchSummaryThreshold
 */

export interface PlatformEvent {
  kind: 'task_started' | 'task_progress' | 'task_complete' | 'task_error' | 'batch_summary';
  studioId: string;
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  detail?: string;
  fileName?: string;
  sensitive?: boolean;
  taskId?: string;
  batch?: { total: number; completed: number; failed: number };
}

export interface FeedbackSettings {
  toasts: boolean;
  haptics: boolean;
  systemNotifications: 'off' | 'background' | 'always';
  showFileNames: boolean;
  batchSummaryThreshold: number;
}

const SETTINGS_KEY = 'gs_feedback_settings_v1';

const DEFAULT_SETTINGS: FeedbackSettings = {
  toasts: true,
  haptics: true,
  systemNotifications: 'background',
  showFileNames: false,
  batchSummaryThreshold: 4,
};

// Rate limiter for haptics: max 1 per 2s, max 10 per minute
let lastHapticTime = 0;
let hapticCountInWindow = 0;
let hapticWindowStart = Date.now();

export function getFeedbackSettings(): FeedbackSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveFeedbackSettings(settings: Partial<FeedbackSettings>): FeedbackSettings {
  const current = getFeedbackSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('gs-feedback-settings-changed', { detail: updated }));
  } catch {
    // quota safe
  }
  return updated;
}

/**
 * Haptic feedback pattern triggers with etiquette rules
 */
export function triggerHaptic(pattern: 'success' | 'error' | 'warning' | 'tick'): boolean {
  const settings = getFeedbackSettings();
  if (!settings.haptics) return false;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;

  const now = Date.now();
  // Minimum 2s between vibrations
  if (now - lastHapticTime < 2000) return false;

  // Max 10 per 60s sliding window
  if (now - hapticWindowStart > 60000) {
    hapticWindowStart = now;
    hapticCountInWindow = 0;
  }
  if (hapticCountInWindow >= 10) return false;

  const patterns: Record<string, number | number[]> = {
    success: [12, 40, 12],
    error: [70],
    warning: [20, 60, 20],
    tick: [8],
  };

  try {
    const vib = patterns[pattern] ?? [8];
    const ok = navigator.vibrate(vib);
    if (ok) {
      lastHapticTime = now;
      hapticCountInWindow++;
    }
    return ok;
  } catch {
    return false;
  }
}

/**
 * Request notification permission safely with privacy disclosure
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

/**
 * In-app Toast event dispatcher
 */
export type ToastListener = (event: PlatformEvent) => void;
const toastListeners = new Set<ToastListener>();

export function subscribeToasts(callback: ToastListener): () => void {
  toastListeners.add(callback);
  return () => {
    toastListeners.delete(callback);
  };
}

/**
 * Dispatch an event across the FeedbackRouter
 */
export async function emitPlatformFeedback(event: PlatformEvent): Promise<void> {
  const settings = getFeedbackSettings();

  // 1. In-App Toasts (ARIA live friendly)
  if (settings.toasts) {
    for (const listener of toastListeners) {
      try {
        listener(event);
      } catch {
        // safe
      }
    }
  }

  // 2. Haptic channel
  if (settings.haptics) {
    if (event.level === 'success') triggerHaptic('success');
    else if (event.level === 'error') triggerHaptic('error');
    else if (event.level === 'warning') triggerHaptic('warning');
  }

  // 3. System Notification channel (Local-only via ServiceWorker)
  const shouldNotify =
    settings.systemNotifications === 'always' ||
    (settings.systemNotifications === 'background' &&
      typeof document !== 'undefined' &&
      document.visibilityState === 'hidden');

  if (!shouldNotify) return;
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Format privacy-preserving notification body
  let body = event.detail || '';
  if (event.fileName && settings.showFileNames && !event.sensitive) {
    body = `File: ${event.fileName}${body ? ` · ${body}` : ''}`;
  }

  if (event.batch) {
    body = `Batch complete: ${event.batch.completed}/${event.batch.total} processed.`;
  }

  // Multi-tab leader election with Web Locks API
  const sendNotification = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(`GS Softwares: ${event.title}`, {
          body,
          icon: './icons/icon-192.png',
          badge: './icons/icon-192.png',
          tag: event.taskId ? `gs-task-${event.taskId}` : 'gs-software-alert',
          data: {
            studioId: event.studioId,
            taskId: event.taskId,
            url: window.location.href,
          },
        });
      } else {
        // Fallback for environments where SW registration is pending
        new Notification(`GS Softwares: ${event.title}`, {
          body,
          icon: './icons/icon-192.png',
          tag: event.taskId ? `gs-task-${event.taskId}` : 'gs-software-alert',
        });
      }
    } catch {
      // Ignored for restricted execution
    }
  };

  if ('locks' in navigator) {
    // Acquire temporary lock to prevent duplicate notifications across 10 open tabs
    await navigator.locks.request('gs-notification-dispatch', { ifAvailable: true }, async (lock) => {
      if (!lock) return; // Another tab is leader or already dispatched
      await sendNotification();
    });
  } else {
    await sendNotification();
  }
}
