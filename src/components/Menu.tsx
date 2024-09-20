import React, { useState, useEffect } from 'react';
import { FolderName } from '../types/types';
import { MenuItem } from 'components';
import * as style from '../styles/menu.module.css';

interface MenuProps {
  folderNames: FolderName[];
  selectedFolder: FolderName | null;
  onMenuItemClick: (folder: FolderName) => void;
}

export const Menu: React.FC<MenuProps> = ({
  folderNames,
  selectedFolder,
  onMenuItemClick,
}) => {
  return (
    <div>
      <ul className={style.menuList}>
        {folderNames.map((folder) => (
          <MenuItem folder={folder} key={folder} selectedFolder={selectedFolder} onClick={() => onMenuItemClick(folder)} />
        ))}
      </ul>
    </div>
  );
};