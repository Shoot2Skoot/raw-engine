/**
 * SheetTabs Component
 * Navigation between multiple sheets
 */

import React from 'react';
import { useEngine } from '../context/EngineContext';

interface SheetTabsProps {
  sheetIds: string[];
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ sheetIds }) => {
  const { engine, forceUpdate } = useEngine();
  const currentSheetId = engine.getCurrentSheetId();

  if (sheetIds.length <= 1) {
    return null; // Don't show tabs if there's only one sheet
  }

  return (
    <div className="flex gap-1 border-b-2 border-gray-300 bg-gray-50 rounded-t-lg overflow-x-auto">
      {sheetIds.map(sheetId => {
        const sheet = engine.getSheet(sheetId);
        const name = sheet?.definition.name || sheetId;

        return (
          <button
            key={sheetId}
            onClick={() => {
              engine.switchSheet(sheetId);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              currentSheetId === sheetId
                ? 'bg-white border-t-4 border-l border-r border-blue-500 text-blue-600 -mb-0.5'
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

export default SheetTabs;
