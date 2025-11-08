// App.tsx - Main application component

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { moonMissionSheet } from './examples/02-image-hotspots';
import { complexGameSheet } from './examples/03-mixed-layout';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([
      yahtzeeSheet,
      moonMissionSheet,
      complexGameSheet
    ]);
  }, []);

  // Get all sheet IDs for tabs
  const sheetIds = engine.getSheetIds();

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing tool for roll-and-write board games
            </p>
          </header>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Toolbar */}
            <Toolbar />

            {/* Sheet Tabs */}
            <SheetTabs sheetIds={sheetIds} />

            {/* Canvas */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <SheetCanvas />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-blue-900 mb-2">How to Use</h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a tool from the toolbar (or use keyboard shortcuts)</li>
                <li>• Click on hotspots to place marks</li>
                <li>• Use Undo (Ctrl+Z) and Redo (Ctrl+Shift+Z) to modify</li>
                <li>• Switch between sheets using the tabs</li>
                <li>• Click Save to store your progress</li>
              </ul>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <div><kbd className="px-2 py-1 bg-white border rounded">C</kbd> Checkbox</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">N</kbd> Number</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">F</kbd> Fill</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">O</kbd> Circle</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">P</kbd> Pencil</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">T</kbd> Text</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, and Tailwind CSS</p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
