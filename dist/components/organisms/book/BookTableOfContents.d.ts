/**
 * BookTableOfContents Molecule
 *
 * Renders a clickable table of contents grouped by parts.
 * Highlights the current chapter.
 *
 * Event Contract:
 * - Emits: UI:BOOK_NAVIGATE { chapterId }
 */
import React from 'react';
import type { EntityDisplayProps } from '../types';
import type { BookPart } from './types';
export interface BookTableOfContentsProps extends EntityDisplayProps {
    parts: BookPart[];
    currentChapterId?: string;
    direction?: 'rtl' | 'ltr';
}
export declare const BookTableOfContents: React.FC<BookTableOfContentsProps>;
