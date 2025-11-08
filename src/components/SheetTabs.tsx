// components/SheetTabs.tsx

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, currentSheet, forceUpdate } = useEngine();
  const sheets = engine.getAllSheets();

  if (sheets.length <= 1) {
    return null; // Don't show tabs if only one sheet
  }

  return (
    <div className="flex gap-1 border-b-2 border-gray-300 bg-gray-50 rounded-t-lg overflow-x-auto">
      {sheets.map((sheet) => {
        const isActive = currentSheet?.definition.id === sheet.definition.id;

        return (
          <button
            key={sheet.definition.id}
            onClick={() => {
              engine.switchSheet(sheet.definition.id);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white border-t-2 border-l-2 border-r-2 border-blue-500 text-blue-600 rounded-t-lg -mb-0.5'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
            }`}
          >
            {sheet.definition.name}
          </button>
        );
      })}
    </div>
  );
};
