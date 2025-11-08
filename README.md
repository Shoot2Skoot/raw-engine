# Roll & Write Game Engine

A web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

## What This Is

- **A specialized drawing tool** - Framework for defining interactive, markable game sheets
- **An intuitive UI** - For players to mark, fill, and annotate sheets
- **A developer-friendly API** - For defining layouts and hotspots
- **State management system** - With undo/redo and save/load

## What This Is NOT

- ❌ A rules validator (doesn't know if moves are legal)
- ❌ A scoring calculator (doesn't understand game mechanics)
- ❌ A multiplayer game server (local only for now)
- ❌ A complete game (provides the canvas, not the game logic)

## Features

### Core Features
- ✨ Multiple mark types (checkboxes, numbers, colors, circles, symbols, text, pencil)
- 🎯 Grid & freeform hotspot layouts
- ↩️ Full undo/redo history
- 💾 Save/load support with localStorage
- 🎨 SVG-based rendering (scalable, print-friendly)
- ⌨️ Keyboard shortcuts
- 📱 Mobile-friendly touch gestures
- ♿ Accessibility support

### Developer Features
- 🏗️ SheetBuilder fluent API
- 🔌 Event system for game logic hooks
- 📦 TypeScript strict mode
- 🧪 Vitest testing setup
- 🎯 Framework-agnostic core engine

## Quick Start

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd raw-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee')
  .name('Score Sheet')
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
  console.log('Mark added:', event);
  // Add your validation logic here
});
```

### React Integration

```tsx
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';

function App() {
  const engine = new SheetEngine([mySheet]);

  return (
    <EngineProvider engine={engine}>
      <Toolbar />
      <SheetCanvas />
    </EngineProvider>
  );
}
```

## Architecture

### Project Structure

```
src/
├── engine/
│   ├── types.ts           # TypeScript type definitions
│   ├── SheetEngine.ts     # Main engine class
│   ├── EventBus.ts        # Event system
│   └── History.ts         # Command pattern for undo/redo
├── components/
│   ├── SheetCanvas.tsx    # Main interactive SVG canvas
│   ├── MarkRenderer.tsx   # Renders different mark types
│   ├── ValuePicker.tsx    # Value selection popover
│   ├── Toolbar.tsx        # Tool & value selection
│   └── SheetTabs.tsx      # Multi-sheet navigation
├── utils/
│   ├── geometry.ts        # Point-in-shape detection
│   ├── coordinates.ts     # SVG coordinate transformations
│   └── serialization.ts   # JSON save/load
├── builders/
│   └── SheetBuilder.ts    # Fluent API for sheets
├── examples/
│   └── *.ts               # Example sheet definitions
└── hooks/
    └── useMobileGestures.ts
```

### Core Concepts

#### 1. Sheet Definition
A sheet is a canvas with defined regions and hotspots:
```typescript
interface SheetDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundImage?: string;
  regions: Region[];
}
```

#### 2. Hotspots
Markable areas on the sheet:
```typescript
interface Hotspot {
  id: string;
  shape: 'rect' | 'circle' | 'polygon' | 'point';
  position: Point;
  allowedMarkTypes: MarkType[];
  maxMarks?: number;
}
```

#### 3. Marks
Visual indicators placed on hotspots:
```typescript
interface Mark {
  id: string;
  type: MarkType;
  value: string | number | boolean;
  timestamp: number;
  isPermanent: boolean;
}
```

## Mark Types

| Type | Description | Use Case |
|------|-------------|----------|
| `checkbox` | Empty → Checked → Crossed | Binary choices, achievements |
| `number` | Integer input | Scores, counts |
| `fill` | Color fill | Resource tracking, regions |
| `circle` | Empty → Half → Full | Progress tracking |
| `symbol` | Icon from set | Special markers |
| `text` | Free text | Notes, names |
| `pencil` | Erasable marks | Temporary annotations |

## Event System

Hook into mark placement for game logic:

```typescript
engine.on('markAdded', (event) => {
  const { sheetId, hotspotId, mark } = event;

  // Validate the move
  if (!isValidMove(mark.value)) {
    engine.rejectMark(hotspotId, 'Invalid move!');
  }
});

engine.on('markRejected', (event) => {
  console.log('Rejected:', event.reason);
});
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Checkbox tool |
| `N` | Number tool |
| `F` | Fill tool |
| `O` | Circle tool |
| `P` | Pencil tool |
| `T` | Text tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

## Examples

### Simple Grid (Yahtzee-style)
```typescript
const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .size(400, 700)
  .addGridRegion('upper', 6, 1, 80, { x: 50, y: 100 }, ['number'])
  .build();
```

### Mixed Layout (Resource Tracker)
```typescript
const resourceSheet = SheetBuilder.create('resources')
  .size(600, 800)
  .addGridRegion('water', 1, 10, 50, { x: 50, y: 100 }, ['fill'])
  .addGridRegion('energy', 1, 8, 60, { x: 50, y: 200 }, ['number'])
  .build();
```

### Freeform Hotspots
```typescript
const customSheet = SheetBuilder.create('custom')
  .size(800, 1000)
  .addFreeformRegion('special', [
    {
      id: 'circle-1',
      shape: 'circle',
      position: { x: 100, y: 100 },
      radius: 30,
      allowedMarkTypes: ['checkbox']
    },
    {
      id: 'polygon-1',
      shape: 'polygon',
      points: [
        { x: 200, y: 200 },
        { x: 300, y: 200 },
        { x: 250, y: 300 }
      ],
      allowedMarkTypes: ['fill', 'symbol']
    }
  ])
  .build();
```

## Testing

The project includes unit tests for core utilities:

```bash
npm run test
```

Example test:
```typescript
test('point in rectangle detection', () => {
  const rect: Hotspot = {
    id: 'test',
    shape: 'rect',
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    allowedMarkTypes: []
  };

  expect(Geometry.pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
  expect(Geometry.pointInRect({ x: 150, y: 50 }, rect)).toBe(false);
});
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- SVG rendering scales well to 100+ hotspots
- Use `React.memo` for MarkRenderer in large sheets
- Debounce hover state updates for 60fps
- Consider virtualization for 500+ hotspots

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Roadmap

- [ ] Image backgrounds support
- [ ] Export to PDF
- [ ] Multi-player support (WebRTC)
- [ ] More mark types (lines, arrows)
- [ ] Theming system
- [ ] Mobile app (React Native)

## Credits

Built with:
- React 19
- TypeScript 5
- Tailwind CSS 4
- Vite 7
- Vitest 4
- Lucide React (icons)

## Support

For issues, questions, or contributions, please visit the GitHub repository.

---

**Made with ❤️ for roll-and-write game designers**
