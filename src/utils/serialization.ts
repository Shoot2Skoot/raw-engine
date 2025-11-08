// utils/serialization.ts

import type { SaveState } from '../engine/types';

export class Serialization {
  /**
   * Save state to localStorage
   */
  static saveToLocalStorage(key: string, state: SaveState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save game state');
    }
  }

  /**
   * Load state from localStorage
   */
  static loadFromLocalStorage(key: string): SaveState | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;

      const state = JSON.parse(serialized) as SaveState;

      // Validate version
      if (state.version !== 1) {
        console.warn(`Unsupported save state version: ${state.version}`);
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Export state as downloadable JSON file
   */
  static exportToFile(state: SaveState, filename: string = 'game-state.json'): void {
    try {
      const serialized = JSON.stringify(state, null, 2);
      const blob = new Blob([serialized], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export to file:', error);
      throw new Error('Failed to export game state');
    }
  }

  /**
   * Import state from uploaded JSON file
   */
  static importFromFile(file: File): Promise<SaveState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const state = JSON.parse(content) as SaveState;

          // Validate version
          if (state.version !== 1) {
            reject(new Error(`Unsupported save state version: ${state.version}`));
            return;
          }

          resolve(state);
        } catch (error) {
          reject(new Error('Invalid save file format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear saved state from localStorage
   */
  static clearLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
