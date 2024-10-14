import React, { useState, useEffect, useMemo } from 'react';
import { FolderName, TextMeta } from '../types/types';
import * as style from '../styles/path.module.css';
import { PathSearch } from 'components';

interface PathProps {
  selectedFolder: FolderName | null;
  selectedText: TextMeta['title'] | null;
  textsMeta: TextMeta[];
  setSelectedFolder: (folder: FolderName | null) => void;
  setSelectedText: (title: TextMeta['title'] | null) => void;
  onSetPathFolder: (setPathText: React.Dispatch<React.SetStateAction<TextMeta['folder'] | null>>) => void;
  setContentVisibility: (visible: boolean) => void;
  setSubMenuVisibility: (visible: boolean) => void;
}

const PATH_PREFIX = 'aurteur/';

export const Path: React.FC<PathProps> = ({
  selectedFolder,
  selectedText,
  textsMeta,
  setSelectedFolder,
  setSelectedText,
  onSetPathFolder,
  setContentVisibility,
  setSubMenuVisibility,
}) => {
  const [pathFolder, setPathFolder] = useState<TextMeta['folder'] | null>(selectedFolder);
  const [pathText, setPathText] = useState<TextMeta['title'] | null>(selectedText);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (onSetPathFolder) {
      onSetPathFolder(setPathFolder);
    }
  }, [onSetPathFolder, setPathFolder]);

  useEffect(() => {
    setPathFolder(selectedFolder);
  }, [selectedFolder]);

  useEffect(() => {
    setPathText(selectedText);
  }, [selectedText]);

  const pathFull = useMemo(
    () => `${pathFolder ? `${pathFolder}/` : ''}${pathText || ''}`,
    [pathFolder, pathText]
  );

  const handlePathClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleResultSelect = (text: TextMeta) => {
    setContentVisibility(true);
    setSubMenuVisibility(true);
    setPathFolder(text.folder);
    setPathText(text.title);
    setSelectedFolder(text.folder);
    setSelectedText(text.title);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div
      className={style.pathContainer}
      onClick={!isEditing ? handlePathClick : undefined}
    >
      {isEditing ? (
        <PathSearch
          textsMeta={textsMeta}
          onResultSelect={handleResultSelect}
          onCancel={handleCancel}
          pathPrefix={PATH_PREFIX}
          currentPath={pathFull}
        />
      ) : (
        <div className={style.pathDisplay}>{`${PATH_PREFIX}${pathFull}`}</div>
      )}
    </div>
  );
};
