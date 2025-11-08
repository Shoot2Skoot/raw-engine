// utils/serialization.ts

import type { SaveState } from '../engine/types';

const STORAGE_KEY = 'roll-and-write-save';

export class Serialization {
  /**
   * Save state to localStorage
   */
  static saveToStorage(state: SaveState): boolean {
    try {
      const json = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, json);
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }

  /**
   * Load state from localStorage
   */
  static loadFromStorage(): SaveState | null {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;

      const state = JSON.parse(json) as SaveState;

      // Validate version
      if (state.version !== 1) {
        console.warn('Unsupported save state version:', state.version);
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  static clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export state as downloadable JSON file
   */
  static exportToFile(state: SaveState, filename: string = 'game-save.json'): void {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import state from file
   */
  static async importFromFile(file: File): Promise<SaveState | null> {
    try {
      const text = await file.text();
      const state = JSON.parse(text) as SaveState;

      // Validate version
      if (state.version !== 1) {
        throw new Error(`Unsupported save state version: ${state.version}`);
      }

      return state;
    } catch (error) {
      console.error('Failed to import state:', error);
      return null;
    }
  }
}
