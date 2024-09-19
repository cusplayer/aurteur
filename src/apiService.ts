import axios from "axios";
import { Text, TextMeta } from './types/types';

const localhostAddress = 'http://localhost:3005'

export const getTextsMeta = async (options?: { signal?: AbortSignal }): Promise<Text[]> => {
  const response = await axios.get(`${localhostAddress}/api/texts`, options);
  return response.data;
};

export const getText = async (title: string, options?: { signal?: AbortSignal }): Promise<Text | null> => {
  const response = await axios.get<Text[]>(`${localhostAddress}/api/texts`, options);
  const Text = response.data.find((Text) => Text.title.toLowerCase() === title.toLowerCase());
  return Text || null;
};