# Roll-and-Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

## What is This?

This is **a specialized drawing tool**, not a game rules engine. It provides:

- ✅ A framework for defining interactive, markable game sheets
- ✅ An intuitive UI for players to mark, fill, and annotate sheets
- ✅ A developer-friendly API for defining layouts and hotspots
- ✅ State management with undo/redo and save/load

This is **NOT**:

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Basic Usage

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee-upper')
  .name('Upper Section')
  .size(400, 600)
  .addGridRegion(
    'scores',
    6,    // rows
    1,    // cols
    80,   // cell size
    { x: 0, y: 0 },  // origin
    ['number']       // allowed mark types
  )
  .build();

// Initialize engine
const engine = new SheetEngine([mySheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  if (!isValidYahtzeeScore(event.mark.value)) {
    engine.rejectMark(event.hotspotId);
  }
});

// Render (in React)
<EngineProvider engine={engine}>
  <SheetCanvas />
</EngineProvider>
```

## Features

### 🎨 Mark Types

- **Checkbox**: Cycle through empty → checked → crossed
- **Number**: Integer values with number picker
- **Fill**: Color fills with opacity
- **Circle**: Empty → Half → Full progression
- **Symbol**: Icons from predefined set (★ ♦ ♥ ♠ ♣ ● ■ ▲)
- **Text**: Free text input
- **Pencil**: Erasable temporary marks

### 🎮 Hotspot Shapes

- **Rectangle**: Axis-aligned bounding boxes
- **Circle**: Circular regions with radius
- **Polygon**: Arbitrary polygons (closed paths)
- **Point**: Click targets with implicit radius

### ⌨️ Keyboard Shortcuts

- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `P` - Pencil tool
- `T` - Text tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+S` - Save

### 💾 State Management

- Full undo/redo history (100 steps)
- Auto-save every 30 seconds to localStorage
- Export/import JSON for manual backup
- Multi-sheet support with independent state

## Architecture

```
roll-and-write-engine/
├── src/
│   ├── components/      # React UI components
│   │   ├── SheetCanvas.tsx
│   │   ├── MarkRenderer.tsx
│   │   ├── ValuePicker.tsx
│   │   ├── Toolbar.tsx
│   │   └── SheetTabs.tsx
│   ├── engine/          # Core engine logic
│   │   ├── types.ts
│   │   ├── SheetEngine.ts
│   │   ├── EventBus.ts
│   │   └── History.ts
│   ├── utils/           # Utility functions
│   │   ├── geometry.ts
│   │   ├── coordinates.ts
│   │   └── serialization.ts
│   ├── builders/        # Fluent API builders
│   │   └── SheetBuilder.ts
│   ├── examples/        # Example sheet definitions
│   └── hooks/           # React hooks
└── tests/               # Unit & integration tests
```

## Creating Custom Sheets

### Simple Grid

```typescript
const sheet = SheetBuilder.create('my-game')
  .name('My Game Sheet')
  .size(800, 1000)
  .backgroundColor('#ffffff')
  .addGridRegion(
    'main-grid',
    10,   // rows
    10,   // cols
    50,   // cell size
    { x: 50, y: 50 },
    ['number', 'fill']
  )
  .build();
```

### Freeform Hotspots

```typescript
const sheet = SheetBuilder.create('custom')
  .name('Custom Layout')
  .size(800, 1000)
  .addFreeformRegion('regions', [
    {
      id: 'zone-1',
      shape: 'polygon',
      position: { x: 100, y: 100 },
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 120 },
        { x: 180, y: 200 },
        { x: 80, y: 180 }
      ],
      allowedMarkTypes: ['fill', 'symbol'],
      maxMarks: 2
    }
  ])
  .build();
```

### With Background Image

```typescript
const sheet = SheetBuilder.create('themed')
  .name('Themed Sheet')
  .size(800, 1000)
  .background('/path/to/background.png')
  .addFreeformRegion('hotspots', [...])
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

  // Mark operations
  addMark(hotspotId: string): boolean
  removeMark(hotspotId: string): boolean
  clearAllMarks(sheetId?: string): void

  // History
  undo(): boolean
  redo(): boolean
  canUndo(): boolean
  canRedo(): boolean

  // Sheet management
  switchSheet(sheetId: string): void
  getCurrentSheet(): SheetState | undefined

  // Serialization
  exportState(): SaveState
  importState(state: SaveState): void
  saveToLocalStorage(key?: string): void
  loadFromLocalStorage(key?: string): boolean

  // Events
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void
}
```

### Events

```typescript
engine.on('markAdded', (event) => {
  console.log('Mark added:', event.mark);
});

engine.on('markRemoved', (event) => {
  console.log('Mark removed:', event.mark);
});

engine.on('markRejected', (event) => {
  console.log('Mark rejected:', event.reason);
});

engine.on('sheetChanged', (event) => {
  console.log('Sheet changed from', event.previousSheetId, 'to', event.currentSheetId);
});

engine.on('toolChanged', (event) => {
  console.log('Tool changed from', event.previousTool, 'to', event.currentTool);
});
```

## Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (for CI)
npm run test:run
```

The engine includes comprehensive tests:

- ✅ 27 passing unit tests
- ✅ Geometry utilities (point-in-shape detection)
- ✅ Engine core (mark placement, undo/redo, serialization)
- ✅ Sheet building and validation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, iOS 14+)

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **SVG** - Scalable graphics
- **Vitest** - Testing
- **Lucide React** - Icons

## Examples Included

1. **Yahtzee** - Simple grid layout
2. **Moon Mission** - Freeform hotspots with circles
3. **Twilight Inscription** - Complex mixed layout

## Performance

- Virtual rendering for 100+ hotspots
- Debounced hover states (16ms)
- Memoized mark renderers
- Efficient coordinate transformations

## Accessibility

- ✅ Keyboard navigation (Tab to move, Enter to mark)
- ✅ ARIA labels on all interactive elements
- ✅ High contrast support
- ✅ Screen reader friendly

## License

MIT

## Contributing

This is a demonstration project. For production use, consider:

- Adding game-specific rule validation
- Implementing multiplayer sync
- Adding animation transitions
- Supporting custom fonts
- Adding print-optimized export

## Author

Built as a comprehensive roll-and-write game engine demonstration.
