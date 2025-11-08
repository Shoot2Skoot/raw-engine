import type { SaveState, SheetState, Mark } from '../engine/types';

export class Serialization {
  /**
   * Export sheet states to SaveState format
   */
  static exportState(sheets: Map<string, SheetState>): SaveState {
    const sheetsArray = Array.from(sheets.entries()).map(([sheetId, sheet]) => ({
      sheetId,
      marks: Array.from(sheet.marks.entries()).map(([hotspotId, mark]) => ({
        hotspotId,
        mark: this.serializeMark(mark)
      }))
    }));

    return {
      version: 1,
      timestamp: Date.now(),
      sheets: sheetsArray
    };
  }

  /**
   * Import SaveState and restore marks to sheets
   */
  static importState(
    saveState: SaveState,
    sheets: Map<string, SheetState>
  ): void {
    // Validate version
    if (saveState.version !== 1) {
      throw new Error(`Unsupported save state version: ${saveState.version}`);
    }

    // Clear current state
    sheets.forEach(sheet => {
      sheet.marks.clear();
      // Clear hotspot references
      for (const region of sheet.definition.regions) {
        region.hotspots?.forEach(hotspot => {
          hotspot.currentMark = undefined;
        });
      }
    });

    // Restore marks
    saveState.sheets.forEach(savedSheet => {
      const sheet = sheets.get(savedSheet.sheetId);
      if (sheet) {
        savedSheet.marks.forEach(({ hotspotId, mark }) => {
          const deserializedMark = this.deserializeMark(mark);
          sheet.marks.set(hotspotId, deserializedMark);

          // Update hotspot reference
          for (const region of sheet.definition.regions) {
            const hotspot = region.hotspots?.find(h => h.id === hotspotId);
            if (hotspot) {
              hotspot.currentMark = deserializedMark;
              break;
            }
          }
        });
      }
    });
  }

  /**
   * Save to localStorage
   */
  static saveToLocalStorage(key: string, saveState: SaveState): void {
    try {
      localStorage.setItem(key, JSON.stringify(saveState));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save game state');
    }
  }

  /**
   * Load from localStorage
   */
  static loadFromLocalStorage(key: string): SaveState | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // Validate basic structure
      if (!parsed.version || !parsed.sheets) {
        throw new Error('Invalid save state format');
      }

      return parsed as SaveState;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Export to JSON file
   */
  static exportToJSON(saveState: SaveState): string {
    return JSON.stringify(saveState, null, 2);
  }

  /**
   * Import from JSON file
   */
  static importFromJSON(json: string): SaveState {
    try {
      const parsed = JSON.parse(json);

      if (!parsed.version || !parsed.sheets) {
        throw new Error('Invalid save state format');
      }

      return parsed as SaveState;
    } catch (error) {
      throw new Error('Failed to parse JSON: ' + (error as Error).message);
    }
  }

  private static serializeMark(mark: Mark): Mark {
    // Deep copy to avoid references
    return {
      id: mark.id,
      type: mark.type,
      value: mark.value,
      color: mark.color,
      timestamp: mark.timestamp,
      isPermanent: mark.isPermanent,
      metadata: mark.metadata ? { ...mark.metadata } : undefined
    };
  }

  private static deserializeMark(mark: Mark): Mark {
    return {
      id: mark.id,
      type: mark.type,
      value: mark.value,
      color: mark.color,
      timestamp: mark.timestamp,
      isPermanent: mark.isPermanent,
      metadata: mark.metadata ? { ...mark.metadata } : undefined
    };
  }
}
