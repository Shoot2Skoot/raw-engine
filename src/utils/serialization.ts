/**
 * Serialization utilities for save/load functionality
 */

import type { SaveState, Mark } from '../engine/types';

/**
 * Validate a save state object
 */
export function validateSaveState(data: unknown): data is SaveState {
  if (typeof data !== 'object' || data === null) return false;

  const state = data as Partial<SaveState>;

  if (state.version !== 1) return false;
  if (typeof state.timestamp !== 'number') return false;
  if (!Array.isArray(state.sheets)) return false;

  // Validate each sheet
  for (const sheet of state.sheets) {
    if (typeof sheet.sheetId !== 'string') return false;
    if (!Array.isArray(sheet.marks)) return false;

    // Validate each mark
    for (const { hotspotId, mark } of sheet.marks) {
      if (typeof hotspotId !== 'string') return false;
      if (!validateMark(mark)) return false;
    }
  }

  return true;
}

/**
 * Validate a mark object
 */
function validateMark(mark: unknown): mark is Mark {
  if (typeof mark !== 'object' || mark === null) return false;

  const m = mark as Partial<Mark>;

  return (
    typeof m.id === 'string' &&
    typeof m.type === 'string' &&
    (typeof m.value === 'string' || typeof m.value === 'number' || typeof m.value === 'boolean') &&
    typeof m.timestamp === 'number' &&
    typeof m.isPermanent === 'boolean'
  );
}

/**
 * Serialize save state to JSON string
 */
export function serializeSaveState(state: SaveState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Deserialize JSON string to save state
 */
export function deserializeSaveState(json: string): SaveState {
  const data = JSON.parse(json);

  if (!validateSaveState(data)) {
    throw new Error('Invalid save state format');
  }

  return data;
}

/**
 * Save to localStorage with error handling
 */
export function saveToLocalStorage(key: string, state: SaveState): boolean {
  try {
    const json = serializeSaveState(state);
    localStorage.setItem(key, json);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load from localStorage with error handling
 */
export function loadFromLocalStorage(key: string): SaveState | null {
  try {
    const json = localStorage.getItem(key);
    if (!json) return null;

    return deserializeSaveState(json);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved state from localStorage
 */
export function clearLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Export save state as downloadable file
 */
export function exportToFile(state: SaveState, filename: string = 'game-save.json'): void {
  const json = serializeSaveState(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Import save state from file
 */
export function importFromFile(): Promise<SaveState> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const state = deserializeSaveState(json);
          resolve(state);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
