import axios from "axios";
import { Article, ArticleMeta } from '../types/types';

const API_URL = 'http://localhost:5000';

export const getArticlesMeta = async (options?: { signal?: AbortSignal }): Promise<ArticleMeta[]> => {
  const response = await axios.get('/api/articles/full', options);
  return response.data;
};