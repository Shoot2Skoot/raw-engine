# Roll-and-Write Game Engine

A specialized web-based drawing/markup engine designed specifically for roll-and-write board games. Think "Figma meets roll-and-write games."

## What This Is

- **A framework for defining interactive, markable game sheets** - Create digital versions of roll-and-write game sheets with ease
- **An intuitive UI for players** - Mark, fill, and annotate sheets with various tools
- **A developer-friendly API** - Simple builder pattern for defining layouts and hotspots
- **State management with undo/redo** - Full history tracking and save/load functionality

## What This Is NOT

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Features

### Mark Types
- ✅ **Checkbox** - Empty → Checked → Crossed (cycles)
- ✅ **Number** - Integer values (0-9)
- ✅ **Fill** - Color fill with opacity
- ✅ **Circle** - Empty → Half → Full (cycles)
- ✅ **Symbol** - Icons from predefined set
- ✅ **Text** - Free text input
- ✅ **Pencil** - Erasable temporary marks

### Hotspot Shapes
- ✅ **Rectangle** - Perfect for grid cells
- ✅ **Circle** - Great for resource tokens
- ✅ **Polygon** - Irregular shaped regions
- ✅ **Point** - Single clickable spots
- ✅ **Auto-generated grids** - Define rows/cols, get hotspots automatically

### Engine Features
- ✅ **Unlimited undo/redo** - Full command pattern implementation
- ✅ **Save/load state** - Persists to localStorage
- ✅ **Multi-sheet support** - Handle complex games with multiple sheets
- ✅ **Keyboard shortcuts** - Fast tool switching (C, N, F, O, P, T)
- ✅ **Touch-friendly** - Works on mobile and tablets
- ✅ **Event system** - Hook into mark events for custom game logic
- ✅ **SVG-based** - Scalable, print-friendly, accessible

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **SVG** - Scalable vector graphics
- **Lucide React** - Beautiful icons
- **Vitest** - Unit testing

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

Here's how easy it is to create a game sheet:

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5F5')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']  // allowed mark types
  )
  .build();

// Initialize engine
const engine = new SheetEngine([mySheet]);

// Hook into game logic (optional)
engine.on('markAdded', (event) => {
  console.log('Mark added:', event.hotspotId, event.mark);
  // Add your validation logic here
});

// Render in React
<EngineProvider engine={engine}>
  <Toolbar />
  <SheetCanvas />
</EngineProvider>
```

## Project Structure

```
src/
├── engine/
│   ├── types.ts              # TypeScript definitions
│   ├── SheetEngine.ts        # Main engine class
│   ├── EventBus.ts           # Event system
│   └── History.ts            # Undo/redo implementation
├── components/
│   ├── SheetCanvas.tsx       # Interactive SVG canvas
│   ├── MarkRenderer.tsx      # Renders different mark types
│   ├── ValuePicker.tsx       # Number/color/symbol selector
│   ├── Toolbar.tsx           # Tool selection
│   └── SheetTabs.tsx         # Multi-sheet navigation
├── context/
│   └── EngineContext.tsx     # React context provider
├── utils/
│   ├── geometry.ts           # Point-in-shape detection
│   └── coordinates.ts        # SVG coordinate transformations
├── builders/
│   └── SheetBuilder.ts       # Fluent API for creating sheets
└── examples/
    ├── 01-simple-grid.ts     # Yahtzee-style example
    ├── 02-image-hotspots.ts  # Welcome to Moon style
    └── 03-mixed-layout.ts    # Complex mixed layout
```

## Examples Included

### Example 1: Simple Grid (Yahtzee-style)
A straightforward grid layout perfect for score tracking games like Yahtzee.

### Example 2: Image with Hotspots (Welcome to Moon)
Demonstrates freeform hotspot placement with circles and custom regions.

### Example 3: Mixed Layout (Twilight Inscription)
Complex example showing grids, polygons, and resource tracks all in one sheet.

## Creating Custom Sheets

### Basic Grid

```typescript
const sheet = SheetBuilder.create('my-game')
  .name('My Game Sheet')
  .size(800, 1000)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'score-grid',
    5,    // rows
    5,    // columns
    60,   // cell size in pixels
    { x: 100, y: 100 },  // origin point
    ['number', 'checkbox']  // allowed tools
  )
  .build();
```

### Freeform Hotspots

```typescript
const sheet = SheetBuilder.create('custom')
  .name('Custom Layout')
  .size(800, 1000)
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
      id: 'region-1',
      shape: 'polygon',
      position: { x: 200, y: 200 },
      points: [
        { x: 200, y: 200 },
        { x: 280, y: 220 },
        { x: 260, y: 300 },
        { x: 180, y: 280 }
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 3
    }
  ])
  .build();
```

## Keyboard Shortcuts

- **C** - Checkbox tool
- **N** - Number tool
- **F** - Fill tool
- **O** - Circle tool
- **P** - Pencil tool
- **T** - Text tool
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z** - Redo

## Event System

Hook into mark events to add custom game logic:

```typescript
// Listen to mark events
engine.on('markAdded', (event) => {
  console.log('Mark added:', event);

  // Validate the mark
  if (!isValidMove(event.mark)) {
    engine.rejectMark(event.hotspotId, 'Invalid move!');
  }
});

engine.on('markRemoved', (event) => {
  console.log('Mark removed:', event);
});

engine.on('sheetChanged', (event) => {
  console.log('Sheet changed:', event);
});
```

## API Reference

### SheetEngine

```typescript
const engine = new SheetEngine(sheetDefinitions);

// Tool management
engine.setCurrentTool('number');
engine.getCurrentTool();
engine.setCurrentValue(5);

// Mark operations
engine.addMark(hotspotId);
engine.addMark(hotspotId, customValue);
engine.removeMark(hotspotId);

// History
engine.undo();
engine.redo();
engine.canUndo();
engine.canRedo();

// Sheet management
engine.getCurrentSheet();
engine.switchSheet(sheetId);
engine.getAllSheets();

// Serialization
const state = engine.exportState();
engine.importState(state);

// Hit detection
const hotspot = engine.getHotspotAt({ x: 100, y: 200 });

// Event subscriptions
const unsubscribe = engine.on('markAdded', callback);
```

## Performance

- **Memoized components** - React.memo for MarkRenderer
- **Efficient hit detection** - Optimized point-in-shape algorithms
- **Z-index sorting** - Proper layering for complex sheets
- **SVG optimization** - Minimal DOM updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a demonstration project for building roll-and-write game engines. Feel free to fork and adapt for your own games!

## Future Enhancements

Potential additions (not implemented):

- [ ] Mobile gesture handling (pinch to zoom)
- [ ] Full accessibility features (keyboard navigation, ARIA)
- [ ] Multiplayer support
- [ ] Custom mark types
- [ ] Animation system
- [ ] Print optimization
- [ ] Theming support
- [ ] Export to PDF

## License

MIT

## Credits

Built with React, TypeScript, Tailwind CSS, and SVG.

---

**Remember**: This engine provides the *canvas*, not the *game*. You'll need to add your own game rules, validation, and scoring logic!
