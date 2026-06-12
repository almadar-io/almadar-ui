/**
 * BookViewer shared types + field-map normalisation.
 *
 * The BookViewer's entity boundary is `EntityRow` (raw schema data bound from
 * `@payload.data`). Books may use non-English field names (e.g. Arabic `.orb`
 * schemas), so `mapBookData()` normalises a raw record into canonical English
 * field names while keeping every value as `EntityRow` — no private entity
 * content-model types.
 *
 * The embedded orbital-diagram (`OrbitalSchema`) is richer than `FieldValue`
 * and therefore CANNOT live on an `EntityRow`. It is lifted OFF the entity
 * boundary into a separate `schemaByChapterId` lookup; consumers fetch a
 * chapter's schema by id and pass it as its own non-entity prop.
 */

import type { EntityRow, OrbitalSchema } from '@almadar/core';

/** A normalised book: cover fields + part rows + a chapter→schema side-table. */
export interface NormalizedBook {
  /** Cover-level fields (title/subtitle/author/coverImageUrl/direction). */
  cover: EntityRow;
  /** Reading direction resolved from the cover record. */
  direction: 'rtl' | 'ltr';
  /** Parts, each an `EntityRow` carrying `title` + a `chapters: EntityRow[]`. */
  parts: readonly EntityRow[];
  /** Flattened chapter rows in reading order (each carries id/title/content). */
  chapters: readonly EntityRow[];
  /** Orbital diagram schemas keyed by chapter id — kept OFF the entity rows. */
  schemaByChapterId: Record<string, OrbitalSchema>;
}

/**
 * Maps raw entity field names to canonical BookData field names.
 * Each key is a canonical field, each value is the entity field name.
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
export const IDENTITY_BOOK_FIELDS: BookFieldMap = {
  title: 'title',
  subtitle: 'subtitle',
  author: 'author',
  coverImageUrl: 'coverImageUrl',
  direction: 'direction',
  parts: 'parts',
  partTitle: 'title',
  chapters: 'chapters',
  chapterId: 'id',
  chapterTitle: 'title',
  chapterContent: 'content',
  chapterOrbitalSchema: 'orbitalSchema',
};

/** Arabic field map for الأمة_الرقمية schema */
export const AR_BOOK_FIELDS: BookFieldMap = {
  title: 'العنوان',
  subtitle: 'العنوان_الفرعي',
  author: 'المؤلف',
  coverImageUrl: 'صورة_الغلاف',
  direction: 'الاتجاه',
  parts: 'الأجزاء',
  partTitle: 'العنوان',
  chapters: 'الفصول',
  chapterId: 'المعرف',
  chapterTitle: 'العنوان',
  chapterContent: 'المحتوى',
  chapterOrbitalSchema: 'المخطط_المداري',
};

/** Registry of named field maps, keyed by locale string from render-ui props */
const FIELD_MAP_REGISTRY: Record<string, BookFieldMap> = {
  ar: AR_BOOK_FIELDS,
};

/**
 * Resolves a fieldMap prop to a BookFieldMap object.
 * Accepts a BookFieldMap object directly, a locale string key ("ar"),
 * or undefined (defaults to identity/English).
 */
export function resolveFieldMap(
  fieldMap: BookFieldMap | string | undefined,
): BookFieldMap {
  if (!fieldMap) return IDENTITY_BOOK_FIELDS;
  if (typeof fieldMap === 'string') return FIELD_MAP_REGISTRY[fieldMap] ?? IDENTITY_BOOK_FIELDS;
  return fieldMap;
}

/** Get a field value from a raw entity record */
function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

function asStr(v: unknown): string {
  return v == null ? '' : String(v);
}

/**
 * Maps a raw entity record to a `NormalizedBook` using a field map. Cover and
 * chapter data come back as `EntityRow`s; the per-chapter `OrbitalSchema` is
 * lifted off into `schemaByChapterId`.
 */
export function mapBookData(
  raw: Record<string, unknown>,
  fields: BookFieldMap = IDENTITY_BOOK_FIELDS,
): NormalizedBook {
  const rawParts = (get(raw, fields.parts) ?? []) as Record<string, unknown>[];
  const direction = (get(raw, fields.direction) as 'rtl' | 'ltr') ?? 'ltr';

  const cover: EntityRow = {
    title: asStr(get(raw, fields.title)),
    subtitle: asStr(get(raw, fields.subtitle)),
    author: asStr(get(raw, fields.author)),
    coverImageUrl: asStr(get(raw, fields.coverImageUrl)),
    direction,
  };

  const schemaByChapterId: Record<string, OrbitalSchema> = {};
  const chapters: EntityRow[] = [];

  const parts: EntityRow[] = rawParts.map((part) => {
    const rawChapters = (get(part, fields.chapters) ?? []) as Record<string, unknown>[];
    const chapterRows: EntityRow[] = rawChapters.map((ch) => {
      const id = asStr(get(ch, fields.chapterId));
      const schema = get(ch, fields.chapterOrbitalSchema) as OrbitalSchema | undefined;
      if (schema) schemaByChapterId[id] = schema;
      const row: EntityRow = {
        id,
        title: asStr(get(ch, fields.chapterTitle)),
        content: asStr(get(ch, fields.chapterContent)),
      };
      chapters.push(row);
      return row;
    });
    return {
      title: asStr(get(part, fields.partTitle)),
      chapters: chapterRows,
    } as EntityRow;
  });

  return { cover, direction, parts, chapters, schemaByChapterId };
}
