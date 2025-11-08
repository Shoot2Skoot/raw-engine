// hooks/useMobileGestures.ts - Mobile gesture handling hook

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

/**
 * Hook for handling mobile-specific gestures
 * Supports long press for alternate actions
 */
export const useMobileGestures = (
  svgRef: RefObject<SVGSVGElement>,
  engine: SheetEngine
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
        handleLongPress(hotspot.id);
      }, 500);

      setLongPressTimer(timer);
    }
  }, [engine, svgRef]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Quick tap = immediate action
    if (pressedHotspot) {
      engine.addMark(pressedHotspot);
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

  const handleLongPress = (hotspotId: string) => {
    // Long press can be used for alternate actions
    // For example: removing a mark, showing info, etc.
    console.log('Long press on', hotspotId);
    // Could trigger a context menu or remove the mark
    engine.removeMark(hotspotId);
  };

  return {
    pressedHotspot,
    isLongPressing: longPressTimer !== null
  };
};
