/**
 * React Context for the SheetEngine
 */

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { SheetEngine } from '../engine/SheetEngine';
import type { SheetState, MarkType } from '../engine/types';

interface EngineContextType {
  engine: SheetEngine;
  currentSheet: SheetState | undefined;
  currentTool: MarkType;
  currentValue: string | number;
  forceUpdate: () => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

interface EngineProviderProps {
  engine: SheetEngine;
  children: React.ReactNode;
}

export const EngineProvider: React.FC<EngineProviderProps> = ({ engine, children }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Re-render on engine events
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

export const useEngine = (): EngineContextType => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
};
