// components/SheetTabs.tsx

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();
  const sheets = engine.getAllSheets();
  const currentSheetId = engine.getCurrentSheet()?.definition.id;

  if (sheets.length <= 1) {
    // Don't show tabs if there's only one sheet
    return null;
  }

  return (
    <div className="flex gap-1 border-b-2 border-gray-300 bg-gray-50 mb-4">
      {sheets.map(sheet => {
        const sheetId = sheet.definition.id;
        const name = sheet.definition.name || sheetId;

        return (
          <button
            key={sheetId}
            onClick={() => {
              engine.switchSheet(sheetId);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-all ${currentSheetId === sheetId
                ? 'bg-white border-t-2 border-l-2 border-r-2 border-blue-500 text-blue-600 rounded-t-lg -mb-0.5'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
              }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};
