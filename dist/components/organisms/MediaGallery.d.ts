/**
 * MediaGallery Organism Component
 *
 * A gallery component for displaying images and media in a grid layout.
 * Supports lightbox viewing, selection, and upload interactions.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export interface MediaItem {
    /** Unique identifier */
    id: string;
    /** Media URL */
    src: string;
    /** Alt text */
    alt?: string;
    /** Thumbnail URL (defaults to src) */
    thumbnail?: string;
    /** Media type */
    mediaType?: "image" | "video";
    /** Caption */
    caption?: string;
    /** File size */
    fileSize?: string;
}
export interface MediaGalleryAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface MediaGalleryProps {
    /** Gallery title */
    title?: string;
    /** Media items */
    items?: readonly MediaItem[];
    /** Schema-driven data */
    data?: readonly Record<string, unknown>[];
    /** Column count */
    columns?: 2 | 3 | 4 | 5 | 6;
    /** Enable item selection */
    selectable?: boolean;
    /** Selected item IDs */
    selectedItems?: readonly string[];
    /** Selection change callback */
    onSelectionChange?: (ids: string[]) => void;
    /** Show upload button */
    showUpload?: boolean;
    /** Actions */
    actions?: readonly MediaGalleryAction[];
    /** Aspect ratio for thumbnails */
    aspectRatio?: "square" | "landscape" | "portrait";
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const MediaGallery: React.FC<MediaGalleryProps>;
