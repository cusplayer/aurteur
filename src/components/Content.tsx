import React, { useState, useEffect } from 'react';
import { getArticle } from '../apiService';
import {Article, ArticleMeta} from '../types/types';

interface ContentProps {
  selectedArticle: ArticleMeta['title'] | null;
}

export const Content: React.FC<ContentProps> = ({selectedArticle}) => {
  const [aricle, setAricle] = useState<Article | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAricle = async () => {
      if (selectedArticle != null){
          try {
          const data = await getArticle(selectedArticle, { signal: controller.signal });
          if (data) {
            setAricle(data); // Если статья найдена, сохраняем её
          } else {
            // setError(`Article with title "${articleName}" not found`);
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            // setError('Error fetching the article');
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
  }, [selectedArticle]);

  return (
    <div className="article-box">    
      <p>
        {(aricle != null ? JSON.stringify(aricle)  : '')}
      </p>
    </div>
  );
};