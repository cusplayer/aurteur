import React, { useState, useEffect, useRef } from 'react';
import { TextMeta } from '../types/types';
import * as style from '../styles/path.module.css';

interface PathSearchProps {
  initialQuery: string;
  textsMeta: TextMeta[];
  onResultSelect: (text: TextMeta) => void;
  onCancel: () => void;
  pathPrefix: string;
  currentPath: string;
}

export const PathSearch: React.FC<PathSearchProps> = ({
  initialQuery,
  textsMeta,
  onResultSelect,
  onCancel,
  pathPrefix,
  currentPath,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<TextMeta[]>([]);
  const [caretPosition, setCaretPosition] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);
  const pathPrefixRef = useRef<HTMLSpanElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const caretPos = inputRef.current?.selectionStart || 0;
    setCaretPosition(caretPos);
    updateTextWidth(caretPos);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = textsMeta.filter((text) =>
        text.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setSelectedResultIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, textsMeta]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const query = input.value;
    setSearchQuery(query);
    const caretPos = input.selectionStart || 0;
    setCaretPosition(caretPos);
    updateTextWidth(caretPos);
  };

  const handleCaretPositionChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const caretPos = input.selectionStart || 0;
    setCaretPosition(caretPos);
    updateTextWidth(caretPos);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
      onResultSelect(searchResults[selectedResultIndex]);
    } else if (event.key === 'Escape') {
      onCancel();
    } else if (event.key === 'ArrowDown' && !isHovered) {
      setSelectedResultIndex((prevIndex) =>
        prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === 'ArrowUp' && !isHovered) {
      setSelectedResultIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1
      );
    }
  };

  const handleResultClick = (text: TextMeta) => {
    onResultSelect(text);
  };

  const updateTextWidth = (caretPos: number) => {
    if (textMeasureRef.current && pathPrefixRef.current) {
      const textBeforeCaret = searchQuery.substring(0, caretPos);
      textMeasureRef.current.textContent = textBeforeCaret;
      const textWidth = textMeasureRef.current.offsetWidth;
      const prefixWidth = pathPrefixRef.current.offsetWidth;
      searchContainerRef.current?.style.setProperty('--prefix-width', `${prefixWidth}px`);
      setTextWidth(textWidth + prefixWidth);
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className={style.searchContainer}
      style={{ '--cursor-position': `${textWidth}px` } as React.CSSProperties}
    >
      <span ref={pathPrefixRef} className={style.pathPrefix}>
        {pathPrefix}
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
        placeholder={currentPath}
      />
      <span ref={textMeasureRef} className={style.textMeasure}>
        {searchQuery.substring(0, caretPosition)}
      </span>
      {searchResults.length > 0 && (
        <ul className={style.searchResults}>
          {searchResults.map((result, index) => (
            <li
              key={result.title}
              onClick={() => handleResultClick(result)}
              onMouseEnter={() => {
                setSelectedResultIndex(index);
                setIsHovered(true);
              }}
              onMouseLeave={() => setIsHovered(false)}
              className={`${style.searchResultItem} ${
                index === selectedResultIndex ? style.active : ''
              }`}
            >
              {result.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
