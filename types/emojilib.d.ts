declare module 'emojilib' {
  export interface EmojilibEntry {
    keywords: string[];
    char: string;
    fitzpatrick_scale: boolean;
    category: string;
  }
  export const lib: Record<string, EmojilibEntry>;
  export const ordered: string[];
  export const fitzpatrick_scale_modifiers: string[];
}
