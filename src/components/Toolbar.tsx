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
  Star,
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
    {
      type: 'checkbox',
      icon: <Square size={20} />,
      label: 'Checkbox',
      shortcut: 'C',
    },
    { type: 'number', icon: <Hash size={20} />, label: 'Number', shortcut: 'N' },
    {
      type: 'fill',
      icon: <PaintBucket size={20} />,
      label: 'Fill',
      shortcut: 'F',
    },
    { type: 'circle', icon: <Circle size={20} />, label: 'Circle', shortcut: 'O' },
    { type: 'symbol', icon: <Star size={20} />, label: 'Symbol', shortcut: 'S' },
    { type: 'text', icon: <Type size={20} />, label: 'Text', shortcut: 'T' },
    {
      type: 'pencil',
      icon: <Pencil size={20} />,
      label: 'Pencil',
      shortcut: 'P',
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
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
        alert('Failed to load saved game');
      }
    } else {
      alert('No saved game found');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300">
      {/* Tools */}
      <div className="flex items-center gap-2">
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

      {/* Actions */}
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
          title="Save"
        >
          <Save size={20} />
          <span className="text-sm font-medium">Save</span>
        </button>

        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
          title="Load"
        >
          Load
        </button>
      </div>
    </div>
  );
};
