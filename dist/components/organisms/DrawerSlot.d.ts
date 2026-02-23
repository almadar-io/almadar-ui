/**
 * DrawerSlot Component
 *
 * Wraps drawer slot content in a proper Drawer component.
 * Used by trait-driven pages to display drawer UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form or DetailPanel components
 * - Configurable position and size
 */
import React from 'react';
import { DrawerPosition, DrawerSize } from '../molecules/Drawer';
export interface DrawerSlotProps {
    /** Content to display in the drawer */
    children?: React.ReactNode;
    /** Override drawer title (extracted from children if not provided) */
    title?: string;
    /** Drawer position */
    position?: DrawerPosition;
    /** Drawer size */
    size?: DrawerSize;
    /** Custom class name */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * DrawerSlot - Wrapper for drawer slot content
 *
 * Automatically shows drawer when children are present,
 * and dispatches close events when drawer is dismissed.
 */
export declare const DrawerSlot: React.FC<DrawerSlotProps>;
