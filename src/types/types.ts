export type FolderName = 'feed' | 'designs' | 'ouvres' | 'contacts';

export type ArticleMeta = {
  title: string;
  folder: FolderName;
  tags: string[];
  date: Date;
}

export interface Article extends ArticleMeta {
  content?: string;
}