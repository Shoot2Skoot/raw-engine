// engine/SheetEngine.ts - Main engine class

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

/**
 * Main engine class for the Roll-and-Write game engine
 * Manages sheets, marks, tools, and game state
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
          const hotspots = Geometry.generateGridHotspots(
            region.layout,
            region.hotspots?.[0]?.allowedMarkTypes || ['number', 'checkbox']
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

  // ============================================================================
  // Event Management
  // ============================================================================

  /**
   * Subscribe to engine events
   * @returns Unsubscribe function
   */
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  // ============================================================================
  // Sheet Management
  // ============================================================================

  /**
   * Get the current active sheet
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

  // ============================================================================
  // Tool Management
  // ============================================================================

  /**
   * Set the current drawing tool
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
   * Get the current drawing tool
   */
  getCurrentTool(): MarkType {
    return this.currentTool;
  }

  /**
   * Set the current value for the tool
   */
  setCurrentValue(value: string | number): void {
    this.currentValue = value;
  }

  /**
   * Get the current value for the tool
   */
  getCurrentValue(): string | number {
    return this.currentValue;
  }

  // ============================================================================
  // Hit Detection
  // ============================================================================

  /**
   * Find the hotspot at a given point on the current sheet
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

  // ============================================================================
  // Mark Operations
  // ============================================================================

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
   * @returns true if mark was added successfully
   */
  addMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
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
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full'
      });
      return false;
    }

    // Create mark
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}`,
      type: this.currentTool,
      value: this.currentValue || this.getDefaultValue(this.currentTool),
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

  /**
   * Remove a mark from a hotspot
   * @returns true if mark was removed successfully
   */
  removeMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const mark = sheet.marks.get(hotspotId);
    if (!mark) return false;

    // Find hotspot and clear reference
    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) {
        hotspot.currentMark = undefined;
        break;
      }
    }

    // Execute via history
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

  /**
   * Reject a mark attempt (for game logic validation)
   */
  rejectMark(hotspotId: string, reason: string = 'Invalid move'): void {
    this.eventBus.emit({
      type: 'markRejected',
      sheetId: this.currentSheetId,
      hotspotId,
      reason
    });
  }

  // ============================================================================
  // History (Undo/Redo)
  // ============================================================================

  /**
   * Undo the last action
   */
  undo(): boolean {
    const success = this.history.undo();
    if (success) {
      // Update hotspot references
      this.syncHotspotsWithMarks();
    }
    return success;
  }

  /**
   * Redo the next action
   */
  redo(): boolean {
    const success = this.history.redo();
    if (success) {
      // Update hotspot references
      this.syncHotspotsWithMarks();
    }
    return success;
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

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Export current state for saving
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
   * Import state from save
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

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Get default value for a mark type
   */
  private getDefaultValue(tool: MarkType): string | number | boolean {
    switch (tool) {
      case 'checkbox':
        return true;
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

  /**
   * Sync hotspot current mark references with the marks map
   * Used after undo/redo operations
   */
  private syncHotspotsWithMarks(): void {
    this.sheets.forEach(sheet => {
      // Clear all hotspot marks
      sheet.definition.regions.forEach(region => {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      });

      // Restore from marks map
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
}
