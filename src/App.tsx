/**
 * Main Application Component
 * Demonstrates the Roll-and-Write Game Engine
 */

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import SheetCanvas from './components/SheetCanvas';
import Toolbar from './components/Toolbar';
import SheetTabs from './components/SheetTabs';

// Import example sheets
import { yahtzeeSheet } from './examples/01-simple-grid';
import { mixedLayoutSheet } from './examples/02-mixed-layout';
import { bingoSheet } from './examples/03-bingo-style';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => {
    const sheets = [yahtzeeSheet, mixedLayoutSheet, bingoSheet];
    const eng = new SheetEngine(sheets);

    // Optional: Add event listeners for game logic
    eng.on('markAdded', (event) => {
      console.log('Mark added:', event);
    });

    eng.on('markRejected', (event) => {
      if (event.type === 'markRejected') {
        console.warn('Mark rejected:', event.reason);
      }
    });

    return eng;
  }, []);

  const sheetIds = engine.getAllSheetIds();

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600 text-lg">
              A specialized drawing tool for roll-and-write board games
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Click on cells to mark them • Use keyboard shortcuts (C, N, F, O, P, T) to switch tools
            </p>
          </header>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            {/* Toolbar */}
            <div className="mb-6">
              <Toolbar />
            </div>

            {/* Sheet Tabs */}
            <SheetTabs sheetIds={sheetIds} />

            {/* Canvas */}
            <div className="mt-4">
              <SheetCanvas />
            </div>

            {/* Footer info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Features Demonstrated:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <li>✓ Multiple mark types (checkbox, number, fill, circle, etc.)</li>
                <li>✓ Undo/Redo with full history</li>
                <li>✓ Save/Load to localStorage</li>
                <li>✓ Keyboard shortcuts for all tools</li>
                <li>✓ Grid and freeform layouts</li>
                <li>✓ Multi-sheet navigation</li>
                <li>✓ SVG-based rendering (scalable and print-friendly)</li>
                <li>✓ Event system for game logic hooks</li>
              </ul>
            </div>

            {/* Examples info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Example Sheets:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Yahtzee Score Sheet:</strong> Simple grid with number input</li>
                <li><strong>Mixed Layout Demo:</strong> Combination of grids, circles, polygons, and points</li>
                <li><strong>Bingo Card:</strong> Classic 5x5 grid with circular markers</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-600 text-sm">
            <p>Built with React, TypeScript, Tailwind CSS, and SVG</p>
            <p className="mt-1">A framework for creating interactive roll-and-write game sheets</p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
