// App.tsx

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { SheetCanvas } from './components/SheetCanvas';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { mixedLayoutSheet } from './examples/02-mixed-layout';
import { ticTacToeSheet } from './examples/03-tic-tac-toe';

function App() {
  // Initialize engine with example sheets
  const engine = useMemo(() => {
    const sheets = [yahtzeeSheet, mixedLayoutSheet, ticTacToeSheet];
    const newEngine = new SheetEngine(sheets);

    // Example: Add event listeners for game logic
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600 text-lg">
              A specialized drawing/markup engine for roll-and-write board games
            </p>
            <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-900">
                <strong>Quick Start:</strong> Select a tool from the toolbar below, then click on the sheet to add marks.
                Use keyboard shortcuts (C, N, F, O, P, T) for quick tool selection. Ctrl+Z to undo, Ctrl+Shift+Z to redo.
              </p>
            </div>
          </header>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <Toolbar />
            <SheetTabs />
            <SheetCanvas />
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-600 text-sm">
            <p>
              Built with React + TypeScript + Vite. Open source and extensible.
            </p>
            <p className="mt-2">
              <strong>Features:</strong> Undo/Redo • Save/Load • Multiple Sheets • Touch Support • Keyboard Shortcuts
            </p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
