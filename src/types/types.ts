export type FolderName = 'all' | 'designs' | 'ouvres' | 'about me';

export type TextMeta = {
  title: string;
  titleExt: string;
  folder: FolderName;
  tags: string[];
  date: Date;
}

export interface Text extends TextMeta {
  content?: string;
}