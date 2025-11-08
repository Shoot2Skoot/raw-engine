// components/Toolbar.tsx

import React, { useEffect } from 'react';
import { useEngine } from '../context/EngineContext';
import {
  Square,
  Hash,
  Circle,
  PaintBucket,
  Pencil,
  Type,
  Undo,
  Redo,
  Save,
  Download,
  Upload
} from 'lucide-react';
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
      // Ignore if typing in input
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
    Serialization.saveToStorage(state);
    alert('Game saved!');
  };

  const handleExport = () => {
    const state = engine.exportState();
    const filename = `roll-and-write-${new Date().toISOString().slice(0, 10)}.json`;
    Serialization.exportToFile(state, filename);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const state = await Serialization.importFromFile(file);
        if (state) {
          engine.importState(state);
          forceUpdate();
          alert('Game loaded!');
        } else {
          alert('Failed to load game file');
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 shadow-md mb-4">
      <div className="flex items-center gap-2">
        {tools.map(tool => (
          <button
            key={tool.type}
            onClick={() => {
              engine.setCurrentTool(tool.type);
              forceUpdate();
            }}
            className={`relative p-3 rounded-lg transition-all ${currentTool === tool.type
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow'
              }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white px-1 rounded opacity-70">
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

        <div className="w-px h-8 bg-gray-400 mx-2" />

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all flex items-center gap-2"
          title="Save to Browser"
        >
          <Save size={20} />
          <span className="text-sm font-medium">Save</span>
        </button>

        <button
          onClick={handleExport}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all"
          title="Export to File"
        >
          <Download size={20} />
        </button>

        <button
          onClick={handleImport}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 hover:shadow transition-all"
          title="Import from File"
        >
          <Upload size={20} />
        </button>
      </div>
    </div>
  );
};
