/**
 * CodeViewer Organism Component
 *
 * A code/diff viewer with syntax highlighting and line numbers.
 * Composes atoms and molecules for layout. Uses pre/code elements
 * which are semantically necessary for code display.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export type CodeViewerMode = "code" | "diff";
export interface DiffLine {
    type: "add" | "remove" | "context";
    content: string;
    lineNumber?: number;
}
export interface CodeViewerAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface CodeViewerProps {
    /** Viewer title */
    title?: string;
    /** Code content */
    code?: string;
    /** Language for display label */
    language?: string;
    /** Diff lines (for diff mode) */
    diff?: readonly DiffLine[];
    /** Old value (for generating diff) */
    oldValue?: string;
    /** New value (for generating diff) */
    newValue?: string;
    /** Display mode */
    mode?: CodeViewerMode;
    /** Show line numbers */
    showLineNumbers?: boolean;
    /** Show copy button */
    showCopy?: boolean;
    /** Enable word wrap */
    wordWrap?: boolean;
    /** Max height before scrolling */
    maxHeight?: number | string;
    /** Multiple files (tabbed view) */
    files?: readonly {
        label: string;
        code: string;
        language?: string;
    }[];
    /** Actions */
    actions?: readonly CodeViewerAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const CodeViewer: React.FC<CodeViewerProps>;
