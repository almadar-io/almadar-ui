/**
 * DocumentViewer Organism Component
 *
 * A document viewer for displaying PDFs, documents, and rich text content.
 * Uses iframe for PDF rendering (necessary) and atoms for all surrounding UI.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export type DocumentType = "pdf" | "text" | "html" | "markdown";
export interface DocumentAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface DocumentViewerProps {
    /** Document title */
    title?: string;
    /** Document URL (for PDF/external documents) */
    src?: string;
    /** Document content (for text/html/markdown) */
    content?: string;
    /** Document type */
    documentType?: DocumentType;
    /** Current page (for multi-page documents) */
    currentPage?: number;
    /** Total pages */
    totalPages?: number;
    /** Viewer height */
    height?: number | string;
    /** Show toolbar */
    showToolbar?: boolean;
    /** Show download button */
    showDownload?: boolean;
    /** Show print button */
    showPrint?: boolean;
    /** Actions */
    actions?: readonly DocumentAction[];
    /** Multiple documents (tabbed view) */
    documents?: readonly {
        label: string;
        src?: string;
        content?: string;
        documentType?: DocumentType;
    }[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const DocumentViewer: React.FC<DocumentViewerProps>;
