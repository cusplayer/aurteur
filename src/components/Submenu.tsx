import React from 'react';
import { FolderName, TextMeta } from '../types/types';
import { SubMenuItem } from 'components';
import * as style from '../styles/submenu.module.css';

interface SubMenuProps {
  Text: TextMeta[];
  selectedFolder: FolderName | null;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({ Text, selectedFolder, setContentVisibility, setSelectedText }) => {

  const filteredTexts = selectedFolder === 'all'
    ? Text
    : Text.filter((text) => text.folder === selectedFolder);

  return (
    <ul className={style.subMenuList}>
      {filteredTexts.map((text) => (
        <SubMenuItem
          Text={text}
          key={text.title}
          setContentVisibility={setContentVisibility}
          setSelectedText={setSelectedText}
        />
      ))}
    </ul>
  );
};
