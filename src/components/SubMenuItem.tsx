import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Text, TextMeta} from '../types/types';

interface SubMenuItemProps {
  Text: TextMeta;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({Text, setContentVisibility, setSelectedText}) => {

  const subMenuClickHandler = () => {
    setSelectedText(Text.title);
    setContentVisibility(true);
  };

  return (
    <li className={`sub-menu-item`} onClick={subMenuClickHandler}>
      <div className="TextTitle"> {Text.title} </div>
      <div className="TextTags">{Text.tags && Text.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
