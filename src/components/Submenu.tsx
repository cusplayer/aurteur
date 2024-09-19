import React from 'react';
import { FolderName, TextMeta } from '../types/types'
import { SubMenuItem } from 'components';

interface SubMenuProps {
  Text: TextMeta[];
  selectedFolder: FolderName | null;
  setContentVisibility: (visible: boolean) => void;
  setSelectedText: (Text: TextMeta['title'] | null) => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({Text, selectedFolder, setContentVisibility, setSelectedText}) => {
  const Texts = Text;
  return (
    <ul className='subMenu'>
      {Texts
      .filter((Text) => Text.folder === selectedFolder)
      .map((Text) => (<SubMenuItem Text={Text} key={Text.title} setContentVisibility={setContentVisibility} setSelectedText={setSelectedText}/>))}
    </ul>
  );
}