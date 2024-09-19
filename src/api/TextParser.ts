import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Text, TextMeta } from '../types/types';

const TextS_DIR = path.join(__dirname, '../../public/Texts');

export const getAllTexts = (): Text[] => {
  const files = fs.readdirSync(TextS_DIR).filter((file) => file.endsWith('.md'));

  const Texts: Text[] = files.map((fileName) => {
    const filePath = path.join(TextS_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContents);

    const title = data.title || fileName;
    const folder = data.folder || 'feed';
    const tags = data.tags ? data.tags.map((tag: string) => tag.trim()) : [];
    const date = data.date || '';

    const TextMeta: TextMeta = {
      title,
      folder,
      tags,
      date
    };

    return {
      ...TextMeta,
      content,
    };
  });

  return Texts;
};
