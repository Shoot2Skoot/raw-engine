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

## Features

- 🎨 **Multiple Mark Types**: Checkboxes, numbers, fills, circles, symbols, text, and pencil marks
- 📐 **Flexible Layouts**: Grid-based or freeform regions with various hotspot shapes (rectangles, circles, polygons)
- ⌨️ **Keyboard Navigation**: Full keyboard support with shortcuts
- 📱 **Mobile-Friendly**: Touch-optimized with gesture support
- ♿ **Accessible**: ARIA labels and keyboard navigation
- ⏮️ **Undo/Redo**: Complete history management
- 💾 **Save/Load**: Persistent state to localStorage
- 🎯 **Multi-Sheet Support**: Switch between multiple game sheets

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage Example

### Creating a Simple Sheet

```typescript
import { SheetBuilder } from './builders/SheetBuilder';

const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    80, // cell size
    { x: 160, y: 50 },
    ['number']
  )
  .build();
```

### Initializing the Engine

```typescript
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';

function App() {
  const engine = useMemo(() => {
    return new SheetEngine([mySheet]);
  }, []);

  return (
    <EngineProvider engine={engine}>
      <Toolbar />
      <SheetCanvas />
    </EngineProvider>
  );
}
```

### Hooking in Game Logic

```typescript
// Listen to marking events
engine.on('markAdded', (event) => {
  if (!isValidScore(event.mark.value)) {
    engine.rejectMark(event.hotspotId);
  }
});
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
- **Tab** - Navigate between hotspots
- **Enter/Space** - Mark selected hotspot
- **Delete/Backspace** - Remove mark

## Project Structure

```
src/
├── engine/
│   ├── types.ts           # TypeScript definitions
│   ├── SheetEngine.ts     # Main engine class
│   ├── EventBus.ts        # Event system
│   └── History.ts         # Undo/redo system
├── utils/
│   ├── geometry.ts        # Point-in-shape detection
│   └── coordinates.ts     # SVG coordinate transforms
├── components/
│   ├── SheetCanvas.tsx    # Main interactive canvas
│   ├── MarkRenderer.tsx   # Renders different mark types
│   ├── ValuePicker.tsx    # Value selection popover
│   ├── Toolbar.tsx        # Tool selection
│   └── SheetTabs.tsx      # Multi-sheet navigation
├── context/
│   └── EngineContext.tsx  # React context provider
├── builders/
│   └── SheetBuilder.ts    # Fluent API for creating sheets
├── hooks/
│   ├── useKeyboardNavigation.ts
│   └── useMobileGestures.ts
└── examples/
    ├── yahtzee.ts
    └── demo-game.ts
```

## Mark Types

- **checkbox**: Cycles through empty → checked → crossed
- **number**: Integer value with picker
- **fill**: Color fill with opacity
- **circle**: Cycles through empty → half → filled
- **symbol**: Icon from predefined set
- **text**: Free text input
- **pencil**: Erasable temporary mark (non-permanent)

## Hotspot Shapes

- **rect**: Rectangular regions
- **circle**: Circular regions
- **polygon**: Arbitrary polygon regions
- **point**: Point hotspots with implicit click radius

## API Reference

### SheetBuilder

```typescript
SheetBuilder.create(id: string)
  .name(name: string)
  .size(width: number, height: number)
  .backgroundColor(color: string)
  .background(imageUrl: string)
  .addGridRegion(id, rows, cols, cellSize, origin, allowedMarks)
  .addFreeformRegion(id, hotspots)
  .build()
```

### SheetEngine

```typescript
// Sheet management
getCurrentSheet(): SheetState | undefined
switchSheet(sheetId: string): void

// Tool management
setCurrentTool(tool: MarkType): void
getCurrentTool(): MarkType
setCurrentValue(value: string | number): void

// Marking
addMark(hotspotId: string, value?: string | number): boolean
removeMark(hotspotId: string): boolean
canPlaceMark(hotspot: Hotspot): boolean

// History
undo(): boolean
redo(): boolean
canUndo(): boolean
canRedo(): boolean

// Events
on(eventType: EngineEvent['type'], callback: EventCallback): () => void

// Serialization
exportState(): SaveState
importState(saveState: SaveState): void
```

## Tech Stack

- **Frontend**: React 18+ with TypeScript (strict mode)
- **Build**: Vite
- **Styling**: Tailwind CSS 3.x
- **State**: React Context + useReducer
- **Graphics**: SVG (scalable, print-friendly, accessible)
- **Storage**: LocalStorage
- **Icons**: Lucide React

## Development

```bash
# Type checking
npm run tsc

# Build
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile

## Performance Considerations

- SVG optimization with `will-change` for animations
- React.memo for mark renderers
- Debounced hover state updates (16ms for 60fps)
- Efficient hit detection algorithms

## Accessibility

- ARIA labels on all interactive elements
- Full keyboard navigation
- Screen reader support
- High contrast mode compatible
- Focus indicators

## License

MIT

## Contributing

Contributions are welcome! This is a framework for building roll-and-write game interfaces. Feel free to extend it with new mark types, hotspot shapes, or features.

## Future Enhancements

- [ ] Virtualization for sheets with 100+ hotspots
- [ ] Web Workers for complex geometry calculations
- [ ] Multi-player support via WebSockets
- [ ] Export to PDF/PNG
- [ ] Custom mark types via plugins
- [ ] Animation library for mark placement
- [ ] Touch gestures (pinch to zoom, pan)

---

Built with ❤️ for the board game community
