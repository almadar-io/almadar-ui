/**
 * BookChapterView Organism
 *
 * Renders a single chapter: title + optional orbital diagram +
 * rich content via ContentRenderer.
 *
 * Event Contract:
 * - Delegates to ContentRenderer children
 */
import React from 'react';
import type { EntityDisplayProps } from '../types';
import type { BookChapter } from './types';
export interface BookChapterViewProps extends EntityDisplayProps {
    chapter: BookChapter;
    direction?: 'rtl' | 'ltr';
}
export declare const BookChapterView: React.FC<BookChapterViewProps>;
