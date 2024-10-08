import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FolderName, TextMeta } from '../types/types';
import * as style from '../styles/path.module.css';
import { getTextsMeta, getText } from '../api/apiService';

interface PathProps {
  selectedFolder: FolderName | null;
  selectedText: TextMeta['title'] | null;
  setSelectedFolder: (folder: FolderName | null) => void;
  setSelectedText: (title: TextMeta['title'] | null) => void;
}

export const Path: React.FC<PathProps> = ({ selectedFolder, selectedText, setSelectedFolder, setSelectedText }) => {
  const [pathFolder, setPathFolder] = useState<FolderName | null>(null);
  const [pathText, setPathText] = useState<TextMeta['title'] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TextMeta[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const PATH_PREFIX = 'aurteur/';
  const [caretPosition, setCaretPosition] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const textMeasureRef = useRef<HTMLSpanElement>(null);
  const pathPrefixRef = useRef<HTMLSpanElement>(null);
  const pathFull = useMemo(() => `${(pathFolder != null ? pathFolder + '/' : '')}${(pathText != null ? pathText : '')}`, [pathFolder, pathText])

  useEffect(() => {
    setPathFolder(selectedFolder);
    setPathText(selectedText);
  }, [selectedFolder, selectedText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        pathContainerRef.current &&
        !pathContainerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handlePathClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      const caretPos = inputRef.current?.selectionStart || 0;
      setCaretPosition(caretPos);
      updateTextWidth(caretPos);
    }, 0);
  };
  

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const query = input.value;
    setSearchQuery(query);
    const caretPos = input.selectionStart || 0;
    setCaretPosition(caretPos);
  
    updateTextWidth(caretPos);
  
    if (query.length > 0) {
      const textsMeta = await getTextsMeta();
      setSearchResults(
        textsMeta.filter((text) =>
          text.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setSearchResults([]);
    }
  };

  const updateTextWidth = (caretPos: number) => {
    if (textMeasureRef.current && pathPrefixRef.current) {
      const textBeforeCaret = searchQuery.substring(0, caretPos);
      textMeasureRef.current.textContent = textBeforeCaret;
  
      const textWidth = textMeasureRef.current.offsetWidth;
      const prefixWidth = pathPrefixRef.current.offsetWidth;
  
      setTextWidth(textWidth + prefixWidth);
    }
  };

  const handleCaretPositionChange = (
    event: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const input = event.currentTarget;
    const caretPos = input.selectionStart || 0;
    setCaretPosition(caretPos);
    updateTextWidth(caretPos);
  };
  
  
  

  const handleResultClick = async (title: string) => {
    const text = await getText(title);
    if (text) {
      setPathFolder(text.folder);
      setPathText(text.title);
      setSelectedFolder(text.folder);
      setSelectedText(text.title);
      setIsEditing(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0].title);
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div
  ref={pathContainerRef}
  className={style.pathContainer}
  onClick={!isEditing ? handlePathClick : undefined}
>
  {isEditing ? (
    <div
      className={style.searchContainer}
      style={{ '--cursor-position': `${textWidth}px` } as React.CSSProperties}
    >
      <span ref={pathPrefixRef} className={style.pathPrefix}>
        {PATH_PREFIX}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCaretPositionChange}
        onClick={handleCaretPositionChange}
        className={style.searchInput}
        placeholder={pathFull || ''}
      />
      <span ref={textMeasureRef} className={style.textMeasure}>
        {searchQuery.substring(0, caretPosition)}
      </span>
      {searchResults.length > 0 && (
        <ul className={style.searchResults}>
          {searchResults.map((result) => (
            <li
              key={result.title}
              onClick={() => handleResultClick(result.title)}
              className={style.searchResultItem}
            >
              {result.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : (
    <div className={style.pathDisplay}>{`${PATH_PREFIX}${pathFull}`}</div>
  )}
</div>

  );
}  