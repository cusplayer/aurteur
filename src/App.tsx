import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import * as style from './styles/app.module.css';
import { Title, Menu, Path, SubMenu, Content, AboutMe, FolderIcons } from 'components';
import { getTextsMeta } from './api/apiService';
import { FolderName, TextMeta } from './types/types';

const folderNames: FolderName[] = ['all', 'designs', 'ouvres', 'about me'];

export const App: React.FC = () => {
  const setPathFolderRef = useRef<React.Dispatch<React.SetStateAction<TextMeta['folder'] | null>> | null>(null);
  const handleSetPathFolder = (setPathFolder: React.Dispatch<React.SetStateAction<TextMeta['folder'] | null>>) => {
    setPathFolderRef.current = setPathFolder;
  };
  const [ariclesMeta, setAriclesMeta] = useState<TextMeta[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<TextMeta['title'] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuItemClick = (folder: FolderName) => {
    if (folder === selectedFolder) {
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folder);
    }
    setSelectedText(null);
    setContentVisibility(false);
    setSubMenuVisibility(folder !== 'about me');
    if (folder === 'about me') {
      navigate('/aboutme');
    } else {
      navigate('/');
    }
  };

  const handleSubMenuItemClick = (Text: TextMeta['title'], folder: FolderName | null) => {
    if (setPathFolderRef.current) {
      setPathFolderRef.current(folder);
    }
    if (selectedFolder === null) {
      setSubMenuVisibility(true);
      setSelectedFolder(folder)
    }
    setSelectedText(Text);
    setContentVisibility(true);
    navigate(`/${encodeURIComponent(Text)}`);
    // navigate(`/${encodeURIComponent(Text.slice(0, -3))}`);
  };

  
  useEffect(() => {
    const controller = new AbortController();
    const fetchAriclesMeta = async () => {
      try {
        const data = await getTextsMeta();
        setAriclesMeta(data);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Ошибка при загрузке:', error);
        }
      }
    };

    fetchAriclesMeta();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const pathSegment = decodeURIComponent(path.substring(1));
    console.log(pathSegment);
    if (pathSegment === 'aboutme') {
      setSelectedFolder('about me');
      setContentVisibility(false);
      setSubMenuVisibility(false);
    } else {
      console.log(ariclesMeta)
      const matchingArticle = ariclesMeta.find((text) => text.title.toLowerCase() === pathSegment.toLowerCase());
      console.log(matchingArticle);
      const folder = matchingArticle ? matchingArticle.folder : null;
      console.log(folder);
      handleSubMenuItemClick(pathSegment, folder);
    }
  }, [location.pathname]);

  return (
    <div className={style.allContainer}>
      <div className={style.topContainer}>
        <Title />
      </div>
      <Path
        selectedFolder={selectedFolder}
        selectedText={selectedText}
        textsMeta={ariclesMeta}
        setSelectedFolder={setSelectedFolder}
        setSelectedText={setSelectedText}
        onSetPathFolder={handleSetPathFolder}
        setSubMenuVisibility={setSubMenuVisibility}
        setContentVisibility={setContentVisibility}
      />
      <div className={style.terminal}>
        <FolderIcons folderNames={folderNames} selectedFolder={selectedFolder} />
      </div>

      <div className={style.mainPageContainer}>
        <div className={style.navigationMenu}>
          <Menu folderNames={folderNames} selectedFolder={selectedFolder} onMenuItemClick={handleMenuItemClick} />
          {subMenuVisibility && (
            <SubMenu
              Text={ariclesMeta}
              selectedFolder={selectedFolder}
              selectedText={selectedText}
              setContentVisibility={setContentVisibility}
              setSelectedText={setSelectedText}
              setSelectedFolder={setSelectedFolder}
              handleSubMenuItemClick={handleSubMenuItemClick}
            />
          )}
        </div>
        <div className={style.contentContainer}>
          {contentVisibility && <Content selectedText={selectedText} />}
          {selectedFolder === 'about me' && <AboutMe />}
        </div>
      </div>
    </div>
  );
};
