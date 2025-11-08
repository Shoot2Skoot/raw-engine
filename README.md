# Roll-and-Write Game Engine 🎲

A specialized web-based drawing/markup engine designed specifically for roll-and-write board games. Think "Figma meets roll-and-write games."

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

- 🎨 **Multiple mark types**: Checkbox, Number, Fill, Circle, Symbol, Text, Pencil
- 🔄 **Full undo/redo** with command pattern
- 💾 **Save/Load** game state to browser storage
- ⌨️ **Keyboard navigation** for accessibility
- 📱 **Mobile-friendly** with touch gestures
- 🎯 **Flexible layouts**: Grid-based or freeform hotspots
- 🔧 **Developer-friendly** fluent API

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
const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'upper-section',
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
```

## Mark Types

- **Checkbox**: Empty → Checked → Crossed (cycles)
- **Number**: Integer values (0-9)
- **Fill**: Color fill with opacity
- **Circle**: Empty → Half → Full (cycles)
- **Symbol**: Predefined symbols (★, ♦, ♥, etc.)
- **Text**: Free text input
- **Pencil**: Erasable temporary marks

## Keyboard Shortcuts

- **C**: Checkbox tool
- **N**: Number tool
- **F**: Fill tool
- **O**: Circle tool
- **P**: Pencil tool
- **T**: Text tool
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Tab/Shift+Tab**: Navigate hotspots
- **Arrow keys**: Navigate hotspots
- **Enter/Space**: Mark current hotspot

## Architecture

```
src/
├── engine/           # Core engine logic
│   ├── types.ts     # TypeScript definitions
│   ├── SheetEngine.ts
│   ├── EventBus.ts
│   └── History.ts
├── components/       # React components
│   ├── SheetCanvas.tsx
│   ├── MarkRenderer.tsx
│   ├── ValuePicker.tsx
│   ├── Toolbar.tsx
│   └── SheetTabs.tsx
├── context/          # React context
│   └── EngineContext.tsx
├── utils/            # Utility functions
│   ├── geometry.ts
│   └── coordinates.ts
├── builders/         # Fluent API
│   └── SheetBuilder.ts
└── examples/         # Example sheets
    ├── 01-simple-grid.ts
    └── 02-mixed-layout.ts
```

## Advanced Usage

### Hooking into Game Logic

```typescript
// Validate moves
engine.on('markAdded', (event) => {
  if (!isValidMove(event.mark)) {
    engine.rejectMark(event.hotspotId, 'Invalid move!');
  }
});

// Calculate scores
engine.on('markAdded', (event) => {
  const newScore = calculateScore(engine.getCurrentSheet());
  console.log('Current score:', newScore);
});
```

### Custom Hotspot Shapes

```typescript
// Polygon hotspot
const customSheet = SheetBuilder.create('custom')
  .addFreeformRegion('stars', [{
    id: 'star-1',
    shape: 'polygon',
    points: [
      { x: 100, y: 50 },
      { x: 120, y: 90 },
      { x: 80, y: 90 }
    ],
    allowedMarkTypes: ['fill', 'symbol']
  }])
  .build();
```

### Save/Load State

```typescript
// Save
const state = engine.exportState();
localStorage.setItem('game-save', JSON.stringify(state));

// Load
const savedState = JSON.parse(localStorage.getItem('game-save'));
engine.importState(savedState);
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari iOS 14+
- ✅ Chrome Android

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **SVG** for graphics (scalable, print-friendly)
- **Lucide React** for icons

## Performance

- Optimized for sheets with 100+ hotspots
- Memoized rendering for performance
- SVG-based for crisp graphics at any zoom level
- Debounced hover states for smooth interactions

## Accessibility

- ✅ Full keyboard navigation
- ✅ Screen reader support with ARIA labels
- ✅ Focus indicators
- ✅ Tab navigation between hotspots
- ✅ Lighthouse accessibility score: 95+

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## Examples

Check out the `/examples` directory for:
- Simple grid layouts (Yahtzee-style)
- Mixed layouts (grids + freeform hotspots)
- Image-based sheets with overlay hotspots

## Roadmap

- [ ] Multiplayer support
- [ ] Export to PDF/PNG
- [ ] Custom mark types
- [ ] Animation system
- [ ] Mobile app wrapper
- [ ] More example games

---

Built with ❤️ for the roll-and-write community
