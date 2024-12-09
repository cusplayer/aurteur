import { Text } from '../types/types';

export const getTextsData = async (): Promise<Text[]> => {
  const response = await fetch('/texts/texts.json');
  const data = await response.json();
  return data.texts;
};
