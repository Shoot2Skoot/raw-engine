// hooks/useMobileGestures.ts

import { useEffect, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

export const useMobileGestures = (
  svgRef: RefObject<SVGSVGElement>,
  engine: SheetEngine
) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pressedHotspot, setPressedHotspot] = useState<string | null>(null);

  const handleLongPress = useCallback((hotspotId: string) => {
    // Long press could trigger alternate behavior
    // For now, just log it
    console.log('Long press on', hotspotId);

    // Could show context menu or perform different action
    // For example, could remove mark instead of adding
    const sheet = engine.getCurrentSheet();
    if (sheet?.marks.get(hotspotId)) {
      engine.removeMark(hotspotId);
    }
  }, [engine]);

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
        handleLongPress(hotspot.id);
        setPressedHotspot(null);
      }, 500);

      setLongPressTimer(timer);
    }
  }, [engine, svgRef, handleLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Quick tap = immediate action
    if (pressedHotspot) {
      // This is handled by the normal pointer events
      setPressedHotspot(null);
    }
  }, [longPressTimer, pressedHotspot]);

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
    svg.addEventListener('touchend', handleTouchEnd);
    svg.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchend', handleTouchEnd);
      svg.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [svgRef, handleTouchStart, handleTouchEnd, handleTouchCancel]);

  return {
    isLongPressing: longPressTimer !== null,
    pressedHotspot
  };
};
