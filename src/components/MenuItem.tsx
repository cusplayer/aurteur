import React from 'react';
import {FolderName} from '../types/types';
import * as style from '../styles/menuItem.module.css';

interface MenuItemProps {
  folder: FolderName;
  selectedFolder: FolderName | null;
  onClick: (folder: FolderName) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({folder, selectedFolder, onClick}) => {

  return (
    <li className={`${style.menuItem} ${folder === selectedFolder ? style.menuItemSelected : ''}`} onClick={() => onClick(folder)}>
      {selectedFolder === folder ? '> ' : ''} {folder}
    </li>
  );
};
