import { useState, useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { moonMissionSheet } from './examples/02-image-hotspots';
import { mixedLayoutSheet } from './examples/03-mixed-layout';

function App() {
  const [selectedDemo, setSelectedDemo] = useState<'yahtzee' | 'moon' | 'mixed'>('yahtzee');

  const engine = useMemo(() => {
    // Create engine with all example sheets
    const sheets = [yahtzeeSheet, moonMissionSheet, mixedLayoutSheet];
    const engine = new SheetEngine(sheets);

    // Hook into events for demo purposes
    engine.on('markAdded', (event) => {
      console.log('Mark added:', event);
    });

    engine.on('markRejected', (event) => {
      if (event.type === 'markRejected') {
        console.warn('Mark rejected:', event.reason);
      }
    });

    // Start with the selected demo
    const sheetMap = {
      yahtzee: yahtzeeSheet.id,
      moon: moonMissionSheet.id,
      mixed: mixedLayoutSheet.id
    };
    engine.switchSheet(sheetMap[selectedDemo]);

    return engine;
  }, [selectedDemo]);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600">
              A web-based drawing/markup engine for roll-and-write board games
            </p>
          </div>

          {/* Demo Selector */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setSelectedDemo('yahtzee')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedDemo === 'yahtzee'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Simple Grid (Yahtzee)
            </button>
            <button
              onClick={() => setSelectedDemo('moon')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedDemo === 'moon'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Image Hotspots (Moon Mission)
            </button>
            <button
              onClick={() => setSelectedDemo('mixed')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedDemo === 'mixed'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mixed Layout
            </button>
          </div>

          {/* Toolbar */}
          <div className="mb-6">
            <Toolbar />
          </div>

          {/* Sheet Tabs (if multiple sheets) */}
          <SheetTabs />

          {/* Main Canvas */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <SheetCanvas />
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">How to Use</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tool Selection</h3>
                <ul className="space-y-1">
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">C</kbd> for Checkbox</li>
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">N</kbd> for Number</li>
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">F</kbd> for Fill</li>
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">O</kbd> for Circle</li>
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">P</kbd> for Pencil</li>
                  <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">T</kbd> for Text</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                <ul className="space-y-1">
                  <li>• Click on a cell to place a mark</li>
                  <li>• Number/Fill/Symbol tools show a value picker</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Z</kbd> to undo</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Shift+Z</kbd> to redo</li>
                  <li>• Use Save/Load buttons to persist your game</li>
                  <li>• Export/Import to save game as a file</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Engine Features</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-900">
              <div>
                <h3 className="font-semibold mb-2">✓ Multiple Mark Types</h3>
                <p className="text-blue-700">Checkboxes, numbers, fills, circles, symbols, text, and pencil marks</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Flexible Layouts</h3>
                <p className="text-blue-700">Grid-based, freeform hotspots, or mixed layouts</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Full Undo/Redo</h3>
                <p className="text-blue-700">Complete history management with command pattern</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Save/Load Support</h3>
                <p className="text-blue-700">LocalStorage and file export/import</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Event Hooks</h3>
                <p className="text-blue-700">Subscribe to marks, rejections, and sheet changes</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Developer Friendly</h3>
                <p className="text-blue-700">Fluent API, TypeScript, and extensive documentation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
