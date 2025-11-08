// hooks/useKeyboardNavigation.ts

import { useState, useEffect, useMemo } from 'react';
import type { SheetEngine } from '../engine/SheetEngine';
import type { Hotspot } from '../engine/types';

export const useKeyboardNavigation = (engine: SheetEngine) => {
  const [focusedHotspotIndex, setFocusedHotspotIndex] = useState(0);

  // Get all hotspots from current sheet
  const allHotspots = useMemo((): Hotspot[] => {
    const sheet = engine.getCurrentSheet();
    if (!sheet) return [];

    return sheet.definition.regions.flatMap(r => r.hotspots || []);
  }, [engine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tab navigation
      if (e.key === 'Tab') {
        e.preventDefault();
        const newIndex = e.shiftKey
          ? (focusedHotspotIndex - 1 + allHotspots.length) % allHotspots.length
          : (focusedHotspotIndex + 1) % allHotspots.length;
        setFocusedHotspotIndex(newIndex);
      }

      // Arrow key navigation
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newIndex = focusedHotspotIndex;

        switch (e.key) {
          case 'ArrowUp':
            newIndex = Math.max(0, focusedHotspotIndex - 1);
            break;
          case 'ArrowDown':
            newIndex = Math.min(allHotspots.length - 1, focusedHotspotIndex + 1);
            break;
          case 'ArrowLeft':
            newIndex = Math.max(0, focusedHotspotIndex - 1);
            break;
          case 'ArrowRight':
            newIndex = Math.min(allHotspots.length - 1, focusedHotspotIndex + 1);
            break;
        }

        setFocusedHotspotIndex(newIndex);
      }

      // Enter or Space to mark
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const hotspot = allHotspots[focusedHotspotIndex];
        if (hotspot) {
          engine.toggleMark(hotspot.id);
        }
      }

      // Delete/Backspace to remove mark
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const hotspot = allHotspots[focusedHotspotIndex];
        if (hotspot) {
          engine.removeMark(hotspot.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedHotspotIndex, allHotspots, engine]);

  return {
    focusedHotspotIndex,
    focusedHotspot: allHotspots[focusedHotspotIndex],
    allHotspots
  };
};
