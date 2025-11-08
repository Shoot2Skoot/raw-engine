import type { SaveState } from '../engine/types';

/**
 * Serialization utilities for save/load functionality
 */
export class Serialization {
  /**
   * Serialize state to JSON string
   */
  static serialize(state: SaveState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Deserialize JSON string to state
   */
  static deserialize(json: string): SaveState {
    const state = JSON.parse(json) as SaveState;

    // Validate version
    if (state.version !== 1) {
      throw new Error(`Unsupported save state version: ${state.version}`);
    }

    return state;
  }

  /**
   * Save state to localStorage
   */
  static saveToLocalStorage(key: string, state: SaveState): void {
    try {
      const json = this.serialize(state);
      localStorage.setItem(key, json);
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
      const json = localStorage.getItem(key);
      if (!json) return null;

      return this.deserialize(json);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved state from localStorage
   */
  static clearLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Export state as downloadable file
   */
  static exportToFile(state: SaveState, filename: string = 'game-save.json'): void {
    const json = this.serialize(state);
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
  static importFromFile(file: File): Promise<SaveState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const state = this.deserialize(json);
          resolve(state);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
