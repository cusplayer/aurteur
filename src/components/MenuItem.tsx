import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {FolderName} from '../types/types';

interface MenuItemProps {
  folder: FolderName;
  selectedFolder: FolderName | null;
  onClick: (folder: FolderName) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({folder, selectedFolder, onClick}) => {

  return (
    <li className={`menu-item ${folder === selectedFolder ? 'selected' : ''}`} onClick={() => onClick(folder)}>
      {selectedFolder === folder ? '> ' : ''} {folder}
    </li>
  );
};
