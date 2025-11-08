/**
 * History management with Command pattern for undo/redo
 */

import type { Command, SheetState, Mark } from './types';

/**
 * Command to add a mark to a hotspot
 */
export class AddMarkCommand implements Command {
  public readonly sheetId: string;
  public readonly hotspotId: string;
  public readonly timestamp: number;
  private readonly mark: Mark;
  private readonly state: Map<string, SheetState>;

  constructor(
    sheetId: string,
    hotspotId: string,
    mark: Mark,
    state: Map<string, SheetState>
  ) {
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.mark = mark;
    this.state = state;
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.mark);

      // Update hotspot reference
      this.updateHotspotMark(sheet, this.hotspotId, this.mark);
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);

      // Clear hotspot reference
      this.updateHotspotMark(sheet, this.hotspotId, undefined);
    }
  }

  private updateHotspotMark(sheet: SheetState, hotspotId: string, mark?: Mark): void {
    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) {
        hotspot.currentMark = mark;
        break;
      }
    }
  }
}

/**
 * Command to remove a mark from a hotspot
 */
export class RemoveMarkCommand implements Command {
  public readonly sheetId: string;
  public readonly hotspotId: string;
  public readonly timestamp: number;
  private readonly previousMark: Mark;
  private readonly state: Map<string, SheetState>;

  constructor(
    sheetId: string,
    hotspotId: string,
    previousMark: Mark,
    state: Map<string, SheetState>
  ) {
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.previousMark = previousMark;
    this.state = state;
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);

      // Clear hotspot reference
      this.updateHotspotMark(sheet, this.hotspotId, undefined);
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.previousMark);

      // Restore hotspot reference
      this.updateHotspotMark(sheet, this.hotspotId, this.previousMark);
    }
  }

  private updateHotspotMark(sheet: SheetState, hotspotId: string, mark?: Mark): void {
    for (const region of sheet.definition.regions) {
      const hotspot = region.hotspots?.find(h => h.id === hotspotId);
      if (hotspot) {
        hotspot.currentMark = mark;
        break;
      }
    }
  }
}

/**
 * History manager for undo/redo functionality
 */
export class HistoryManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

  /**
   * Execute a command and add it to history
   */
  execute(command: Command): void {
    // Remove any "future" commands if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Execute command
    command.execute();

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Limit history size (FIFO)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (this.currentIndex < 0) return false;

    this.history[this.currentIndex].undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo the next command
   */
  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    this.history[this.currentIndex].execute();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history size (for debugging)
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Get current position in history (for debugging)
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
