// engine/SheetEngine.ts - Main engine class

import type {
  SheetDefinition,
  SheetState,
  MarkType,
  Mark,
  Hotspot,
  Point,
  EngineEvent,
  SaveState,
} from './types';
import { EventBus } from './EventBus';
import { HistoryManager, AddMarkCommand, RemoveMarkCommand } from './History';
import { Geometry } from '../utils/geometry';

type EventCallback = (event: EngineEvent) => void;

export class SheetEngine {
  private sheets: Map<string, SheetState> = new Map();
  private currentSheetId: string;
  private currentTool: MarkType = 'checkbox';
  private currentValue: string | number = '';
  private eventBus: EventBus = new EventBus();
  private history: HistoryManager = new HistoryManager();

  constructor(sheetDefinitions: SheetDefinition[]) {
    if (sheetDefinitions.length === 0) {
      throw new Error('At least one sheet definition is required');
    }

    // Initialize sheets with hotspot generation
    sheetDefinitions.forEach(def => {
      const regions = def.regions.map(region => {
        if (region.type === 'grid' && region.layout) {
          // Auto-generate hotspots for grid
          const hotspots = Geometry.generateGridHotspots(
            region.layout,
            ['number', 'checkbox'] // Default, can be overridden
          );
          return { ...region, hotspots };
        }
        return region;
      });

      this.sheets.set(def.id, {
        definition: { ...def, regions },
        marks: new Map(),
      });
    });

    this.currentSheetId = sheetDefinitions[0].id;
  }

  // Event subscription
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  // Sheet management
  getCurrentSheet(): SheetState | undefined {
    return this.sheets.get(this.currentSheetId);
  }

  getSheet(sheetId: string): SheetState | undefined {
    return this.sheets.get(sheetId);
  }

  getAllSheets(): SheetState[] {
    return Array.from(this.sheets.values());
  }

  switchSheet(sheetId: string): void {
    const previousId = this.currentSheetId;
    if (this.sheets.has(sheetId)) {
      this.currentSheetId = sheetId;
      this.eventBus.emit({
        type: 'sheetChanged',
        previousSheetId: previousId,
        currentSheetId: sheetId,
      });
    }
  }

  // Tool management
  setCurrentTool(tool: MarkType): void {
    const previous = this.currentTool;
    this.currentTool = tool;
    this.eventBus.emit({
      type: 'toolChanged',
      previousTool: previous,
      currentTool: tool,
    });
  }

  getCurrentTool(): MarkType {
    return this.currentTool;
  }

  setCurrentValue(value: string | number): void {
    this.currentValue = value;
  }

  getCurrentValue(): string | number {
    return this.currentValue;
  }

  // Hit detection
  getHotspotAt(point: Point, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    // Check all regions, respecting z-index
    const sortedRegions = [...sheet.definition.regions].sort(
      (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
    );

    for (const region of sortedRegions) {
      const hotspots = region.hotspots || [];
      for (const hotspot of hotspots) {
        if (Geometry.isPointInHotspot(point, hotspot)) {
          return hotspot;
        }
      }
    }

    return null;
  }

  // Find hotspot by ID
  getHotspotById(hotspotId: string, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }

    return null;
  }

  // Mark operations
  canPlaceMark(hotspot: Hotspot, tool?: MarkType): boolean {
    const markType = tool || this.currentTool;

    // Check if tool is allowed
    if (!hotspot.allowedMarkTypes.includes(markType)) {
      return false;
    }

    // Check mark limit
    if (hotspot.maxMarks && hotspot.currentMark) {
      return false; // Already at limit
    }

    return true;
  }

