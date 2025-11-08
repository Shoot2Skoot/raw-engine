// engine/SheetEngine.ts

import type {
  SheetDefinition,
  SheetState,
  Point,
  Hotspot,
  Mark,
  MarkType,
  SaveState,
  EngineEvent,
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
    sheetDefinitions.forEach((def) => {
      const regions = def.regions.map((region) => {
        if (region.type === 'grid' && region.layout) {
          // Auto-generate hotspots for grid
          const hotspots = Geometry.generateGridHotspots(
            region.layout,
            region.hotspots?.[0]?.allowedMarkTypes || ['number', 'checkbox'] // Use existing or default
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

  // Find hotspot by ID
  findHotspot(hotspotId: string, sheetId?: string): Hotspot | undefined {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return undefined;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find((h) => h.id === hotspotId);
      if (hotspot) return hotspot;
    }
    return undefined;
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
    const targetHotspot = this.findHotspot(hotspotId);

    if (!targetHotspot || !this.canPlaceMark(targetHotspot)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full',
      });
      return false;
    }

    // Create mark
    const markValue = value !== undefined ? value : this.currentValue || this.getDefaultValue(this.currentTool);
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}`,
      type: this.currentTool,
      value: markValue,
      timestamp: Date.now(),
      isPermanent: this.currentTool !== 'pencil',
      color: this.currentTool === 'fill' ? String(markValue) : undefined,
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
      mark,
    });

    return true;
  }

  removeMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Find hotspot and clear current mark
    const targetHotspot = this.findHotspot(hotspotId);

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
      mark,
    });

    return true;
  }

  toggleMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const existingMark = sheet.marks.get(hotspotId);

    // If mark exists and is same type, cycle or remove
    if (existingMark && existingMark.type === this.currentTool) {
      // For checkbox, cycle through states
      if (this.currentTool === 'checkbox') {
        const currentValue = existingMark.value;
        let newValue: boolean | string;

        if (currentValue === false || currentValue === 'empty') {
          newValue = 'checked';
        } else if (currentValue === 'checked') {
          newValue = 'crossed';
        } else {
          // Remove mark and return
          return this.removeMark(hotspotId);
        }

        // Remove old mark
        this.removeMark(hotspotId);
        // Add new mark with new value
        return this.addMark(hotspotId, newValue);
      }

      // For circle, cycle through states
      if (this.currentTool === 'circle') {
        const currentValue = existingMark.value;
        let newValue: string;

        if (currentValue === 'empty') {
          newValue = 'half';
        } else if (currentValue === 'half') {
          newValue = 'filled';
        } else {
          // Remove mark and return
          return this.removeMark(hotspotId);
        }

        this.removeMark(hotspotId);
        return this.addMark(hotspotId, newValue);
      }

      // For other types, just remove
      return this.removeMark(hotspotId);
    }

    // No existing mark or different type, add new mark
    return this.addMark(hotspotId);
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
      // Update hotspot references
      this.syncHotspotMarks();
    }
    return result;
  }

  redo(): boolean {
    const result = this.history.redo();
    if (result) {
      // Update hotspot references
      this.syncHotspotMarks();
    }
    return result;
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  // Sync hotspot currentMark references with marks map
  private syncHotspotMarks(): void {
    this.sheets.forEach((sheet) => {
      sheet.definition.regions.forEach((region) => {
        region.hotspots?.forEach((hotspot) => {
          const mark = sheet.marks.get(hotspot.id);
          hotspot.currentMark = mark;
        });
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
    this.sheets.forEach((sheet) => sheet.marks.clear());
    this.history.clear();

    // Restore marks
    saveState.sheets.forEach((savedSheet) => {
      const sheet = this.sheets.get(savedSheet.sheetId);
      if (sheet) {
        savedSheet.marks.forEach(({ hotspotId, mark }) => {
          sheet.marks.set(hotspotId, mark);

          // Update hotspot reference
          for (const region of sheet.definition.regions) {
            const hotspot = region.hotspots?.find((h) => h.id === hotspotId);
            if (hotspot) {
              hotspot.currentMark = mark;
              break;
            }
          }
        });
      }
    });
  }

  saveToLocalStorage(key: string = 'roll-and-write-save'): void {
    try {
      const state = this.exportState();
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  loadFromLocalStorage(key: string = 'roll-and-write-save'): boolean {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved) as SaveState;
        this.importState(state);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  clearLocalStorage(key: string = 'roll-and-write-save'): void {
    localStorage.removeItem(key);
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
