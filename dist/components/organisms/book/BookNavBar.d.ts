/**
 * BookNavBar Molecule
 *
 * Navigation bar for the BookViewer with prev/next, page indicator,
 * print button, and TOC toggle.
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_PREV, UI:BOOK_PAGE_NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */
import React from 'react';
import type { EntityDisplayProps } from '../types';
export interface BookNavBarProps extends EntityDisplayProps {
    currentPage: number;
    totalPages: number;
    chapterTitle?: string;
    direction?: 'rtl' | 'ltr';
}
export declare const BookNavBar: React.FC<BookNavBarProps>;
