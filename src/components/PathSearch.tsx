import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TextMeta } from '../types/types';
import * as style from '../styles/path.module.css';

interface PathSearchProps {
  textsMeta: TextMeta[];
  pathPrefix: string;
  currentPath: string;
  onResultSelect: (text: TextMeta) => void;
  onCancel: () => void;
}

export const PathSearch: React.FC<PathSearchProps> = ({
  textsMeta,
  pathPrefix,
  currentPath,
  onResultSelect,
  onCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TextMeta[]>([]);
  const [caretPosition, setCaretPosition] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);
  const pathPrefixRef = useRef<HTMLSpanElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const caretPos = inputRef.current.selectionStart || 0;
      setCaretPosition(caretPos);
      updateTextWidth(caretPos);
    }
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

  useEffect(() => {
    if (searchContainerRef.current && pathPrefixRef.current) {
      const containerRect = searchContainerRef.current.getBoundingClientRect();
      const prefixWidth = pathPrefixRef.current.offsetWidth;
      setDropdownPosition({
        top: containerRect.bottom,
        left: containerRect.left + prefixWidth,
      });
    }
  }, [searchQuery]);

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

      const measuredTextWidth = textMeasureRef.current.offsetWidth;
      const prefixWidth = pathPrefixRef.current.offsetWidth;

      searchContainerRef.current?.style.setProperty('--prefix-width', `${prefixWidth}px`);
      setTextWidth(measuredTextWidth + prefixWidth);
    }
  };

  const dropdown = (
    <ul
      className={style.searchResults}
      style={{
        position: 'absolute',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 9999,
      }}
    >
      {searchResults.map((result, index) => (
        <li
          key={result.title}
          onClick={() => handleResultClick(result)}
          onMouseEnter={() => {
            setSelectedResultIndex(index);
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          className={`${style.searchResultItem} ${index === selectedResultIndex ? style.active : ''}`}
        >
          {result.title}
        </li>
      ))}
    </ul>
  );

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
      {searchResults.length > 0 &&
        document.getElementById('portal-root') &&
        ReactDOM.createPortal(dropdown, document.getElementById('portal-root') as HTMLElement)}
    </div>
  );
};
