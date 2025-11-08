# Roll-and-Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. This is a specialized drawing tool framework, not a game rules engine. Think "Figma meets roll-and-write games."

## What This IS

- ✅ A framework for defining interactive, markable game sheets
- ✅ An intuitive UI for players to mark, fill, and annotate sheets
- ✅ A developer-friendly API for defining layouts and hotspots
- ✅ A state management system with undo/redo and save/load

## What This IS NOT

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Features

### Core Features
- **Multiple Mark Types**: Checkbox, Number, Fill, Circle, Symbol, Text, Pencil
- **Flexible Layouts**: Grid-based and freeform hotspot placement
- **Undo/Redo**: Full history management with Command pattern
- **Auto-save**: Automatic localStorage persistence
- **Multi-sheet Support**: Tab-based navigation between sheets
- **Responsive**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and ARIA support

### Mark Types
1. **Checkbox** - Empty → Checked → Crossed (cycles)
2. **Number** - Integer value with number picker
3. **Fill** - Color fill with color palette
4. **Circle** - Empty → Half → Full (cycles)
5. **Symbol** - Icon from predefined set
6. **Text** - Free text input
7. **Pencil** - Erasable temporary marks

### Keyboard Shortcuts
- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `P` - Pencil tool
- `T` - Text tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Example

Here's what using the engine looks like:

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee-upper')
  .name('Upper Section')
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
  // Add your game logic here
});

// In your React component
<EngineProvider engine={engine}>
  <Toolbar />
  <SheetCanvas />
</EngineProvider>
```

## Project Structure

```
src/
├── components/          # React components
│   ├── SheetCanvas.tsx     # Main interactive SVG canvas
│   ├── MarkRenderer.tsx    # Renders different mark types
│   ├── ValuePicker.tsx     # Value selection UI
│   ├── Toolbar.tsx         # Tool selection
│   └── SheetTabs.tsx       # Multi-sheet navigation
├── engine/             # Core engine logic
│   ├── types.ts           # TypeScript definitions
│   ├── SheetEngine.ts     # Main engine class
│   ├── EventBus.ts        # Event system
│   └── History.ts         # Undo/redo system
├── utils/              # Utility functions
│   ├── geometry.ts        # Point-in-shape detection
│   └── coordinates.ts     # SVG coordinate transformations
├── builders/           # Fluent API builders
│   └── SheetBuilder.ts    # Sheet definition builder
└── examples/           # Example sheet definitions
    ├── 01-simple-grid.ts
    └── 02-mixed-layout.ts
```

## Architecture

### Coordinate System
- Origin (0,0) is top-left of sheet
- X increases rightward, Y increases downward
- All hotspot coordinates are in sheet space (not screen space)
- SVG viewBox handles scaling automatically

### Event System
The engine emits events that you can hook into for game logic:

```typescript
engine.on('markAdded', (event) => {
  // Validate the mark against game rules
  if (!isValidMove(event.mark)) {
    engine.rejectMark(event.hotspotId, 'Invalid move');
  }
});

engine.on('markRejected', (event) => {
  console.warn('Invalid move:', event.reason);
});
```

### State Management
- Uses React Context for global state
- Command pattern for undo/redo
- LocalStorage for persistence
- Immutable sheet definitions

## Creating Custom Sheets

### Simple Grid Layout

```typescript
const sheet = SheetBuilder.create('my-game')
  .name('My Game Sheet')
  .size(800, 1000)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'main-grid',
    5,  // rows
    5,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number', 'checkbox'],
    5   // gap between cells
  )
  .build();
```

### Freeform Hotspots

```typescript
const sheet = SheetBuilder.create('complex-game')
  .name('Complex Layout')
  .size(800, 1000)
  .addFreeformRegion('special-areas', [
    {
      id: 'bonus-circle',
      shape: 'circle',
      position: { x: 400, y: 200 },
      radius: 40,
      allowedMarkTypes: ['fill', 'symbol']
    },
    {
      id: 'polygon-region',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
      ],
      allowedMarkTypes: ['fill']
    }
  ])
  .build();
```

## API Reference

### SheetEngine

```typescript
class SheetEngine {
  // Tool management
  setCurrentTool(tool: MarkType): void
  getCurrentTool(): MarkType
  setCurrentValue(value: string | number): void

  // Marking operations
  addMark(hotspotId: string, value?: string | number): boolean
  removeMark(hotspotId: string): boolean
  toggleMark(hotspotId: string): boolean

  // Sheet management
  getCurrentSheet(): SheetState | undefined
  switchSheet(sheetId: string): void

  // History
  undo(): boolean
  redo(): boolean
  canUndo(): boolean
  canRedo(): boolean

  // Persistence
  saveToLocalStorage(key?: string): void
  loadFromLocalStorage(key?: string): boolean
  exportState(): SaveState
  importState(state: SaveState): void

  // Events
  on(eventType: string, callback: (event: EngineEvent) => void): () => void
}
```

### SheetBuilder

```typescript
class SheetBuilder {
  static create(id: string): SheetBuilder

  name(name: string): this
  size(width: number, height: number): this
  background(imageUrl: string): this
  backgroundColor(color: string): this

  addGridRegion(
    id: string,
    rows: number,
    cols: number,
    cellSize: number,
    origin: Point,
    allowedMarks: MarkType[],
    gap?: number
  ): this

  addFreeformRegion(id: string, hotspots: Hotspot[]): this

  build(): SheetDefinition
}
```

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety (strict mode)
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SVG** - Scalable, print-friendly graphics
- **Lucide React** - Icons
- **LocalStorage** - Persistence

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile

## Performance

- Supports sheets with 100+ hotspots
- 60fps interactions with proper memoization
- Debounced hover state updates
- Lazy rendering of off-screen regions

## License

MIT

## Contributing

Contributions welcome! This is an open framework for roll-and-write game developers.

### Key Design Principles
1. **Developer Experience First** - Easy to define sheets programmatically
2. **Player Delight** - Smooth, intuitive interactions
3. **Separation of Concerns** - Drawing engine ≠ game rules
4. **Extensibility** - Easy to add new mark types and behaviors
5. **Accessibility** - Keyboard and screen reader support

## Examples

Check out the `src/examples/` directory for:
- Simple grid-based games (Yahtzee-style)
- Complex freeform layouts
- Multi-sheet games

---

**Built with ❤️ for roll-and-write game designers**
