import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as style from './styles/app.module.css';
import { Title, Menu, Path, SubMenu, Content, AboutMe, FolderIcons, Modal } from 'components';
import { getTextsData } from './api/apiService';
import { useWindowSize } from './hooks/useWindowSize';
import { FolderName, Text, TextMeta } from './types/types';

const folderNames: FolderName[] = ['all', 'designs', 'ouvres', 'about me'];

export const App: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 767;
  const setPathFolderRef = useRef<React.Dispatch<React.SetStateAction<TextMeta['folder'] | null>> | null>(null);
  const handleSetPathFolder = (setPathFolder: React.Dispatch<React.SetStateAction<TextMeta['folder'] | null>>) => {
    setPathFolderRef.current = setPathFolder;
  };

  const [textsData, setTextsData] = useState<Text[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<Text | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<FolderName | null>(null);

  const [navigationSource, setNavigationSource] = useState<'menu' | 'submenu' | 'initial' | 'modalClose' | null>(null);

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
    setNavigationSource('menu');

    if (folder === 'about me') {
      navigate('/about');
    } else {
      navigate('/');
    }
  };

  const handleSubMenuItemClick = (textTitle: Text['title'], folder: FolderName | null) => {
    if (setPathFolderRef.current) {
      setPathFolderRef.current(folder);
    }

    if (selectedFolder !== 'all') {
      if (selectedFolder === null) {
        setSubMenuVisibility(true);
        setSelectedFolder(folder);
      } else if (selectedFolder !== folder) {
        setSelectedFolder(folder);
      }
    }

    const textData = textsData.find((text) => text.title === textTitle) || null;
    setSelectedText(textData);
    setContentVisibility(true);

    const currentPath = decodeURIComponent(location.pathname.substring(1));
    if (currentPath.toLowerCase() !== textTitle.toLowerCase()) {
      setNavigationSource('submenu');
      navigate(`/${encodeURIComponent(textTitle)}`);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadTextsData = async () => {
      try {
        const data = await getTextsData();
        setTextsData(data);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error loading data:', error);
        }
      }
    };

    if (textsData.length === 0) {
      loadTextsData();
    }

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (textsData.length > 0) {
      const path = location.pathname;
      const pathSegment = decodeURIComponent(path.substring(1));

      if (pathSegment.length === 0) {
        if (navigationSource === 'menu') {
          setSelectedText(null);
          setContentVisibility(false);
          setSubMenuVisibility(selectedFolder !== 'about me' && selectedFolder !== null);
        } else if (navigationSource === 'modalClose') {
          setSelectedText(null);
          setContentVisibility(false);
          setSubMenuVisibility(selectedFolder !== 'about me' && selectedFolder !== null);
        } else {
          setSelectedFolder(null);
          setSelectedText(null);
          setContentVisibility(false);
          setSubMenuVisibility(false);
        }
      } else if (pathSegment === 'about') {
        setSelectedFolder('about me');
        setContentVisibility(false);
        setSubMenuVisibility(false);
      } else {
        const matchingText = textsData.find((text) => text.title.toLowerCase() === pathSegment.toLowerCase());
        if (matchingText) {
          if (setPathFolderRef.current) {
            setPathFolderRef.current(matchingText.folder);
          }

          if (selectedFolder !== 'all') {
            if (selectedFolder === null || selectedFolder !== matchingText.folder) {
              setSubMenuVisibility(true);
              setSelectedFolder(matchingText.folder);
            }
          }

          setSelectedText(matchingText);
          setContentVisibility(true);
        } else {
          console.warn(`Text not found for pathSegment: ${pathSegment}`);
        }
      }
      setNavigationSource(null);
    }
  }, [textsData, location.pathname]);

  const textsMeta: TextMeta[] = textsData.map(({ content, ...meta }) => meta);

  return (
    <div className={style.allContainer}>
      <div className={style.topContainer}>
        <Title />
      </div>
      {!isMobile && (
        <>
          {/* <div className={style.pathSpacer}></div> */}
          <Path
              selectedFolder={selectedFolder}
              selectedText={selectedText?.title || null}
              textsMeta={textsMeta}
              setSelectedFolder={setSelectedFolder}
              setSelectedText={(title) => {
                const text = textsData.find((t) => t.title === title) || null;
                setSelectedText(text);
              }}
              onSetPathFolder={handleSetPathFolder}
              setSubMenuVisibility={setSubMenuVisibility}
              setContentVisibility={setContentVisibility}
            />
          <div className={style.terminal}>
            <FolderIcons
              folderNames={folderNames}
              selectedFolder={selectedFolder}
              setHoveredFolder={setHoveredFolder}
              hoveredFolder={hoveredFolder}
              onFolderIconClick={handleMenuItemClick}
            />
          </div>
        </>
      )}
      <div className={style.mainPageContainer}>
        <div className={style.navigationMenu}>
          <Menu
            folderNames={folderNames}
            selectedFolder={selectedFolder}
            onMenuItemClick={handleMenuItemClick}
            setHoveredFolder={setHoveredFolder}
          />
          {subMenuVisibility && (
            <SubMenu
              Text={textsMeta}
              selectedFolder={selectedFolder}
              selectedText={selectedText?.title || null}
              setContentVisibility={setContentVisibility}
              setSelectedText={(title) => {
                const text = textsData.find((t) => t.title === title) || null;
                setSelectedText(text);
              }}
              setSelectedFolder={setSelectedFolder}
              handleSubMenuItemClick={handleSubMenuItemClick}
            />
          )}
        </div>
        {isMobile ? (
          <>
            <Modal
              isVisible={contentVisibility && selectedText !== null}
              onClose={() => {
                setContentVisibility(false); 
                setSelectedText(null); 
                navigate('/');
                setNavigationSource('modalClose');}}
            >
              {selectedText && <Content textData={selectedText} />}
            </Modal>
            <div className={style.contentContainer}>
              {selectedFolder === 'about me' && <AboutMe />}
            </div>
          </>
        ) : (
          <div className={style.contentContainer}>
            {contentVisibility && selectedText && <Content textData={selectedText} />}
            {selectedFolder === 'about me' && <AboutMe />}
          </div>
        )}
      </div>
    </div>
  );
};
