// src/suites/image/hooks/useCanvasGestures.ts
import { useEffect, useRef } from 'react';
import { useImageStore } from '../store/imageStore';
import { useHaptics } from './useHaptics';

export function useCanvasGestures(elementRef: React.RefObject<HTMLDivElement | null>) {
  const { triggerHaptic } = useHaptics();
  const setPan = useImageStore((s) => s.setPan);
  const setZoom = useImageStore((s) => s.setZoom);
  const resetView = useImageStore((s) => s.resetView);
  const setIsComparing = useImageStore((s) => s.setIsComparing);
  const undo = useImageStore((s) => s.undo);
  const redo = useImageStore((s) => s.redo);

  const initialDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(1);
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Mouse Pan Dragging
    let isMouseDown = false;
    let startPos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore if clicking on interactive overlays or buttons
      if ((e.target as HTMLElement).closest('button, input, select, textarea, .non-canvas-control')) {
        return;
      }
      if (e.button !== 0 && e.button !== 1) return;
      isMouseDown = true;
      startPos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      startPos = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    // Mouse Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => prev * zoomFactor);
    };

    // Multi-Touch Handlers (1-finger pan, 2-finger pinch, double-tap fit, triple-tap 100%, 3-finger swipe)
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button, input, select, textarea, .non-canvas-control')) {
        return;
      }

      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        tapCount.current += 1;
      } else {
        tapCount.current = 1;
      }
      lastTapTime.current = now;

      // Double-Tap to Fit View
      if (tapCount.current === 2) {
        resetView();
        triggerHaptic('light');
      } else if (tapCount.current === 3) {
        // Triple-Tap to 100% Zoom
        setZoom(1);
        triggerHaptic('light');
        tapCount.current = 0;
      }

      // 2-Finger Hold for Temporary Before/After
      if (e.touches.length === 2) {
        holdTimer.current = window.setTimeout(() => {
          setIsComparing(true);
          triggerHaptic('boundary');
        }, 320);

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance.current = Math.hypot(dx, dy);
        initialZoom.current = useImageStore.getState().zoom;
      }

      // 3-Finger Swipe Baseline
      if (e.touches.length === 3) {
        startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 1) {
        startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }

      // 1-Finger Pan
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (startPos.x !== 0 || startPos.y !== 0) {
          const dx = touch.clientX - startPos.x;
          const dy = touch.clientY - startPos.y;
          setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        }
        startPos = { x: touch.clientX, y: touch.clientY };
      }

      // 2-Finger Pinch Zoom
      if (e.touches.length === 2 && initialDistance.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);
        const scale = currentDistance / initialDistance.current;
        setZoom(initialZoom.current * scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      setIsComparing(false);

      // 3-Finger Horizontal Swipe for Undo/Redo
      if (e.changedTouches.length === 3 && startPos.x !== 0) {
        const deltaX = e.changedTouches[0].clientX - startPos.x;
        if (deltaX > 75) {
          redo();
          triggerHaptic('success');
        } else if (deltaX < -75) {
          undo();
          triggerHaptic('success');
        }
      }

      if (e.touches.length < 2) {
        initialDistance.current = null;
      }
      startPos = { x: 0, y: 0 };
    };

    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, setPan, setZoom, resetView, setIsComparing, undo, redo, triggerHaptic]);
}
