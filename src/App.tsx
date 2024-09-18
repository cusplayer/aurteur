import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Title, Menu, Path, Submenu } from 'components';
import { FolderName } from './types/types';

const folderNames: FolderName[] = ['feed', 'designs', 'ouvres', 'contacts'];

export const App: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<FolderName | null>(null);
  const [subMenuVisibility, setSubMenuVisibility] = useState<boolean>(false);
  const handleMenuItemClick = (folder: FolderName) => {
    setSelectedFolder(folder);
    setSubMenuVisibility(true);
  };

  return (
    <Router>
      <Title/>
      <Path selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}/>
      <Menu folderNames={folderNames} selectedFolder={selectedFolder} onMenuItemClick={handleMenuItemClick}/>
      {subMenuVisibility && <Submenu selectedFolder={selectedFolder}/>}
    </Router>
  );
};