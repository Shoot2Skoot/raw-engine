// components/SheetTabs.tsx

import { useEngine } from '../context/EngineContext';

export const SheetTabs: React.FC<{ sheetIds: string[] }> = ({ sheetIds }) => {
  const { engine, forceUpdate } = useEngine();
  const currentSheetId = engine.getCurrentSheet()?.definition.id;

  return (
    <div className="flex gap-1 border-b border-gray-300 bg-gray-50">
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
