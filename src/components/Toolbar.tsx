import React, { useEffect } from 'react';
import {
  Square,
  Hash,
  PaintBucket,
  Circle,
  Pencil,
  Type,
  Undo,
  Redo,
  Save,
  Upload
} from 'lucide-react';
import { useEngine } from '../context/EngineContext';
import type { MarkType } from '../engine/types';
import { Serialization } from '../utils/serialization';

export const Toolbar: React.FC = () => {
  const { engine, currentTool, forceUpdate } = useEngine();

  const tools: Array<{
    type: MarkType;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
  }> = [
    { type: 'checkbox', icon: <Square size={20} />, label: 'Checkbox', shortcut: 'C' },
    { type: 'number', icon: <Hash size={20} />, label: 'Number', shortcut: 'N' },
    { type: 'fill', icon: <PaintBucket size={20} />, label: 'Fill', shortcut: 'F' },
    { type: 'circle', icon: <Circle size={20} />, label: 'Circle', shortcut: 'O' },
    { type: 'pencil', icon: <Pencil size={20} />, label: 'Pencil', shortcut: 'P' },
    { type: 'text', icon: <Type size={20} />, label: 'Text', shortcut: 'T' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool && !e.ctrlKey && !e.metaKey) {
        engine.setCurrentTool(tool.type);
        forceUpdate();
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          engine.redo();
        } else {
          engine.undo();
        }
        forceUpdate();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [engine, forceUpdate, tools]);

  const handleSave = () => {
    const state = engine.exportState();
    Serialization.save('roll-and-write-save', state);
    alert('Game saved!');
  };

  const handleLoad = () => {
    const state = Serialization.load('roll-and-write-save');
    if (state) {
      engine.importState(state);
      forceUpdate();
      alert('Game loaded!');
    } else {
      alert('No saved game found!');
    }
  };

  const handleExport = () => {
    const state = engine.exportState();
    Serialization.exportToFile(state, `game-${Date.now()}.json`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const state = await Serialization.importFromFile(file);
          engine.importState(state);
          forceUpdate();
          alert('Game imported!');
        } catch (error) {
          alert('Failed to import game: ' + (error as Error).message);
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300 gap-4">
      <div className="flex items-center gap-2">
        {tools.map(tool => (
          <button
            key={tool.type}
            onClick={() => {
              engine.setCurrentTool(tool.type);
              forceUpdate();
            }}
            className={`relative p-3 rounded-lg transition-all ${
              currentTool === tool.type
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white px-1 rounded">
              {tool.shortcut}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            engine.undo();
            forceUpdate();
          }}
          disabled={!engine.canUndo()}
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={() => {
            engine.redo();
            forceUpdate();
          }}
          disabled={!engine.canRedo()}
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
          title="Save to localStorage"
        >
          <Save size={20} />
          <span className="text-sm">Save</span>
        </button>

        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
          title="Load from localStorage"
        >
          <Upload size={20} />
          <span className="text-sm">Load</span>
        </button>

        <button
          onClick={handleExport}
          className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-sm transition-colors"
          title="Export to file"
        >
          Export
        </button>

        <button
          onClick={handleImport}
          className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-sm transition-colors"
          title="Import from file"
        >
          Import
        </button>
      </div>
    </div>
  );
};
