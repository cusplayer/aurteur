import React from 'react';
import {Text, TextMeta} from '../types/types';
import * as style from '../styles/submenuitem.module.css';

interface SubMenuItemProps {
  Text: TextMeta;
  selectedText: TextMeta['title'] | null;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
  handleSubMenuItemClick : (Text: TextMeta['title'], folder: TextMeta['folder'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({Text, selectedText, handleSubMenuItemClick }) => {

  return (
    <li className={`${style.subMenuItem} ${Text.title === selectedText ? style.subMenuItemSelected : ''}`} 
      onClick={() => handleSubMenuItemClick(Text.title, Text.folder)} 
      >
      <div className={style.textTitle}> {Text.title.replace('.md', '')} </div>
      <div className={style.textTags}>{Text.tags && Text.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
