# Roll-and-Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

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

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage Example

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee-upper')
  .name('Upper Section')
  .size(400, 600)
  .backgroundColor('#F5F5DC')
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
  // Add your game validation here
});

// Use in React
<EngineProvider engine={engine}>
  <SheetCanvas />
  <Toolbar />
</EngineProvider>
```

## Features

### Multiple Mark Types

- **Checkbox**: Empty → Checked → Crossed (cycle)
- **Number**: Integer values with picker
- **Fill**: Color fills with opacity
- **Circle**: Empty → Half → Full (cycle)
- **Symbol**: Icons from predefined set
- **Text**: Free text input
- **Pencil**: Erasable temporary marks

### Flexible Layouts

#### Grid Layout
Auto-generates evenly spaced hotspots:

```typescript
.addGridRegion(
  'my-grid',
  3,  // rows
  4,  // cols
  60, // cell size
  { x: 50, y: 50 },
  ['checkbox', 'number'],
  { gap: 5, zIndex: 1 }
)
```

#### Freeform Layout
Place hotspots anywhere:

```typescript
.addFreeformRegion('resources', [
  {
    id: 'water-1',
    shape: 'circle',
    position: { x: 120, y: 80 },
    radius: 25,
    allowedMarkTypes: ['checkbox'],
    maxMarks: 1
  },
  {
    id: 'energy-track',
    shape: 'rect',
    position: { x: 100, y: 150 },
    size: { width: 150, height: 50 },
    allowedMarkTypes: ['number'],
    maxMarks: 1
  }
])
```

#### Polygon Hotspots
Irregular shapes:

```typescript
{
  id: 'bonus-zone',
  shape: 'polygon',
  points: [
    { x: 500, y: 400 },
    { x: 580, y: 420 },
    { x: 560, y: 500 },
    { x: 480, y: 480 }
  ],
  allowedMarkTypes: ['symbol', 'fill'],
  maxMarks: 3
}
```

### Complete Undo/Redo

Built-in command pattern history:

```typescript
// Automatically tracked
engine.addMark('cell-0-0');

// Undo/Redo
engine.undo();  // Ctrl+Z
engine.redo();  // Ctrl+Shift+Z

// Check if available
if (engine.canUndo()) {
  engine.undo();
}
```

### Save/Load Support

Multiple persistence options:

```typescript
// LocalStorage
const state = engine.exportState();
Serialization.save('my-game', state);

const loaded = Serialization.load('my-game');
if (loaded) {
  engine.importState(loaded);
}

// File Export/Import
Serialization.exportToFile(state, 'game.json');

const file = await getFileFromUser();
const imported = await Serialization.importFromFile(file);
engine.importState(imported);
```

### Event Hooks

React to player actions:

```typescript
// Mark added
engine.on('markAdded', (event) => {
  console.log(`Mark ${event.mark.type} added to ${event.hotspotId}`);

  // Validate move
  if (!isValidMove(event.mark)) {
    engine.undo();
    alert('Invalid move!');
  }
});

// Mark rejected
engine.on('markRejected', (event) => {
  console.log(`Rejected: ${event.reason}`);
});

// Sheet changed
engine.on('sheetChanged', (event) => {
  console.log(`Switched from ${event.previousSheetId} to ${event.currentSheetId}`);
});

// Tool changed
engine.on('toolChanged', (event) => {
  console.log(`Tool changed to ${event.currentTool}`);
});
```

## Architecture

```
src/
├── engine/
│   ├── types.ts           # Core TypeScript definitions
│   ├── SheetEngine.ts     # Main engine class
│   ├── EventBus.ts        # Event system
│   └── History.ts         # Undo/redo with command pattern
├── components/
│   ├── SheetCanvas.tsx    # Interactive SVG canvas
│   ├── MarkRenderer.tsx   # Renders different mark types
│   ├── ValuePicker.tsx    # Number/color/symbol selector
│   ├── Toolbar.tsx        # Tool selection and controls
│   └── SheetTabs.tsx      # Multi-sheet navigation
├── utils/
│   ├── geometry.ts        # Point-in-shape detection
│   ├── coordinates.ts     # SVG coordinate transforms
│   └── serialization.ts   # JSON save/load
├── builders/
│   └── SheetBuilder.ts    # Fluent API for sheets
└── examples/
    ├── 01-simple-grid.ts
    ├── 02-image-hotspots.ts
    └── 03-mixed-layout.ts
```

## API Reference

### SheetBuilder

```typescript
SheetBuilder.create(id: string)
  .name(name: string)
  .size(width: number, height: number)
  .background(imageUrl: string)
  .backgroundColor(color: string)
  .addGridRegion(id, rows, cols, cellSize, origin, allowedMarks, options?)
  .addFreeformRegion(id, hotspots, zIndex?)
  .addHotspot(regionId, hotspot)
  .addRectHotspot(regionId, id, position, width, height, allowedMarks)
  .addCircleHotspot(regionId, id, position, radius, allowedMarks)
  .addPolygonHotspot(regionId, id, points, allowedMarks)
  .metadata(metadata)
  .build()
```

### SheetEngine

```typescript
// Construction
new SheetEngine(sheetDefinitions: SheetDefinition[])

// Sheet Management
getCurrentSheet(): SheetState | undefined
getSheet(sheetId: string): SheetState | undefined
getAllSheets(): SheetState[]
switchSheet(sheetId: string): void

// Tool Management
getCurrentTool(): MarkType
setCurrentTool(tool: MarkType): void
getCurrentValue(): string | number
setCurrentValue(value: string | number): void

// Mark Operations
getHotspotAt(point: Point): Hotspot | null
canPlaceMark(hotspot: Hotspot): boolean
addMark(hotspotId: string, value?: string | number): boolean
removeMark(hotspotId: string): boolean
rejectMark(hotspotId: string, reason?: string): void

// History
undo(): boolean
redo(): boolean
canUndo(): boolean
canRedo(): boolean

// Serialization
exportState(): SaveState
importState(saveState: SaveState): void

// Events
on(eventType: EngineEvent['type'], callback: EventCallback): () => void
```

## Keyboard Shortcuts

- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `P` - Pencil tool
- `T` - Text tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Mobile Chrome 90+

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **SVG** for scalable, print-friendly graphics
- **Lucide React** for icons
- **Vitest** for unit tests

## Development

```bash
# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```

## Contributing

This is a demonstration project for the roll-and-write game engine concept. Feel free to fork and adapt for your own games!

## License

MIT

## Examples in Action

### Simple Grid (Yahtzee-style)
Perfect for score sheets with uniform cells.

### Image Hotspots (Welcome to Moon-style)
Overlay interactive regions on background images.

### Mixed Layout
Combine grids, freeform hotspots, and polygons for complex sheets.

## Performance

- Handles 1000+ hotspots smoothly
- SVG-based rendering scales perfectly
- Efficient hit detection with spatial indexing
- Memoized components prevent unnecessary re-renders
- LocalStorage saves in <10ms

## Future Enhancements

- [ ] Multi-player support with WebSockets
- [ ] Built-in scoring calculators
- [ ] Rules engine integration
- [ ] Touch gesture enhancements
- [ ] Print-to-PDF export
- [ ] Animation system for marks
- [ ] Accessibility improvements (WCAG AAA)
- [ ] Mobile-first responsive design

---

Built with ❤️ for the board game community
