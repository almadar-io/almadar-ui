/**
 * BookViewer Organism
 *
 * Flippable book reader with cover, TOC, chapter views, and navigation.
 * Supports RTL layout (Arabic), CSS slide transitions, and print mode.
 *
 * Page model:
 *   0 = cover, 1 = TOC, 2+ = chapters (flattened from parts)
 *
 * Field mapping:
 *   Entity data may use non-English field names (e.g. Arabic .orb schemas).
 *   Pass a `fieldMap` prop to translate entity fields to canonical BookData.
 *   Default: IDENTITY_BOOK_FIELDS (English field names, no translation).
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_CHANGE { pageIndex, chapterId? }
 * - Listens: UI:BOOK_START, UI:BOOK_NAVIGATE, UI:BOOK_PAGE_PREV/NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */
import React from 'react';
import type { EntityDisplayProps } from '../types';
import type { BookFieldMap } from './types';
export interface BookViewerProps extends EntityDisplayProps {
    /** Initial page index (default: 0 = cover) */
    initialPage?: number;
    /** Field name translation map — a BookFieldMap object or locale key ("ar") */
    fieldMap?: BookFieldMap | string;
}
export declare const BookViewer: React.FC<BookViewerProps>;
