/**
 * BookViewer Organism
 *
 * Flippable book reader with cover, TOC, chapter views, and navigation.
 * Supports RTL layout (Arabic), CSS slide transitions, and print mode.
 *
 * Page model:
 *   0 = cover, 1 = TOC, 2+ = chapters (flattened from parts)
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_CHANGE { pageIndex, chapterId? }
 * - Listens: UI:BOOK_START, UI:BOOK_NAVIGATE, UI:BOOK_PAGE_PREV/NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '../../atoms/Box';
import { VStack } from '../../atoms/VStack';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';
import { BookCoverPage } from './BookCoverPage';
import { BookTableOfContents } from './BookTableOfContents';
import { BookChapterView } from './BookChapterView';
import { BookNavBar } from './BookNavBar';
import type { EntityDisplayProps } from '../types';
import type { BookData, BookChapter } from './types';

export interface BookViewerProps extends EntityDisplayProps {
  book: BookData;
  /** Initial page index (default: 0 = cover) */
  initialPage?: number;
}

/** Flatten all chapters from all parts into a single ordered array */
function flattenChapters(book: BookData): BookChapter[] {
  return book.parts.flatMap((part) => part.chapters);
}

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
  book,
  initialPage = 0,
  className,
}) => {
  const eventBus = useEventBus();
  const { t: _t } = useTranslate();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const direction = book.direction ?? 'ltr';

  const chapters = useMemo(() => flattenChapters(book), [book]);
  const totalPages = 2 + chapters.length; // cover + TOC + chapters

  const navigateTo = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clamped);
      const chapterId = clamped >= 2 ? chapters[clamped - 2]?.id : undefined;
      eventBus.emit('UI:BOOK_PAGE_CHANGE', { pageIndex: clamped, chapterId });
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
      eventBus.on('UI:BOOK_NAVIGATE', (payload: Record<string, unknown>) => {
        const chapterId = payload.chapterId as string;
        const idx = chapters.findIndex((ch) => ch.id === chapterId);
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
  const currentChapterId = currentPage >= 2 ? chapters[currentPage - 2]?.id : undefined;
  const currentChapterTitle = currentPage >= 2 ? chapters[currentPage - 2]?.title : undefined;

  const isRtl = direction === 'rtl';

  return (
    <VStack className={cn('relative h-full overflow-hidden bg-[var(--color-background)]', className)}>
      {/* Page container */}
      <Box
        className="flex-1 overflow-y-auto overflow-x-hidden book-viewer-page"
        style={{ direction }}
      >
        {/* Print-mode: render all chapters sequentially */}
        <Box className="hidden print:block">
          <BookCoverPage
            title={book.title}
            subtitle={book.subtitle}
            author={book.author}
            coverImageUrl={book.coverImageUrl}
            direction={direction}
          />
          <BookTableOfContents
            parts={book.parts}
            direction={direction}
          />
          {chapters.map((chapter) => (
            <BookChapterView
              key={chapter.id}
              chapter={chapter}
              direction={direction}
            />
          ))}
        </Box>

        {/* Screen-mode: single page at a time */}
        <Box className="print:hidden">
          {currentPage === 0 && (
            <BookCoverPage
              title={book.title}
              subtitle={book.subtitle}
              author={book.author}
              coverImageUrl={book.coverImageUrl}
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
            ? book.title
            : currentPage === 1
              ? (isRtl ? 'فهرس المحتويات' : 'Table of Contents')
              : currentChapterTitle
        }
        direction={direction}
      />
    </VStack>
  );
};

BookViewer.displayName = 'BookViewer';
