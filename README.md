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
  .backgroundColor('#F5F5F5')
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
  if (!isValidYahtzeeScore(event.mark.value)) {
    engine.rejectMark(event.hotspotId);
  }
});

// Render in React
<EngineProvider engine={engine}>
  <SheetCanvas />
</EngineProvider>
```

## Features

### Core Engine (Phase 1)

- **Type System**: Complete TypeScript definitions for sheets, hotspots, marks, and events
- **Coordinate System**: SVG-based with automatic screen-to-sheet transformations
- **Geometry**: Hit detection for rectangles, circles, polygons, and points
- **Event Bus**: Subscribe to engine events for game logic integration
- **History**: Command pattern-based undo/redo with 100-entry history
- **Serialization**: Versioned save/load with localStorage support

### React Components (Phase 2)

- **EngineContext**: Global state management via React Context
- **SheetCanvas**: Interactive SVG canvas with touch support
- **MarkRenderer**: Multiple mark types (checkbox, number, fill, circle, symbol, text, pencil)
- **ValuePicker**: Popover for selecting mark values
- **Toolbar**: Tool selection with keyboard shortcuts (C, N, F, O, P, T)
- **SheetTabs**: Multi-sheet navigation

### Builder API (Phase 3)

- **Fluent API**: Chain methods to define sheets
- **Grid Layouts**: Auto-generate hotspots in regular grids
- **Freeform Regions**: Custom hotspot shapes and positions
- **Mixed Layouts**: Combine grids and freeform regions

### Examples (Phase 4)

- **Simple Grid**: Yahtzee-style score tracking
- **Image Hotspots**: Welcome to Moon style with background images
- **Complex Layout**: Mixed grids and irregular shapes

### Enhanced Interactions (Phase 5)

- **Mobile Gestures**: Long-press for alternate actions
- **Keyboard Navigation**: Tab through hotspots, Enter/Space to mark
- **Accessibility**: ARIA labels and keyboard shortcuts
- **Responsive**: Works on desktop, tablet, and mobile

## Architecture

```
src/
├── engine/           # Core engine logic
│   ├── types.ts      # TypeScript definitions
│   ├── SheetEngine.ts # Main engine class
│   ├── EventBus.ts   # Event system
│   └── History.ts    # Undo/redo
├── components/       # React UI components
│   ├── SheetCanvas.tsx
│   ├── MarkRenderer.tsx
│   ├── ValuePicker.tsx
│   ├── Toolbar.tsx
│   └── SheetTabs.tsx
├── utils/            # Utilities
│   ├── coordinates.ts
│   ├── geometry.ts
│   └── serialization.ts
├── builders/         # Fluent API
│   └── SheetBuilder.ts
├── context/          # React context
│   └── EngineContext.tsx
├── hooks/            # Custom hooks
│   └── useMobileGestures.ts
└── examples/         # Example sheets
    ├── 01-simple-grid.ts
    ├── 02-image-hotspots.ts
    └── 03-mixed-layout.ts
```

## Mark Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `checkbox` | Empty → Checked → Crossed | Binary choices, completed tasks |
| `number` | Integer value | Scores, counts |
| `fill` | Color fill | Resource tracking, territories |
| `circle` | Empty → Half → Full | Progress indicators |
| `symbol` | Icon from set | Categories, types |
| `text` | Free text | Notes, names |
| `pencil` | Erasable mark | Temporary annotations |

## Hotspot Shapes

- **Rectangle**: Most common, defined by position and size
- **Circle**: Defined by center point and radius
- **Polygon**: Irregular shapes with custom vertices
- **Point**: Implicit 20px click radius

## API Reference

### SheetEngine

```typescript
const engine = new SheetEngine(sheetDefinitions);

// Sheet management
engine.getCurrentSheet(): SheetState | undefined
engine.switchSheet(sheetId: string): void

// Tool management
engine.setCurrentTool(tool: MarkType): void
engine.setCurrentValue(value: string | number): void

// Mark operations
engine.addMark(hotspotId: string): boolean
engine.removeMark(hotspotId: string): boolean
engine.canPlaceMark(hotspot: Hotspot): boolean

// History
engine.undo(): boolean
engine.redo(): boolean
engine.canUndo(): boolean
engine.canRedo(): boolean

// Events
engine.on(eventType, callback): () => void

// Serialization
engine.exportState(): SaveState
engine.importState(saveState: SaveState): void
```

### SheetBuilder

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

## Keyboard Shortcuts

- **C**: Checkbox tool
- **N**: Number tool
- **F**: Fill tool
- **O**: Circle tool
- **P**: Pencil tool
- **T**: Text tool
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Tab**: Navigate hotspots
- **Enter/Space**: Mark hotspot

## Tech Stack

- **React 18+**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **SVG**: Scalable graphics
- **Lucide React**: Icons

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run build

# Lint
npm run lint
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Hotspot Limit**: Tested with 1000+ hotspots
- **History Size**: 100 entries (configurable)
- **Save State**: ~1KB per 100 marks (gzipped)

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## Roadmap

- [ ] Testing suite (Vitest + Playwright)
- [ ] Multiplayer support
- [ ] Print-friendly export
- [ ] Touch gesture improvements
- [ ] Additional mark types
- [ ] Animation effects
- [ ] Sound effects
- [ ] Theme customization

## Credits

Built with inspiration from popular roll-and-write games like:
- Welcome To...
- Railroad Ink
- Cartographers
- Ganz schön clever

---

**Made with ❤️ for the board game community**
