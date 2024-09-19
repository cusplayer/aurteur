import React, { useState, useEffect} from 'react';
import { FolderName, TextMeta } from '../types/types';

interface PathProps {
  selectedFolder: FolderName | null;
  selectedText: TextMeta['title'] | null;
  setSelectedFolder: (folder: FolderName | null) => void;
}

export const Path: React.FC<PathProps> = ({selectedFolder, selectedText, setSelectedFolder}) => {
  const [pathFolder, setPathFoler] = useState<FolderName | null>(null);
  const [pathText, setPathText] = useState<TextMeta['title'] | null>(null);

  useEffect(() => {
    setPathFoler(selectedFolder);
    setPathText(selectedText);
  }, [selectedFolder, selectedText]);

  const handlePathClick = () => {
    // setSelectedFolder(null)
  };

  return (
    <div className="path" onClick={handlePathClick}>
         {`aurteur/${(pathFolder != null ? pathFolder + '/' : '')}${(pathText != null ? pathText : '')}`}
    </div>
  );
};