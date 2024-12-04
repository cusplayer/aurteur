import React from 'react';
import {FolderName} from '../types/types';
import { useWindowSize } from '../hooks/useWindowSize';
import * as style from '../styles/menuItem.module.css';

interface MenuItemProps {
  folder: FolderName;
  selectedFolder: FolderName | null;
  onClick: (folder: FolderName) => void;
  setHoveredFolder: (folder: FolderName | null) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ folder, selectedFolder, onClick, setHoveredFolder }) => {
  const { width } = useWindowSize();
  const isMobile = width <= 767;
  return (
    <li
      className={`${style.menuItem} ${folder === selectedFolder ? style.menuItemSelected : ''}`}
      onClick={() => onClick(folder)}
      onMouseEnter={() => setHoveredFolder(folder)}
      onMouseLeave={() => setHoveredFolder(null)}
    >
      {(selectedFolder === folder && !isMobile) ? '> ' : ''} {folder}
    </li>
  );
};

