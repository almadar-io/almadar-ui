/**
 * BookViewer shared types
 */

export interface BookData {
  title: string;
  subtitle?: string;
  author?: string;
  coverImageUrl?: string;
  direction?: 'rtl' | 'ltr';
  parts: BookPart[];
}

export interface BookPart {
  title: string;
  chapters: BookChapter[];
}

export interface BookChapter {
  id: string;
  title: string;
  content: string;
  orbitalSchema?: unknown;
}
