// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { SheetCanvas } from './components/SheetCanvas';
import { demoGameSheet, secondSheet } from './examples/demo-game';

function App() {
  // Initialize the engine with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([demoGameSheet, secondSheet]);
  }, []);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600">
              A web-based drawing/markup engine for roll-and-write board games
            </p>
          </header>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">How to Use:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a tool from the toolbar (or use keyboard shortcuts: C, N, F, O, P, T)</li>
              <li>• Click on cells to mark them</li>
              <li>• For numbers, colors, and symbols, a picker will appear</li>
              <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
              <li>• Click "Save" to save your progress, "Load" to restore it</li>
              <li>• Switch between sheets using the tabs</li>
            </ul>
          </div>

          {/* Toolbar */}
          <Toolbar />

          {/* Sheet Tabs */}
          <SheetTabs />

          {/* Main Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SheetCanvas />
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, and SVG</p>
            <p className="mt-1">
              This is a specialized drawing tool for roll-and-write games, not a rules engine.
            </p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
