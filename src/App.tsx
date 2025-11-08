// App.tsx

import { useState, useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { moonMissionSheet } from './examples/02-image-hotspots';
import { twilightSheet } from './examples/03-mixed-layout';

function App() {
  const [selectedExample, setSelectedExample] = useState<'yahtzee' | 'moon' | 'twilight'>('yahtzee');

  // Create engine based on selected example
  const engine = useMemo(() => {
    switch (selectedExample) {
      case 'yahtzee':
        return new SheetEngine([yahtzeeSheet]);
      case 'moon':
        return new SheetEngine([moonMissionSheet]);
      case 'twilight':
        return new SheetEngine([twilightSheet]);
    }
  }, [selectedExample]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Roll-and-Write Game Engine
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            A specialized drawing/markup engine for roll-and-write board games
          </p>
        </div>
      </header>

      {/* Example Selector */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Select Example:
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedExample('yahtzee')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedExample === 'yahtzee'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Example 1: Yahtzee Grid
            </button>
            <button
              onClick={() => setSelectedExample('moon')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedExample === 'moon'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Example 2: Moon Mission
            </button>
            <button
              onClick={() => setSelectedExample('twilight')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedExample === 'twilight'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Example 3: Mixed Layout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <EngineProvider engine={engine}>
          <div className="space-y-6">
            {/* Toolbar */}
            <Toolbar />

            {/* Sheet Tabs (if multiple sheets) */}
            <SheetTabs />

            {/* Canvas */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <SheetCanvas />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                How to Use
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  Select a tool from the toolbar (or use keyboard shortcuts: C, N, F, O, P, T)
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  Click on any highlighted region to place a mark
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  For Number, Fill, Symbol, or Text tools, a value picker will appear
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  Checkbox and Circle marks cycle through states on repeated clicks
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  Use Ctrl+Z to undo and Ctrl+Shift+Z to redo
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">6.</span>
                  Save your progress with the Save button, and reload it with Load
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Mark Types
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Checkbox (empty/checked/crossed)</li>
                  <li>✓ Number (0-9)</li>
                  <li>✓ Fill (color selection)</li>
                  <li>✓ Circle (empty/half/full)</li>
                  <li>✓ Symbol (icons)</li>
                  <li>✓ Text (free input)</li>
                  <li>✓ Pencil (erasable)</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Hotspot Shapes
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Rectangle (grid cells)</li>
                  <li>✓ Circle (resource tokens)</li>
                  <li>✓ Polygon (irregular regions)</li>
                  <li>✓ Point (clickable spots)</li>
                  <li>✓ Auto-generated grids</li>
                  <li>✓ Custom freeform layouts</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Engine Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Unlimited undo/redo</li>
                  <li>✓ Save/load state</li>
                  <li>✓ Multi-sheet support</li>
                  <li>✓ Keyboard shortcuts</li>
                  <li>✓ Touch-friendly</li>
                  <li>✓ Event system for game logic</li>
                </ul>
              </div>
            </div>
          </div>
        </EngineProvider>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Built with React, TypeScript, Tailwind CSS, and SVG
        </p>
      </footer>
    </div>
  );
}

export default App;
