import React from 'react';
import { Text } from '../types/types';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; 
import remarkGfm from 'remark-gfm';
import * as style from '../styles/content.module.css';

interface ContentProps {
  textData: Text | null;
}

export const Content: React.FC<ContentProps> = ({ textData }) => {
  if (!textData) {
    return null;
  }

  const formattedDate = new Date(textData.date).toLocaleDateString(undefined);

  return (
    <div className={style.text_box}>
      <h2 className="text-title"> {textData.title.replace('.md', '')} </h2>
      <div className='text-meta'>
        Folder: {textData.folder} | Date: {formattedDate} | Tags: {textData.tags && textData.tags.map(tag => `#${tag}`).join(', ')}
      </div>
      <div className='text-itself'>
        <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
          {textData.content}
        </Markdown>
      </div>
    </div>
  );
};
