import { Router } from 'express';
import { getAllTexts } from 'api';
import fs from 'fs';
import path from 'path';
import { Text } from '../types/types';

const TextsJsonPath = path.join(__dirname, '../../public/texts/Texts.json');

export const allRouter = Router().get('/generate', (req, res) => {
  const Texts = getAllTexts();
  const filePath = path.join(__dirname, '../../public/texts/Texts.json');
  fs.writeFileSync(filePath, JSON.stringify(Texts, null, 2));
  res.json({ message: 'Texts.json успешно создан' });
});

export const oneRouter = Router().get('/', (req, res) => {
  if (!fs.existsSync(TextsJsonPath)) {
    return res.status(404).json({ error: 'Файл Texts.json не найден. Сгенерируйте его с помощью /generate' });
  }

  const rawData = fs.readFileSync(TextsJsonPath, 'utf-8');
  const Texts: Text[] = JSON.parse(rawData);
  res.json(Texts);
});

