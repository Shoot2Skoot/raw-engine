# Roll & Write Game Engine

A specialized drawing/markup engine for roll-and-write board games. Think "Figma meets roll-and-write games."

## What This Is

- **A framework** for defining interactive, markable game sheets
- **An intuitive UI** for players to mark, fill, and annotate sheets
- **A developer-friendly API** for defining layouts and hotspots
- **A state management system** with undo/redo and save/load

## What This Is NOT

- A rules validator (doesn't know if moves are legal)
- A scoring calculator (doesn't understand game mechanics)
- A multiplayer game server (local only for now)
- A complete game (provides the canvas, not the game logic)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Usage Example

```typescript
import { SheetEngine } from './engine/SheetEngine';
import { SheetBuilder } from './builders/SheetBuilder';

// Define a simple Yahtzee-style sheet
const mySheet = SheetBuilder.create('yahtzee-upper')
  .name('Upper Section')
  .size(400, 600)
  .addGridRegion('scores', 6, 1, 80, { x: 0, y: 0 }, ['number'])
  .build();

// Initialize engine
const engine = new SheetEngine([mySheet]);

// Hook in game logic
engine.on('markAdded', (event) => {
  if (!isValidYahtzeeScore(event.mark.value)) {
    engine.rejectMark(event.hotspotId);
  }
});
```

## Features

### Core Engine

- **Multiple Mark Types**: checkbox, number, fill, circle, symbol, text, pencil
- **Flexible Hotspot Shapes**: rectangles, circles, polygons, points
- **Grid Auto-generation**: Automatically create grids with configurable spacing
- **Event System**: Hook into mark additions, removals, and rejections
- **History Management**: Full undo/redo support with command pattern
- **State Persistence**: Save and load game state to localStorage or JSON files

### User Interface

- **Interactive SVG Canvas**: Scalable, print-friendly rendering
- **Tool Selection**: Toolbar with keyboard shortcuts
- **Value Pickers**: Modal dialogs for numbers, colors, and symbols
- **Multi-sheet Support**: Tab navigation between different sheets
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and ARIA labels

### Developer Experience

- **Fluent API**: SheetBuilder for easy sheet definition
- **TypeScript**: Full type safety and autocomplete
- **Comprehensive Tests**: Unit and integration tests included
- **Well-documented**: Inline comments and examples

## Project Structure

```
roll-and-write-engine/
├── src/
│   ├── components/      # React components
│   ├── engine/          # Core engine logic
│   ├── utils/           # Geometry, coordinates, serialization
│   ├── context/         # React context for engine
│   ├── hooks/           # Custom React hooks
│   ├── builders/        # Fluent API builders
│   └── examples/        # Example sheet definitions
├── tests/               # Unit and integration tests
└── public/              # Static assets
```

## Tech Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vitest** for testing
- **SVG** for graphics

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

## Architecture

### Core Concepts

1. **Sheet**: A complete game sheet with background, size, and regions
2. **Region**: A collection of hotspots (can be grid or freeform)
3. **Hotspot**: A markable area on the sheet
4. **Mark**: A user-placed annotation on a hotspot
5. **Engine**: The main state manager coordinating everything

### Design Patterns

- **Command Pattern**: For undo/redo functionality
- **Observer Pattern**: Event bus for game logic hooks
- **Builder Pattern**: Fluent API for sheet construction
- **Strategy Pattern**: Different mark type renderers

## Examples

The project includes three example sheets:

1. **Simple Grid** (`01-simple-grid.ts`): Yahtzee-style score sheet
2. **Image Hotspots** (`02-image-hotspots.ts`): Welcome to Moon style
3. **Mixed Layout** (`03-mixed-layout.ts`): Complex multi-region sheet

## Keyboard Shortcuts

- **C**: Checkbox tool
- **N**: Number tool
- **F**: Fill tool
- **O**: Circle tool
- **P**: Pencil tool
- **T**: Text tool
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Tab**: Navigate between hotspots
- **Enter/Space**: Mark focused hotspot
- **Delete/Backspace**: Remove mark from focused hotspot

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 14+)
- Mobile Chrome (Android 8+)

## License

MIT

## Contributing

This is a demonstration project. Feel free to use it as a foundation for your own roll-and-write game implementations!

## Credits

Built with Claude Code as a comprehensive example of a roll-and-write game engine.
