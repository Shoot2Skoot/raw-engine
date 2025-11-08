// utils/serialization.ts - Save/load utilities with versioning

import type { SaveState } from '../engine/types';

/**
 * Serialization utilities for saving and loading game state
 */
export class Serialization {
  /**
   * Serialize save state to JSON string
   */
  static serialize(saveState: SaveState): string {
    return JSON.stringify(saveState);
  }

  /**
   * Deserialize JSON string to save state
   * Validates version and structure
   */
  static deserialize(json: string): SaveState {
    try {
      const parsed = JSON.parse(json);

      // Validate version
      if (parsed.version !== 1) {
        throw new Error(`Unsupported save state version: ${parsed.version}`);
      }

      // Validate structure
      if (!parsed.timestamp || !Array.isArray(parsed.sheets)) {
        throw new Error('Invalid save state structure');
      }

      return parsed as SaveState;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw error;
    }
  }

  /**
   * Save state to localStorage
   */
  static saveToLocalStorage(key: string, saveState: SaveState): void {
    try {
      const json = this.serialize(saveState);
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
}
