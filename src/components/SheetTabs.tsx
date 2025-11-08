import React from 'react';
import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC = () => {
  const { engine, forceUpdate } = useEngine();

  const sheets = engine.getAllSheets();
  const currentSheetId = engine.getCurrentSheetId();

  if (sheets.length <= 1) {
    return null; // Don't show tabs if only one sheet
  }

  return (
    <div className="flex gap-1 border-b-2 border-gray-300 bg-gray-50 rounded-t-lg overflow-x-auto">
      {sheets.map(sheet => {
        const isActive = currentSheetId === sheet.definition.id;
        const markCount = sheet.marks.size;

        return (
          <button
            key={sheet.definition.id}
            onClick={() => {
              engine.switchSheet(sheet.definition.id);
              forceUpdate();
            }}
            className={`
              relative px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
              ${isActive
                ? 'bg-white border-t-2 border-l-2 border-r-2 border-blue-500 text-blue-600 -mb-0.5'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }
            `}
          >
            {sheet.definition.name}
            {markCount > 0 && (
              <span
                className={`
                  ml-2 px-2 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}
                `}
              >
                {markCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
