/**
 * ToastSlot Component
 *
 * Wraps toast slot content in a proper Toast component with positioning.
 * Used by trait-driven pages to display toast UI from render_ui effects.
 *
 * Handles:
 * - Auto-show when content is present
 * - Dispatches DISMISS event when dismissed
 * - Fixed positioning in corner of screen
 */
import React from 'react';
import { ToastVariant } from '../molecules/Toast';
export interface ToastSlotProps {
    /** Content to display in the toast (message or ReactNode) */
    children?: React.ReactNode;
    /** Toast variant */
    variant?: ToastVariant;
    /** Toast title */
    title?: string;
    /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
    duration?: number;
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
 * ToastSlot - Wrapper for toast slot content
 *
 * Automatically shows toast when children are present,
 * and dispatches dismiss events when toast is dismissed.
 */
export declare const ToastSlot: React.FC<ToastSlotProps>;
