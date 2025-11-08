// engine/types.ts

/** Base mark types supported by the engine */
export type MarkType =
  | 'checkbox'      // Empty → Checked → Crossed (cycle)
  | 'number'        // Integer value
  | 'fill'          // Color fill with opacity
  | 'circle'        // Empty → Half → Full (cycle)
  | 'symbol'        // Icon from predefined set
  | 'text'          // Free text input
  | 'pencil';       // Erasable temporary mark

/** A mark placed on a hotspot */
export interface Mark {
  id: string;
  type: MarkType;
  value: string | number | boolean;
  color?: string;
  timestamp: number;
  isPermanent: boolean;     // false = erasable pencil mark
  metadata?: Record<string, unknown>;
}

/** Shape types for hotspots */
export type HotspotShape = 'rect' | 'circle' | 'polygon' | 'point';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** A markable region on the sheet */
export interface Hotspot {
  id: string;
  shape: HotspotShape;

  // Position/geometry (all coordinates relative to sheet origin)
  position: Point;
  size?: Size;              // For rect
  radius?: number;          // For circle
  points?: Point[];         // For polygon (must be closed)

  // Marking constraints
  allowedMarkTypes: MarkType[];
  maxMarks?: number;        // Default: 1

  // Current state
  currentMark?: Mark;

  // For game logic
  metadata?: Record<string, unknown>;
}

/** Grid layout auto-generates hotspots */
export interface GridLayout {
  type: 'grid';
  rows: number;
  cols: number;
  cellSize: number;
  gap?: number;
  origin: Point;
}

/** A region is a collection of hotspots */
export interface Region {
  id: string;
  type: 'grid' | 'freeform';
  layout?: GridLayout;      // If grid type
  hotspots?: Hotspot[];     // If freeform type or generated from grid
  zIndex?: number;
}

/** Complete sheet definition */
export interface SheetDefinition {
  id: string;
  name: string;
  width: number;            // SVG viewBox width
  height: number;           // SVG viewBox height
  backgroundImage?: string;
  backgroundColor?: string;
  regions: Region[];
  metadata?: Record<string, unknown>;
}

/** Runtime sheet state */
export interface SheetState {
  definition: SheetDefinition;
  marks: Map<string, Mark>; // hotspotId -> Mark
}

/** Event types for game logic hooks */
export type EngineEvent =
  | { type: 'markAdded'; sheetId: string; hotspotId: string; mark: Mark }
  | { type: 'markRemoved'; sheetId: string; hotspotId: string; mark: Mark }
  | { type: 'markRejected'; sheetId: string; hotspotId: string; reason: string }
  | { type: 'sheetChanged'; previousSheetId: string; currentSheetId: string }
  | { type: 'toolChanged'; previousTool: MarkType; currentTool: MarkType };

/** History entry for undo/redo (Command pattern) */
export interface Command {
  execute(): void;
  undo(): void;
  sheetId: string;
  hotspotId: string;
  timestamp: number;
}

/** Serialization format (versioned for migrations) */
export interface SaveState {
  version: 1;
  timestamp: number;
  sheets: Array<{
    sheetId: string;
    marks: Array<{ hotspotId: string; mark: Mark }>;
  }>;
}
