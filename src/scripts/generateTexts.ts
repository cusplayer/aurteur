import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import chokidar from 'chokidar';
import { Text, TextMeta } from '../types/types';

const TEXTS_DIR = path.join(__dirname, '../../public/texts');
const OUTPUT_FILE = path.join(TEXTS_DIR, 'texts.json');

const getAllTexts = (): Text[] => {
  const files = fs.readdirSync(TEXTS_DIR).filter((file: string) => file.endsWith('.md'));

  const texts: Text[] = files.map((fileName: string) => {
    const filePath = path.join(TEXTS_DIR, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContents);

    const title = data.title || fileName;
    const folder = data.folder || 'all';
    const tags = Array.isArray(data.tags) ? data.tags.map((tag: string) => tag.trim()) : [];
    const date = data.date || '';

    const textMeta: TextMeta = {
      title,
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

const watcher = chokidar.watch(`${TEXTS_DIR}/*.md`);

watcher.on('change', (filePath) => {
  console.log(`File ${filePath} has been changed`);
  generateTextsJson();
});

watcher.on('add', (filePath) => {
  console.log(`File ${filePath} has been added`);
  generateTextsJson();
});

watcher.on('unlink', (filePath) => {
  console.log(`File ${filePath} has been removed`);
  generateTextsJson();
});
