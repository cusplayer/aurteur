import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import * as style from './styles/app.module.css';
import { Title, Menu, Path, SubMenu, Content, AboutMe, FolderIcons } from 'components';
import { PathStateProvider } from './components/PathStateProvider';
import { getTextsMeta } from './api/apiService';
import { FolderName, TextMeta } from './types/types';
import { PathRef } from './components/Path';

const folderNames: FolderName[] = ['all', 'designs', 'ouvres', 'about me'];

export const App: React.FC = () => {
  const pathRef = useRef<PathRef>(null);
  const [ariclesMeta, setAriclesMeta] = useState<TextMeta[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<TextMeta['title'] | null>(null);

  const handleMenuItemClick = (folder: FolderName) => {
    if (folder === selectedFolder) {
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folder);
    }
    setSelectedText(null);
    setContentVisibility(false);
    setSubMenuVisibility(folder !== 'about me');
  };

  const handleSubMenuItemClick = (Text: TextMeta['title'], folder: FolderName | null) => {
    if (pathRef.current) {
      pathRef.current.setPathFolder(folder);
    }
    setSelectedText(Text);
    setContentVisibility(true);
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
        }
      }
    };

    fetchAriclesMeta();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Router>
      <PathStateProvider>
        <div className={style.allContainer}>
          <div className={style.topContainer}>
            <Title />
          </div>
          <Path
            ref={pathRef}
            selectedFolder={selectedFolder}
            selectedText={selectedText}
            setSelectedFolder={setSelectedFolder}
            setSelectedText={setSelectedText}
            textsMeta={ariclesMeta}
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
                  setContentVisibility={setContentVisibility}
                  setSelectedText={setSelectedText}
                  setSelectedFolder={setSelectedFolder}
                  handleSubMenuItemClick={handleSubMenuItemClick}
                />
              )}
            </div>
            {contentVisibility && <Content selectedText={selectedText} />}
            {selectedFolder === 'about me' && <AboutMe />}
          </div>
        </div>
      </PathStateProvider>
    </Router>
  );
};
