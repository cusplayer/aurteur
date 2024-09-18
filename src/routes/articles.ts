import { Router } from 'express';
import { getAllArticles } from '../utils/articleParser';
import fs from 'fs';
import path from 'path';
import { Article } from '../types/types';

const router = Router();

router.get('/generate', (req, res) => {
  const articles = getAllArticles().map(({ content, ...meta }) => meta);
  const filePath = path.join(__dirname, '../../articles.json');
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
  res.json({ message: 'articles.json успешно создан' });
});

router.get('/', (req, res) => {
  const articles = getAllArticles().map(({ content, ...meta }) => meta);
  res.json(articles);
});

router.get('/full', (req, res) => {
  const articles = getAllArticles();
  res.json(articles);
});

export default router;
