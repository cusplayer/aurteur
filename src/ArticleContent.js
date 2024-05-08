import React, { useState, useEffect } from 'react';
import './Menu.css';
import axios from 'axios';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'

const moment = require('moment');

const ArticleContent = ({ fileName }) => {
  const [metadata, setMetadata] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    axios.get(`api/articles/${fileName}`)
      .then(response => {
        setMetadata(response.data.metadata);
        setContent(response.data.content);
      })
      .catch(error => {
        console.error('Error fetching article content:', error);
      });
  }, [fileName]);

  return (
    <div className="article-box">
      <h1>{fileName.split('.').slice(0, -1).join('.')}</h1>
      <Markdown>---</Markdown>
      {metadata && (
        <div className="article-metadata">
          <h1>{metadata.title}</h1>
          <p>Folder: {metadata.folder}</p>
          <p>Tags: {metadata.tags.map(tag => `#${tag}`).join(' ')}</p>
          <p>Date: {moment(metadata.date).format('DD/MM/YYYY')}</p>
        </div>
      )}
      <div className="article-content">
        <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
      </div>
    </div>
  );
};

export default ArticleContent;
