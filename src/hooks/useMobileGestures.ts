// hooks/useMobileGestures.ts

import { useEffect, useState, useCallback, RefObject } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

export const useMobileGestures = (
  svgRef: RefObject<SVGSVGElement>,
  engine: SheetEngine,
  onLongPress?: (hotspotId: string) => void
) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pressedHotspot, setPressedHotspot] = useState<string | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1 || !svgRef.current) return;

    const touch = e.touches[0];
    const point = CoordinateTransform.screenToSheet(
      { x: touch.clientX, y: touch.clientY },
      svgRef.current
    );

    const hotspot = engine.getHotspotAt(point);
    if (hotspot) {
      setPressedHotspot(hotspot.id);

      // Long press = show context menu / alternative action
      const timer = window.setTimeout(() => {
        if (onLongPress) {
          onLongPress(hotspot.id);
        }
      }, 500);

      setLongPressTimer(timer);
    }
  }, [engine, svgRef, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Quick tap = immediate action (already handled by pointer events)
    setPressedHotspot(null);
  }, [longPressTimer]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedHotspot(null);
  }, [longPressTimer]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('touchstart', handleTouchStart, { passive: true });
    svg.addEventListener('touchend', handleTouchEnd, { passive: true });
    svg.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchend', handleTouchEnd);
      svg.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [svgRef, handleTouchStart, handleTouchEnd, handleTouchCancel]);

  return { pressedHotspot };
};
