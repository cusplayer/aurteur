// PathStateProvider.tsx
import React, { useState, useMemo,ReactNode } from 'react';
import { PathStateContext } from './PathStateContext';
import { FolderName } from '../types/types';

interface PathStateProviderProps {
    children: ReactNode;
  }

export const PathStateProvider: React.FC<PathStateProviderProps> = ({ children }) => {
  // Define the state you want to share between components
  const [pathFolder, setPathFolder] = useState<FolderName | null>(null);

  // Memoize the context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({ pathFolder, setPathFolder }), [pathFolder]);

  return (
    <PathStateContext.Provider value={contextValue}>
      {children}
    </PathStateContext.Provider>
  );
};
