import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article, ArticleMeta } from '../types/types';

const ARTICLES_DIR = path.join(__dirname, '../../public/articles');

export const getAllArticles = (): Article[] => {
  const files = fs.readdirSync(ARTICLES_DIR).filter((file) => file.endsWith('.md'));

  const articles: Article[] = files.map((fileName) => {
    const filePath = path.join(ARTICLES_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContents);

    const title = data.title || fileName.replace('.md', '');
    const folder = data.folder || 'feed';
    const tags = data.tags ? data.tags.map((tag: string) => tag.trim()) : [];
    const date = data.date || '';

    const articleMeta: ArticleMeta = {
      title,
      folder,
      tags,
      date
    };

    return {
      ...articleMeta,
      content,
    };
  });

  return articles;
};
