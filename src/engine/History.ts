/**
 * Command pattern implementation for undo/redo functionality
 */

import type { Command, Mark, SheetState } from './types';

/**
 * Command to add a mark to a hotspot
 */
export class AddMarkCommand implements Command {
  public timestamp: number;
  public sheetId: string;
  public hotspotId: string;
  private mark: Mark;
  private state: Map<string, SheetState>;
  private onExecute?: () => void;
  private onUndo?: () => void;

  constructor(
    sheetId: string,
    hotspotId: string,
    mark: Mark,
    state: Map<string, SheetState>,
    onExecute?: () => void,
    onUndo?: () => void
  ) {
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.mark = mark;
    this.state = state;
    this.onExecute = onExecute;
    this.onUndo = onUndo;
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.mark);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = this.mark;
          break;
        }
      }

      if (this.onExecute) {
        this.onExecute();
      }
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = undefined;
          break;
        }
      }

      if (this.onUndo) {
        this.onUndo();
      }
    }
  }
}

/**
 * Command to remove a mark from a hotspot
 */
export class RemoveMarkCommand implements Command {
  public timestamp: number;
  public sheetId: string;
  public hotspotId: string;
  private mark: Mark;
  private state: Map<string, SheetState>;
  private onExecute?: () => void;
  private onUndo?: () => void;

  constructor(
    sheetId: string,
    hotspotId: string,
    mark: Mark,
    state: Map<string, SheetState>,
    onExecute?: () => void,
    onUndo?: () => void
  ) {
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.mark = mark;
    this.state = state;
    this.onExecute = onExecute;
    this.onUndo = onUndo;
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = undefined;
          break;
        }
      }

      if (this.onExecute) {
        this.onExecute();
      }
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.mark);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = this.mark;
          break;
        }
      }

      if (this.onUndo) {
        this.onUndo();
      }
    }
  }
}

/**
 * Command to update a mark (combines remove + add)
 */
export class UpdateMarkCommand implements Command {
  public timestamp: number;
  public sheetId: string;
  public hotspotId: string;
  private oldMark: Mark;
  private newMark: Mark;
  private state: Map<string, SheetState>;
  private onExecute?: () => void;
  private onUndo?: () => void;

  constructor(
    sheetId: string,
    hotspotId: string,
    oldMark: Mark,
    newMark: Mark,
    state: Map<string, SheetState>,
    onExecute?: () => void,
    onUndo?: () => void
  ) {
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.oldMark = oldMark;
    this.newMark = newMark;
    this.state = state;
    this.onExecute = onExecute;
    this.onUndo = onUndo;
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.newMark);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = this.newMark;
          break;
        }
      }

      if (this.onExecute) {
        this.onExecute();
      }
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.oldMark);

      // Update hotspot reference
      for (const region of sheet.definition.regions) {
        const hotspot = region.hotspots?.find(h => h.id === this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = this.oldMark;
          break;
        }
      }

      if (this.onUndo) {
        this.onUndo();
      }
    }
  }
}

/**
 * History manager for undo/redo operations
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

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last command
   * @returns true if undo was successful
   */
  undo(): boolean {
    if (this.currentIndex < 0) return false;

    this.history[this.currentIndex].undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo the next command
   * @returns true if redo was successful
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
   * Get the current history size
   */
  size(): number {
    return this.history.length;
  }

  /**
   * Get current position in history
   */
  position(): number {
    return this.currentIndex;
  }

  /**
   * Set maximum history size
   */
  setMaxSize(size: number): void {
    this.maxHistorySize = size;

    // Trim if necessary
    if (this.history.length > size) {
      const excess = this.history.length - size;
      this.history.splice(0, excess);
      this.currentIndex = Math.max(-1, this.currentIndex - excess);
    }
  }
}
