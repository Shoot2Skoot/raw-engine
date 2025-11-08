// App.tsx

import { useMemo, useEffect } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet, simpleGridSheet, mixedLayoutSheet } from './examples';

function App() {
  // Create engine instance with example sheets
  const engine = useMemo(() => {
    const sheets = [simpleGridSheet, yahtzeeSheet, mixedLayoutSheet];
    return new SheetEngine(sheets);
  }, []);

  // Set up event listeners for demo purposes
  useEffect(() => {
    const unsubscribers = [
      engine.on('markAdded', (event) => {
        console.log('Mark added:', event);
      }),
      engine.on('markRemoved', (event) => {
        console.log('Mark removed:', event);
      }),
      engine.on('markRejected', (event) => {
        if (event.type === 'markRejected') {
          console.warn('Mark rejected:', event.reason);
        }
      }),
      engine.on('sheetChanged', (event) => {
        console.log('Sheet changed:', event);
      }),
      engine.on('toolChanged', (event) => {
        console.log('Tool changed:', event);
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600">
              A powerful drawing/markup engine for roll-and-write board games
            </p>
          </header>

          {/* Toolbar */}
          <div className="mb-4">
            <Toolbar />
          </div>

          {/* Sheet Tabs */}
          <div className="mb-2">
            <SheetTabs />
          </div>

          {/* Main Canvas */}
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <SheetCanvas />
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              How to Use
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Tool Selection:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">C</kbd> -
                    Checkbox (cycles: empty → checked → crossed)
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">N</kbd> -
                    Number (opens picker)
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">F</kbd> -
                    Fill (opens color picker)
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">O</kbd> -
                    Circle (cycles: empty → half → filled)
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">P</kbd> -
                    Pencil (temporary marks)
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">T</kbd> -
                    Text (opens input)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Actions:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+Z</kbd>{' '}
                    - Undo
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">
                      Ctrl+Shift+Z
                    </kbd>{' '}
                    - Redo
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+S</kbd>{' '}
                    - Save to LocalStorage
                  </li>
                  <li>Click on any cell to place a mark</li>
                  <li>Click again to cycle through states (checkbox, circle)</li>
                  <li>Export/Import buttons save to JSON files</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">✅ Core Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Multiple mark types</li>
                  <li>Undo/Redo system</li>
                  <li>Save/Load support</li>
                  <li>Multi-sheet navigation</li>
                  <li>Keyboard shortcuts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎨 Layout Options</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Grid layouts</li>
                  <li>Freeform hotspots</li>
                  <li>Rect, Circle, Polygon shapes</li>
                  <li>Background images</li>
                  <li>Custom colors</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔧 Developer Tools</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Fluent SheetBuilder API</li>
                  <li>Event system for hooks</li>
                  <li>TypeScript support</li>
                  <li>JSON export/import</li>
                  <li>Debug outlines (dev mode)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-6 text-center text-sm text-gray-600">
            <p>
              Built with React, TypeScript, Tailwind CSS, and SVG • Open Source
            </p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
