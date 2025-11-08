// hooks/useMobileGestures.ts

import { useCallback, useEffect, useState, type RefObject } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

export const useMobileGestures = (
  svgRef: RefObject<SVGSVGElement>,
  engine: SheetEngine
) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [pressedHotspot, setPressedHotspot] = useState<string | null>(null);

  const handleLongPress = useCallback((hotspotId: string) => {
    // Long press behavior - could show context menu or alternative action
    console.log('Long press on', hotspotId);
    // For now, remove mark on long press
    engine.removeMark(hotspotId);
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
      }, 500);

      setLongPressTimer(timer);
    }
  }, [engine, svgRef, handleLongPress]);

  const handleTouchEnd = useCallback((_e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Quick tap = immediate action
    if (pressedHotspot) {
      // Only add mark if it wasn't a long press
      if (longPressTimer !== null) {
        engine.addMark(pressedHotspot);
      }
      setPressedHotspot(null);
    }
  }, [engine, longPressTimer, pressedHotspot]);

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
    pressedHotspot,
    longPressTimer
  };
};
