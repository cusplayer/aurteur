import React, { useState, useEffect } from 'react';
import './Menu.css';
import axios from 'axios';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const moment = require('moment');

const ArticleModal = ({ fileName }) => {
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
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="article-box">
          <div className="article-content">
            <h1>{fileName.split('.').slice(0, -1).join('.')}</h1>
              {metadata && (
                <div className="article-metadata">
                  <h1>{metadata.title}</h1>
                  <p>Folder: {metadata.folder}</p>
                  <p>Tags: {metadata.tags.map(tag => `#${tag}`).join(' ')}</p>
                  <p>Date: {moment(metadata.date).format('DD/MM/YYYY')}</p>
                </div>
              )}
            <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
          </div>
        </div>
        <button className="close-modal-button" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default ArticleModal;
