// hooks/useKeyboardNavigation.ts

import { useEffect, useState } from 'react';
import type { SheetEngine } from '../engine/SheetEngine';
import type { Hotspot } from '../engine/types';

export const useKeyboardNavigation = (
  engine: SheetEngine,
  allHotspots: Hotspot[]
) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+Tab = previous
            setFocusedIndex((prev) =>
              prev === 0 ? allHotspots.length - 1 : prev - 1
            );
          } else {
            // Tab = next
            setFocusedIndex((prev) =>
              prev === allHotspots.length - 1 ? 0 : prev + 1
            );
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          const hotspot = allHotspots[focusedIndex];
          if (hotspot) {
            engine.addMark(hotspot.id);
          }
          break;

        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          const targetHotspot = allHotspots[focusedIndex];
          if (targetHotspot) {
            engine.removeMark(targetHotspot.id);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev === allHotspots.length - 1 ? 0 : prev + 1
          );
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev === 0 ? allHotspots.length - 1 : prev - 1
          );
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Move down in grid (estimate 5 columns)
          setFocusedIndex((prev) =>
            Math.min(prev + 5, allHotspots.length - 1)
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          // Move up in grid (estimate 5 columns)
          setFocusedIndex((prev) =>
            Math.max(prev - 5, 0)
          );
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, allHotspots, focusedIndex]);

  return { focusedIndex, setFocusedIndex };
};
