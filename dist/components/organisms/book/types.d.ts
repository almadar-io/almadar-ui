/**
 * BookViewer shared types
 *
 * Field names are canonical English. When entity data arrives from a
 * schema with non-English field names (e.g. Arabic .orb), a field map
 * translates them before passing to BookViewer. See `mapBookData()`.
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
/**
 * Maps raw entity field names to canonical BookData field names.
 * Each key is a canonical field, each value is the entity field name.
 *
 * @example
 * ```ts
 * // Arabic schema
 * const AR_BOOK_FIELDS: BookFieldMap = {
 *   title: 'العنوان',
 *   subtitle: 'العنوان_الفرعي',
 *   author: 'المؤلف',
 *   coverImageUrl: 'صورة_الغلاف',
 *   direction: 'الاتجاه',
 *   parts: 'الأجزاء',
 *   partTitle: 'العنوان',
 *   chapters: 'الفصول',
 *   chapterId: 'المعرف',
 *   chapterTitle: 'العنوان',
 *   chapterContent: 'المحتوى',
 *   chapterOrbitalSchema: 'المخطط_المداري',
 * };
 * ```
 */
export interface BookFieldMap {
    title: string;
    subtitle: string;
    author: string;
    coverImageUrl: string;
    direction: string;
    parts: string;
    partTitle: string;
    chapters: string;
    chapterId: string;
    chapterTitle: string;
    chapterContent: string;
    chapterOrbitalSchema: string;
}
/** Identity map — entity already uses canonical English field names */
export declare const IDENTITY_BOOK_FIELDS: BookFieldMap;
/** Arabic field map for الأمة_الرقمية schema */
export declare const AR_BOOK_FIELDS: BookFieldMap;
/**
 * Resolves a fieldMap prop to a BookFieldMap object.
 * Accepts a BookFieldMap object directly, a locale string key ("ar"),
 * or undefined (defaults to identity/English).
 */
export declare function resolveFieldMap(fieldMap: BookFieldMap | string | undefined): BookFieldMap;
/**
 * Maps a raw entity record to a typed BookData using a field map.
 * Pass `IDENTITY_BOOK_FIELDS` for English schemas, `AR_BOOK_FIELDS` for Arabic, etc.
 */
export declare function mapBookData(raw: Record<string, unknown>, fields?: BookFieldMap): BookData;
