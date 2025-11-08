# Roll & Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What This Is

- **A framework for defining interactive, markable game sheets**
- **An intuitive UI for players to mark, fill, and annotate sheets**
- **A developer-friendly API for defining layouts and hotspots**
- **A state management system with undo/redo and save/load**

## What This Is NOT

- A rules validator (doesn't know if moves are legal)
- A scoring calculator (doesn't understand game mechanics)
- A multiplayer game server (local only for now)
- A complete game (provides the canvas, not the game logic)

## Features

### Mark Types

- **Checkbox**: Empty → Checked → Crossed (cycle)
- **Number**: Integer value with picker
- **Fill**: Color fill with opacity
- **Circle**: Empty → Half → Full (cycle)
- **Symbol**: Icon from predefined set (★, ♦, ♥, ♠, etc.)
- **Text**: Free text input
- **Pencil**: Erasable temporary mark

### Layout Types

- **Grid**: Auto-generated rectangular grids with customizable spacing
- **Freeform**: Custom hotspot regions with various shapes (rect, circle, polygon)

### Core Features

- ✅ Full undo/redo support with command pattern
- ✅ Save/load game state to localStorage
- ✅ Keyboard shortcuts for all tools (C, N, F, O, S, T, P)
- ✅ Touch/mobile support with gesture handling
- ✅ SVG-based rendering (scalable, print-friendly)
- ✅ Event system for game logic hooks
- ✅ Multi-sheet support with tabs
- ✅ Developer-friendly builder API

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173 to see the demo.

### Build

```bash
npm run build
```

## Usage Example

Here's a simple example of creating a Yahtzee-style score sheet:

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#FFFEF0')
  .addGridRegion(
    'upper-section',
    6, // rows
    1, // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']
  )
  .build();

// Initialize engine
const engine = new SheetEngine([yahtzeeSheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  console.log('Mark added:', event.mark);
});

// Render in React
<EngineProvider engine={engine}>
  <SheetCanvas />
</EngineProvider>
```

## Project Structure

```
roll-and-write-engine/
├── src/
│   ├── components/        # React components
│   │   ├── SheetCanvas.tsx
│   │   ├── MarkRenderer.tsx
│   │   ├── ValuePicker.tsx
│   │   ├── Toolbar.tsx
│   │   └── SheetTabs.tsx
│   ├── engine/           # Core engine logic
│   │   ├── types.ts
│   │   ├── SheetEngine.ts
│   │   ├── EventBus.ts
│   │   └── History.ts
│   ├── context/          # React context
│   │   └── EngineContext.tsx
│   ├── utils/            # Utility functions
│   │   ├── geometry.ts
│   │   └── coordinates.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useMobileGestures.ts
│   ├── builders/         # Builder pattern utilities
│   │   └── SheetBuilder.ts
│   └── examples/         # Example sheets
│       ├── 01-simple-grid.ts
│       ├── 02-mixed-layout.ts
│       └── 03-basic-test.ts
```

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SVG** - Graphics rendering
- **Lucide React** - Icons

## Keyboard Shortcuts

- `C` - Checkbox tool
- `N` - Number tool
- `F` - Fill tool
- `O` - Circle tool
- `S` - Symbol tool
- `T` - Text tool
- `P` - Pencil tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

## API Documentation

### SheetBuilder

Fluent API for creating sheet definitions:

```typescript
SheetBuilder.create(id: string)
  .name(name: string)
  .size(width: number, height: number)
  .background(imageUrl: string)
  .backgroundColor(color: string)
  .addGridRegion(id, rows, cols, cellSize, origin, allowedMarks, gap?)
  .addFreeformRegion(id, hotspots)
  .build()
```

### SheetEngine

Main engine class:

```typescript
const engine = new SheetEngine(sheetDefinitions: SheetDefinition[]);

// Tool management
engine.setCurrentTool(tool: MarkType);
engine.getCurrentTool(): MarkType;

// Mark operations
engine.addMark(hotspotId: string, value?: string | number): boolean;
engine.removeMark(hotspotId: string): boolean;

// History
engine.undo(): boolean;
engine.redo(): boolean;

// State management
engine.exportState(): SaveState;
engine.importState(state: SaveState): void;

// Events
engine.on(eventType, callback);
```

## Examples

The project includes three example sheets:

1. **Basic Test Sheet** (`03-basic-test.ts`) - Simple 8x8 grid for testing all mark types
2. **Yahtzee Sheet** (`01-simple-grid.ts`) - Classic Yahtzee score sheet layout
3. **Mixed Layout** (`02-mixed-layout.ts`) - Complex sheet with grids, circles, and polygons

## Development

### Adding a New Mark Type

1. Add the type to `MarkType` in `src/engine/types.ts`
2. Implement rendering in `MarkRenderer.tsx`
3. Add picker UI in `ValuePicker.tsx`
4. Add toolbar icon in `Toolbar.tsx`

### Creating Custom Sheets

Use the `SheetBuilder` API or define `SheetDefinition` objects directly:

```typescript
const customSheet: SheetDefinition = {
  id: 'custom',
  name: 'Custom Sheet',
  width: 600,
  height: 800,
  regions: [
    {
      id: 'main',
      type: 'freeform',
      hotspots: [
        {
          id: 'hotspot-1',
          shape: 'circle',
          position: { x: 100, y: 100 },
          radius: 50,
          allowedMarkTypes: ['fill', 'number'],
        },
      ],
    },
  ],
};
```

## Performance Considerations

- **SVG Optimization**: Uses `will-change` CSS for animated elements
- **Memoization**: Mark renderers are memoized to prevent unnecessary re-renders
- **Event Debouncing**: Hover state updates are debounced for 60fps
- **Virtualization**: Future: For sheets with 100+ hotspots

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this in your own projects!

## Roadmap

- [ ] Add more mark types (crossout, underline, etc.)
- [ ] Implement zoom/pan controls
- [ ] Add print stylesheet
- [ ] Multiplayer support with WebRTC
- [ ] Rules engine plugin system
- [ ] Scoring calculator helpers
- [ ] Import/export sheets as JSON
- [ ] Background image editor
- [ ] Hotspot visual editor

## Credits

Built with ❤️ using React, TypeScript, and Tailwind CSS.

## Support

For questions, issues, or feature requests, please open an issue on GitHub.
