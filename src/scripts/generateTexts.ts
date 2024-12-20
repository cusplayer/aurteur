import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Text, TextMeta } from '../types/types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEXTS_DIR = path.join(__dirname, '../../public/texts');
const OUTPUT_FILE = path.join(TEXTS_DIR, 'texts.json');

const getAllTexts = (): Text[] => {
  const files = fs.readdirSync(TEXTS_DIR).filter((file: string) => file.endsWith('.md'));

  const texts: Text[] = files.map((fileName: string) => {
    const filePath = path.join(TEXTS_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContents);

    const title = (data.title || fileName).split('.').slice(0, -1).join('.');
    const titleExt = '.' + (data.title || fileName).split('.').pop();
    const folder = data.folder || 'all';
    const tags = Array.isArray(data.tags) ? data.tags.map((tag: string) => tag.trim()) : [];
    const date = data.date || '';

    const textMeta: TextMeta = {
      title,
      titleExt,
      folder,
      date,
      tags,
    };

    return {
      ...textMeta,
      content,
    };
  });

  return texts;
};

const generateTextsJson = () => {
  const texts = getAllTexts();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ texts }, null, 2));
  console.log('texts.json successfully generated.');
};

generateTextsJson();