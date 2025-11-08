import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/yahtzee-sheet';
import { complexSheet } from './examples/complex-sheet';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([yahtzeeSheet, complexSheet]);
  }, []);

  const sheetIds = engine.getSheetIds();

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing tool for roll-and-write board games
            </p>
          </header>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
            {/* Toolbar */}
            <Toolbar />

            {/* Sheet tabs */}
            <SheetTabs sheetIds={sheetIds} />

            {/* Canvas */}
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                <SheetCanvas />
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a tool from the toolbar (or use keyboard shortcuts C, N, F, O, P, T)</li>
                <li>• Click on cells to mark them</li>
                <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                <li>• Click "Save" to save your progress to browser storage</li>
                <li>• Switch between sheets using the tabs above</li>
              </ul>
            </div>

            {/* Features showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-1">Multiple Mark Types</h4>
                <p className="text-sm text-green-800">
                  Checkboxes, numbers, colors, circles, symbols, and more
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-1">Undo/Redo</h4>
                <p className="text-sm text-purple-800">
                  Full history management with command pattern
                </p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-1">Save/Load</h4>
                <p className="text-sm text-orange-800">
                  Persist your game state to continue later
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-600 text-sm">
            <p>Built with React, TypeScript, and Tailwind CSS</p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
