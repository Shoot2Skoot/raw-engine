import { useCallback, useEffect, useState, RefObject } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

/**
 * Hook for handling mobile touch gestures
 * Provides long-press detection and improved touch handling
 */
export const useMobileGestures = (
  svgRef: RefObject<SVGSVGElement>,
  engine: SheetEngine,
  onLongPress?: (hotspotId: string) => void
) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pressedHotspot, setPressedHotspot] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const point = CoordinateTransform.screenToSheet(
        { x: touch.clientX, y: touch.clientY },
        svgElement
      );

      setTouchStartPos({ x: touch.clientX, y: touch.clientY });

      const hotspot = engine.getHotspotAt(point);
      if (hotspot) {
        setPressedHotspot(hotspot.id);

        // Long press = show context menu / alternative action
        const timer = window.setTimeout(() => {
          if (onLongPress) {
            onLongPress(hotspot.id);
          }
          // Provide haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, 500);

        setLongPressTimer(timer);
      }
    },
    [engine, svgRef, onLongPress]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // If user moves finger significantly, cancel long press
      if (longPressTimer && touchStartPos && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPos.x;
        const dy = touch.clientY - touchStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than 10px, cancel long press
        if (distance > 10) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      }
    },
    [longPressTimer, touchStartPos]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Quick tap = immediate action (only if long press didn't trigger)
      if (pressedHotspot && touchStartPos) {
        // Check if it was a quick tap (not a long press)
        const tapTime = Date.now();
        // This will be a quick tap if timer was still running
        if (longPressTimer) {
          // Quick tap - place mark normally
          // The actual marking is handled by the component's pointer events
        }
      }

      setPressedHotspot(null);
      setTouchStartPos(null);
    },
    [longPressTimer, pressedHotspot, touchStartPos]
  );

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedHotspot(null);
    setTouchStartPos(null);
  }, [longPressTimer]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Use passive: false to prevent default scroll behavior on touch
    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    svg.addEventListener('touchend', handleTouchEnd, { passive: false });
    svg.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchmove', handleTouchMove);
      svg.removeEventListener('touchend', handleTouchEnd);
      svg.removeEventListener('touchcancel', handleTouchCancel);

      // Clean up any pending timers
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [svgRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, longPressTimer]);

  return {
    isPressing: !!pressedHotspot,
    pressedHotspot,
  };
};
