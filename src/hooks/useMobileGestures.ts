// hooks/useMobileGestures.ts - Mobile gesture handling

import { useCallback, useEffect, useState, RefObject } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

interface UseMobileGesturesOptions {
  svgRef: RefObject<SVGSVGElement>;
  engine: SheetEngine;
  onLongPress?: (hotspotId: string) => void;
}

export const useMobileGestures = ({
  svgRef,
  engine,
  onLongPress,
}: UseMobileGesturesOptions) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pressedHotspot, setPressedHotspot] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1 || !svgRef.current) return;

      const touch = e.touches[0];
      const point = CoordinateTransform.screenToSheet(
        { x: touch.clientX, y: touch.clientY },
        svgRef.current
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
      if (!touchStartPos || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.x;
      const dy = touch.clientY - touchStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If user moves more than 10px, cancel long press
      if (distance > 10) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
        setPressedHotspot(null);
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

      // Quick tap = immediate action (only if we haven't moved much)
      if (pressedHotspot && touchStartPos) {
        const changedTouch = e.changedTouches[0];
        const dx = changedTouch.clientX - touchStartPos.x;
        const dy = changedTouch.clientY - touchStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          // This was a tap, not a drag
          engine.toggleMark(pressedHotspot);
        }
      }

      setPressedHotspot(null);
      setTouchStartPos(null);
    },
    [engine, longPressTimer, pressedHotspot, touchStartPos]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    svg.addEventListener('touchend', handleTouchEnd);

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchmove', handleTouchMove);
      svg.removeEventListener('touchend', handleTouchEnd);
    };
  }, [svgRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPressing: pressedHotspot !== null,
    pressedHotspot,
  };
};
