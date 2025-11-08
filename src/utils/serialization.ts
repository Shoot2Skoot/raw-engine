import type { SaveState } from '../engine/types';

export class Serialization {
  /**
   * Save state to localStorage with error handling
   */
  static save(key: string, state: SaveState): boolean {
    try {
      const json = JSON.stringify(state);
      localStorage.setItem(key, json);
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }

  /**
   * Load state from localStorage with validation
   */
  static load(key: string): SaveState | null {
    try {
      const json = localStorage.getItem(key);
      if (!json) return null;

      const state = JSON.parse(json) as SaveState;

      // Validate version
      if (state.version !== 1) {
        console.warn(`Unsupported save state version: ${state.version}`);
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
  static clear(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Export state as downloadable JSON file
   */
  static exportToFile(state: SaveState, filename: string = 'game-state.json'): void {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
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
          const state = JSON.parse(json) as SaveState;

          if (state.version !== 1) {
            reject(new Error(`Unsupported version: ${state.version}`));
            return;
          }

          resolve(state);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
