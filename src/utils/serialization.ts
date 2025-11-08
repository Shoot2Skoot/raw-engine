// utils/serialization.ts

import type { SaveState } from '../engine/types';

export class Serialization {
  private static readonly STORAGE_KEY = 'roll-and-write-save';

  /**
   * Save state to localStorage
   */
  static save(saveState: SaveState): void {
    try {
      const json = JSON.stringify(saveState);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw new Error('Failed to save state to localStorage');
    }
  }

  /**
   * Load state from localStorage
   */
  static load(): SaveState | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) return null;

      const saveState = JSON.parse(json) as SaveState;

      // Validate version
      if (saveState.version !== 1) {
        console.warn(`Unsupported save state version: ${saveState.version}`);
        return null;
      }

      return saveState;
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export state as JSON string (for download)
   */
  static exportToJSON(saveState: SaveState): string {
    return JSON.stringify(saveState, null, 2);
  }

  /**
   * Import state from JSON string
   */
  static importFromJSON(json: string): SaveState | null {
    try {
      const saveState = JSON.parse(json) as SaveState;

      // Validate version
      if (saveState.version !== 1) {
        throw new Error(`Unsupported save state version: ${saveState.version}`);
      }

      return saveState;
    } catch (error) {
      console.error('Failed to import state:', error);
      return null;
    }
  }

  /**
   * Download state as JSON file
   */
  static downloadAsFile(saveState: SaveState, filename: string = 'sheet-save.json'): void {
    const json = this.exportToJSON(saveState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
