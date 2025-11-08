// components/SheetTabs.tsx

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();
  const allSheets = engine.getAllSheets();
  const currentSheetId = engine.getCurrentSheetId();

  if (allSheets.length <= 1) {
    // Don't show tabs if there's only one sheet
    return null;
  }

  return (
    <div className="flex gap-1 border-b border-gray-300 bg-gray-50">
      {allSheets.map(sheet => (
        <button
          key={sheet.id}
          onClick={() => {
            engine.switchSheet(sheet.id);
            forceUpdate();
          }}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            currentSheetId === sheet.id
              ? 'bg-white border-t-2 border-l border-r border-blue-500 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {sheet.name}
        </button>
      ))}
    </div>
  );
};
