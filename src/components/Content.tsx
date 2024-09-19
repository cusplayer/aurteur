import React, { useState, useEffect } from 'react';
import { getText } from '../apiService';
import {Text, TextMeta} from '../types/types';

interface ContentProps {
  selectedText: TextMeta['title'] | null;
}

export const Content: React.FC<ContentProps> = ({selectedText}) => {
  const [aricle, setAricle] = useState<Text | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAricle = async () => {
      if (selectedText != null){
          try {
          const data = await getText(selectedText, { signal: controller.signal });
          if (data) {
            setAricle(data); // Если статья найдена, сохраняем её
          } else {
            // setError(`Text with title "${TextName}" not found`);
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            // setError('Error fetching the Text');
          }
        } finally {
          // setLoading(false); // Заканчиваем загрузку
        }
      }
    };

    fetchAricle();

    return () => {
      controller.abort();
    };
  }, [selectedText]);

  return (
    <div className="Text-box">    
      <p>
        {(aricle != null ? JSON.stringify(aricle)  : '')}
      </p>
    </div>
  );
};