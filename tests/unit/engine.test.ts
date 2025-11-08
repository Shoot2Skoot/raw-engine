import { describe, it, expect, beforeEach } from 'vitest';
import { SheetEngine } from '../../src/engine/SheetEngine';
import { SheetBuilder } from '../../src/builders/SheetBuilder';

describe('SheetEngine', () => {
  let engine: SheetEngine;

  beforeEach(() => {
    const testSheet = SheetBuilder.create('test')
      .name('Test Sheet')
      .size(400, 400)
      .addGridRegion('grid', 2, 2, 100, { x: 0, y: 0 }, ['number', 'checkbox'])
      .build();

    engine = new SheetEngine([testSheet]);
  });

  describe('initialization', () => {
    it('should initialize with sheets', () => {
      expect(engine.getCurrentSheet()).toBeDefined();
      expect(engine.getAllSheets()).toHaveLength(1);
    });

    it('should set first sheet as current', () => {
      expect(engine.getCurrentSheetId()).toBe('test');
    });
  });

  describe('tool management', () => {
    it('should change current tool', () => {
      engine.setCurrentTool('number');
      expect(engine.getCurrentTool()).toBe('number');

      engine.setCurrentTool('fill');
      expect(engine.getCurrentTool()).toBe('fill');
    });

    it('should set current value', () => {
      engine.setCurrentValue(42);
      expect(engine.getCurrentValue()).toBe(42);
    });
  });

  describe('mark placement', () => {
    it('should place valid mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);

      const result = engine.addMark('cell-0-0');

      expect(result).toBe(true);

      const sheet = engine.getCurrentSheet();
      const mark = sheet?.marks.get('cell-0-0');

      expect(mark).toBeDefined();
      expect(mark?.value).toBe(5);
      expect(mark?.type).toBe('number');
    });

    it('should reject mark when tool not allowed', () => {
      engine.setCurrentTool('fill');

      const result = engine.addMark('cell-0-0');

      expect(result).toBe(false);

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.has('cell-0-0')).toBe(false);
    });

    it('should allow cycling checkbox marks', () => {
      engine.setCurrentTool('checkbox');

      // First click - checked
      engine.addMark('cell-0-0');
      let mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe('checked');

      // Second click - crossed
      engine.addMark('cell-0-0');
      mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe('crossed');

      // Third click - removed
      engine.addMark('cell-0-0');
      mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark).toBeUndefined();
    });
  });

  describe('mark removal', () => {
    it('should remove existing mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(7);
      engine.addMark('cell-0-0');

      const result = engine.removeMark('cell-0-0');

      expect(result).toBe(true);
      expect(engine.getCurrentSheet()?.marks.has('cell-0-0')).toBe(false);
    });

    it('should return false when removing non-existent mark', () => {
      const result = engine.removeMark('cell-0-0');
      expect(result).toBe(false);
    });
  });

  describe('undo/redo', () => {
    it('should undo mark placement', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      expect(engine.canUndo()).toBe(true);

      engine.undo();

      expect(engine.getCurrentSheet()?.marks.has('cell-0-0')).toBe(false);
    });

    it('should redo mark placement', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');
      engine.undo();

      expect(engine.canRedo()).toBe(true);

      engine.redo();

      const mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe(5);
    });

    it('should clear redo history on new action', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');
      engine.undo();

      engine.setCurrentValue(10);
      engine.addMark('cell-1-1');

      expect(engine.canRedo()).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should export state', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const state = engine.exportState();

      expect(state.version).toBe(1);
      expect(state.sheets).toHaveLength(1);
      expect(state.sheets[0].marks).toHaveLength(1);
    });

    it('should import state', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const state = engine.exportState();

      // Clear and reimport
      engine.clearAllMarks();
      expect(engine.getCurrentSheet()?.marks.size).toBe(0);

      engine.importState(state);
      expect(engine.getCurrentSheet()?.marks.size).toBe(1);

      const mark = engine.getCurrentSheet()?.marks.get('cell-0-0');
      expect(mark?.value).toBe(5);
    });
  });

  describe('sheet switching', () => {
    it('should switch between sheets', () => {
      const sheet2 = SheetBuilder.create('test2')
        .name('Test Sheet 2')
        .size(400, 400)
        .addGridRegion('grid', 1, 1, 100, { x: 0, y: 0 }, ['number'])
        .build();

      const multiEngine = new SheetEngine([
        SheetBuilder.create('test1').name('Test 1').size(400, 400).build(),
        sheet2
      ]);

      expect(multiEngine.getCurrentSheetId()).toBe('test1');

      multiEngine.switchSheet('test2');

      expect(multiEngine.getCurrentSheetId()).toBe('test2');
    });
  });

  describe('hotspot detection', () => {
    it('should find hotspot at point', () => {
      const hotspot = engine.getHotspotAt({ x: 50, y: 50 });

      expect(hotspot).toBeDefined();
      expect(hotspot?.id).toBe('cell-0-0');
    });

    it('should return null for point with no hotspot', () => {
      const hotspot = engine.getHotspotAt({ x: 500, y: 500 });

      expect(hotspot).toBeNull();
    });

    it('should find hotspot by id', () => {
      const hotspot = engine.findHotspot('cell-1-1');

      expect(hotspot).toBeDefined();
      expect(hotspot?.id).toBe('cell-1-1');
    });
  });
});
