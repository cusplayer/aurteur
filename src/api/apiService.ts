import axios from "axios";
import { Text, TextMeta } from '../types/types';

const apiBaseUrl = "https://aurteur-api-747601109736.europe-west1.run.app" // process.env.REACT_APP_API_URL;

export const getTextsMeta = async (options?: { signal?: AbortSignal }): Promise<TextMeta[]> => {
  const response = await axios.get<Text[]>(`${apiBaseUrl}/texts`, options);
  return response.data.map(({ content, ...meta }) => meta);
};

export const getText = async (title: string, options?: { signal?: AbortSignal }): Promise<Text | null> => {
  const response = await axios.get<Text[]>(`${apiBaseUrl}/texts`, options);
  const text = response.data.find((t) => t.title.toLowerCase() === title.toLowerCase());
  return text || null;
};
