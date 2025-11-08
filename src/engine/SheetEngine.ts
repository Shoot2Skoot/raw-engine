/**
 * Main Sheet Engine - The core of the roll-and-write drawing system
 */

import type {
  SheetDefinition,
  SheetState,
  Mark,
  MarkType,
  Point,
  Hotspot,
  EngineEvent,
  SaveState
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
            region.layout.type === 'grid' ? ['number', 'checkbox'] : []
          );
          return { ...region, hotspots };
        }
        return region;
      });

      this.sheets.set(def.id, {
        definition: { ...def, regions },
        marks: new Map()
      });
    });

    this.currentSheetId = sheetDefinitions[0].id;
  }

  // ============================================================
  // Event subscription
  // ============================================================

  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  // ============================================================
  // Sheet management
  // ============================================================

  getCurrentSheet(): SheetState | undefined {
    return this.sheets.get(this.currentSheetId);
  }

  getSheet(sheetId: string): SheetState | undefined {
    return this.sheets.get(sheetId);
  }

  getAllSheetIds(): string[] {
    return Array.from(this.sheets.keys());
  }

  switchSheet(sheetId: string): void {
    const previousId = this.currentSheetId;
    if (this.sheets.has(sheetId) && sheetId !== previousId) {
      this.currentSheetId = sheetId;
      this.eventBus.emit({
        type: 'sheetChanged',
        previousSheetId: previousId,
        currentSheetId: sheetId
      });
    }
  }

  getCurrentSheetId(): string {
    return this.currentSheetId;
  }

  // ============================================================
  // Tool management
  // ============================================================

  setCurrentTool(tool: MarkType): void {
    const previous = this.currentTool;
    if (tool !== previous) {
      this.currentTool = tool;
      this.eventBus.emit({
        type: 'toolChanged',
        previousTool: previous,
        currentTool: tool
      });
    }
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

  // ============================================================
  // Hit detection
  // ============================================================

  getHotspotAt(point: Point, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    // Check all regions, respecting z-index (higher z-index = on top)
    const sortedRegions = [...sheet.definition.regions].sort(
      (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
    );

    for (const region of sortedRegions) {
      const hotspots = region.hotspots || [];
      // Check in reverse order so top-most hotspots are checked first
      for (let i = hotspots.length - 1; i >= 0; i--) {
        const hotspot = hotspots[i];
        if (Geometry.isPointInHotspot(point, hotspot)) {
          return hotspot;
        }
      }
    }

    return null;
  }

  getHotspotById(hotspotId: string, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }

    return null;
  }

  // ============================================================
  // Mark operations
  // ============================================================

  canPlaceMark(hotspot: Hotspot, tool?: MarkType): boolean {
    const markType = tool || this.currentTool;

    // Check if tool is allowed
    if (!hotspot.allowedMarkTypes.includes(markType)) {
      return false;
    }

    // Check mark limit
    const maxMarks = hotspot.maxMarks ?? 1;
    if (maxMarks === 1 && hotspot.currentMark) {
      // For single-mark hotspots, allow cycling/replacement
      return true;
    }

    return true;
  }

  addMark(hotspotId: string, value?: string | number): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    // Find hotspot
    let targetHotspot: Hotspot | undefined;
    for (const region of sheet.definition.regions) {
      targetHotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (targetHotspot) break;
    }

    if (!targetHotspot) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Hotspot not found'
      });
      return false;
    }

    if (!this.canPlaceMark(targetHotspot)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full'
      });
      return false;
    }

    // Handle cycling for checkbox and circle
    if (this.currentTool === 'checkbox' && targetHotspot.currentMark) {
      return this.cycleCheckbox(hotspotId);
    }
    if (this.currentTool === 'circle' && targetHotspot.currentMark) {
      return this.cycleCircle(hotspotId);
    }

    // If hotspot already has a mark, remove it first
    if (targetHotspot.currentMark) {
      this.removeMark(hotspotId);
    }

    // Create mark
    const markValue = value !== undefined ? value : (this.currentValue || this.getDefaultValue(this.currentTool));
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}`,
      type: this.currentTool,
      value: markValue,
      timestamp: Date.now(),
      isPermanent: this.currentTool !== 'pencil'
    };

    // Execute via history
    const command = new AddMarkCommand(
      this.currentSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Emit event
    this.eventBus.emit({
      type: 'markAdded',
      sheetId: this.currentSheetId,
      hotspotId,
      mark
    });

    return true;
  }

  removeMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Create remove command
    const command = new RemoveMarkCommand(
      this.currentSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Emit event
    this.eventBus.emit({
      type: 'markRemoved',
      sheetId: this.currentSheetId,
      hotspotId,
      mark
    });

    return true;
  }

  private cycleCheckbox(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const currentMark = sheet.marks.get(hotspotId);
    if (!currentMark || currentMark.type !== 'checkbox') return false;

    // Cycle: empty → checked → crossed → empty
    let newValue: boolean | string;
    if (currentMark.value === false || currentMark.value === 'empty') {
      newValue = 'checked';
    } else if (currentMark.value === 'checked' || currentMark.value === true) {
      newValue = 'crossed';
    } else {
      // Remove the mark to go back to empty
      return this.removeMark(hotspotId);
    }

    // Remove old mark and add new one
    this.removeMark(hotspotId);
    return this.addMark(hotspotId, newValue);
  }

  private cycleCircle(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const currentMark = sheet.marks.get(hotspotId);
    if (!currentMark || currentMark.type !== 'circle') return false;

    // Cycle: empty → half → filled → empty
    let newValue: string;
    if (currentMark.value === 'empty') {
      newValue = 'half';
    } else if (currentMark.value === 'half') {
      newValue = 'filled';
    } else {
      // Remove the mark to go back to empty
      return this.removeMark(hotspotId);
    }

    // Remove old mark and add new one
    this.removeMark(hotspotId);
    return this.addMark(hotspotId, newValue);
  }

  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason
    });
  }

  // ============================================================
  // History (Undo/Redo)
  // ============================================================

  undo(): boolean {
    const result = this.history.undo();
    return result;
  }

  redo(): boolean {
    const result = this.history.redo();
    return result;
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  clearHistory(): void {
    this.history.clear();
  }

  // ============================================================
  // Serialization
  // ============================================================

  exportState(): SaveState {
    const sheets = Array.from(this.sheets.entries()).map(([sheetId, sheet]) => ({
      sheetId,
      marks: Array.from(sheet.marks.entries()).map(([hotspotId, mark]) => ({
        hotspotId,
        mark
      }))
    }));

    return {
      version: 1,
      timestamp: Date.now(),
      sheets
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

  // ============================================================
  // Utilities
  // ============================================================

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

  /**
   * Clear all marks from current sheet
   */
  clearSheet(sheetId?: string): void {
    const targetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetId);
    if (sheet) {
      sheet.marks.clear();

      // Clear hotspot references
      sheet.definition.regions.forEach(region => {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      });

      this.history.clear();
    }
  }

  /**
   * Clear all marks from all sheets
   */
  clearAllSheets(): void {
    this.sheets.forEach(sheet => {
      sheet.marks.clear();

      // Clear hotspot references
      sheet.definition.regions.forEach(region => {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      });
    });

    this.history.clear();
  }
}
