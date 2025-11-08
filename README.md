# Roll-and-Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-34%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-blue)

## What This Is

**A specialized drawing tool**, not a game rules engine. This framework provides:

- **Interactive Sheet Definition**: Define markable game sheets with grid and freeform layouts
- **Multiple Mark Types**: Checkbox, number, fill, circle, symbol, text, and pencil marks
- **Smart Hit Detection**: Accurate point-in-polygon detection for any hotspot shape
- **Undo/Redo System**: Full history management with Command pattern
- **Save/Load**: Serialize game state to localStorage or JSON files
- **Event System**: React to player actions with game logic hooks
- **Developer-Friendly API**: Fluent builder pattern for easy sheet creation

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the demo.

### Build

```bash
npm run build
```

### Test

```bash
npm test        # Run tests in watch mode
npm run test:ui # Run tests with UI
npm run test:run # Run tests once
```

## Usage Example

### 1. Define a Sheet

```typescript
import { SheetBuilder } from './builders/SheetBuilder';

const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    60, // cell size
    { x: 150, y: 100 },
    ['number']  // allowed mark types
  )
  .build();
```

### 2. Initialize the Engine

```typescript
import { SheetEngine } from './engine/SheetEngine';

const engine = new SheetEngine([mySheet]);

// Optional: Add game logic
engine.on('markAdded', (event) => {
  console.log('Mark added:', event);
  // Add your game validation here
});
```

### 3. Render with React

```typescript
import { EngineProvider } from './context/EngineContext';
import SheetCanvas from './components/SheetCanvas';
import Toolbar from './components/Toolbar';

function App() {
  return (
    <EngineProvider engine={engine}>
      <Toolbar />
      <SheetCanvas />
    </EngineProvider>
  );
}
```

## Core Features

### Mark Types

- **Checkbox**: Cycles through empty → checked → crossed
- **Number**: Enter numeric values (0-9)
- **Fill**: Color fill with customizable colors
- **Circle**: Cycles through empty → half → filled
- **Symbol**: Choose from predefined symbols (★, ♦, ♥, etc.)
- **Text**: Free-form text input
- **Pencil**: Temporary erasable marks

### Hotspot Shapes

- **Rectangle**: Standard grid cells
- **Circle**: Circular markers
- **Polygon**: Irregular shaped regions
- **Point**: Small clickable targets

### Keyboard Shortcuts

- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `P` - Pencil tool
- `T` - Text tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+S` - Save

## Architecture

```
src/
├── engine/           # Core game engine
│   ├── types.ts      # TypeScript definitions
│   ├── SheetEngine.ts # Main engine class
│   ├── EventBus.ts   # Event system
│   └── History.ts    # Undo/redo with Command pattern
├── components/       # React components
│   ├── SheetCanvas.tsx    # Main interactive SVG canvas
│   ├── MarkRenderer.tsx   # Mark rendering
│   ├── ValuePicker.tsx    # Value selection UI
│   ├── Toolbar.tsx        # Tool selection
│   └── SheetTabs.tsx      # Multi-sheet navigation
├── utils/            # Utilities
│   ├── geometry.ts        # Hit detection
│   ├── coordinates.ts     # Coordinate transforms
│   └── serialization.ts   # Save/load
├── builders/         # Builder pattern
│   └── SheetBuilder.ts    # Fluent API
└── examples/         # Example sheets
    ├── 01-simple-grid.ts
    ├── 02-mixed-layout.ts
    └── 03-bingo-style.ts
```

## Advanced Usage

### Creating Custom Layouts

```typescript
const customSheet = SheetBuilder.create('custom')
  .name('Custom Layout')
  .size(800, 1000)

  // Add a grid region
  .addGridRegion('main-grid', 5, 5, 80, { x: 50, y: 50 }, ['number', 'checkbox'])

  // Add freeform hotspots
  .addFreeformRegion('bonus-zones', [
    SheetBuilder.circle('bonus-1', 400, 400, 40, ['fill']),
    SheetBuilder.polygon('special', [
      { x: 100, y: 600 },
      { x: 250, y: 600 },
      { x: 200, y: 750 }
    ], ['symbol'])
  ])

  .build();
```

### Game Logic Hooks

```typescript
engine.on('markAdded', (event) => {
  const { sheetId, hotspotId, mark } = event;

  // Validate mark
  if (!isValidMove(mark)) {
    engine.rejectMark(hotspotId, 'Invalid move!');
    return;
  }

  // Update game state
  updateScore(mark.value);
});

engine.on('markRejected', (event) => {
  if (event.type === 'markRejected') {
    alert(event.reason);
  }
});
```

### Save/Load State

```typescript
// Save to localStorage
import { saveToLocalStorage } from './utils/serialization';
const state = engine.exportState();
saveToLocalStorage('my-game', state);

// Load from localStorage
import { loadFromLocalStorage } from './utils/serialization';
const savedState = loadFromLocalStorage('my-game');
if (savedState) {
  engine.importState(savedState);
}
```

## Testing

The project includes comprehensive unit tests:

- Geometry utilities (hit detection, grid generation)
- Engine core functionality (marks, undo/redo, serialization)
- All tests passing (34/34)

```bash
npm run test:run
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Vitest** - Testing
- **SVG** - Scalable graphics

## Project Status

✅ Core engine implementation
✅ All mark types (checkbox, number, fill, circle, symbol, text, pencil)
✅ Hit detection (rect, circle, polygon, point)
✅ Undo/redo with full history
✅ Save/load to localStorage
✅ Multi-sheet support
✅ Keyboard shortcuts
✅ Event system for game logic
✅ Unit tests (34 passing)
✅ Production build
⚪ Mobile gesture handling (future)
⚪ Accessibility enhancements (future)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

Contributions welcome! This is a framework for building roll-and-write games, not a complete game itself. Perfect for:

- Board game designers prototyping ideas
- Developers building digital versions of roll-and-write games
- Educators teaching game design concepts

## Examples Included

1. **Yahtzee Score Sheet** - Simple grid with number input
2. **Mixed Layout Demo** - Combination of grids, circles, polygons, and points
3. **Bingo Card** - Classic 5x5 grid with circular markers

## Acknowledgments

Built with modern web technologies and inspired by the roll-and-write board game genre (Yahtzee, Welcome To, Railroad Ink, etc.).
