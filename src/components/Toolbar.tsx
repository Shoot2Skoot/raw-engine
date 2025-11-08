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
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (tool) {
          e.preventDefault();
          engine.setCurrentTool(tool.type);
          forceUpdate();
          return;
        }
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
    try {
      engine.saveToLocalStorage();
      // Show success feedback
      const button = document.getElementById('save-button');
      if (button) {
        button.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
          button.classList.remove('bg-green-500', 'text-white');
        }, 500);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save game state');
    }
  };

  const handleExport = () => {
    const state = engine.exportState();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
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
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = e.target?.result as string;
            const state = JSON.parse(json);
            engine.importState(state);
            forceUpdate();
          } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import game state');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Clear all marks on this sheet? This cannot be undone.')) {
      engine.clearAllMarks();
      forceUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
      {/* Tools */}
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
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white px-1 rounded text-[10px]">
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

        {/* Save/Load */}
        <button
          id="save-button"
          onClick={handleSave}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save size={20} />
        </button>

        <button
          onClick={handleExport}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          title="Export to JSON"
        >
          <Download size={20} />
        </button>

        <button
          onClick={handleImport}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          title="Import from JSON"
        >
          <Upload size={20} />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        {/* Clear */}
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Clear all marks"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
