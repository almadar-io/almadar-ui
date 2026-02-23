/**
 * GenericAppTemplate
 *
 * A simple, generic template for any application.
 * Includes a header with title and actions, and a main content area.
 * **Atomic Design**: Composed using Box, Typography, and Button atoms.
 */
import React from "react";
import type { TemplateProps } from "./types";
interface GenericAppEntity {
    id: string;
    title?: string;
    subtitle?: string;
}
export interface GenericAppTemplateProps extends TemplateProps<GenericAppEntity> {
    /** Page title */
    title: string;
    /** Subtitle or description */
    subtitle?: string;
    /** Main content */
    children: React.ReactNode;
    /** Header actions (buttons, links) */
    headerActions?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Additional class name */
    className?: string;
}
export declare const GenericAppTemplate: React.FC<GenericAppTemplateProps>;
export {};
