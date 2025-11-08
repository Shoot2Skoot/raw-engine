// components/SheetTabs.tsx - Multi-sheet navigation

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, currentSheet, forceUpdate } = useEngine();
  const allSheets = engine.getAllSheets();

  if (allSheets.length <= 1) {
    // Don't show tabs if there's only one sheet
    return null;
  }

  const currentSheetId = currentSheet?.definition.id;

  return (
    <div className="flex gap-1 border-b border-gray-300 bg-gray-50 rounded-t-lg overflow-x-auto">
      {allSheets.map(sheet => {
        const sheetId = sheet.definition.id;
        const name = sheet.definition.name || sheetId;
        const isActive = currentSheetId === sheetId;
        const markCount = sheet.marks.size;

        return (
          <button
            key={sheetId}
            onClick={() => {
              engine.switchSheet(sheetId);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white border-t-2 border-l border-r border-blue-500 text-blue-600 rounded-t-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {name}
            {markCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {markCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
