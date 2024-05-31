import React, { useState, useEffect } from 'react';
import './Menu.css';
import axios from 'axios';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import moment from 'moment';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ArticleContent = ({ fileName }) => {
  const [metadata, setMetadata] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/articles/${fileName}`)
      .then(response => {
        setTimeout(() => {
          setMetadata(response.data.metadata);
          setContent(response.data.content);
          setLoading(false);
        }, 500);
      })
      .catch(error => {
        console.error('Error fetching article content:', error);
        setLoading(false);
      });
  }, [fileName]);

  return (
    <div className="article-box">
      <h1>{fileName.split('.').slice(0, -1).join('.')}</h1>
      <hr />
      <SkeletonTheme baseColor="#F8F8FF" highlightColor="#000" width = "256px" borderRadius="2px">
        {loading ? (
          <div className="article-metadata">
            <div className="article-metadata-skeleton"><Skeleton width={224} height={18.66} /></div>
            <div className="article-metadata-skeleton"><Skeleton width={336} height={18.67} /></div>
            <div className="article-metadata-skeleton"><Skeleton width={152} height={18.67} /></div>
          </div>
        ) : (
          metadata && (
            <div className="article-metadata">
              <h1>{metadata.title}</h1>
              <p>Folder: {metadata.folder}</p>
              <p>Tags: {metadata.tags.map(tag => `#${tag}`).join(' ')}</p>
              <p>Date: {moment(metadata.date).format('DD/MM/YYYY')}</p>
            </div>
          )
        )}
      </SkeletonTheme>
      <hr />
      <SkeletonTheme baseColor="#F8F8FF" highlightColor="#000" borderRadius="2px">
        <div className="article-content">
          {loading ? (
            <div className="article-content-skeleton"><Skeleton height={336} /></div>
          ) : (
            <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
          )}
        </div>
      </SkeletonTheme>
    </div>
  );
};

export default ArticleContent;
