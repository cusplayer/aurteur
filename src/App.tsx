import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import * as style from './styles/app.module.css'
import { Title, Menu, Path, SubMenu, Content } from 'components';
import { getArticlesMeta } from './apiService';
import { FolderName } from './types/types';
import { Article, ArticleMeta } from './types/types';

const folderNames: FolderName[] = ['feed', 'designs', 'ouvres', 'contacts'];
console.log(style);
export const App: React.FC = () => {
  const [ariclesMeta, setAriclesMeta] = useState<ArticleMeta[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleMeta['title'] | null>(null);
  const handleMenuItemClick = (folder: FolderName) => {
    setSelectedFolder(folder);
    setSubMenuVisibility(true);
    setContentVisibility(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchAriclesMeta = async () => {
      try {
        const data = await getArticlesMeta({ signal: controller.signal });
        setAriclesMeta(data);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Ошибка при загрузке:', error);
          // setError('Ой, что-то пошло не так!');
        }
      } finally {
        // setLoading(false);
      }
    };

    fetchAriclesMeta();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Router>
      <Title/>
      <Path selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}/>
      <div className={style.page}>
        <div className={style.navigationMenu}>
          <Menu folderNames={folderNames} selectedFolder={selectedFolder} onMenuItemClick={handleMenuItemClick}/>
          {subMenuVisibility && <SubMenu article={ariclesMeta} selectedFolder={selectedFolder} setContentVisibility={setContentVisibility} setSelectedArticle={setSelectedArticle}/>}
        </div>
        {contentVisibility && <Content selectedArticle={selectedArticle}/>}
      </div>
    </Router>
  );
};