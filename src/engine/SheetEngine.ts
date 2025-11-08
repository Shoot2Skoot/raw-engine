// engine/SheetEngine.ts

import type {
  SheetDefinition,
  SheetState,
  MarkType,
  Mark,
  Hotspot,
  Point,
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

    this.currentSheetId = sheetDefinitions[0]?.id || '';
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

  getAllSheets(): SheetDefinition[] {
    return Array.from(this.sheets.values()).map(sheet => sheet.definition);
  }

  switchSheet(sheetId: string): void {
    const previousId = this.currentSheetId;
    if (this.sheets.has(sheetId)) {
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

  // Tool management
  setCurrentTool(tool: MarkType): void {
    const previous = this.currentTool;
    this.currentTool = tool;
    this.eventBus.emit({
      type: 'toolChanged',
      previousTool: previous,
      currentTool: tool
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
  getHotspotAt(point: Point): Hotspot | null {
    const sheet = this.getCurrentSheet();
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

  getHotspotById(hotspotId: string): Hotspot | null {
    const sheet = this.getCurrentSheet();
    if (!sheet) return null;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }
    return null;
  }

  // Mark operations
  canPlaceMark(hotspot: Hotspot): boolean {
    // Check if tool is allowed
    if (!hotspot.allowedMarkTypes.includes(this.currentTool)) {
      return false;
    }

    // Check mark limit
    if (hotspot.maxMarks && hotspot.currentMark) {
      return false; // Already at limit
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

    // For checkbox and circle types, cycle through states if already marked
    if ((this.currentTool === 'checkbox' || this.currentTool === 'circle') && targetHotspot.currentMark) {
      return this.cycleMark(hotspotId);
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

    // Use provided value or current value or default
    const markValue = value !== undefined ? value :
                      this.currentValue !== '' ? this.currentValue :
                      this.getDefaultValue(this.currentTool);

    // Create mark
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

    // Update hotspot reference
    targetHotspot.currentMark = mark;

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

    // Find hotspot
    let targetHotspot: Hotspot | undefined;
    for (const region of sheet.definition.regions) {
      targetHotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (targetHotspot) break;
    }

    // Create remove command
    const command = new RemoveMarkCommand(
      this.currentSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Update hotspot reference
    if (targetHotspot) {
      targetHotspot.currentMark = undefined;
    }

    // Emit event
    this.eventBus.emit({
      type: 'markRemoved',
      sheetId: this.currentSheetId,
      hotspotId,
      mark
    });

    return true;
  }

  // Cycle through states for checkbox and circle marks
  private cycleMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const currentMark = sheet.marks.get(hotspotId);
    if (!currentMark) return false;

    let newValue: string | number | boolean = '';

    if (currentMark.type === 'checkbox') {
      // Empty → Checked → Crossed → (remove)
      if (currentMark.value === false || currentMark.value === 'empty') {
        newValue = 'checked';
      } else if (currentMark.value === 'checked') {
        newValue = 'crossed';
      } else {
        // Remove the mark
        return this.removeMark(hotspotId);
      }
    } else if (currentMark.type === 'circle') {
      // Empty → Half → Full → (remove)
      if (currentMark.value === 'empty') {
        newValue = 'half';
      } else if (currentMark.value === 'half') {
        newValue = 'filled';
      } else {
        return this.removeMark(hotspotId);
      }
    }

    // Remove old mark and add new one
    this.removeMark(hotspotId);

    // Temporarily set the value
    const oldValue = this.currentValue;
    this.currentValue = newValue;
    const result = this.addMark(hotspotId);
    this.currentValue = oldValue;

    return result;
  }

  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason
    });
  }

  // History
  undo(): boolean {
    const result = this.history.undo();
    if (result) {
      // Update hotspot references
      this.updateHotspotReferences();
    }
    return result;
  }

  redo(): boolean {
    const result = this.history.redo();
    if (result) {
      // Update hotspot references
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

  // Update hotspot references after undo/redo
  private updateHotspotReferences(): void {
    for (const [, sheet] of this.sheets) {
      for (const region of sheet.definition.regions) {
        if (region.hotspots) {
          for (const hotspot of region.hotspots) {
            const mark = sheet.marks.get(hotspot.id);
            hotspot.currentMark = mark;
          }
        }
      }
    }
  }

  // Serialization
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
    }
  }

  // Clear all marks
  clearAllMarks(): void {
    const sheet = this.getCurrentSheet();
    if (!sheet) return;

    sheet.marks.clear();
    for (const region of sheet.definition.regions) {
      if (region.hotspots) {
        for (const hotspot of region.hotspots) {
          hotspot.currentMark = undefined;
        }
      }
    }
    this.history.clear();
  }

  // Get all marks for current sheet
  getAllMarks(): Map<string, Mark> {
    const sheet = this.getCurrentSheet();
    return sheet ? sheet.marks : new Map();
  }
}
