import React, { useState, useEffect} from 'react';
import {FolderName} from '../types/types';

interface PathProps {
  selectedFolder: FolderName | null;
  setSelectedFolder: (folder: FolderName | null) => void;
}

export const Path: React.FC<PathProps> = ({selectedFolder, setSelectedFolder}) => {
  const [pathFolder, setPathFoler] = useState<FolderName | null>(null);
  useEffect(() => {
    setPathFoler(selectedFolder);
  }, [selectedFolder]);
  const handlePathClick = () => {
    setSelectedFolder(null)
  };

  return (
    <div className="path" onClick={handlePathClick}>
         {`/aurteur/${pathFolder || ''}`}
    </div>
  );
};