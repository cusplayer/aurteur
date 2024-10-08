import React, { useState, useEffect } from 'react';
import {Text, TextMeta} from '../types/types';

interface SubMenuItemProps {
  Text: TextMeta;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
  setSelectedFolder: (Text: TextMeta['folder'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({Text, setContentVisibility, setSelectedText, setSelectedFolder }) => {

  const subMenuClickHandler = () => {
    setSelectedText(Text.title);
    setSelectedFolder(Text.folder);
    setContentVisibility(true);
  };

  return (
    <li className={`sub-menu-item`} onClick={subMenuClickHandler} style={{ cursor: 'pointer'}}>
      <div className="TextTitle"> {Text.title} </div>
      <div className="TextTags">{Text.tags && Text.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
