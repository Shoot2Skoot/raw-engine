// components/SheetTabs.tsx

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();
  const currentSheetId = engine.getCurrentSheet()?.definition.id;
  const allSheets = engine.getAllSheets();

  // Don't render if there's only one sheet
  if (allSheets.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-1 border-b border-gray-300 bg-gray-50">
      {allSheets.map(sheet => {
        const sheetId = sheet.definition.id;
        const name = sheet.definition.name || sheetId;

        return (
          <button
            key={sheetId}
            onClick={() => {
              engine.switchSheet(sheetId);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-colors ${currentSheetId === sheetId
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
