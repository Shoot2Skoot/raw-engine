# Roll & Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## What This IS

- **A framework for defining interactive, markable game sheets**
- **An intuitive UI for players to mark, fill, and annotate sheets**
- **A developer-friendly API for defining layouts and hotspots**
- **A state management system with undo/redo and save/load**

## What This IS NOT

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Features

✅ **Multiple Mark Types**: Checkbox, Number, Fill, Circle, Symbol, Text, Pencil
✅ **Undo/Redo**: Full command pattern implementation
✅ **Save/Load**: LocalStorage persistence + file export/import
✅ **Multi-Sheet Support**: Navigate between multiple game sheets
✅ **Touch Support**: Works on mobile and tablet devices
✅ **Keyboard Shortcuts**: Quick tool selection (C, N, F, O, P, T)
✅ **Event System**: Hook into mark changes for game logic
✅ **SVG-based**: Scalable, print-friendly, accessible
✅ **TypeScript**: Full type safety throughout

## Quick Start

### Installation

```bash
npm install
npm run dev
```

Visit http://localhost:5173 to see the demo.

### Building

```bash
npm run build
```

## Usage Example

Here's what using the engine looks like:

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F9FAFB')
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

// In your React component
<EngineProvider engine={engine}>
  <Toolbar />
  <SheetCanvas />
</EngineProvider>
```

That's it! Players can now click cells, enter numbers, and undo/redo works automatically.

## Project Structure

```
roll-and-write-engine/
├── src/
│   ├── components/          # React UI components
│   │   ├── SheetCanvas.tsx  # Main interactive SVG canvas
│   │   ├── MarkRenderer.tsx # Renders different mark types
│   │   ├── ValuePicker.tsx  # Number/color/symbol selector
│   │   ├── Toolbar.tsx      # Tool selection + undo/redo
│   │   └── SheetTabs.tsx    # Multi-sheet navigation
│   ├── engine/              # Core engine logic
│   │   ├── types.ts         # TypeScript definitions
│   │   ├── SheetEngine.ts   # Main engine class
│   │   ├── EventBus.ts      # Event system
│   │   └── History.ts       # Undo/redo commands
│   ├── context/             # React context
│   │   └── EngineContext.tsx
│   ├── utils/               # Utilities
│   │   ├── geometry.ts      # Point-in-shape detection
│   │   ├── coordinates.ts   # SVG coordinate transforms
│   │   └── serialization.ts # Save/load with versioning
│   ├── builders/            # Fluent API for creating sheets
│   │   └── SheetBuilder.ts
│   └── examples/            # Example sheet definitions
│       ├── 01-simple-grid.ts
│       ├── 02-mixed-layout.ts
│       └── 03-tic-tac-toe.ts
└── README.md
```

## Core Concepts

### Sheet Definition

A sheet is composed of:
- **Regions**: Collections of hotspots (grid or freeform)
- **Hotspots**: Individual markable areas (rect, circle, polygon, point)
- **Marks**: User-placed annotations on hotspots

### Mark Types

| Type | Description | Behavior |
|------|-------------|----------|
| `checkbox` | ✓ / ✗ marks | Cycles: empty → checked → crossed |
| `number` | Numeric values | Opens number picker (0-9) |
| `fill` | Color fills | Opens color picker |
| `circle` | Circle states | Cycles: empty → half → filled |
| `symbol` | Icons/symbols | Opens symbol picker (★ ♦ ♥ etc.) |
| `text` | Free text | Opens text input |
| `pencil` | Erasable notes | Lighter, temporary marks |

### Coordinate System

- Origin (0,0) is top-left of sheet
- X increases rightward, Y increases downward
- All hotspot coordinates are in sheet space (not screen space)
- SVG viewBox handles scaling automatically

### Event System

Hook into engine events for game logic:

```typescript
engine.on('markAdded', (event) => {
  // Validate move, update score, etc.
});

engine.on('markRejected', (event) => {
  // Show error message
});
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Checkbox tool |
| `N` | Number tool |
| `F` | Fill tool |
| `O` | Circle tool |
| `P` | Pencil tool |
| `T` | Text tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

## Examples

See the `/src/examples` directory for complete examples:

1. **Simple Grid** (`01-simple-grid.ts`): Basic Yahtzee-style number entry
2. **Mixed Layout** (`02-mixed-layout.ts`): Combines grids, circles, polygons
3. **Tic-Tac-Toe** (`03-tic-tac-toe.ts`): Simple 3×3 grid with symbols

## API Reference

### SheetBuilder

Fluent API for creating sheet definitions:

```typescript
SheetBuilder.create(id)
  .name(name)
  .size(width, height)
  .backgroundColor(color)
  .background(imageUrl)
  .addGridRegion(id, rows, cols, cellSize, origin, allowedMarks)
  .addFreeformRegion(id, hotspots)
  .build()
```

### SheetEngine

Main engine class:

```typescript
const engine = new SheetEngine(sheetDefinitions);

// Tool management
engine.setCurrentTool(markType);
engine.getCurrentTool();
engine.setCurrentValue(value);

// Sheet management
engine.getCurrentSheet();
engine.switchSheet(sheetId);

// Mark operations
engine.addMark(hotspotId, value?);
engine.removeMark(hotspotId);

// History
engine.undo();
engine.redo();
engine.canUndo();
engine.canRedo();

// Serialization
const state = engine.exportState();
engine.importState(state);

// Events
engine.on('markAdded', callback);
engine.on('markRemoved', callback);
engine.on('markRejected', callback);
```

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Vite** for blazing-fast builds
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **SVG** for scalable, print-friendly graphics

## Performance Considerations

- Uses `React.memo` for mark renderers
- Debounced hover state updates (60fps)
- Efficient hit detection with early returns
- Command pattern for O(1) undo/redo

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari, Chrome Mobile

## License

Open source - feel free to use and modify for your projects!

## Contributing

This is a demonstration project. Feel free to fork and adapt to your needs.

## Roadmap

Future enhancements could include:
- [ ] Multi-player sync (WebSockets/WebRTC)
- [ ] Zoom and pan controls
- [ ] Custom mark types via plugins
- [ ] Print-optimized export (PDF)
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Mobile gesture improvements (long-press, swipe)
- [ ] Background image alignment tools
- [ ] Snap-to-grid for freeform hotspots

---

**Built with ❤️ for the board game community**
