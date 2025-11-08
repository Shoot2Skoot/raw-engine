# Roll & Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. This is a specialized drawing tool, not a game rules engine. Think "Figma meets roll-and-write games."

![Roll & Write Engine](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

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

- 🎯 **Multiple Mark Types**: Checkbox, Number, Fill (colors), Circle, Symbol, Text, Pencil
- 🔄 **Undo/Redo**: Full command pattern implementation with history
- 💾 **Save/Load**: LocalStorage-based state persistence
- ⌨️ **Keyboard Shortcuts**: Quick tool switching and undo/redo
- 📱 **Touch Support**: Works on mobile and tablet devices
- 🎨 **Flexible Layouts**: Grid-based or freeform hotspot positioning
- 🔍 **Developer Tools**: Debug mode with hotspot outlines
- ♿ **Accessible**: Keyboard navigation and ARIA labels

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` to see the demo.

## Usage Example

Here's what using the engine looks like:

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const yahtzeeSheet = SheetBuilder.create('yahtzee')
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
const engine = new SheetEngine([yahtzeeSheet]);

// Hook in game logic (optional)
engine.on('markAdded', (event) => {
  console.log('Mark added:', event.mark);
});

// Use in React
function App() {
  return (
    <EngineProvider engine={engine}>
      <Toolbar />
      <SheetCanvas />
    </EngineProvider>
  );
}
```

## Project Structure

```
src/
├── engine/              # Core engine logic
│   ├── types.ts        # TypeScript type definitions
│   ├── SheetEngine.ts  # Main engine class
│   ├── EventBus.ts     # Event system for game hooks
│   └── History.ts      # Undo/redo command pattern
├── components/         # React components
│   ├── SheetCanvas.tsx # Main SVG canvas
│   ├── MarkRenderer.tsx # Mark rendering logic
│   ├── ValuePicker.tsx # Value selection popover
│   ├── Toolbar.tsx     # Tool selection UI
│   └── SheetTabs.tsx   # Multi-sheet navigation
├── context/
│   └── EngineContext.tsx # React context provider
├── utils/
│   ├── geometry.ts     # Point-in-shape detection
│   └── coordinates.ts  # SVG coordinate transforms
├── builders/
│   └── SheetBuilder.ts # Fluent API for sheets
└── examples/           # Example sheet definitions
    ├── simple-grid.ts
    ├── mixed-layout.ts
    └── demo-sheet.ts
```

## Mark Types

| Type | Description | Behavior |
|------|-------------|----------|
| **Checkbox** | Three-state checkbox | Cycles: empty → checked → crossed → empty |
| **Number** | Integer value (0-9) | Opens number picker |
| **Fill** | Color fill | Opens color palette |
| **Circle** | Three-state circle | Cycles: empty → half → filled → empty |
| **Symbol** | Icon from preset | Opens symbol picker |
| **Text** | Free text input | Opens text input |
| **Pencil** | Erasable marks | Appears lighter/italic |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Checkbox tool |
| `N` | Number tool |
| `F` | Fill tool |
| `O` | Circle tool |
| `P` | Pencil tool |
| `T` | Text tool |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |

## API Reference

### SheetBuilder

Fluent API for creating sheet definitions:

```typescript
SheetBuilder.create(id: string)
  .name(name: string)
  .size(width: number, height: number)
  .backgroundColor(color: string)
  .background(imageUrl: string)
  .addGridRegion(id, rows, cols, cellSize, origin, allowedMarks, gap?)
  .addFreeformRegion(id, hotspots, zIndex?)
  .build()
```

### SheetEngine

Main engine class:

```typescript
// Sheet management
engine.getCurrentSheet(): SheetState | undefined
engine.switchSheet(sheetId: string): void

// Tool management
engine.setCurrentTool(tool: MarkType): void
engine.getCurrentTool(): MarkType
engine.setCurrentValue(value: string | number): void

// Mark operations
engine.addMark(hotspotId: string, value?: string | number): boolean
engine.removeMark(hotspotId: string): boolean
engine.canPlaceMark(hotspot: Hotspot): boolean

// History
engine.undo(): boolean
engine.redo(): boolean
engine.canUndo(): boolean
engine.canRedo(): boolean

// Events
engine.on(eventType, callback): unsubscribe
engine.exportState(): SaveState
engine.importState(saveState: SaveState): void
```

### Event Types

```typescript
engine.on('markAdded', (event) => {
  // event: { type, sheetId, hotspotId, mark }
});

engine.on('markRemoved', (event) => {
  // event: { type, sheetId, hotspotId, mark }
});

engine.on('sheetChanged', (event) => {
  // event: { type, previousSheetId, currentSheetId }
});

engine.on('toolChanged', (event) => {
  // event: { type, previousTool, currentTool }
});
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 7.2** - Build tool
- **Tailwind CSS 4.0** - Styling
- **Lucide React** - Icons
- **SVG** - Scalable, print-friendly graphics

## Design Principles

1. **Developer Experience First**: Simple, intuitive API
2. **Separation of Concerns**: Engine doesn't know game rules
3. **Extensible**: Easy to add custom mark types and behaviors
4. **Performance**: Efficient rendering and state management
5. **Accessibility**: Keyboard navigation and screen reader support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari & Chrome (iOS/Android)

## Contributing

This is a demonstration project. Feel free to fork and adapt for your own roll-and-write games!

## License

MIT

## Acknowledgments

Built for the roll-and-write board game community. Inspired by games like:
- Welcome To...
- Railroad Ink
- Yahtzee
- That's Pretty Clever
- Cartographers

---

**Built with ❤️ for roll-and-write enthusiasts**
