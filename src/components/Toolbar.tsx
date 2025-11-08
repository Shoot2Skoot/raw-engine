/**
 * Toolbar Component
 * Tool selection, undo/redo, and save/load
 */

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
  Upload,
  Trash2
} from 'lucide-react';
import { useEngine } from '../context/EngineContext';
import type { MarkType } from '../engine/types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/serialization';

const STORAGE_KEY = 'roll-and-write-save';

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
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
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
    const state = engine.exportState();
    const success = saveToLocalStorage(STORAGE_KEY, state);
    if (success) {
      alert('Game saved!');
    } else {
      alert('Failed to save game');
    }
  };

  const handleLoad = () => {
    const state = loadFromLocalStorage(STORAGE_KEY);
    if (state) {
      engine.importState(state);
      forceUpdate();
      alert('Game loaded!');
    } else {
      alert('No saved game found');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all marks? This cannot be undone.')) {
      engine.clearSheet();
      forceUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 shadow-md">
      {/* Tool selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
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
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white px-1 rounded font-mono">
              {tool.shortcut}
            </span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          onClick={() => {
            engine.undo();
            forceUpdate();
          }}
          disabled={!engine.canUndo()}
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 shadow transition-all"
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
          className="p-2 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 shadow transition-all"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-8 bg-gray-400 mx-2" />

        {/* Save/Load/Clear */}
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow transition-all flex items-center gap-2"
          title="Save (Ctrl+S)"
        >
          <Save size={18} />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow transition-all flex items-center gap-2"
          title="Load"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">Load</span>
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow transition-all flex items-center gap-2"
          title="Clear all marks"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
