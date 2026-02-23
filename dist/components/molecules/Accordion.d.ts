/**
 * Accordion Molecule Component
 *
 * A collapsible content component with single or multiple open items.
 * Uses Button, Icon, Typography, and Divider atoms.
 */
import React from "react";
export interface AccordionItem {
    /**
     * Item ID (auto-generated from header/title if not provided)
     */
    id?: string;
    /**
     * Item header/title
     */
    header?: React.ReactNode;
    /**
     * Alias for header (pattern compatibility)
     */
    title?: React.ReactNode;
    /**
     * Item content
     */
    content: React.ReactNode;
    /**
     * Disable item
     */
    disabled?: boolean;
    /**
     * Default open state
     */
    defaultOpen?: boolean;
}
export interface AccordionProps {
    /**
     * Accordion items
     */
    items: AccordionItem[];
    /**
     * Allow multiple items open at once
     * @default false
     */
    multiple?: boolean;
    /**
     * Default open items (IDs)
     */
    defaultOpenItems?: string[];
    /**
     * Default open items by index (pattern compatibility)
     */
    defaultOpen?: number[];
    /**
     * Controlled open items (IDs)
     */
    openItems?: string[];
    /**
     * Callback when item opens/closes
     */
    onItemToggle?: (itemId: string, isOpen: boolean) => void;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative toggle event — emits UI:{toggleEvent} with { itemId, isOpen } */
    toggleEvent?: string;
}
export declare const Accordion: React.FC<AccordionProps>;