  addMark(hotspotId: string, sheetId?: string): boolean {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return false;

    // Find hotspot
    let targetHotspot: Hotspot | undefined;
    for (const region of sheet.definition.regions) {
      targetHotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (targetHotspot) break;
    }

    if (!targetHotspot || !this.canPlaceMark(targetHotspot)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: targetSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full',
      });
      return false;
    }

    // Create mark
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}`,
      type: this.currentTool,
      value: this.currentValue || this.getDefaultValue(this.currentTool),
      timestamp: Date.now(),
      isPermanent: this.currentTool !== 'pencil',
    };

    // Execute via history
    const command = new AddMarkCommand(
      targetSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Update hotspot reference
    targetHotspot.currentMark = mark;

    // Emit event
    this.eventBus.emit({
      type: 'markAdded',
      sheetId: targetSheetId,
      hotspotId,
      mark,
    });

    return true;
  }

  removeMark(hotspotId: string, sheetId?: string): boolean {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Find hotspot to clear its reference
    let targetHotspot: Hotspot | undefined;
    for (const region of sheet.definition.regions) {
      targetHotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (targetHotspot) break;
    }

    // Create remove command
    const command = new RemoveMarkCommand(
      targetSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Clear hotspot reference
    if (targetHotspot) {
      targetHotspot.currentMark = undefined;
    }

    // Emit event
    this.eventBus.emit({
      type: 'markRemoved',
      sheetId: targetSheetId,
      hotspotId,
      mark,
    });

    return true;
  }

  toggleMark(hotspotId: string, sheetId?: string): boolean {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return false;

    const existingMark = sheet.marks.get(hotspotId);
    if (existingMark) {
      // For cycling marks (checkbox, circle), cycle to next state
      if (existingMark.type === 'checkbox') {
        return this.cycleCheckbox(hotspotId, targetSheetId);
      } else if (existingMark.type === 'circle') {
        return this.cycleCircle(hotspotId, targetSheetId);
      } else {
        // For other types, remove the mark
        return this.removeMark(hotspotId, targetSheetId);
      }
    } else {
      // No mark exists, add one
      return this.addMark(hotspotId, targetSheetId);
    }
  }

  private cycleCheckbox(hotspotId: string, sheetId: string): boolean {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark || mark.type !== 'checkbox') return false;

    // Cycle: empty -> checked -> crossed -> empty (remove)
    if (mark.value === false || mark.value === 'empty') {
      this.currentValue = 'checked';
      this.removeMark(hotspotId, sheetId);
      return this.addMark(hotspotId, sheetId);
    } else if (mark.value === 'checked' || mark.value === true) {
      this.currentValue = 'crossed';
      this.removeMark(hotspotId, sheetId);
      return this.addMark(hotspotId, sheetId);
    } else {
      // crossed -> remove
      return this.removeMark(hotspotId, sheetId);
    }
  }

  private cycleCircle(hotspotId: string, sheetId: string): boolean {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark || mark.type !== 'circle') return false;

    // Cycle: empty -> half -> filled -> empty (remove)
    if (mark.value === 'empty') {
      this.currentValue = 'half';
      this.removeMark(hotspotId, sheetId);
      return this.addMark(hotspotId, sheetId);
    } else if (mark.value === 'half') {
      this.currentValue = 'filled';
      this.removeMark(hotspotId, sheetId);
      return this.addMark(hotspotId, sheetId);
    } else {
      // filled -> remove
      return this.removeMark(hotspotId, sheetId);
    }
  }

  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason,
    });
  }

  // History
  undo(): boolean {
    const result = this.history.undo();
    if (result) {
      // Update hotspot references after undo
      this.updateHotspotReferences();
    }
    return result;
  }

  redo(): boolean {
    const result = this.history.redo();
    if (result) {
      // Update hotspot references after redo
      this.updateHotspotReferences();
    }
    return result;
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  private updateHotspotReferences(): void {
    this.sheets.forEach(sheet => {
      // Clear all current marks
      sheet.definition.regions.forEach(region => {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      });

      // Reapply marks from state
      sheet.marks.forEach((mark, hotspotId) => {
        for (const region of sheet.definition.regions) {
          const hotspot = region.hotspots?.find(h => h.id === hotspotId);
          if (hotspot) {
            hotspot.currentMark = mark;
            break;
          }
        }
      });
    });
  }

  // Serialization
  exportState(): SaveState {
    const sheets = Array.from(this.sheets.entries()).map(([sheetId, sheet]) => ({
      sheetId,
      marks: Array.from(sheet.marks.entries()).map(([hotspotId, mark]) => ({
        hotspotId,
        mark,
      })),
    }));

    return {
      version: 1,
      timestamp: Date.now(),
      sheets,
    };
  }

  importState(saveState: SaveState): void {
    // Validate version
    if (saveState.version !== 1) {
      throw new Error(`Unsupported save state version: ${saveState.version}`);
    }

    // Clear current state
    this.sheets.forEach(sheet => sheet.marks.clear());
    this.history.clear();

    // Restore marks
    saveState.sheets.forEach(savedSheet => {
      const sheet = this.sheets.get(savedSheet.sheetId);
      if (sheet) {
        savedSheet.marks.forEach(({ hotspotId, mark }) => {
          sheet.marks.set(hotspotId, mark);

          // Update hotspot reference
          for (const region of sheet.definition.regions) {
            const hotspot = region.hotspots?.find(h => h.id === hotspotId);
            if (hotspot) {
              hotspot.currentMark = mark;
              break;
            }
          }
        });
      }
    });
  }

  private getDefaultValue(tool: MarkType): string | number | boolean {
    switch (tool) {
      case 'checkbox':
        return 'checked';
      case 'number':
        return 0;
      case 'fill':
        return '#cccccc';
      case 'circle':
        return 'empty';
      case 'symbol':
        return '★';
      case 'text':
        return '';
      case 'pencil':
        return '';
      default:
        return '';
    }
  }

  // Utility methods
  clearAllMarks(sheetId?: string): void {
    if (sheetId) {
      const sheet = this.sheets.get(sheetId);
      if (sheet) {
        sheet.marks.clear();
        sheet.definition.regions.forEach(region => {
          region.hotspots?.forEach(hotspot => {
            hotspot.currentMark = undefined;
          });
        });
      }
    } else {
      this.sheets.forEach(sheet => {
        sheet.marks.clear();
        sheet.definition.regions.forEach(region => {
          region.hotspots?.forEach(hotspot => {
            hotspot.currentMark = undefined;
          });
        });
      });
    }
    this.history.clear();
  }

  getMarkCount(sheetId?: string): number {
    if (sheetId) {
      return this.sheets.get(sheetId)?.marks.size || 0;
    }
    return Array.from(this.sheets.values()).reduce(
      (sum, sheet) => sum + sheet.marks.size,
      0
    );
  }
}
