/**
 * Main Application Component
 */

import { useEffect, useMemo, useState } from 'react';
import { SheetEngine } from './engine/SheetEngine';
import { EngineProvider } from './context/EngineContext';
import { SheetCanvas } from './components/SheetCanvas';
import { Toolbar } from './components/Toolbar';
import { SheetTabs } from './components/SheetTabs';
import { yahtzeeSheet, ticTacToeSheet } from './examples/01-simple-grid';
import { moonMissionSheet, spaceStationSheet } from './examples/02-image-hotspots';
import { twilightInscriptionSheet, civilizationSheet } from './examples/03-mixed-layout';
import { Info, FileText, Download, Upload } from 'lucide-react';

function App() {
  const [selectedExample, setSelectedExample] = useState('yahtzee');
  const [showInfo, setShowInfo] = useState(true);

  // Initialize engine with example sheets
  const engine = useMemo(() => {
    const sheets = [
      yahtzeeSheet,
      ticTacToeSheet,
      moonMissionSheet,
      spaceStationSheet,
      twilightInscriptionSheet,
      civilizationSheet
    ];

    const eng = new SheetEngine(sheets);

    // Try to load saved state
    eng.loadFromLocalStorage();

    // Listen to events for debugging
    if (import.meta.env.DEV) {
      eng.on('markAdded', (event) => {
        console.log('Mark added:', event);
      });
      eng.on('markRemoved', (event) => {
        console.log('Mark removed:', event);
      });
      eng.on('markRejected', (event) => {
        console.warn('Mark rejected:', event);
      });
    }

    return eng;
  }, []);

  // Auto-save on changes
  useEffect(() => {
    const unsubscribers = [
      engine.on('markAdded', () => {
        engine.saveToLocalStorage();
      }),
      engine.on('markRemoved', () => {
        engine.saveToLocalStorage();
      })
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  }, [engine]);

  // Example selection
  const examples = [
    { id: 'yahtzee', name: 'Yahtzee (Simple Grid)' },
    { id: 'tictactoe', name: 'Tic Tac Toe (Grid)' },
    { id: 'moon-mission-1', name: 'Moon Mission (Hotspots)' },
    { id: 'space-station', name: 'Space Station (Hotspots)' },
    { id: 'twilight-main', name: 'Twilight (Mixed)' },
    { id: 'civilization', name: 'Civilization (Mixed)' }
  ];

  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    engine.switchSheet(exampleId);
  };

  const handleExportState = () => {
    const state = engine.exportState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roll-and-write-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportState = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const state = JSON.parse(e.target?.result as string);
            engine.importState(state);
            alert('State imported successfully!');
          } catch (error) {
            alert('Failed to import state: ' + error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <EngineProvider engine={engine}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🎲 Roll-and-Write Engine
                </h1>
                <p className="text-gray-600">
                  A specialized drawing/markup engine for roll-and-write board games
                </p>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
              >
                <Info size={24} />
              </button>
            </div>

            {showInfo && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Guide:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select a tool from the toolbar below (or use keyboard shortcuts)</li>
                  <li>• Click on hotspots to place marks</li>
                  <li>• For checkboxes and circles, click multiple times to cycle states</li>
                  <li>• Use Ctrl+Z/Ctrl+Shift+Z for undo/redo</li>
                  <li>• Press 'E' to clear pencil marks</li>
                  <li>• Your progress is auto-saved to localStorage</li>
                </ul>
              </div>
            )}
          </header>

          {/* Example Selector */}
          <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FileText size={20} />
                Select Example:
              </label>
              <select
                value={selectedExample}
                onChange={(e) => handleExampleChange(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {examples.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>

              <button
                onClick={handleExportState}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                title="Export state to JSON"
              >
                <Download size={20} />
                Export
              </button>

              <button
                onClick={handleImportState}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                title="Import state from JSON"
              >
                <Upload size={20} />
                Import
              </button>
            </div>
          </div>

          {/* Sheet Tabs */}
          <SheetTabs />

          {/* Toolbar */}
          <Toolbar />

          {/* Main Canvas */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <SheetCanvas />
          </div>

          {/* Footer */}
          <footer className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200 text-center text-gray-600 text-sm">
            <p>
              Built with React, TypeScript, and Tailwind CSS •
              <a
                href="https://github.com"
                className="text-blue-600 hover:text-blue-800 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documentation
              </a>
            </p>
          </footer>
        </div>
      </div>
    </EngineProvider>
  );
}

export default App;
