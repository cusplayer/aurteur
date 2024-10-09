import React, { useState, useEffect } from 'react';
import {Text, TextMeta} from '../types/types';
import { usePathState } from './usePathState'; 

interface SubMenuItemProps {
  Text: TextMeta;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
  setSelectedFolder: (Text: TextMeta['folder'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({Text, setContentVisibility, setSelectedText, setSelectedFolder }) => {

  const { setPathFolder } = usePathState();
  const subMenuClickHandler = () => {
    setSelectedText(Text.title);
    setPathFolder(Text.folder);
    console.log(Text.folder)
    setContentVisibility(true);
  };

  return (
    <li className={`sub-menu-item`} onClick={subMenuClickHandler} style={{ cursor: 'pointer'}}>
      <div className="TextTitle"> {Text.title.replace('.md', '')} </div>
      <div className="TextTags">{Text.tags && Text.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
