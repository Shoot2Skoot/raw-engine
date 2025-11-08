// components/Toolbar.tsx

import React, { useEffect } from 'react';
import {
  Square,
  Hash,
  PaintBucket,
  Circle,
  Type,
  Pencil,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
} from 'lucide-react';
import { useEngine } from '../context/EngineContext';
import type { MarkType } from '../engine/types';

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
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const tool = tools.find(
        (t) => t.shortcut.toLowerCase() === e.key.toLowerCase()
      );
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

      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [engine, forceUpdate, tools]);

  const handleSave = () => {
    engine.saveToLocalStorage();
    alert('Game saved!');
  };

  const handleLoad = () => {
    const loaded = engine.loadFromLocalStorage();
    if (loaded) {
      forceUpdate();
      alert('Game loaded!');
    } else {
      alert('No saved game found');
    }
  };

  const handleExport = () => {
    const state = engine.exportState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roll-and-write-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const state = JSON.parse(event.target?.result as string);
            engine.importState(state);
            forceUpdate();
            alert('Game imported!');
          } catch (error) {
            alert('Failed to import: Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-300 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-gray-700 mr-2">Tools:</div>
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => {
              engine.setCurrentTool(tool.type);
              forceUpdate();
            }}
            className={`relative p-3 rounded-lg transition-all ${
              currentTool === tool.type
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
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
          className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
          title="Save (Ctrl+S)"
        >
          <Save size={20} />
          <span className="text-sm">Save</span>
        </button>

        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
          title="Load"
        >
          <Upload size={20} />
          <span className="text-sm">Load</span>
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-2"
          title="Export to file"
        >
          <Download size={20} />
          <span className="text-sm">Export</span>
        </button>

        <button
          onClick={handleImport}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          title="Import from file"
        >
          <Upload size={20} />
          <span className="text-sm">Import</span>
        </button>
      </div>
    </div>
  );
};
