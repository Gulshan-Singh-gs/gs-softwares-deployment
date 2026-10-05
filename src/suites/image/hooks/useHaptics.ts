// src/suites/image/hooks/useHaptics.ts
import { useCallback } from 'react';

export type HapticPattern = 'light' | 'tick' | 'boundary' | 'success' | 'error';

export function useHaptics() {
  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      switch (pattern) {
        case 'light':
          navigator.vibrate(8);
          break;
        case 'tick':
          navigator.vibrate(4);
          break;
        case 'boundary':
          navigator.vibrate([12, 35, 12]);
          break;
        case 'success':
          navigator.vibrate([10, 30, 25]);
          break;
        case 'error':
          navigator.vibrate([40, 80, 40]);
          break;
      }
    } catch {
      // Graceful fallback for browsers restricting programmatic vibration
    }
  }, []);

  return { triggerHaptic };
}
