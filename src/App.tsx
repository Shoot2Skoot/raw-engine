// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { diceGameSheet } from './examples/02-mixed-layout';

function App() {
  // Create engine with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([yahtzeeSheet, diceGameSheet]);
  }, []);

  // Get all sheet IDs
  const sheetIds = useMemo(() => {
    return engine.getAllSheets().map(sheet => sheet.definition.id);
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing tool for roll-and-write board games. Click cells to mark them!
            </p>
          </div>

          {/* Sheet tabs */}
          {sheetIds.length > 1 && <SheetTabs sheetIds={sheetIds} />}

          {/* Main canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <SheetCanvas />
          </div>

          {/* Toolbar */}
          <Toolbar />

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a tool from the toolbar or use keyboard shortcuts (C, N, F, O, P, T)</li>
              <li>• Click on cells to mark them (checkboxes and circles cycle through states)</li>
              <li>• For numbers, fills, and symbols, a picker will appear</li>
              <li>• Use Ctrl+Z to undo and Ctrl+Shift+Z to redo</li>
              <li>• Click "Save" to save your progress to browser storage</li>
            </ul>
          </div>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
