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

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '../../../core/atoms/Box';
import { VStack } from '../../../core/atoms/Stack';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { cn } from '../../../../lib/cn';
import { BookCoverPage } from './BookCoverPage';
import { BookTableOfContents } from './BookTableOfContents';
import { BookChapterView } from './BookChapterView';
import { BookNavBar } from './BookNavBar';
import { EmptyState } from '../../../core/molecules/EmptyState';
import type { EntityRow } from '@almadar/core';
import type { DisplayStateProps } from '../../../core/organisms/types';
import type { NormalizedBook, BookFieldMap } from '../../../core/organisms/book/types';
import { mapBookData, resolveFieldMap } from '../../../core/organisms/book/types';

export interface BookViewerProps extends DisplayStateProps {
  /** Renders ONE record (the book), not a collection */
  entity?: EntityRow | readonly EntityRow[];
  /** Initial page index (default: 0 = cover) */
  initialPage?: number;
  /** Field name translation map — a BookFieldMap object or locale key ("ar") */
  fieldMap?: BookFieldMap | string;
}

const chapterId = (ch: EntityRow | undefined): string | undefined =>
  ch?.id == null ? undefined : String(ch.id);
const chapterTitle = (ch: EntityRow | undefined): string | undefined =>
  ch?.title == null ? undefined : String(ch.title);

/** Print styles injected once */
const PRINT_STYLES = `
@media print {
  .book-viewer-page {
    overflow: visible !important;
    height: auto !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .book-viewer-page { transition: none !important; }
}
`;

export const BookViewer: React.FC<BookViewerProps> = ({
  entity,
  initialPage = 0,
  fieldMap,
  className,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Resolve string key ("ar") or object to a BookFieldMap
  const resolvedFieldMap = useMemo(() => resolveFieldMap(fieldMap), [fieldMap]);

  // Map raw entity data to a NormalizedBook using field map
  const book = useMemo<NormalizedBook | null>(() => {
    const entityArray = Array.isArray(entity) ? entity : entity ? [entity] : [];
    const raw = entityArray[0];
    if (!raw) return null;
    return mapBookData(raw, resolvedFieldMap);
  }, [entity, resolvedFieldMap]);

  const direction = book?.direction ?? 'ltr';

  const chapters = useMemo<readonly EntityRow[]>(() => book ? book.chapters : [], [book]);
  const totalPages = 2 + chapters.length; // cover + TOC + chapters

  const navigateTo = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clamped);
      const id = clamped >= 2 ? chapterId(chapters[clamped - 2]) : undefined;
      eventBus.emit('UI:BOOK_PAGE_CHANGE', { pageIndex: clamped, chapterId: id });
    },
    [totalPages, chapters, eventBus],
  );

  // Listen for navigation events
  useEffect(() => {
    const unsubs = [
      eventBus.on('UI:BOOK_START', () => navigateTo(1)),
      eventBus.on('UI:BOOK_SHOW_TOC', () => navigateTo(1)),
      eventBus.on('UI:BOOK_PAGE_PREV', () => navigateTo(currentPage - 1)),
      eventBus.on('UI:BOOK_PAGE_NEXT', () => navigateTo(currentPage + 1)),
      eventBus.on('UI:BOOK_PRINT', () => window.print()),
      eventBus.on('UI:BOOK_NAVIGATE', (event) => {
        const targetId = event.payload?.chapterId as string;
        const idx = chapters.findIndex((ch) => chapterId(ch) === targetId);
        if (idx >= 0) navigateTo(idx + 2);
      }),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [eventBus, currentPage, navigateTo, chapters]);

  // Inject print styles
  useEffect(() => {
    const id = 'book-viewer-print-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // Resolve current chapter ID for TOC highlighting
  const currentChapterId = currentPage >= 2 ? chapterId(chapters[currentPage - 2]) : undefined;
  const currentChapterTitle = currentPage >= 2 ? chapterTitle(chapters[currentPage - 2]) : undefined;

  // No data — Suspense/ErrorBoundary handles loading and errors at the parent level
  if (!book) return <EmptyState message={t('book.noData')} />;

  const cover = book.cover;
  const coverTitle = String(cover.title ?? '');

  return (
    <VStack className={cn('relative h-full overflow-hidden bg-background', className)}>
      {/* Page container */}
      <Box
        className="flex-1 overflow-y-auto overflow-x-hidden book-viewer-page"
        style={{ direction }}
      >
        {/* Print-mode: render all chapters sequentially */}
        <Box className="hidden print:block">
          <BookCoverPage
            title={coverTitle}
            subtitle={String(cover.subtitle ?? '') || undefined}
            author={String(cover.author ?? '') || undefined}
            coverImageUrl={String(cover.coverImageUrl ?? '') || undefined}
            direction={direction}
          />
          <BookTableOfContents
            parts={book.parts}
            direction={direction}
          />
          {chapters.map((chapter) => {
            const id = chapterId(chapter);
            return (
              <BookChapterView
                key={id}
                chapter={chapter}
                orbitalSchema={id ? book.schemaByChapterId[id] : undefined}
                direction={direction}
              />
            );
          })}
        </Box>

        {/* Screen-mode: single page at a time */}
        <Box className="print:hidden">
          {currentPage === 0 && (
            <BookCoverPage
              title={coverTitle}
              subtitle={String(cover.subtitle ?? '') || undefined}
              author={String(cover.author ?? '') || undefined}
              coverImageUrl={String(cover.coverImageUrl ?? '') || undefined}
              direction={direction}
            />
          )}

          {currentPage === 1 && (
            <BookTableOfContents
              parts={book.parts}
              currentChapterId={currentChapterId}
              direction={direction}
            />
          )}

          {currentPage >= 2 && chapters[currentPage - 2] && (
            <BookChapterView
              chapter={chapters[currentPage - 2]}
              orbitalSchema={currentChapterId ? book.schemaByChapterId[currentChapterId] : undefined}
              direction={direction}
            />
          )}
        </Box>
      </Box>

      {/* Navigation bar */}
      <BookNavBar
        currentPage={currentPage}
        totalPages={totalPages}
        chapterTitle={
          currentPage === 0
            ? coverTitle
            : currentPage === 1
              ? t('book.tableOfContents')
              : currentChapterTitle
        }
        direction={direction}
      />
    </VStack>
  );
};

BookViewer.displayName = 'BookViewer';
