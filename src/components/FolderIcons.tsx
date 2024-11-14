import React from 'react';
import { FolderName } from '../types/types';
import * as style from '../styles/foldericons.module.css';
import { ReactComponent as FolderIcon } from '../icons/folder.svg';
import { ReactComponent as PersonIcon } from '../icons/person.svg';
import { ReactComponent as GlobeIcon } from '../icons/globe.svg';

interface FolderIconsProps {
  folderNames: FolderName[];
  selectedFolder: FolderName | null;
  setHoveredFolder: (folder: FolderName | null) => void;
  hoveredFolder: FolderName | null;
  onFolderIconClick: (folder: FolderName) => void;
}

export const FolderIcons: React.FC<FolderIconsProps> = ({
  folderNames,
  selectedFolder,
  setHoveredFolder,
  hoveredFolder,
  onFolderIconClick,
}) => {
  const getIconComponent = (folder: FolderName) => {
    switch (folder) {
      case 'all':
        return <GlobeIcon className={style.iconImage} />;
      case 'about me':
        return <PersonIcon className={style.iconImage} />;
      default:
        return <FolderIcon className={style.iconImage} />;
    }
  };

  return (
    <div className={style.iconsContainer}>
      {folderNames.map((folder) => (
        <div
          key={folder}
          className={`${style.folderIcon} ${selectedFolder === folder ? style.selected : ''} ${
            hoveredFolder === folder ? style.hovered : ''
          }`}
          title={folder}
          onMouseEnter={() => setHoveredFolder(folder)}
          onMouseLeave={() => setHoveredFolder(null)}
          onClick={() => onFolderIconClick(folder)}
        >
          {getIconComponent(folder)}
        </div>
      ))}
    </div>
  );
};
