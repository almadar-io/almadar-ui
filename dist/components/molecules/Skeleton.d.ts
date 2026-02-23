import React from 'react';
export type SkeletonVariant = 'header' | 'table' | 'form' | 'card' | 'text';
export interface SkeletonProps {
    /** The skeleton variant to render */
    variant?: SkeletonVariant;
    /** Number of rows for table/text variants */
    rows?: number;
    /** Number of columns for table variant */
    columns?: number;
    /** Number of fields for form variant */
    fields?: number;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Skeleton — loading placeholder with 5 variants for Suspense fallbacks.
 *
 * Variants: `header`, `table`, `form`, `card`, `text`.
 * Used as fallback content inside `<Suspense>` boundaries.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Skeleton variant="table" rows={8} columns={5} />}>
 *   <DataTable entity="Task" />
 * </Suspense>
 *
 * <Suspense fallback={<Skeleton variant="form" fields={6} />}>
 *   <Form entity="Task" />
 * </Suspense>
 * ```
 */
export declare function Skeleton({ variant, rows, columns, fields, className, }: SkeletonProps): React.ReactElement;
export declare namespace Skeleton {
    var displayName: string;
}
