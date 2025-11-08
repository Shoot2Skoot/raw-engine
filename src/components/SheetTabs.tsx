import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();
  const sheets = engine.getAllSheets();
  const currentSheetId = engine.getCurrentSheet()?.definition.id;

  if (sheets.length <= 1) {
    return null; // Don't show tabs if only one sheet
  }

  return (
    <div className="flex gap-1 border-b border-gray-300 bg-gray-50">
      {sheets.map(sheet => {
        const { id, name } = sheet.definition;

        return (
          <button
            key={id}
            onClick={() => {
              engine.switchSheet(id);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentSheetId === id
                ? 'bg-white border-t-2 border-l border-r border-blue-500 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};
