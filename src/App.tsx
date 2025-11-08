import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { mixedLayoutSheet } from './examples/02-mixed-layout';
import { basicTestSheet } from './examples/03-basic-test';

function App() {
  // Initialize the engine with example sheets
  const engine = useMemo(() => {
    const sheets = [basicTestSheet, yahtzeeSheet, mixedLayoutSheet];
    return new SheetEngine(sheets);
  }, []);

  const sheetIds = useMemo(
    () => [
      basicTestSheet.id,
      yahtzeeSheet.id,
      mixedLayoutSheet.id,
    ],
    []
  );

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Roll & Write Game Engine
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              A drawing/markup engine for roll-and-write board games
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Toolbar */}
            <Toolbar />

            {/* Sheet tabs */}
            <SheetTabs sheetIds={sheetIds} />

            {/* Canvas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <SheetCanvas />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                How to use:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  Select a tool from the toolbar (or use keyboard shortcuts: C,
                  N, F, O, S, T, P)
                </li>
                <li>Click on cells to mark them</li>
                <li>
                  For number, fill, symbol, and text tools, a picker will appear
                </li>
                <li>Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                <li>Click "Save" to save your progress to local storage</li>
                <li>Try different sheets using the tabs above</li>
              </ul>
            </div>

            {/* Features showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Mark Types
                </h4>
                <p className="text-sm text-gray-600">
                  Checkbox, Number, Fill, Circle, Symbol, Text, and Pencil marks
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Grid & Freeform
                </h4>
                <p className="text-sm text-gray-600">
                  Auto-generated grids or custom hotspot regions with various
                  shapes
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  History & State
                </h4>
                <p className="text-sm text-gray-600">
                  Full undo/redo support with save/load functionality
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-sm text-gray-600 text-center">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </EngineProvider>
  );
}

export default App;
