/**
 * Main Sheet Engine - Core state management and operations
 */

import type {
  SheetDefinition,
  SheetState,
  MarkType,
  Point,
  Hotspot,
  Mark,
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
    if (!sheetDefinitions || sheetDefinitions.length === 0) {
      throw new Error('At least one sheet definition is required');
    }

    // Initialize sheets with hotspot generation
    sheetDefinitions.forEach(def => {
      const regions = def.regions.map(region => {
        if (region.type === 'grid' && region.layout) {
          // Auto-generate hotspots for grid
          const hotspots = Geometry.generateGridHotspots(
            region.layout,
            region.hotspots?.[0]?.allowedMarkTypes || ['number', 'checkbox'] // Use first hotspot's marks or defaults
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

  // ============================================================================
  // Event Management
  // ============================================================================

  /**
   * Subscribe to engine events
   */
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.on(eventType, callback);
  }

  /**
   * Subscribe to an event once
   */
  once(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    return this.eventBus.once(eventType, callback);
  }

  /**
   * Unsubscribe from events
   */
  off(eventType: EngineEvent['type'], callback: EventCallback): void {
    this.eventBus.off(eventType, callback);
  }

  // ============================================================================
  // Sheet Management
  // ============================================================================

  /**
   * Get current active sheet
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
   * Get current sheet ID
   */
  getCurrentSheetId(): string {
    return this.currentSheetId;
  }

  /**
   * Switch to a different sheet
   */
  switchSheet(sheetId: string): boolean {
    const previousId = this.currentSheetId;
    if (this.sheets.has(sheetId) && sheetId !== previousId) {
      this.currentSheetId = sheetId;
      this.eventBus.emit({
        type: 'sheetChanged',
        previousSheetId: previousId,
        currentSheetId: sheetId
      });
      return true;
    }
    return false;
  }

  // ============================================================================
  // Tool Management
  // ============================================================================

  /**
   * Set the current drawing tool
   */
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

  /**
   * Get the current tool
   */
  getCurrentTool(): MarkType {
    return this.currentTool;
  }

  /**
   * Set the current value for marks
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

  // ============================================================================
  // Hit Detection
  // ============================================================================

  /**
   * Find hotspot at a given point
   */
  getHotspotAt(point: Point, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    // Check all regions, respecting z-index
    const sortedRegions = [...sheet.definition.regions].sort(
      (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
    );

    for (const region of sortedRegions) {
      const hotspots = region.hotspots || [];
      // Check in reverse order (top to bottom)
      for (let i = hotspots.length - 1; i >= 0; i--) {
        const hotspot = hotspots[i];
        if (Geometry.isPointInHotspot(point, hotspot)) {
          return hotspot;
        }
      }
    }

    return null;
  }

  /**
   * Get a specific hotspot by ID
   */
  getHotspot(hotspotId: string, sheetId?: string): Hotspot | null {
    const sheet = sheetId ? this.sheets.get(sheetId) : this.getCurrentSheet();
    if (!sheet) return null;

    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) return hotspot;
    }

    return null;
  }

  // ============================================================================
  // Mark Operations
  // ============================================================================

  /**
   * Check if a mark can be placed on a hotspot
   */
  canPlaceMark(hotspot: Hotspot, tool?: MarkType): boolean {
    const markType = tool || this.currentTool;

    // Check if tool is allowed
    if (!hotspot.allowedMarkTypes.includes(markType)) {
      return false;
    }

    // Check mark limit
    const maxMarks = hotspot.maxMarks || 1;
    if (hotspot.currentMark && maxMarks <= 1) {
      return false; // Already at limit for single-mark hotspots
    }

    return true;
  }

  /**
   * Add a mark to a hotspot
   */
  addMark(hotspotId: string, value?: string | number, tool?: MarkType): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    // Find hotspot
    const targetHotspot = this.getHotspot(hotspotId);
    if (!targetHotspot) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Hotspot not found'
      });
      return false;
    }

    const markType = tool || this.currentTool;

    if (!this.canPlaceMark(targetHotspot, markType)) {
      this.eventBus.emit({
        type: 'markRejected',
        sheetId: this.currentSheetId,
        hotspotId,
        reason: 'Tool not allowed or hotspot full'
      });
      return false;
    }

    // Get value - use provided, current, or default
    const markValue = value !== undefined ? value : (
      this.currentValue || this.getDefaultValue(markType)
    );

    // Create mark
    const mark: Mark = {
      id: `${hotspotId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: markType,
      value: markValue,
      timestamp: Date.now(),
      isPermanent: markType !== 'pencil'
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

  /**
   * Remove a mark from a hotspot
   */
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

  /**
   * Toggle a mark on a hotspot (add if not present, remove if present)
   */
  toggleMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const existingMark = sheet.marks.get(hotspotId);
    if (existingMark) {
      return this.removeMark(hotspotId);
    } else {
      return this.addMark(hotspotId);
    }
  }

  /**
   * Cycle through mark states (for checkbox, circle, etc.)
   */
  cycleMark(hotspotId: string): boolean {
    const sheet = this.getCurrentSheet();
    if (!sheet) return false;

    const hotspot = this.getHotspot(hotspotId);
    if (!hotspot) return false;

    const currentMark = sheet.marks.get(hotspotId);

    // Remove current mark first
    if (currentMark) {
      this.removeMark(hotspotId);
    }

    // Determine next value based on mark type
    let nextValue: string | number | boolean;

    if (this.currentTool === 'checkbox') {
      if (!currentMark) {
        nextValue = 'checked';
      } else if (currentMark.value === 'checked') {
        nextValue = 'crossed';
      } else {
        // Cycle complete, don't add new mark
        return true;
      }
    } else if (this.currentTool === 'circle') {
      if (!currentMark) {
        nextValue = 'empty';
      } else if (currentMark.value === 'empty') {
        nextValue = 'half';
      } else if (currentMark.value === 'half') {
        nextValue = 'filled';
      } else {
        // Cycle complete, don't add new mark
        return true;
      }
    } else {
      // For other types, toggle on/off
      return !currentMark;
    }

    return this.addMark(hotspotId, nextValue);
  }

  /**
   * Clear all marks from the current sheet
   */
  clearSheet(): void {
    const sheet = this.getCurrentSheet();
    if (!sheet) return;

    const marksToRemove = Array.from(sheet.marks.keys());
    marksToRemove.forEach(hotspotId => {
      this.removeMark(hotspotId);
    });
  }

  /**
   * Clear all pencil marks (temporary marks)
   */
  clearPencilMarks(): void {
    const sheet = this.getCurrentSheet();
    if (!sheet) return;

    const pencilMarks = Array.from(sheet.marks.entries())
      .filter(([_, mark]) => !mark.isPermanent)
      .map(([hotspotId]) => hotspotId);

    pencilMarks.forEach(hotspotId => {
      this.removeMark(hotspotId);
    });
  }

  /**
   * Reject a mark (for game logic validation)
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
  // History Management
  // ============================================================================

  /**
   * Undo last action
   */
  undo(): boolean {
    return this.history.undo();
  }

  /**
   * Redo last undone action
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
   * Clear history
   */
  clearHistory(): void {
    this.history.clear();
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Export current state to JSON
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
   * Import state from JSON
   */
  importState(saveState: SaveState): void {
    // Validate version
    if (saveState.version !== 1) {
      throw new Error(`Unsupported save state version: ${saveState.version}`);
    }

    // Clear current state
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

  /**
   * Save to localStorage
   */
  saveToLocalStorage(key: string = 'roll-and-write-save'): void {
    const state = this.exportState();
    localStorage.setItem(key, JSON.stringify(state));
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage(key: string = 'roll-and-write-save'): boolean {
    const data = localStorage.getItem(key);
    if (!data) return false;

    try {
      const state = JSON.parse(data) as SaveState;
      this.importState(state);
      return true;
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      return false;
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

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

  /**
   * Get statistics about current state
   */
  getStats() {
    const sheet = this.getCurrentSheet();
    if (!sheet) {
      return {
        totalHotspots: 0,
        markedHotspots: 0,
        permanentMarks: 0,
        pencilMarks: 0
      };
    }

    const totalHotspots = sheet.definition.regions.reduce(
      (sum, region) => sum + (region.hotspots?.length || 0),
      0
    );

    const marks = Array.from(sheet.marks.values());
    const permanentMarks = marks.filter(m => m.isPermanent).length;
    const pencilMarks = marks.filter(m => !m.isPermanent).length;

    return {
      totalHotspots,
      markedHotspots: sheet.marks.size,
      permanentMarks,
      pencilMarks
    };
  }
}
