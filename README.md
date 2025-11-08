# 🎲 Roll-and-Write Game Engine

A powerful, framework-agnostic engine for creating interactive roll-and-write board game sheets in the browser. Built with TypeScript, React, and SVG.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## What is This?

This is **a specialized drawing/markup engine**, not a game rules engine. Think "Figma meets roll-and-write games."

### What This IS:
- ✅ A framework for defining interactive, markable game sheets
- ✅ An intuitive UI for players to mark, fill, and annotate sheets
- ✅ A developer-friendly API for defining layouts and hotspots
- ✅ A state management system with undo/redo and save/load

### What This IS NOT:
- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Quick Start

### Installation

```bash
npm install
npm run dev
```

### Basic Usage

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple sheet
const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 600)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'scores',
    6,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']
  )
  .build();

// Initialize engine
const engine = new SheetEngine([mySheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  console.log('Mark added:', event);
});

// Render in React
<EngineProvider engine={engine}>
  <SheetCanvas />
  <Toolbar />
</EngineProvider>
```

## Features

### 🎯 Core Features
- **Multiple Mark Types**: Checkboxes, numbers, fills, circles, symbols, text, and pencil marks
- **Flexible Layouts**: Grid-based or freeform hotspot placement
- **Hit Detection**: Precise point-in-shape detection for rectangles, circles, and polygons
- **Undo/Redo**: Full command pattern implementation with unlimited history
- **Auto-save**: Automatic localStorage persistence
- **Import/Export**: JSON-based state serialization
- **Event System**: Hook into mark additions, removals, and rejections

### 🎨 Mark Types
1. **Checkbox** - Empty → Checked → Crossed (cycle)
2. **Number** - Integer values with picker
3. **Fill** - Color fills with opacity
4. **Circle** - Empty → Half → Full (cycle)
5. **Symbol** - Predefined icon set
6. **Text** - Free text input
7. **Pencil** - Erasable temporary marks

### ⌨️ Keyboard Shortcuts
- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `P` - Pencil tool
- `T` - Text tool
- `S` - Symbol tool
- `E` - Clear pencil marks
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` or `Ctrl+Y` - Redo
- `Ctrl+S` - Save

## Architecture

### Project Structure

```
roll-and-write-engine/
├── src/
│   ├── engine/              # Core engine logic
│   │   ├── types.ts         # TypeScript definitions
│   │   ├── SheetEngine.ts   # Main engine class
│   │   ├── EventBus.ts      # Event system
│   │   └── History.ts       # Undo/redo commands
│   ├── components/          # React components
│   │   ├── SheetCanvas.tsx  # Main SVG canvas
│   │   ├── MarkRenderer.tsx # Mark rendering
│   │   ├── ValuePicker.tsx  # Value selection popup
│   │   ├── Toolbar.tsx      # Tool selection
│   │   └── SheetTabs.tsx    # Multi-sheet navigation
│   ├── context/             # React context
│   │   └── EngineContext.tsx
│   ├── utils/               # Utilities
│   │   ├── geometry.ts      # Hit detection
│   │   └── coordinates.ts   # SVG transformations
│   ├── builders/            # Builder API
│   │   └── SheetBuilder.ts  # Fluent sheet builder
│   └── examples/            # Example sheets
│       ├── 01-simple-grid.ts
│       ├── 02-image-hotspots.ts
│       └── 03-mixed-layout.ts
└── tests/                   # Test files
    ├── unit/
    └── integration/
```

### Core Types

```typescript
// Mark types supported
type MarkType = 'checkbox' | 'number' | 'fill' | 'circle' | 'symbol' | 'text' | 'pencil';

// A markable region
interface Hotspot {
  id: string;
  shape: 'rect' | 'circle' | 'polygon' | 'point';
  position: Point;
  size?: Size;
  radius?: number;
  points?: Point[];
  allowedMarkTypes: MarkType[];
  maxMarks?: number;
}

// Complete sheet definition
interface SheetDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundImage?: string;
  backgroundColor?: string;
  regions: Region[];
}
```

## Examples

### Example 1: Simple Grid (Yahtzee)

```typescript
export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(500, 800)
  .backgroundColor('#F5F5F5')
  .addGridRegion(
    'upper-section',
    6, 1, 60,
    { x: 150, y: 100 },
    ['number'],
    { gap: 5 }
  )
  .build();
```

### Example 2: Image with Hotspots

