import React from 'react';
import { FolderName, ArticleMeta } from '../types/types'

interface SubMenuProps {
  article: ArticleMeta;
  selectedFolder: FolderName | null;
}

export const Submenu: React.FC<SubMenuProps> = ({article, selectedFolder}) => {

  return (
    <p>yo</p>
  );
}