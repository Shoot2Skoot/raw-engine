// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/simple-grid';
import { mixedLayoutSheet } from './examples/mixed-layout';
import { demoSheet } from './examples/demo-sheet';

function App() {
  // Initialize the engine with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([
      demoSheet,
      yahtzeeSheet,
      mixedLayoutSheet
    ]);
  }, []);

  const sheetIds = engine.getAllSheetIds();

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing/markup engine for roll-and-write board games
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-2">Quick Guide:</h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use the toolbar to select different mark types (or press keyboard shortcuts)</li>
                <li>• Click on cells/hotspots to mark them</li>
                <li>• Checkboxes cycle through: empty → checked → crossed</li>
                <li>• Circles cycle through: empty → half → filled</li>
                <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                <li>• Save/Load your progress using the buttons</li>
              </ul>
            </div>
          </header>

          <main>
            <Toolbar />
            <SheetTabs sheetIds={sheetIds} />
            <SheetCanvas />
          </main>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, and SVG</p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
