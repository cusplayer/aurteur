import { Text, TextMeta } from '../types/types';

export const getTextsMeta = async (): Promise<TextMeta[]> => {
  const response = await fetch('/texts/Texts.json');
  const data = await response.json();
  return data.texts.map(({ content, ...meta }: Text) => meta);
};

export const getText = async (title: string): Promise<Text | null> => {
  const response = await fetch('/texts/Texts.json');
  const data = await response.json();
  const text = data.texts.find((t: Text) => t.title.toLowerCase() === title.toLowerCase());
  return text || null;
};
