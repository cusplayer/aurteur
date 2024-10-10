import React from 'react';
import { FolderName, TextMeta } from '../types/types';
import { SubMenuItem } from 'components';
import * as style from '../styles/submenu.module.css';

interface SubMenuProps {
  Text: TextMeta[];
  selectedFolder: FolderName | null;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
  setSelectedFolder: (Text: TextMeta['folder'] | null) => void;
  handleSubMenuItemClick: (Text: TextMeta['title'], folder: FolderName | null) => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({ Text, selectedFolder, setContentVisibility, setSelectedText, setSelectedFolder, handleSubMenuItemClick }) => {

  const filteredTexts = selectedFolder === 'all'
    ? Text
    : Text.filter((text) => text.folder === selectedFolder);

  const sortedTexts = filteredTexts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return (
    <ul className={style.subMenuList}>
      {sortedTexts.map((text) => (
        <SubMenuItem
          Text={text}
          key={text.title}
          setContentVisibility={setContentVisibility}
          setSelectedText={setSelectedText}
          handleSubMenuItemClick={handleSubMenuItemClick}
        />
      ))}
    </ul>
  );
};
