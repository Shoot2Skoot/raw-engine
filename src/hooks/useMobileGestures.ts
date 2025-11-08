import { useCallback, useEffect, useRef } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import { CoordinateTransform } from '../utils/coordinates';

export const useMobileGestures = (
  svgRef: React.RefObject<SVGSVGElement>,
  engine: SheetEngine,
  onLongPress?: (hotspotId: string) => void
) => {
  const longPressTimer = useRef<number | null>(null);
  const pressedHotspot = useRef<string | null>(null);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1 || !svgRef.current) return;

    const touch = e.touches[0];
    const point = CoordinateTransform.screenToSheet(
      { x: touch.clientX, y: touch.clientY },
      svgRef.current
    );

    const hotspot = engine.getHotspotAt(point);
    if (hotspot) {
      pressedHotspot.current = hotspot.id;
      touchStartTime.current = Date.now();

      // Long press detection (500ms)
      longPressTimer.current = window.setTimeout(() => {
        if (pressedHotspot.current && onLongPress) {
          onLongPress(pressedHotspot.current);
          // Prevent the normal tap action
          pressedHotspot.current = null;
        }
      }, 500);
    }
  }, [engine, svgRef, onLongPress]);

  const handleTouchEnd = useCallback((_e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touchDuration = Date.now() - touchStartTime.current;

    // Quick tap (less than 500ms) = immediate action
    if (pressedHotspot.current && touchDuration < 500) {
      engine.addMark(pressedHotspot.current);
    }

    pressedHotspot.current = null;
    touchStartTime.current = 0;
  }, [engine]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressedHotspot.current = null;
    touchStartTime.current = 0;
  }, []);

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

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [svgRef, handleTouchStart, handleTouchEnd, handleTouchCancel]);
};
