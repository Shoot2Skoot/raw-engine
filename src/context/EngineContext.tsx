import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import type { SheetState, MarkType } from '../engine/types';

interface EngineContextType {
  engine: SheetEngine;
  currentSheet: SheetState | undefined;
  currentTool: MarkType;
  currentValue: string | number;
  forceUpdate: () => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

export const EngineProvider: React.FC<{
  engine: SheetEngine;
  children: ReactNode;
}> = ({ engine, children }) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Re-render on events
  useEffect(() => {
    const unsubscribers = [
      engine.on('markAdded', forceUpdate),
      engine.on('markRemoved', forceUpdate),
      engine.on('sheetChanged', forceUpdate),
      engine.on('toolChanged', forceUpdate)
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  }, [engine]);

  const value: EngineContextType = {
    engine,
    currentSheet: engine.getCurrentSheet(),
    currentTool: engine.getCurrentTool(),
    currentValue: engine.getCurrentValue(),
    forceUpdate
  };

  return (
    <EngineContext.Provider value={value}>
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
};
