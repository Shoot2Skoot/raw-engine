# Roll & Write Game Engine

A specialized drawing/markup engine for roll-and-write board games. Think "Figma meets roll-and-write games."

## What This Is

- ✅ A framework for defining interactive, markable game sheets
- ✅ An intuitive UI for players to mark, fill, and annotate sheets
- ✅ A developer-friendly API for defining layouts and hotspots
- ✅ A state management system with undo/redo and save/load

## What This Is NOT

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Features

### Multiple Mark Types
- **Checkboxes**: Empty → Checked → Crossed (cycle)
- **Numbers**: Integer value entry
- **Fill**: Color fill with opacity
- **Circles**: Empty → Half → Full (cycle)
- **Symbols**: Icons from predefined set
- **Text**: Free text input
- **Pencil**: Erasable temporary marks

### Developer Experience
- Fluent API for building sheets
- TypeScript-first with full type safety
- Event system for game logic hooks
- Hot module replacement during development

### Player Experience
- Click to mark cells
- Keyboard shortcuts (C, N, F, O, P, T)
- Undo/Redo (Ctrl+Z, Ctrl+Shift+Z)
- Save/Load to browser storage
- Responsive design for desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Usage Example

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a Yahtzee-style sheet
const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    60, // cell size
    { x: 170, y: 100 },
    ['number'],
    5  // gap
  )
  .build();

// Initialize engine
const engine = new SheetEngine([yahtzeeSheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  console.log('Mark added:', event);
  // Validate, calculate score, etc.
});

// Render in React
<EngineProvider engine={engine}>
  <SheetCanvas />
  <Toolbar />
</EngineProvider>
```

## Architecture

### Core Engine (`src/engine/`)
- **types.ts**: Type definitions for all engine components
- **SheetEngine.ts**: Main engine class managing sheets, marking, and state
- **EventBus.ts**: Event system for game logic hooks
- **History.ts**: Undo/redo with Command pattern

### Utilities (`src/utils/`)
- **geometry.ts**: Hit detection and grid generation
- **coordinates.ts**: SVG coordinate transformations
- **serialization.ts**: JSON save/load with versioning

### React Components (`src/components/`)
- **SheetCanvas.tsx**: Main interactive SVG canvas
- **Toolbar.tsx**: Tool selection and actions
- **MarkRenderer.tsx**: Renders different mark types
- **ValuePicker.tsx**: Popup for value selection
- **SheetTabs.tsx**: Multi-sheet navigation

### Builders (`src/builders/`)
- **SheetBuilder.ts**: Fluent API for creating sheet definitions

## Project Structure

```
raw-engine/
├── src/
│   ├── components/        # React components
│   ├── engine/           # Core engine logic
│   ├── context/          # React context providers
│   ├── utils/            # Utility functions
│   ├── hooks/            # React hooks
│   ├── builders/         # Builder patterns
│   ├── examples/         # Example sheet definitions
│   └── App.tsx           # Main application
├── tests/
│   ├── unit/             # Unit tests
│   └── setup.ts          # Test configuration
└── public/               # Static assets
```

## Design Principles

1. **Separation of Concerns**: Engine handles marking, not game rules
2. **Type Safety**: TypeScript strict mode for all code
3. **Developer Experience**: Fluent APIs and clear documentation
4. **Performance**: Efficient hit detection and minimal re-renders
5. **Accessibility**: Keyboard navigation and ARIA attributes

## Hotspot Types

### Rectangle
```typescript
{
  id: 'cell-1',
  shape: 'rect',
  position: { x: 100, y: 100 },
  size: { width: 50, height: 50 },
  allowedMarkTypes: ['number']
}
```

### Circle
```typescript
{
  id: 'resource-1',
  shape: 'circle',
  position: { x: 200, y: 200 },
  radius: 25,
  allowedMarkTypes: ['checkbox', 'fill']
}
```

### Polygon
```typescript
{
  id: 'region-1',
  shape: 'polygon',
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ],
  allowedMarkTypes: ['symbol']
}
```

## Event System

```typescript
// Subscribe to events
engine.on('markAdded', (event) => {
  console.log(`Mark added to ${event.hotspotId}`);
});

engine.on('markRejected', (event) => {
  console.log(`Mark rejected: ${event.reason}`);
});

engine.on('sheetChanged', (event) => {
  console.log(`Switched from ${event.previousSheetId} to ${event.currentSheetId}`);
});

engine.on('toolChanged', (event) => {
  console.log(`Tool changed to ${event.currentTool}`);
});
```

## State Management

```typescript
// Export current state
const saveState = engine.exportState();
localStorage.setItem('game-save', JSON.stringify(saveState));

// Import saved state
const savedData = localStorage.getItem('game-save');
if (savedData) {
  const saveState = JSON.parse(savedData);
  engine.importState(saveState);
}

// Undo/Redo
engine.undo();
engine.redo();
```

## Testing

```bash
# Run unit tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test -- --coverage
```

## Tech Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Vitest**: Unit testing
- **Lucide React**: Icons
- **SVG**: Scalable, print-friendly graphics

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari/Chrome

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## Roadmap

- [ ] Image upload for custom backgrounds
- [ ] Export to PDF/PNG
- [ ] Multiplayer support via WebRTC
- [ ] Mobile gesture improvements
- [ ] Additional mark types (lines, arrows, etc.)
- [ ] Template library
- [ ] Accessibility improvements (screen reader support)

## Success Criteria

✅ Developer can define a sheet in < 30 lines of code
✅ Touch interactions feel native (no lag, proper feedback)
✅ All mark types render clearly at any zoom
✅ Undo/redo works across all sheets
✅ State serializes/deserializes perfectly
✅ Keyboard navigation works completely
✅ Works on mobile Safari, Chrome, and Firefox

## Credits

Built with ❤️ for the roll-and-write board game community.
