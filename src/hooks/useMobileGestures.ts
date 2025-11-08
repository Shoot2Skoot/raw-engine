// hooks/useMobileGestures.ts

import { useCallback, useEffect, useState } from 'react';
import type { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

export const useMobileGestures = (
  svgRef: React.RefObject<SVGSVGElement>,
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
        setPressedHotspot(null);
      }, 500);

      setLongPressTimer(timer);
    }
  }, [engine, svgRef, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    setPressedHotspot(null);
  }, [longPressTimer]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchend', handleTouchEnd);
    svg.addEventListener('touchmove', handleTouchMove);

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchend', handleTouchEnd);
      svg.removeEventListener('touchmove', handleTouchMove);

      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [svgRef, handleTouchStart, handleTouchEnd, handleTouchMove, longPressTimer]);

  return { pressedHotspot };
};
