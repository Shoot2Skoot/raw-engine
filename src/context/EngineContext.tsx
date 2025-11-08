// context/EngineContext.tsx - React Context for the SheetEngine

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

export const EngineProvider: React.FC<{
  engine: SheetEngine;
  children: React.ReactNode;
}> = ({ engine, children }) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Re-render on engine events
  useEffect(() => {
    const unsubscribers = [
      engine.on('markAdded', forceUpdate),
      engine.on('markRemoved', forceUpdate),
      engine.on('sheetChanged', forceUpdate),
      engine.on('toolChanged', forceUpdate),
      engine.on('markRejected', (event) => {
        if (event.type === 'markRejected') {
          console.warn(`Mark rejected: ${event.reason}`);
        }
        forceUpdate();
      }),
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  }, [engine]);

  const value: EngineContextType = {
    engine,
    currentSheet: engine.getCurrentSheet(),
    currentTool: engine.getCurrentTool(),
    currentValue: engine.getCurrentValue(),
    forceUpdate,
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
