// App.tsx

import { useEffect, useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { demoSheet } from './examples/02-mixed-layout';

function App() {
  const engine = useMemo(() => {
    const eng = new SheetEngine([yahtzeeSheet, demoSheet]);

    // Try to load saved state
    eng.loadFromLocalStorage();

    // Hook up event listeners for debugging
    eng.on('markAdded', (event) => {
      console.log('Mark added:', event);
    });

    eng.on('markRemoved', (event) => {
      console.log('Mark removed:', event);
    });

    eng.on('markRejected', (event) => {
      console.warn('Mark rejected:', event);
    });

    return eng;
  }, []);

  // Auto-save on changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      engine.saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Roll & Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing/markup engine for roll-and-write board games
            </p>
          </header>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Quick Start:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use keyboard shortcuts (C, N, F, O, P, T) to switch tools</li>
              <li>• Click cells to mark them (checkboxes and circles cycle through states)</li>
              <li>• Numbers, fills, and symbols show a value picker</li>
              <li>• Undo/Redo with Ctrl+Z / Ctrl+Shift+Z</li>
              <li>• Your work auto-saves to localStorage</li>
            </ul>
          </div>

          {/* Sheet Tabs */}
          <SheetTabs />

          {/* Toolbar */}
          <Toolbar />

          {/* Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <SheetCanvas />
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-gray-500">
            <p>
              Built with React, TypeScript, and Tailwind CSS.
              This is a drawing framework, not a game rules engine.
            </p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
