import { Router } from 'express';
import { getAllArticles } from 'api';
import fs from 'fs';
import path from 'path';
import { Article } from '../types/types';

// const router = Router();
const articlesJsonPath = path.join(__dirname, '../../public/articles/articles.json');

export const allRouter = Router().get('/generate', (req, res) => {
  const articles = getAllArticles();
  const filePath = path.join(__dirname, '../../public/articles/articles.json');
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
  res.json({ message: 'articles.json успешно создан' });
});

export const oneRouter = Router().get('/', (req, res) => {
  if (!fs.existsSync(articlesJsonPath)) {
    return res.status(404).json({ error: 'Файл articles.json не найден. Сгенерируйте его с помощью /generate' });
  }

  const rawData = fs.readFileSync(articlesJsonPath, 'utf-8');
  const articles: Article[] = JSON.parse(rawData);
  res.json(articles);
});

// export default router;
