import { describe, test, expect, beforeEach } from 'vitest';
import { SheetEngine } from '../../src/engine/SheetEngine';
import { SheetBuilder } from '../../src/builders/SheetBuilder';

describe('Mark placement integration tests', () => {
  let engine: SheetEngine;

  beforeEach(() => {
    const sheet = SheetBuilder.create('test')
      .name('Test Sheet')
      .size(400, 400)
      .addGridRegion('grid', 2, 2, 100, { x: 0, y: 0 }, ['number', 'checkbox'])
      .build();

    engine = new SheetEngine([sheet]);
  });

  describe('Adding marks', () => {
    test('can place valid mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      const result = engine.addMark('cell-0-0');

      expect(result).toBe(true);
      const sheet = engine.getCurrentSheet();
      const mark = sheet?.marks.get('cell-0-0');
      expect(mark?.value).toBe(5);
      expect(mark?.type).toBe('number');
    });

    test('rejects mark when tool not allowed', () => {
      engine.setCurrentTool('fill');
      const result = engine.addMark('cell-0-0');

      expect(result).toBe(false);
      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')).toBeUndefined();
    });

    test('emits markAdded event on success', () => {
      let eventFired = false;
      engine.on('markAdded', () => {
        eventFired = true;
      });

      engine.setCurrentTool('number');
      engine.addMark('cell-0-0');

      expect(eventFired).toBe(true);
    });

    test('emits markRejected event on failure', () => {
      let eventFired = false;
      engine.on('markRejected', () => {
        eventFired = true;
      });

      engine.setCurrentTool('fill'); // Not allowed
      engine.addMark('cell-0-0');

      expect(eventFired).toBe(true);
    });
  });

  describe('Removing marks', () => {
    test('can remove existing mark', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const result = engine.removeMark('cell-0-0');

      expect(result).toBe(true);
      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')).toBeUndefined();
    });

    test('returns false when removing non-existent mark', () => {
      const result = engine.removeMark('cell-0-0');
      expect(result).toBe(false);
    });
  });

  describe('Toggling marks', () => {
    test('adds mark if none exists', () => {
      engine.setCurrentTool('checkbox');
      engine.toggleMark('cell-0-0');

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')).toBeDefined();
    });

    test('cycles checkbox states', () => {
      engine.setCurrentTool('checkbox');

      // First toggle: empty -> checked
      engine.toggleMark('cell-0-0');
      let sheet = engine.getCurrentSheet();
      let mark = sheet?.marks.get('cell-0-0');
      expect(mark?.value).toBe('checked');

      // Second toggle: checked -> crossed
      engine.toggleMark('cell-0-0');
      sheet = engine.getCurrentSheet();
      mark = sheet?.marks.get('cell-0-0');
      expect(mark?.value).toBe('crossed');

      // Third toggle: crossed -> removed
      engine.toggleMark('cell-0-0');
      sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')).toBeUndefined();
    });
  });

  describe('History and undo/redo', () => {
    test('can undo mark addition', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      expect(engine.canUndo()).toBe(true);
      engine.undo();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')).toBeUndefined();
    });

    test('can redo after undo', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');
      engine.undo();

      expect(engine.canRedo()).toBe(true);
      engine.redo();

      const sheet = engine.getCurrentSheet();
      expect(sheet?.marks.get('cell-0-0')?.value).toBe(5);
    });

    test('cannot undo when history is empty', () => {
      expect(engine.canUndo()).toBe(false);
    });

    test('cannot redo when at end of history', () => {
      engine.setCurrentTool('number');
      engine.addMark('cell-0-0');
      expect(engine.canRedo()).toBe(false);
    });
  });

  describe('Serialization', () => {
    test('exports state correctly', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');
      engine.setCurrentValue(7);
      engine.addMark('cell-0-1');

      const state = engine.exportState();

      expect(state.version).toBe(1);
      expect(state.sheets).toHaveLength(1);
      expect(state.sheets[0].marks).toHaveLength(2);
    });

    test('imports state correctly', () => {
      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      const state = engine.exportState();
      engine.clearAllMarks();

      expect(engine.getCurrentSheet()?.marks.size).toBe(0);

      engine.importState(state);

      expect(engine.getCurrentSheet()?.marks.size).toBe(1);
      expect(engine.getCurrentSheet()?.marks.get('cell-0-0')?.value).toBe(5);
    });
  });

  describe('Multi-sheet support', () => {
    test('can switch between sheets', () => {
      const sheet2 = SheetBuilder.create('test2')
        .name('Test Sheet 2')
        .size(400, 400)
        .addGridRegion('grid', 1, 1, 100, { x: 0, y: 0 }, ['number'])
        .build();

      engine = new SheetEngine([
        SheetBuilder.create('test1')
          .name('Test Sheet 1')
          .size(400, 400)
          .addGridRegion('grid', 1, 1, 100, { x: 0, y: 0 }, ['number'])
          .build(),
        sheet2
      ]);

      expect(engine.getCurrentSheet()?.definition.id).toBe('test1');

      engine.switchSheet('test2');

      expect(engine.getCurrentSheet()?.definition.id).toBe('test2');
    });

    test('marks are preserved when switching sheets', () => {
      const sheet1 = SheetBuilder.create('test1')
        .name('Test Sheet 1')
        .size(400, 400)
        .addGridRegion('grid', 1, 1, 100, { x: 0, y: 0 }, ['number'])
        .build();

      const sheet2 = SheetBuilder.create('test2')
        .name('Test Sheet 2')
        .size(400, 400)
        .addGridRegion('grid', 1, 1, 100, { x: 0, y: 0 }, ['number'])
        .build();

      engine = new SheetEngine([sheet1, sheet2]);

      engine.setCurrentTool('number');
      engine.setCurrentValue(5);
      engine.addMark('cell-0-0');

      engine.switchSheet('test2');
      engine.setCurrentValue(7);
      engine.addMark('cell-0-0');

      engine.switchSheet('test1');

      expect(engine.getCurrentSheet()?.marks.get('cell-0-0')?.value).toBe(5);
    });
  });
});
