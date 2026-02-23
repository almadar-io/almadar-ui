/**
 * BookCoverPage Molecule
 *
 * Renders a book cover with title, subtitle, author, and optional image.
 * Centered layout suitable for the first "page" of a BookViewer.
 *
 * Event Contract:
 * - Emits: UI:BOOK_START
 */
import React from 'react';
import type { EntityDisplayProps } from '../types';
export interface BookCoverPageProps extends EntityDisplayProps {
    title: string;
    subtitle?: string;
    author?: string;
    coverImageUrl?: string;
    direction?: 'rtl' | 'ltr';
}
export declare const BookCoverPage: React.FC<BookCoverPageProps>;
