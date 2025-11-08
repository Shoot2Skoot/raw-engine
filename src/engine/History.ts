// engine/History.ts

import type { Command, Mark, SheetState } from './types';

export class AddMarkCommand implements Command {
  public sheetId: string;
  public hotspotId: string;
  public timestamp: number;
  private mark: Mark;
  private state: Map<string, SheetState>;

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
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.delete(this.hotspotId);
    }
  }
}

export class RemoveMarkCommand implements Command {
  public sheetId: string;
  public hotspotId: string;
  public timestamp: number;
  private previousMark: Mark;
  private state: Map<string, SheetState>;

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
    }
  }

  undo(): void {
    const sheet = this.state.get(this.sheetId);
    if (sheet) {
      sheet.marks.set(this.hotspotId, this.previousMark);
    }
  }
}

export class HistoryManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

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

  undo(): boolean {
    if (this.currentIndex < 0) return false;

    this.history[this.currentIndex].undo();
    this.currentIndex--;
    return true;
  }

  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    this.history[this.currentIndex].execute();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistory(): Command[] {
    return [...this.history];
  }
}
