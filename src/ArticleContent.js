import React, { useState, useEffect } from 'react';
import './Menu.css';
import axios from 'axios';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'

const ArticleContent = ({ fileName }) => {
  const [articleContent, setArticleContent] = useState('');

  useEffect(() => {
    axios.get(`/api/articles/${fileName}`)
      .then(response => {
        // Разбиваем строку на абзацы и объединяем их в одну строку
        const content = response.data.split('\n').join('\n\n');
        setArticleContent(content);
      })
      .catch(error => {
        console.error('Error fetching article content:', error);
      });
  }, [fileName]);

  return (
    <div className="article-box">
      <div className="article-content">
        <h1>{fileName.split('.').slice(0, -1).join('.')}</h1>
        <Markdown rehypePlugins={[rehypeRaw]}>{articleContent}</Markdown>
      </div>
    </div>
  );
};

export default ArticleContent;
