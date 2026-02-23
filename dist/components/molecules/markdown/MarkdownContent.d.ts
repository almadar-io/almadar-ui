/**
 * MarkdownContent Molecule Component
 *
 * Renders markdown content with support for GFM (GitHub Flavored Markdown)
 * and math equations (KaTeX). Handles inline code only — fenced code blocks
 * should be parsed out and rendered with CodeBlock component.
 *
 * Event Contract:
 * - No events emitted (display-only component)
 * - entityAware: false
 *
 * NOTE: react-markdown's `components` override API requires native HTML
 * elements — this is the same library-boundary exception as `<iframe>` in
 * DocumentViewer and `<svg>` in JazariStateMachine/StateMachineView.
 */
import React from 'react';
import 'katex/dist/katex.min.css';
export interface MarkdownContentProps {
    /** The markdown content to render */
    content: string;
    /** Text direction */
    direction?: 'rtl' | 'ltr';
    /** Additional CSS classes */
    className?: string;
}
export declare const MarkdownContent: React.NamedExoticComponent<MarkdownContentProps>;
