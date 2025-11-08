/**
 * Toolbar for tool selection and actions
 */

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
  Eraser,
  Trash2
} from 'lucide-react';

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
    { type: 'symbol', icon: <span className="text-xl">★</span>, label: 'Symbol', shortcut: 'S' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool && !e.ctrlKey && !e.metaKey && !e.altKey) {
        engine.setCurrentTool(tool.type);
        forceUpdate();
        e.preventDefault();
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

      // Redo alternative (Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        engine.redo();
        forceUpdate();
      }

      // Save (Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        engine.saveToLocalStorage();
      }

      // Clear pencil marks (E key)
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        engine.clearPencilMarks();
        forceUpdate();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [engine, forceUpdate, tools]);

  const handleClearSheet = () => {
    if (window.confirm('Clear all marks from this sheet?')) {
      engine.clearSheet();
      forceUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-300 shadow-lg">
      {/* Tool Selection */}
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
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            {currentTool === tool.type && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            engine.clearPencilMarks();
            forceUpdate();
          }}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Clear Pencil Marks (E)"
        >
          <Eraser size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => {
            engine.undo();
            forceUpdate();
          }}
          disabled={!engine.canUndo()}
          className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-gray-700 transition-colors"
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
          className="p-2 rounded-lg bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-gray-700 transition-colors"
          title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => {
            engine.saveToLocalStorage();
            // Visual feedback
            const btn = document.activeElement as HTMLButtonElement;
            btn.classList.add('animate-pulse-soft');
            setTimeout(() => btn.classList.remove('animate-pulse-soft'), 1000);
          }}
          className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2"
          title="Save (Ctrl+S)"
        >
          <Save size={20} />
          <span className="font-medium">Save</span>
        </button>

        <button
          onClick={handleClearSheet}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
          title="Clear Sheet"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
