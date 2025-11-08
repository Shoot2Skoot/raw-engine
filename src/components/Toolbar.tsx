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
  Trash2
} from 'lucide-react';

/**
 * Toolbar component with tool selection and actions
 */
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
      // Don't trigger shortcuts when typing in an input
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
    localStorage.setItem('roll-and-write-save', JSON.stringify(state));
    alert('Game saved!');
  };

  const handleClear = () => {
    if (confirm('Clear all marks? This cannot be undone.')) {
      engine.clearAllMarks();
      forceUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300 shadow-sm">
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
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className={`absolute -bottom-1 -right-1 text-xs px-1 rounded ${
              currentTool === tool.type ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white'
            }`}>
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
          className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all flex items-center gap-2"
          title="Save"
        >
          <Save size={20} />
          <span className="text-sm font-medium">Save</span>
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg bg-white hover:bg-red-50 hover:shadow transition-all flex items-center gap-2 text-red-600"
          title="Clear All"
        >
          <Trash2 size={20} />
          <span className="text-sm font-medium">Clear</span>
        </button>
      </div>
    </div>
  );
};
