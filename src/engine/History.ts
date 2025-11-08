// engine/History.ts - Command pattern for undo/redo functionality

import type { Command, Mark, SheetState } from './types';

/**
 * Command to add a mark to a hotspot
 */
export class AddMarkCommand implements Command {
  public timestamp: number;

  constructor(
    public sheetId: string,
    public hotspotId: string,
    private mark: Mark,
    private state: Map<string, SheetState>
  ) {
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.mark);
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);
    }
  }
}

/**
 * Command to remove a mark from a hotspot
 */
export class RemoveMarkCommand implements Command {
  public timestamp: number;

  constructor(
    public sheetId: string,
    public hotspotId: string,
    private mark: Mark,
    private state: Map<string, SheetState>
  ) {
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.mark);
    }
  }
}

/**
 * Command to update a mark (replace existing mark with new one)
 */
export class UpdateMarkCommand implements Command {
  public timestamp: number;

  constructor(
    public sheetId: string,
    public hotspotId: string,
    private oldMark: Mark,
    private newMark: Mark,
    private state: Map<string, SheetState>
  ) {
    this.timestamp = Date.now();
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.newMark);
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.oldMark);
    }
  }
}

/**
 * History manager using the Command pattern
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
   * Get the current history size
   */
  size(): number {
    return this.history.length;
  }

  /**
   * Get the current position in history
   */
  getPosition(): number {
    return this.currentIndex;
  }

  /**
   * Set the maximum history size
   */
  setMaxSize(size: number): void {
    this.maxHistorySize = Math.max(1, size);

    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize;
      this.history.splice(0, excess);
      this.currentIndex = Math.max(-1, this.currentIndex - excess);
    }
  }
}
