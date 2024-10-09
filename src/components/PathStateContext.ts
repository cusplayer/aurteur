// PathStateContext.ts
import { createContext } from 'use-context-selector';
import { FolderName } from '../types/types';

interface PathStateContextProps {
  pathFolder: FolderName | null;
  setPathFolder: (folder: FolderName | null) => void;
}

export const PathStateContext = createContext<PathStateContextProps | undefined>(undefined);
