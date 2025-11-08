import type {
  SheetDefinition,
  SheetState,
  MarkType,
  Point,
  Hotspot,
  Mark,
  EngineEvent,
  SaveState,
} from './types';
import { EventBus } from './EventBus';
import { HistoryManager, AddMarkCommand, RemoveMarkCommand } from './History';
import { Geometry } from '../utils/geometry';

type EventCallback = (event: EngineEvent) => void;

/**
 * Main sheet engine class
 * Manages sheets, marking, undo/redo, and events
 */
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
          const allowedMarkTypes = region.layout.type === 'grid'
            ? ['number', 'checkbox'] as MarkType[]
            : ['number', 'checkbox'] as MarkType[];

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

    this.currentSheetId = sheetDefinitions[0]?.id || '';
  }

  // ========== Event subscription ==========

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  // ========== Sheet management ==========

  /**
   * Get the current sheet state
   */
  getCurrentSheet(): SheetState | undefined {
    return this.sheets.get(this.currentSheetId);
  }

  /**
   * Get a specific sheet by ID
   */
  getSheet(sheetId: string): SheetState | undefined {
    return this.sheets.get(sheetId);
  }

  /**
   * Get all sheet IDs
   */
  getSheetIds(): string[] {
    return Array.from(this.sheets.keys());
  }

  /**
   * Switch to a different sheet
   */
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

  // ========== Tool management ==========

  /**
   * Set the current marking tool
   */
  setCurrentTool(tool: MarkType): void {
    const previous = this.currentTool;
    this.currentTool = tool;
    this.eventBus.emit({
      type: 'toolChanged',
      previousTool: previous,
      currentTool: tool
    });
  }

  /**
   * Get the current tool
   */
  getCurrentTool(): MarkType {
    return this.currentTool;
  }

  /**
   * Set the current value for tools that need it
   */
  setCurrentValue(value: string | number): void {
    this.currentValue = value;
  }

  /**
   * Get the current value
   */
  getCurrentValue(): string | number {
    return this.currentValue;
  }

  // ========== Hit detection ==========

  /**
   * Find hotspot at a given point on the current sheet
   */
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

  /**
   * Get hotspot by ID in a specific sheet
   */
  private getHotspot(sheetId: string, hotspotId: string): Hotspot | undefined {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return undefined;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }

    return undefined;
  }

  // ========== Mark operations ==========

  /**
   * Check if a mark can be placed on a hotspot
   */
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

  /**
   * Add a mark to a hotspot
   */
  addMark(hotspotId: string, value?: string | number): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    // Find hotspot
    const targetHotspot = this.getHotspot(this.currentSheetId, hotspotId);

    if (!targetHotspot || !this.canPlaceMark(targetHotspot)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full'
      });
      return false;
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
      this.sheets,
      (sheetId, hotspotId) => this.getHotspot(sheetId, hotspotId)
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

  /**
   * Remove a mark from a hotspot
   */
  removeMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Execute via history
    const command = new RemoveMarkCommand(
      this.currentSheetId,
      hotspotId,
      this.sheets,
      (sheetId, hotspotId) => this.getHotspot(sheetId, hotspotId)
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

  /**
   * Reject a mark placement (for game logic validation)
   */
  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason
    });
  }

  /**
   * Toggle a checkbox or circle mark through its states
   */
  toggleMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const hotspot = this.getHotspot(this.currentSheetId, hotspotId);
    if (!hotspot) return false;

    const currentMark = hotspot.currentMark;

    if (this.currentTool === 'checkbox') {
      let newValue: string | boolean = 'checked';

      if (!currentMark) {
        newValue = 'checked';
      } else if (currentMark.value === 'checked') {
        newValue = 'crossed';
      } else {
        // Remove mark if crossed
        return this.removeMark(hotspotId);
      }

      return this.addMark(hotspotId, newValue);
    } else if (this.currentTool === 'circle') {
      let newValue = 'half';

      if (!currentMark) {
        newValue = 'empty';
      } else if (currentMark.value === 'empty') {
        newValue = 'half';
      } else if (currentMark.value === 'half') {
        newValue = 'filled';
      } else {
        // Remove mark if filled
        return this.removeMark(hotspotId);
      }

      return this.addMark(hotspotId, newValue);
    }

    return false;
  }

  // ========== History ==========

  /**
   * Undo the last action
   */
  undo(): boolean {
    return this.history.undo();
  }

  /**
   * Redo the next action
   */
  redo(): boolean {
    return this.history.redo();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history.clear();
  }

  // ========== Serialization ==========

  /**
   * Export current state
   */
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

  /**
   * Import saved state
   */
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
          const hotspot = this.getHotspot(savedSheet.sheetId, hotspotId);
          if (hotspot) {
            hotspot.currentMark = mark;
          }
        });
      }
    });
  }

  /**
   * Clear all marks from all sheets
   */
  clearAllMarks(): void {
    this.sheets.forEach(sheet => {
      sheet.marks.clear();
      sheet.definition.regions.forEach(region => {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      });
    });
    this.history.clear();
  }

  // ========== Helpers ==========

  /**
   * Get default value for a mark type
   */
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
