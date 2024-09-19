import React, { useState, useEffect } from 'react';
import { getText } from '../apiService';
import {Text, TextMeta} from '../types/types';
import Markdown from 'react-markdown';

interface ContentProps {
  selectedText: TextMeta['title'] | null;
}

export const Content: React.FC<ContentProps> = ({selectedText}) => {
  const [text, setText] = useState<Text | null>(null);
  const [thisTextDate, setThisTextDate] = useState<string>('f');

  useEffect(() => {
    const controller = new AbortController();
    const fetchText = async () => {
      if (selectedText != null){
          try {
          const data = await getText(selectedText, { signal: controller.signal });
          if (data) {
            setText(data);
            const formattedDate = new Date(data.date).toLocaleDateString(undefined);
            setThisTextDate(formattedDate);
            console.log(thisTextDate);
          } else {
            // setError(`Text with title "${TextName}" not found`);
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            // setError('Error fetching the Text');
          }
        } finally {
          // setLoading(false);
        }
      }
    };

    fetchText();

    return () => {
      controller.abort();
    };
  }, [selectedText]);

  if (text === null) {
    return;
  }

  return (
    <div className="text-box">
      <h2 className="text-title"> {text.title.replace('.md', '')} </h2>
      <div className='text-meta'>
        Folder: {text.folder} | Date: {thisTextDate} | Tags: {text.tags && text.tags.map(tag => `#${tag}`).join(', ')}
      </div>
      <div className='text-itself'>
        <Markdown>
          {text.content}
        </Markdown>
      </div>
    </div>
  );
};