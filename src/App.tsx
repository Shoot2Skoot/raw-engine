// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { SheetCanvas } from './components/SheetCanvas';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { moonMissionSheet } from './examples/02-image-hotspots';
import { twilightSheet } from './examples/03-mixed-layout';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => {
    const sheets = [yahtzeeSheet, moonMissionSheet, twilightSheet];
    const newEngine = new SheetEngine(sheets);

    // Example: Add event listener for mark validation
    newEngine.on('markAdded', (event) => {
      console.log('Mark added:', event);
    });

    newEngine.on('markRejected', (event) => {
      if (event.type === 'markRejected') {
        console.warn('Mark rejected:', event.reason);
      }
    });

    return newEngine;
  }, []);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing tool for roll-and-write board games
            </p>
          </header>

          {/* Sheet Tabs */}
          <SheetTabs />

          {/* Toolbar */}
          <Toolbar />

          {/* Main Canvas */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <SheetCanvas />
          </div>

          {/* Instructions */}
          <footer className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Instructions
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Select a tool from the toolbar (or use keyboard shortcuts)</li>
              <li>• Click on hotspots to mark them</li>
              <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
              <li>• Switch between sheets using the tabs above</li>
              <li>• Save your progress and load it later</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <h4 className="font-medium text-blue-900 mb-1">Keyboard Shortcuts:</h4>
              <div className="grid grid-cols-3 gap-2 text-sm text-blue-800">
                <div><kbd className="px-2 py-1 bg-white rounded border">C</kbd> Checkbox</div>
                <div><kbd className="px-2 py-1 bg-white rounded border">N</kbd> Number</div>
                <div><kbd className="px-2 py-1 bg-white rounded border">F</kbd> Fill</div>
                <div><kbd className="px-2 py-1 bg-white rounded border">O</kbd> Circle</div>
                <div><kbd className="px-2 py-1 bg-white rounded border">P</kbd> Pencil</div>
                <div><kbd className="px-2 py-1 bg-white rounded border">T</kbd> Text</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
