/**
 * Tab navigation for multiple sheets
 */

import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();
  const sheetIds = engine.getSheetIds();
  const currentSheetId = engine.getCurrentSheetId();

  if (sheetIds.length <= 1) {
    // Don't show tabs if only one sheet
    return null;
  }

  return (
    <div className="flex gap-1 border-b-2 border-gray-300 bg-gray-50">
      {sheetIds.map(sheetId => {
        const sheet = engine.getSheet(sheetId);
        const name = sheet?.definition.name || sheetId;
        const stats = engine.getStats();

        return (
          <button
            key={sheetId}
            onClick={() => {
              engine.switchSheet(sheetId);
              forceUpdate();
            }}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              currentSheetId === sheetId
                ? 'bg-white border-t-4 border-l-2 border-r-2 border-blue-500 text-blue-600 -mb-0.5 z-10'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-t-2 border-gray-300'
            }`}
          >
            <span>{name}</span>
            {currentSheetId === sheetId && stats.markedHotspots > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {stats.markedHotspots}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
