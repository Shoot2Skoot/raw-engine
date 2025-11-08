// utils/serialization.ts

import type { SaveState } from '../engine/types';

export class Serialization {
  /**
   * Validate a save state structure
   */
  static validate(saveState: unknown): saveState is SaveState {
    if (typeof saveState !== 'object' || saveState === null) {
      return false;
    }

    const state = saveState as Partial<SaveState>;

    // Check version
    if (state.version !== 1) {
      return false;
    }

    // Check timestamp
    if (typeof state.timestamp !== 'number') {
      return false;
    }

    // Check sheets array
    if (!Array.isArray(state.sheets)) {
      return false;
    }

    // Validate each sheet
    for (const sheet of state.sheets) {
      if (typeof sheet.sheetId !== 'string') {
        return false;
      }
      if (!Array.isArray(sheet.marks)) {
        return false;
      }

      // Validate marks
      for (const markEntry of sheet.marks) {
        if (typeof markEntry.hotspotId !== 'string') {
          return false;
        }
        if (!markEntry.mark || typeof markEntry.mark.id !== 'string') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Serialize save state to JSON string
   */
  static serialize(saveState: SaveState): string {
    return JSON.stringify(saveState, null, 2);
  }

  /**
   * Deserialize JSON string to save state
   */
  static deserialize(json: string): SaveState {
    try {
      const parsed = JSON.parse(json);
      if (!this.validate(parsed)) {
        throw new Error('Invalid save state format');
      }
      return parsed;
    } catch (error) {
      throw new Error(
        `Failed to deserialize save state: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create empty save state
   */
  static createEmpty(): SaveState {
    return {
      version: 1,
      timestamp: Date.now(),
      sheets: [],
    };
  }
}
