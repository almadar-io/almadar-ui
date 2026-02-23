/**
 * ModalSlot Component
 *
 * Wraps modal slot content in a proper Modal component.
 * Used by trait-driven pages to display modal UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form components
 */
import React from 'react';
export interface ModalSlotProps {
    /** Content to display in the modal */
    children?: React.ReactNode;
    /** Override modal title (extracted from children if not provided) */
    title?: string;
    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Custom class name */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * ModalSlot - Wrapper for modal slot content
 *
 * Automatically shows modal when children are present,
 * and dispatches close events when modal is dismissed.
 */
export declare const ModalSlot: React.FC<ModalSlotProps>;
