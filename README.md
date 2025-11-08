# Roll & Write Game Engine

A powerful, flexible web-based drawing/markup engine specifically designed for roll-and-write board games. Think "Figma meets roll-and-write games."

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎲 What This Is

- **A framework for defining interactive, markable game sheets** - Create custom layouts with hotspots
- **An intuitive UI for players** - Mark, fill, and annotate sheets with ease
- **A developer-friendly API** - Fluent SheetBuilder API for defining sheets
- **A state management system** - Built-in undo/redo and save/load functionality

## 🚫 What This Is NOT

- **A rules validator** - Doesn't know if moves are legal
- **A scoring calculator** - Doesn't understand game mechanics
- **A multiplayer game server** - Local only for now
- **A complete game** - Provides the canvas, not the game logic

## ✨ Features

### Core Features
- ✅ **7 Mark Types**: Checkbox, Number, Fill, Circle, Symbol, Text, Pencil
- ✅ **Undo/Redo System**: Command pattern with full history
- ✅ **Save/Load**: LocalStorage persistence + JSON export/import
- ✅ **Multi-sheet Navigation**: Tab-based sheet switching
- ✅ **Keyboard Shortcuts**: Fast tool selection and actions

### Layout Options
- 📐 **Grid Layouts**: Auto-generated hotspot grids
- 🎨 **Freeform Hotspots**: Custom shapes (rect, circle, polygon)
- 🖼️ **Background Images**: Import your game sheet designs
- 🎨 **Custom Styling**: Background colors and themes

### Developer Tools
- 🔧 **Fluent API**: `SheetBuilder` for easy sheet definition
- 📡 **Event System**: Hook into mark events for game logic
- 📘 **TypeScript**: Full type safety and IntelliSense
- 💾 **Serialization**: Version-aware JSON import/export
- 🐛 **Debug Mode**: Visual hotspot outlines in development

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

### Basic Usage

```typescript
import { SheetBuilder } from './builders/SheetBuilder';
import { SheetEngine } from './engine/SheetEngine';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 600)
  .backgroundColor('#F5F5DC')
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

// Use in React
<EngineProvider engine={engine}>
  <SheetCanvas />
  <Toolbar />
</EngineProvider>
```

## 📚 Documentation

### Sheet Definition

```typescript
const sheet = SheetBuilder.create('my-sheet')
  .name('My Game Sheet')
  .size(800, 1000)
  .backgroundColor('#FFFFFF')
  .background('/path/to/image.png') // Optional background image
  .addGridRegion(
    'main-grid',
    5,  // rows
    5,  // cols
    100, // cell size
    { x: 50, y: 50 },
    ['number', 'fill', 'checkbox']
  )
  .addFreeformRegion('custom-zones', [
    {
      id: 'bonus-circle',
      shape: 'circle',
      position: { x: 400, y: 500 },
      radius: 50,
      allowedMarkTypes: ['symbol'],
      maxMarks: 1
    },
    {
      id: 'polygon-zone',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 200, y: 700 },
        { x: 300, y: 680 },
        { x: 320, y: 780 },
        { x: 220, y: 800 }
      ],
      allowedMarkTypes: ['checkbox', 'number'],
      maxMarks: 1
    }
  ])
  .build();
```

### Mark Types

| Type | Description | Interaction |
|------|-------------|-------------|
| `checkbox` | Check/cross marks | Cycles: empty → checked → crossed |
| `number` | Numeric values | Opens number picker |
| `fill` | Color fills | Opens color picker |
| `circle` | Circle states | Cycles: empty → half → filled |
| `symbol` | Icons/symbols | Opens symbol picker |
| `text` | Free text | Opens text input |
| `pencil` | Temporary marks | Same as text but erasable |

### Event Hooks

```typescript
engine.on('markAdded', (event) => {
  // Validate game rules
  if (!isValidMove(event.mark)) {
    engine.rejectMark(event.hotspotId, 'Invalid move');
  }
});

engine.on('markRemoved', (event) => {
  console.log('Mark removed:', event);
});

engine.on('sheetChanged', (event) => {
  console.log('Switched to sheet:', event.currentSheetId);
});
```

### Keyboard Shortcuts

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
| `Ctrl+S` | Save to LocalStorage |

## 🏗️ Architecture

```
src/
├── engine/
│   ├── types.ts              # TypeScript type definitions
│   ├── SheetEngine.ts        # Main engine class
│   ├── EventBus.ts           # Event system
│   └── History.ts            # Undo/redo with Command pattern
├── components/
│   ├── SheetCanvas.tsx       # Main interactive SVG canvas
│   ├── MarkRenderer.tsx      # Renders different mark types
│   ├── ValuePicker.tsx       # Value selection UI
│   ├── Toolbar.tsx           # Tool selection + actions
│   └── SheetTabs.tsx         # Multi-sheet navigation
├── utils/
│   ├── geometry.ts           # Point-in-shape detection
│   ├── coordinates.ts        # SVG coordinate transforms
│   └── serialization.ts      # JSON save/load
├── builders/
│   └── SheetBuilder.ts       # Fluent API for sheets
├── context/
│   └── EngineContext.tsx     # React context provider
└── examples/
    ├── yahtzee-sheet.ts      # Example: Simple grid
    ├── simple-grid.ts        # Example: Basic demo
    └── mixed-layout.ts       # Example: Complex layout
```

## 🎯 Design Principles

1. **Separation of Concerns**: Engine handles state/logic, React handles UI
2. **Developer Experience**: Fluent API, TypeScript, clear abstractions
3. **Player Delight**: Smooth interactions, visual feedback, keyboard support
4. **Flexibility**: Works for any roll-and-write game
5. **Simplicity**: Provides the canvas, you provide the rules

## 🛠️ Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SVG** - Scalable, print-friendly graphics
- **Lucide React** - Icons

## 🧪 Examples Included

1. **Simple Grid** - 5×5 grid with all mark types
2. **Yahtzee Sheet** - Classic score sheet layout
3. **Mixed Layout** - Grids + freeform hotspots

## 📦 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

This is a demonstration project built to showcase a roll-and-write game engine architecture. Feel free to fork and extend it for your own games!

## 📝 License

MIT License - feel free to use this in your own projects!

## 🎮 Use Cases

Perfect for digital versions of games like:
- **Yahtzee** - Score tracking
- **Welcome To...** - Number placement and combos
- **Railroad Ink** - Route drawing
- **Ganz Schön Clever** - Mark tracking
- **Cartographers** - Map marking
- And many more!

## 🔮 Future Enhancements

Potential additions (not yet implemented):
- [ ] Mobile gesture support (pinch-to-zoom, long-press)
- [ ] Multiplayer sync via WebSockets
- [ ] Print-to-PDF functionality
- [ ] Custom mark type plugins
- [ ] Animation system
- [ ] Touch/stylus pressure sensitivity
- [ ] Accessibility improvements (WCAG 2.1 AA)

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for the roll-and-write game community
