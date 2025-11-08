// components/Toolbar.tsx - Tool selection and action buttons

import React, { useEffect } from 'react';
import { useEngine } from '../context/EngineContext';
import type { MarkType } from '../engine/types';
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
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

interface Tool {
  type: MarkType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

export const Toolbar: React.FC = () => {
  const { engine, currentTool, forceUpdate } = useEngine();

  const tools: Tool[] = [
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
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
      const tool = tools.find(
        t => t.shortcut.toLowerCase() === e.key.toLowerCase()
      );
      if (tool && !e.ctrlKey && !e.metaKey) {
        engine.setCurrentTool(tool.type);
        forceUpdate();
        return;
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
        return;
      }

      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [engine, forceUpdate, tools]);

  const handleSave = () => {
    const state = engine.exportState();
    localStorage.setItem('roll-and-write-save', JSON.stringify(state));
    alert('Game saved!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('roll-and-write-save');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        engine.importState(state);
        forceUpdate();
        alert('Game loaded!');
      } catch (error) {
        alert('Failed to load game: ' + error);
      }
    } else {
      alert('No saved game found!');
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

  // Future: Add file import functionality
  // const handleImport = () => { ... }

  const handleClear = () => {
    if (confirm('Clear all marks? This cannot be undone.')) {
      engine.clearAllMarks();
      forceUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300 shadow-lg">
      {/* Tool selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 mr-2">Tools:</span>
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
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
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

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            engine.undo();
            forceUpdate();
          }}
          disabled={!engine.canUndo()}
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow transition-all"
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
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow transition-all"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <button
          onClick={handleSave}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all"
          title="Save to Browser (Ctrl+S)"
        >
          <Save size={20} />
        </button>
        <button
          onClick={handleLoad}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all"
          title="Load from Browser"
        >
          <Upload size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <button
          onClick={handleExport}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all"
          title="Export to File"
        >
          <Download size={20} />
        </button>

        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:shadow transition-all"
          title="Clear All Marks"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
