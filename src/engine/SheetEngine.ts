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
import { Serialization } from '../utils/serialization';

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
          const allowedMarkTypes = region.layout ? ['number', 'checkbox'] as MarkType[] : [];
          const hotspots = Geometry.generateGridHotspots(
            region.layout,
            allowedMarkTypes
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

  // ============ Event Subscription ============

  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  // ============ Sheet Management ============

  getCurrentSheet(): SheetState | undefined {
    return this.sheets.get(this.currentSheetId);
  }

  getSheet(sheetId: string): SheetState | undefined {
    return this.sheets.get(sheetId);
  }

  getAllSheets(): SheetState[] {
    return Array.from(this.sheets.values());
  }

  getCurrentSheetId(): string {
    return this.currentSheetId;
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

  // ============ Tool Management ============

  setCurrentTool(tool: MarkType): void {
    const previous = this.currentTool;
    if (previous !== tool) {
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

  // ============ Hit Detection ============

  getHotspotAt(point: Point, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    // Check all regions, respecting z-index (higher z-index = checked first)
    const sortedRegions = [...sheet.definition.regions].sort(
      (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
    );

    for (const region of sortedRegions) {
      const hotspots = region.hotspots || [];
      // Check hotspots in reverse order (later hotspots on top)
      for (let i = hotspots.length - 1; i >= 0; i--) {
        const hotspot = hotspots[i];
        if (Geometry.isPointInHotspot(point, hotspot)) {
          return hotspot;
        }
      }
    }

    return null;
  }

  findHotspot(hotspotId: string, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }

    return null;
  }

  // ============ Mark Operations ============

  canPlaceMark(hotspot: Hotspot, tool?: MarkType): boolean {
    const markType = tool || this.currentTool;

    // Check if tool is allowed
    if (!hotspot.allowedMarkTypes.includes(markType)) {
      return false;
    }

    // Check mark limit (default is 1)
    const maxMarks = hotspot.maxMarks ?? 1;
    if (maxMarks === 1 && hotspot.currentMark) {
      // For single-mark hotspots, check if we're cycling (like checkbox)
      if (this.isCyclicMarkType(markType)) {
        return true; // Can cycle to next state
      }
      return false; // Already has a mark
    }

    return true;
  }

  addMark(hotspotId: string, sheetId?: string): boolean {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return false;

    // Find hotspot
    const targetHotspot = this.findHotspot(hotspotId, targetSheetId);

    if (!targetHotspot || !this.canPlaceMark(targetHotspot)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: targetSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full'
      });
      return false;
    }

    // Handle cyclic marks (checkbox, circle)
    if (targetHotspot.currentMark && this.isCyclicMarkType(this.currentTool)) {
      const nextValue = this.getNextCyclicValue(
        this.currentTool,
        targetHotspot.currentMark.value
      );

      // If cycling back to empty, remove the mark
      if (nextValue === null) {
        return this.removeMark(hotspotId, targetSheetId);
      }

      // Update to next value
      const updatedMark: Mark = {
        ...targetHotspot.currentMark,
        value: nextValue,
        timestamp: Date.now()
      };

      // Remove old and add new (for undo/redo)
      const oldMark = targetHotspot.currentMark;
      const removeCommand = new RemoveMarkCommand(
        targetSheetId,
        hotspotId,
        oldMark,
        this.sheets
      );
      const addCommand = new AddMarkCommand(
        targetSheetId,
        hotspotId,
        updatedMark,
        this.sheets
      );

      // Execute both commands
      this.history.execute(removeCommand);
      this.history.execute(addCommand);

      this.eventBus.emit({
        type: 'markAdded',
        sheetId: targetSheetId,
        hotspotId,
        mark: updatedMark
      });

      return true;
    }

    // Create new mark
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}`,
      type: this.currentTool,
      value: this.currentValue || this.getDefaultValue(this.currentTool),
      timestamp: Date.now(),
      isPermanent: this.currentTool !== 'pencil',
      color: this.currentTool === 'fill' ? (this.currentValue as string || '#cccccc') : undefined
    };

    // Execute via history
    const command = new AddMarkCommand(
      targetSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Emit event
    this.eventBus.emit({
      type: 'markAdded',
      sheetId: targetSheetId,
      hotspotId,
      mark
    });

    return true;
  }

  removeMark(hotspotId: string, sheetId?: string): boolean {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Create remove command
    const command = new RemoveMarkCommand(
      targetSheetId,
      hotspotId,
      mark,
      this.sheets
    );
    this.history.execute(command);

    // Emit event
    this.eventBus.emit({
      type: 'markRemoved',
      sheetId: targetSheetId,
      hotspotId,
      mark
    });

    return true;
  }

  clearAllMarks(sheetId?: string): void {
    const targetSheetId = sheetId || this.currentSheetId;
    const sheet = this.sheets.get(targetSheetId);
    if (!sheet) return;

    // Remove all marks with undo support
    const hotspotIds = Array.from(sheet.marks.keys());
    hotspotIds.forEach(hotspotId => {
      this.removeMark(hotspotId, targetSheetId);
    });
  }

  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason
    });
  }

  // ============ History ============

  undo(): boolean {
    const result = this.history.undo();
    if (result) {
      // Force re-render by emitting an event
      this.eventBus.emit({
        type: 'toolChanged',
        previousTool: this.currentTool,
        currentTool: this.currentTool
      });
    }
    return result;
  }

  redo(): boolean {
    const result = this.history.redo();
    if (result) {
      // Force re-render by emitting an event
      this.eventBus.emit({
        type: 'toolChanged',
        previousTool: this.currentTool,
        currentTool: this.currentTool
      });
    }
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

  // ============ Serialization ============

  exportState(): SaveState {
    return Serialization.exportState(this.sheets);
  }

  importState(saveState: SaveState): void {
    Serialization.importState(saveState, this.sheets);

    // Clear history after import
    this.history.clear();

    // Emit event to trigger re-render
    this.eventBus.emit({
      type: 'sheetChanged',
      previousSheetId: this.currentSheetId,
      currentSheetId: this.currentSheetId
    });
  }

  saveToLocalStorage(key: string = 'roll-and-write-save'): void {
    const state = this.exportState();
    Serialization.saveToLocalStorage(key, state);
  }

  loadFromLocalStorage(key: string = 'roll-and-write-save'): boolean {
    const state = Serialization.loadFromLocalStorage(key);
    if (state) {
      this.importState(state);
      return true;
    }
    return false;
  }

  // ============ Helper Methods ============

  private isCyclicMarkType(type: MarkType): boolean {
    return type === 'checkbox' || type === 'circle';
  }

  private getNextCyclicValue(
    type: MarkType,
    currentValue: string | number | boolean
  ): string | boolean | null {
    if (type === 'checkbox') {
      if (currentValue === false || currentValue === 'unchecked') {
        return 'checked';
      } else if (currentValue === 'checked' || currentValue === true) {
        return 'crossed';
      } else {
        return null; // Back to empty
      }
    } else if (type === 'circle') {
      if (currentValue === 'empty') {
        return 'half';
      } else if (currentValue === 'half') {
        return 'filled';
      } else {
        return 'empty'; // Back to empty (but keep the mark)
      }
    }
    return null;
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
}