```typescript
export const moonSheet = SheetBuilder.create('moon')
  .name('Moon Mission')
  .size(800, 1000)
  .background('/images/moon-background.png')
  .addFreeformRegion('resources', [
    HotspotHelpers.circle('water-1', 120, 80, 20, ['checkbox']),
    HotspotHelpers.row('energy', 10, 100, 150, 50, 30, 5, ['number', 'fill'])
  ])
  .build();
```

### Example 3: Mixed Layout

```typescript
export const complexSheet = SheetBuilder.create('complex')
  .name('Complex Board')
  .size(1000, 1400)
  .addGridRegion('tech-tree', 3, 4, 70, { x: 50, y: 50 }, ['checkbox', 'circle'])
  .addFreeformRegion('territories', [
    HotspotHelpers.polygon('zone-1', [
      { x: 500, y: 800 },
      { x: 580, y: 780 },
      { x: 600, y: 860 },
      { x: 520, y: 880 }
    ], ['symbol', 'fill'])
  ])
  .build();
```

## API Reference

### SheetEngine

Main engine class for managing sheets and marks.

```typescript
class SheetEngine {
  // Sheet management
  getCurrentSheet(): SheetState | undefined;
  switchSheet(sheetId: string): boolean;
  getSheetIds(): string[];

  // Tool management
  setCurrentTool(tool: MarkType): void;
  getCurrentTool(): MarkType;
  setCurrentValue(value: string | number): void;

  // Mark operations
  addMark(hotspotId: string, value?: string | number): boolean;
  removeMark(hotspotId: string): boolean;
  toggleMark(hotspotId: string): boolean;
  cycleMark(hotspotId: string): boolean;

  // History
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;

  // Events
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void;

  // Serialization
  exportState(): SaveState;
  importState(state: SaveState): void;
  saveToLocalStorage(key?: string): void;
  loadFromLocalStorage(key?: string): boolean;
}
```

### SheetBuilder

Fluent API for constructing sheets.

```typescript
class SheetBuilder {
  static create(id: string): SheetBuilder;

  name(name: string): this;
  size(width: number, height: number): this;
  background(imageUrl: string): this;
  backgroundColor(color: string): this;

  addGridRegion(
    id: string,
    rows: number,
    cols: number,
    cellSize: number,
    origin: Point,
    allowedMarks: MarkType[],
    options?: { gap?: number; zIndex?: number }
  ): this;

  addFreeformRegion(
    id: string,
    hotspots: Hotspot[],
    options?: { zIndex?: number }
  ): this;

  build(): SheetDefinition;
}
```

### HotspotHelpers

Helper functions for common hotspot patterns.

```typescript
class HotspotHelpers {
  static rect(id: string, x: number, y: number, width: number, height: number, allowedMarks: MarkType[]): Hotspot;
  static circle(id: string, cx: number, cy: number, radius: number, allowedMarks: MarkType[]): Hotspot;
  static polygon(id: string, points: Point[], allowedMarks: MarkType[]): Hotspot;
  static point(id: string, x: number, y: number, allowedMarks: MarkType[]): Hotspot;
  static row(idPrefix: string, count: number, x: number, y: number, cellWidth: number, cellHeight: number, gap: number, allowedMarks: MarkType[]): Hotspot[];
  static column(idPrefix: string, count: number, x: number, y: number, cellWidth: number, cellHeight: number, gap: number, allowedMarks: MarkType[]): Hotspot[];
  static circularArrangement(idPrefix: string, count: number, centerX: number, centerY: number, radius: number, hotspotRadius: number, allowedMarks: MarkType[]): Hotspot[];
}
```

## Testing

Run unit and integration tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Performance Considerations

- Uses React.memo for mark renderers
- Debounced hover state updates
- SVG-based rendering (hardware accelerated)
- Efficient hit detection algorithms
- Command pattern for undo/redo (no state cloning)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

### v1.1
- [ ] Mobile gesture improvements
- [ ] Touch-optimized value pickers
- [ ] Print mode
- [ ] PDF export

### v2.0
- [ ] Multiplayer sync (WebRTC)
- [ ] Custom mark types
- [ ] Animation system
- [ ] Theme support
- [ ] Accessibility improvements

## Credits

Built with:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)

Inspired by roll-and-write games like Welcome To..., Railroad Ink, and Twilight Inscription.

## Support

For questions, issues, or feature requests, please open an issue on GitHub.
