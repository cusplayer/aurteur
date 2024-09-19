import axios from "axios";
import { Text, TextMeta } from '../types/types';

const localhostAddress = 'http://localhost:3005'

export const getTextsMeta = async (options?: { signal?: AbortSignal }): Promise<TextMeta[]> => {
  const response = await axios.get<Text[]>(`${localhostAddress}/texts`, options);
  return response.data.map(({ content, ...meta }) => meta);
};

export const getText = async (title: string, options?: { signal?: AbortSignal }): Promise<Text | null> => {
  const response = await axios.get<Text[]>(`${localhostAddress}/texts`, options);
  const text = response.data.find((t) => t.title.toLowerCase() === title.toLowerCase());
  return text || null;
};