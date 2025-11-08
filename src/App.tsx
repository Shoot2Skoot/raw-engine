import { useEffect, useMemo } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet } from './examples/01-simple-grid';
import { moonMissionSheet } from './examples/02-image-hotspots';
import { twilightSheet } from './examples/03-mixed-layout';

function App() {
  // Create engine instance with example sheets
  const engine = useMemo(() => {
    return new SheetEngine([
      yahtzeeSheet,
      moonMissionSheet,
      twilightSheet
    ]);
  }, []);

  // Auto-load from localStorage on mount
  useEffect(() => {
    const loaded = engine.loadFromLocalStorage();
    if (loaded) {
      console.log('Loaded saved state from localStorage');
    }
  }, [engine]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        engine.saveToLocalStorage();
        console.log('Auto-saved to localStorage');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Roll-and-Write Game Engine
            </h1>
            <p className="text-gray-600">
              A specialized drawing/markup engine for roll-and-write board games
            </p>
          </header>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Sheet Tabs */}
            <SheetTabs />

            {/* Canvas */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <SheetCanvas />
            </div>

            {/* Toolbar */}
            <Toolbar />

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm">
              <h3 className="font-semibold text-blue-900 mb-2">Quick Guide:</h3>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>Click hotspots</strong> to mark them with the selected tool</li>
                <li>• <strong>Tool shortcuts:</strong> C (Checkbox), N (Number), F (Fill), O (Circle), P (Pencil), T (Text)</li>
                <li>• <strong>Undo/Redo:</strong> Ctrl+Z / Ctrl+Shift+Z</li>
                <li>• <strong>Save:</strong> Ctrl+S (auto-saves every 30 seconds)</li>
                <li>• <strong>Multiple sheets:</strong> Switch between sheets using tabs</li>
                <li>• <strong>Checkbox cycling:</strong> Click repeatedly to cycle through states (checked → crossed → empty)</li>
              </ul>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm mt-8">
              <p>Built with React, TypeScript, and SVG</p>
              <p className="mt-1">
                Demo sheets: Yahtzee, Moon Mission, Twilight Inscription
              </p>
            </footer>
          </div>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
