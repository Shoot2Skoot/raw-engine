# Roll & Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

## What This IS

- A framework for defining interactive, markable game sheets
- An intuitive UI for players to mark, fill, and annotate sheets
- A developer-friendly API for defining layouts and hotspots
- A state management system with undo/redo and save/load

## What This IS NOT

- A rules validator (doesn't know if moves are legal)
- A scoring calculator (doesn't understand game mechanics)
- A multiplayer game server (local only for now)
- A complete game (provides the canvas, not the game logic)

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

## Usage Example

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee-upper')
  .name('Upper Section')
  .size(400, 600)
  .backgroundColor('#F8F9FA')
  .addGridRegion(
    'scores',
    6, // rows
    1, // cols
    80, // cell size
    { x: 0, y: 0 },
    ['number']
  )
  .build();

// Initialize engine
const engine = new SheetEngine([mySheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  console.log('Mark added:', event);
  // Add your validation logic here
});

// Use in React
<EngineProvider engine={engine}>
  <SheetCanvas />
</EngineProvider>
```

## Features

### Core Engine

- ✅ Multiple mark types: checkbox, number, fill, circle, symbol, text, pencil
- ✅ Flexible hotspot shapes: rectangle, circle, polygon, point
- ✅ Grid and freeform layouts
- ✅ Undo/redo with command pattern
- ✅ Event system for game logic hooks
- ✅ Save/load state (localStorage + JSON export)

### UI Components

- ✅ Interactive SVG canvas with touch support
- ✅ Tool selection toolbar with keyboard shortcuts
- ✅ Value picker for numbers, colors, symbols
- ✅ Multi-sheet navigation with tabs
- ✅ Hover effects and visual feedback

### Developer Experience

- ✅ Fluent API with SheetBuilder
- ✅ Full TypeScript support
- ✅ Comprehensive type definitions
- ✅ Example sheets (Yahtzee, Moon Mission, Twilight)

## Architecture

```
src/
├── engine/           # Core engine logic
│   ├── types.ts      # TypeScript definitions
│   ├── SheetEngine.ts # Main engine class
│   ├── EventBus.ts   # Event system
│   └── History.ts    # Undo/redo
├── components/       # React components
│   ├── SheetCanvas.tsx
│   ├── MarkRenderer.tsx
│   ├── ValuePicker.tsx
│   ├── Toolbar.tsx
│   └── SheetTabs.tsx
├── utils/            # Utilities
│   ├── geometry.ts   # Hit detection
│   └── coordinates.ts # Transformations
├── builders/         # Builder API
│   └── SheetBuilder.ts
├── examples/         # Example sheets
│   ├── yahtzee.ts
│   ├── moon-mission.ts
│   └── mixed-layout.ts
└── context/          # React context
    └── EngineContext.tsx
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
- `Ctrl+S` - Save to browser

## Creating Custom Sheets

### Simple Grid

```typescript
const sheet = SheetBuilder.create('my-game')
  .name('My Game Sheet')
  .size(800, 1000)
  .addGridRegion('main', 10, 10, 50, { x: 0, y: 0 }, ['number'])
  .build();
```

### Freeform Hotspots

```typescript
const sheet = SheetBuilder.create('my-game')
  .name('My Game Sheet')
  .size(800, 1000)
  .addFreeformRegion('special', [
    {
      id: 'bonus',
      shape: 'circle',
      position: { x: 100, y: 100 },
      radius: 30,
      allowedMarkTypes: ['checkbox'],
      maxMarks: 1,
    },
  ])
  .build();
```

## Event System

Hook into engine events for custom game logic:

```typescript
engine.on('markAdded', (event) => {
  // Validate the mark
  if (!isValidMove(event.mark)) {
    engine.rejectMark(event.hotspotId, 'Invalid move!');
  }
});

engine.on('markRejected', (event) => {
  // Show error to user
  showToast(event.reason);
});
```

## Tech Stack

- React 18+
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- SVG for graphics
- Lucide React for icons

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

This is a framework for building roll-and-write games. Feel free to extend it with:

- Additional mark types
- New hotspot shapes
- Game-specific validation logic
- Custom rendering
- Multiplayer support
- Print-to-PDF functionality

## Examples Included

1. **Yahtzee** - Simple grid-based scoring
2. **Moon Mission** - Image-based with freeform hotspots
3. **Twilight Inscription** - Complex mixed layout

## Future Enhancements

- [ ] Zoom and pan
- [ ] Multi-mark hotspots
- [ ] Custom mark renderers
- [ ] Animation system
- [ ] Multiplayer sync
- [ ] Print optimization
- [ ] Accessibility improvements
- [ ] Performance optimizations for large sheets

---

Built with ❤️ for the roll-and-write gaming community
