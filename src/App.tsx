import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import * as style from './styles/app.module.css'
import { Title, Menu, Path, SubMenu, Content, AboutMe } from 'components';
import { getTextsMeta } from './api/apiService';
import { FolderName, TextMeta } from './types/types';

const folderNames: FolderName[] = ['all', 'designs', 'ouvres', 'about me'];
export const App: React.FC = () => {
  const [ariclesMeta, setAriclesMeta] = useState<TextMeta[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<TextMeta['title'] | null>(null);

  const handleMenuItemClick = (folder: FolderName) => {
    setSelectedFolder(folder);
    setSelectedText(null);
    setContentVisibility(false);
    if (folder === 'about me') {
      setSubMenuVisibility(false);
    } else {
      setSubMenuVisibility(true);
    };
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchAriclesMeta = async () => {
      try {
        const data = await getTextsMeta({ signal: controller.signal });
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


    useEffect(() => {
      if (selectedText) {
        setContentVisibility(true);
      }
    }, [selectedText]);


    useEffect(() => {
      if (selectedFolder && selectedFolder != 'about me') {
        setSubMenuVisibility(true);
      }
    }, [selectedFolder]);

  return (
    <Router>
      <Title/>
      <Path 
        selectedFolder={selectedFolder} 
        selectedText={selectedText} 
        setSelectedFolder={setSelectedFolder} 
        setSelectedText={setSelectedText}
        textsMeta={ariclesMeta}
      />
      <div className={style.mainPageContainer}>
        <div className={style.navigationMenu}>
          <Menu folderNames={folderNames} selectedFolder={selectedFolder} onMenuItemClick={handleMenuItemClick}/>
          {subMenuVisibility && 
            <SubMenu 
            Text={ariclesMeta} 
            selectedFolder={selectedFolder} 
            setContentVisibility={setContentVisibility} 
            setSelectedText={setSelectedText}
            setSelectedFolder={setSelectedFolder}
            />
          }
        </div>
        {contentVisibility && <Content selectedText={selectedText}/>}
        {selectedFolder === 'about me' && <AboutMe />}
      </div>
    </Router>
  );
};