import type { Command, Mark, SheetState, Hotspot } from './types';

/**
 * Command for adding a mark
 */
export class AddMarkCommand implements Command {
  timestamp: number;
  sheetId: string;
  hotspotId: string;
  private previousMark?: Mark;
  private mark: Mark;
  private state: Map<string, SheetState>;
  private getHotspot: (sheetId: string, hotspotId: string) => Hotspot | undefined;

  constructor(
    sheetId: string,
    hotspotId: string,
    mark: Mark,
    state: Map<string, SheetState>,
    getHotspot: (sheetId: string, hotspotId: string) => Hotspot | undefined
  ) {
    this.timestamp = Date.now();
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.mark = mark;
    this.state = state;
    this.getHotspot = getHotspot;
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      // Store previous mark if exists
      this.previousMark = sheet.marks.get(this.hotspotId);

      // Add new mark
      sheet.marks.set(this.hotspotId, this.mark);

      // Update hotspot reference
      const hotspot = this.getHotspot(this.sheetId, this.hotspotId);
      if (hotspot) {
        hotspot.currentMark = this.mark;
      }
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      if (this.previousMark) {
        // Restore previous mark
        sheet.marks.set(this.hotspotId, this.previousMark);

        const hotspot = this.getHotspot(this.sheetId, this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = this.previousMark;
        }
      } else {
        // Remove mark
        sheet.marks.delete(this.hotspotId);

        const hotspot = this.getHotspot(this.sheetId, this.hotspotId);
        if (hotspot) {
          hotspot.currentMark = undefined;
        }
      }
    }
  }
}

/**
 * Command for removing a mark
 */
export class RemoveMarkCommand implements Command {
  timestamp: number;
  sheetId: string;
  hotspotId: string;
  private removedMark?: Mark;
  private state: Map<string, SheetState>;
  private getHotspot: (sheetId: string, hotspotId: string) => Hotspot | undefined;

  constructor(
    sheetId: string,
    hotspotId: string,
    state: Map<string, SheetState>,
    getHotspot: (sheetId: string, hotspotId: string) => Hotspot | undefined
  ) {
    this.timestamp = Date.now();
    this.sheetId = sheetId;
    this.hotspotId = hotspotId;
    this.state = state;
    this.getHotspot = getHotspot;
  }

  execute(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      // Store the mark being removed
      this.removedMark = sheet.marks.get(this.hotspotId);

      // Remove mark
      sheet.marks.delete(this.hotspotId);

      // Update hotspot reference
      const hotspot = this.getHotspot(this.sheetId, this.hotspotId);
      if (hotspot) {
        hotspot.currentMark = undefined;
      }
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet && this.removedMark) {
      // Restore the mark
      sheet.marks.set(this.hotspotId, this.removedMark);

      const hotspot = this.getHotspot(this.sheetId, this.hotspotId);
      if (hotspot) {
        hotspot.currentMark = this.removedMark;
      }
    }
  }
}

/**
 * History manager implementing undo/redo with command pattern
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
   * Get current history size
   */
  getSize(): number {
    return this.history.length;
  }
}
