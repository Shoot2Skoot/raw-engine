// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { exampleSheets } from './examples/02-mixed-layout';
import { Dices } from 'lucide-react';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => new SheetEngine(exampleSheets), []);
  const sheetIds = engine.getAllSheetIds();

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Dices size={40} className="text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Roll & Write Engine
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              A web-based drawing/markup engine for roll-and-write board games
            </p>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            {/* Tabs for multi-sheet navigation */}
            {sheetIds.length > 1 && <SheetTabs sheetIds={sheetIds} />}

            {/* Toolbar */}
            <Toolbar />

            {/* Canvas */}
            <SheetCanvas />

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a tool from the toolbar (or use keyboard shortcuts: C, N, F, O, P, T)</li>
                <li>• Click on cells to place marks</li>
                <li>• For numbers, colors, and symbols, a picker will appear</li>
                <li>• Use Ctrl+Z to undo and Ctrl+Shift+Z to redo</li>
                <li>• Click Save to save your progress to browser storage</li>
                <li>• Red dashed outlines show hotspot boundaries (dev mode only)</li>
              </ul>
            </div>

            {/* Features showcase */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✨ Features</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Multiple mark types</li>
                  <li>• Grid & freeform layouts</li>
                  <li>• Undo/redo history</li>
                  <li>• Save/load support</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🎨 Mark Types</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Checkboxes</li>
                  <li>• Numbers</li>
                  <li>• Color fills</li>
                  <li>• Circles (empty/half/full)</li>
                  <li>• Symbols</li>
                  <li>• Text & pencil marks</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 Developer API</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• SheetBuilder fluent API</li>
                  <li>• Event system for hooks</li>
                  <li>• TypeScript strict mode</li>
                  <li>• Framework agnostic core</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>
              Built with React, TypeScript, and Tailwind CSS
            </p>
            <p className="mt-1">
              A specialized drawing tool for roll-and-write game designers
            </p>
          </div>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
