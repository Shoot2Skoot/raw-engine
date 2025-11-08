/**
 * Unit tests for SheetEngine
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SheetEngine } from '../../src/engine/SheetEngine';
import { SheetBuilder } from '../../src/builders/SheetBuilder';

describe('SheetEngine', () => {
  let engine: SheetEngine;
  let testSheet: ReturnType<typeof SheetBuilder.create>;

  beforeEach(() => {
    testSheet = SheetBuilder.create('test-sheet')
      .name('Test Sheet')
      .size(400, 400)
      .addGridRegion('grid', 3, 3, 100, { x: 0, y: 0 }, ['number', 'checkbox'])
      .build();

    engine = new SheetEngine([testSheet]);
  });

  describe('initialization', () => {
    test('initializes with sheets', () => {
      expect(engine.getCurrentSheet()).toBeDefined();
      expect(engine.getCurrentSheetId()).toBe('test-sheet');
    });

    test('throws error with no sheets', () => {
      expect(() => new SheetEngine([])).toThrow();
    });
  });

  describe('sheet management', () => {
    test('gets current sheet', () => {
      const sheet = engine.getCurrentSheet();
      expect(sheet?.definition.id).toBe('test-sheet');
    });

    test('gets all sheet IDs', () => {
      const ids = engine.getAllSheetIds();
      expect(ids).toContain('test-sheet');
    });

    test('switches sheets', () => {
      const sheet2 = SheetBuilder.create('sheet-2')
        .name('Sheet 2')
        .size(400, 400)
        .addGridRegion('grid', 2, 2, 100, { x: 0, y: 0 }, ['number'])
        .build();

      const multiEngine = new SheetEngine([testSheet, sheet2]);
      multiEngine.switchSheet('sheet-2');
      expect(multiEngine.getCurrentSheetId()).toBe('sheet-2');
    });
  });

  describe('tool management', () => {
    test('sets current tool', () => {
      engine.setCurrentTool('number');
      expect(engine.getCurrentTool()).toBe('number');
    });

    test('sets current value', () => {
      engine.setCurrentValue(42);
      expect(engine.getCurrentValue()).toBe(42);
    });
  });

  describe('mark operations', () => {
    test('adds mark to hotspot', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      const result = engine.addMark('cell-0-0');

      expect(result).toBe(true);
      const sheet = engine.getCurrentSheet();
      const mark = sheet?.marks.get('cell-0-0');
      expect(mark).toBeDefined();
      expect(mark?.value).toBe(5);
    });

    test('rejects mark when tool not allowed', () => {
      engine.setCurrentTool('fill');
      const result = engine.addMark('cell-0-0');
      expect(result).toBe(false);
    });

    test('removes mark from hotspot', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0', 5);

      const result = engine.removeMark('cell-0-0');
      expect(result).toBe(true);

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });

    test('cycles checkbox marks', () => {
      engine.setCurrentTool('checkbox');

      // First click: checked
      engine.addMark('cell-0-0');
      let mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe('checked');

      // Second click: crossed
      engine.addMark('cell-0-0');
      mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe('crossed');

      // Third click: removed (empty)
      engine.addMark('cell-0-0');
      mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark).toBeUndefined();
    });
  });

  describe('hit detection', () => {
    test('finds hotspot at point', () => {
      const hotspot = engine.getHotspotAt({ x: 50, y: 50 });
      expect(hotspot).toBeDefined();
      expect(hotspot?.id).toBe('cell-0-0');
    });

    test('returns null for point outside hotspots', () => {
      const hotspot = engine.getHotspotAt({ x: 500, y: 500 });
      expect(hotspot).toBeNull();
    });

    test('gets hotspot by ID', () => {
      const hotspot = engine.getHotspotById('cell-0-0');
      expect(hotspot).toBeDefined();
      expect(hotspot?.id).toBe('cell-0-0');
    });
  });

  describe('undo/redo', () => {
    test('undo removes mark', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0', 5);

      expect(engine.canUndo()).toBe(true);
      engine.undo();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });

    test('redo restores mark', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0', 5);
      engine.undo();

      expect(engine.canRedo()).toBe(true);
      engine.redo();

      const sheet = engine.getCurrentSheet();
      const mark = sheet?.marks.get('cell-0-0');
      expect(mark?.value).toBe(5);
    });

    test('canUndo returns false when no history', () => {
      expect(engine.canUndo()).toBe(false);
    });

    test('canRedo returns false when at end of history', () => {
      engine.addMark('cell-0-0', 5);
      expect(engine.canRedo()).toBe(false);
    });
  });

  describe('serialization', () => {
    test('exports state', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0', 5);

      const state = engine.exportState();
      expect(state.version).toBe(1);
      expect(state.sheets).toHaveLength(1);
      expect(state.sheets[0].marks).toHaveLength(1);
    });

    test('imports state', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0', 5);

      const state = engine.exportState();
      engine.clearSheet();

      engine.importState(state);
      const sheet = engine.getCurrentSheet();
      const mark = sheet?.marks.get('cell-0-0');
      expect(mark?.value).toBe(5);
    });
  });

  describe('clear operations', () => {
    test('clears current sheet', () => {
      engine.addMark('cell-0-0', 5);
      engine.addMark('cell-1-1', 10);

      engine.clearSheet();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.size).toBe(0);
    });

    test('clears all sheets', () => {
      engine.addMark('cell-0-0', 5);
      engine.clearAllSheets();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.size).toBe(0);
    });
  });
});
