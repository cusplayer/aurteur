import React from 'react';
import { FolderName, ArticleMeta } from '../types/types'
import { SubMenuItem } from 'components';

interface SubMenuProps {
  article: ArticleMeta[];
  selectedFolder: FolderName | null;
  setContentVisibility: (visible: boolean) => void;
  setSelectedArticle: (article: ArticleMeta['title'] | null) => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({article, selectedFolder, setContentVisibility, setSelectedArticle}) => {
  const articles = article;
  return (
    <ul className='subMenu'>
      {articles
      .filter((article) => article.folder === selectedFolder)
      .map((article) => (<SubMenuItem article={article} key={article.title} setContentVisibility={setContentVisibility} setSelectedArticle={setSelectedArticle}/>))}
    </ul>
  );
}