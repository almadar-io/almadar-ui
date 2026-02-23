/**
 * DetailPanel Organism Component
 *
 * Composes atoms and molecules to create a professional detail view.
 *
 * Data is provided by the trait via the `data` prop (render-ui effect).
 * See EntityDisplayProps in ./types.ts for base prop contract.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import type { EntityDisplayProps } from "./types";
export interface DetailField {
    label: string;
    value: React.ReactNode;
    icon?: LucideIcon;
    copyable?: boolean;
}
export interface DetailSection {
    title: string;
    fields: (DetailField | string)[];
}
/**
 * Action definition for DetailPanel
 */
export interface DetailPanelAction {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    /** Event to emit via event bus */
    event?: string;
    /** Navigation URL */
    navigatesTo?: string;
    /** Button variant (primary for main action, others for secondary) */
    variant?: "primary" | "secondary" | "ghost" | "danger";
}
/**
 * Field definition for unified interface - can be a simple string or object
 */
export type FieldDef = string | {
    key: string;
    header?: string;
};
export interface DetailPanelProps extends Omit<EntityDisplayProps<Record<string, unknown>>, 'data'> {
    title?: string;
    subtitle?: string;
    status?: {
        label: string;
        variant?: "default" | "success" | "warning" | "danger" | "info";
    };
    avatar?: React.ReactNode;
    sections?: readonly DetailSection[];
    /** Unified actions array - first action with variant='primary' is the main action */
    actions?: readonly DetailPanelAction[];
    footer?: React.ReactNode;
    slideOver?: boolean;
    /** Fields to display - accepts string[], {key, header}[], or DetailField[] */
    fields?: readonly (FieldDef | DetailField)[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
    /** Data object provided by the trait via render-ui */
    data?: Record<string, unknown> | unknown;
    /** Initial data for edit mode (passed by compiler) */
    initialData?: Record<string, unknown> | unknown;
    /** Display mode (passed by compiler) */
    mode?: string;
    /** Panel position (for drawer/sidebar placement) */
    position?: "left" | "right";
    /** Panel width (CSS value, e.g., '400px', '50%') */
    width?: string;
}
export declare const DetailPanel: React.FC<DetailPanelProps>;
