import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Article, ArticleMeta} from '../types/types';

interface SubMenuItemProps {
  article: ArticleMeta;
  setContentVisibility: (visible: boolean) => void;
  setSelectedArticle: (article: ArticleMeta['title'] | null) => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({article, setContentVisibility, setSelectedArticle}) => {

  const subMenuClickHandler = () => {
    setSelectedArticle(article.title);
    setContentVisibility(true);
  };

  return (
    <li className={`sub-menu-item`} onClick={subMenuClickHandler}>
      <div className="articleTitle"> {article.title} </div>
      <div className="articleTags">{article.tags && article.tags.map(tag => `#${tag}`).join(' ')}</div>
    </li>
  );
};
