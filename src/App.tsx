// App.tsx - Main application component

import { useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/yahtzee';
import { moonMissionSheet } from './examples/moon-mission';
import { twilightSheet } from './examples/mixed-layout';

function App() {
  // Create engine with example sheets
  const engine = useMemo(() => {
    const sheetEngine = new SheetEngine([
      yahtzeeSheet,
      moonMissionSheet,
      twilightSheet,
    ]);

    // Example: Hook into mark events for game logic
    sheetEngine.on('markAdded', (event) => {
      console.log('Mark added:', event);
      // Here you could add custom game logic validation
      // For example, check if a Yahtzee score is valid:
      // if (!isValidYahtzeeScore(event.mark.value)) {
      //   sheetEngine.rejectMark(event.hotspotId, 'Invalid score');
      // }
    });

    sheetEngine.on('markRejected', (event) => {
      if (event.type === 'markRejected') {
        console.warn('Mark rejected:', event.reason);
      }
      // You could show a toast notification here
    });

    return sheetEngine;
  }, []);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll & Write Engine
            </h1>
            <p className="text-gray-600">
              A web-based drawing/markup engine for roll-and-write board games
            </p>
          </header>

          {/* Main content */}
          <div className="space-y-4">
            {/* Toolbar */}
            <Toolbar />

            {/* Sheet tabs and canvas */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <SheetTabs />
              <div className="p-6">
                <SheetCanvas />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Quick Start Guide
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a tool from the toolbar (C=Checkbox, N=Number, F=Fill, O=Circle, P=Pencil, T=Text)</li>
                <li>• Click on cells to mark them</li>
                <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                <li>• Save your progress with Ctrl+S or the Save button</li>
                <li>• Switch between sheets using the tabs above</li>
                <li>• Export your game to a file for sharing</li>
              </ul>
            </div>

            {/* Footer */}
            <footer className="text-center text-sm text-gray-500 py-4">
              <p>
                Built with React, TypeScript, and SVG • Open source engine for
                roll-and-write games
              </p>
            </footer>
          </div>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
