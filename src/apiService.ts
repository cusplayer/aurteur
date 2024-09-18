import axios from "axios";
import { Article, ArticleMeta } from './types/types';

const localhostAddress = 'http://localhost:3005'

export const getArticlesMeta = async (options?: { signal?: AbortSignal }): Promise<Article[]> => {
  const response = await axios.get(`${localhostAddress}/api/articles`, options);
  return response.data;
};

export const getArticle = async (title: string, options?: { signal?: AbortSignal }): Promise<Article | null> => {
  const response = await axios.get<Article[]>(`${localhostAddress}/api/articles`, options);
  const article = response.data.find((article) => article.title.toLowerCase() === title.toLowerCase());
  return article || null;
};