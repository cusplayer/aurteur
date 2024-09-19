export type FolderName = 'feed' | 'designs' | 'ouvres' | 'contacts';

export type TextMeta = {
  title: string;
  folder: FolderName;
  tags: string[];
  date: Date;
}

export interface Text extends TextMeta {
  content?: string;
}