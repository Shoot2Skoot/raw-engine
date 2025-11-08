/**
 * Integration tests for SheetEngine
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SheetEngine } from '../../engine/SheetEngine';
import { SheetBuilder } from '../../builders/SheetBuilder';

describe('SheetEngine', () => {
  let engine: SheetEngine;

  beforeEach(() => {
    const testSheet = SheetBuilder.create('test')
      .name('Test Sheet')
      .size(400, 400)
      .addGridRegion('grid', 3, 3, 100, { x: 0, y: 0 }, ['number', 'checkbox'])
      .build();

    engine = new SheetEngine([testSheet]);
  });

  describe('Mark operations', () => {
    test('can add a mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      const result = engine.addMark('cell-0-0');

      expect(result).toBe(true);
      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')?.value).toBe(5);
    });

    test('rejects mark when tool not allowed', () => {
      engine.setCurrentTool('fill'); // Not in allowed types
      const result = engine.addMark('cell-0-0');

      expect(result).toBe(false);
    });

    test('can remove a mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const result = engine.removeMark('cell-0-0');
      expect(result).toBe(true);

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });

    test('can toggle mark', () => {
      engine.setCurrentTool('checkbox');

      // Toggle on
      engine.toggleMark('cell-0-0');
      let sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(true);

      // Toggle off
      engine.toggleMark('cell-0-0');
      sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });
  });

  describe('History operations', () => {
    test('can undo mark addition', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      expect(engine.canUndo()).toBe(true);
      engine.undo();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });

    test('can redo mark addition', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');
      engine.undo();

      expect(engine.canRedo()).toBe(true);
      engine.redo();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')?.value).toBe(5);
    });

    test('cannot undo when no history', () => {
      expect(engine.canUndo()).toBe(false);
      expect(engine.undo()).toBe(false);
    });

    test('cannot redo when at end of history', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0');

      expect(engine.canRedo()).toBe(false);
      expect(engine.redo()).toBe(false);
    });
  });

  describe('Serialization', () => {
    test('can export state', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const state = engine.exportState();

      expect(state.version).toBe(1);
      expect(state.sheets).toHaveLength(1);
      expect(state.sheets[0].marks).toHaveLength(1);
    });

    test('can import state', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const state = engine.exportState();

      // Create new engine
      const testSheet = SheetBuilder.create('test')
        .name('Test Sheet')
        .size(400, 400)
        .addGridRegion('grid', 3, 3, 100, { x: 0, y: 0 }, ['number', 'checkbox'])
        .build();

      const newEngine = new SheetEngine([testSheet]);
      newEngine.importState(state);

      const sheet = newEngine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')?.value).toBe(5);
    });
  });

  describe('Tool management', () => {
    test('can change tool', () => {
      engine.setCurrentTool('number');
      expect(engine.getCurrentTool()).toBe('number');

      engine.setCurrentTool('checkbox');
      expect(engine.getCurrentTool()).toBe('checkbox');
    });

    test('emits toolChanged event', () => {
      let eventFired = false;
      engine.on('toolChanged', () => {
        eventFired = true;
      });

      engine.setCurrentTool('number');
      expect(eventFired).toBe(true);
    });
  });

  describe('Hit detection', () => {
    test('finds hotspot at position', () => {
      const hotspot = engine.getHotspotAt({ x: 50, y: 50 });
      expect(hotspot).not.toBeNull();
      expect(hotspot?.id).toBe('cell-0-0');
    });

    test('returns null when no hotspot at position', () => {
      const hotspot = engine.getHotspotAt({ x: 500, y: 500 });
      expect(hotspot).toBeNull();
    });
  });

  describe('Statistics', () => {
    test('reports correct stats', () => {
      const initialStats = engine.getStats();
      expect(initialStats.totalHotspots).toBe(9);
      expect(initialStats.markedHotspots).toBe(0);

      engine.setCurrentTool('number');
      engine.addMark('cell-0-0');

      const updatedStats = engine.getStats();
      expect(updatedStats.markedHotspots).toBe(1);
      expect(updatedStats.permanentMarks).toBe(1);
    });
  });
});
