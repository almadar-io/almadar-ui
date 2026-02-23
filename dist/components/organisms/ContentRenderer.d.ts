/**
 * ContentRenderer Organism
 *
 * Renders rich content as a sequence of typed segments: markdown, code,
 * orbital diagrams (via JazariStateMachine), and quiz blocks. Accepts
 * either raw content string (auto-parsed) or pre-parsed segments.
 *
 * Event Contract:
 * - Delegates to child components (CodeBlock -> UI:COPY_CODE)
 * - entityAware: false
 */
import React from 'react';
import { type ContentSegment } from '../../lib/parseContentSegments';
import type { EntityDisplayProps } from './types';
export interface ContentRendererProps extends EntityDisplayProps {
    /** Raw content string — auto-parsed into segments */
    content?: string;
    /** Pre-parsed segments (overrides content) */
    segments?: ContentSegment[];
    /** Text direction for markdown */
    direction?: 'rtl' | 'ltr';
}
export declare const ContentRenderer: React.FC<ContentRendererProps>;
