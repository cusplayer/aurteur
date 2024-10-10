import React, { useContext } from 'react';
import {Text, TextMeta} from '../types/types';
// import { useContextSelector } from 'use-context-selector';
// import { PathStateContext } from './PathStateContext';

interface SubMenuItemProps {
  Text: TextMeta;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
  handleSubMenuItemClick : (Text: TextMeta['title'], folder: TextMeta['folder'] | null) => void;
  // setSelectedFolder: (Text: TextMeta['folder'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({Text, setContentVisibility, setSelectedText, handleSubMenuItemClick }) => {
  // const setPathFolder = useContextSelector(PathStateContext, (context) => context?.setPathFolder);
  // if (!setPathFolder) {
  //   throw new Error('SubMenuItem must be used within a PathStateProvider');
  // }

  // const subMenuClickHandler = () => {
  //   setSelectedText(Text.title);
  //   setPathFolder(Text.folder);
  //   setContentVisibility(true);
  // };

  return (
    <li className={`sub-menu-item`} onClick={() => handleSubMenuItemClick(Text.title, Text.folder)} style={{ cursor: 'pointer'}}>
      <div className="TextTitle"> {Text.title.replace('.md', '')} </div>
      <div className="TextTags">{Text.tags && Text.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
