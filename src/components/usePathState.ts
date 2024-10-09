// usePathState.ts
import { useState } from 'react';
import { FolderName } from '../types/types';

export const usePathState = () => {
  const [pathFolder, setPathFolder] = useState<FolderName | null>(null);

  return {
    pathFolder,
    setPathFolder,
  };
};
