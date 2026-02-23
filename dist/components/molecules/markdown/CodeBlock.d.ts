/**
 * CodeBlock Molecule Component
 *
 * A syntax-highlighted code block with copy-to-clipboard functionality.
 * Preserves scroll position during re-renders.
 *
 * Event Contract:
 * - Emits: UI:COPY_CODE { language, success }
 */
import React from 'react';
export interface CodeBlockProps {
    /** The code content to display */
    code: string;
    /** Programming language for syntax highlighting */
    language?: string;
    /** Show the copy button */
    showCopyButton?: boolean;
    /** Show the language badge */
    showLanguageBadge?: boolean;
    /** Maximum height before scrolling */
    maxHeight?: string;
    /** Additional CSS classes */
    className?: string;
}
export declare const CodeBlock: React.NamedExoticComponent<CodeBlockProps>;
