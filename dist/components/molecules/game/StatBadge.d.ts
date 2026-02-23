import * as React from 'react';
export interface StatBadgeProps {
    /** Stat label */
    label: string;
    /** Current value (defaults to 0 if not provided) */
    value?: number | string;
    /** Maximum value (for bar/hearts format) */
    max?: number;
    /** Data source entity name (for schema config) */
    source?: string;
    /** Field name in the source (for schema config) */
    field?: string;
    /** Display format */
    format?: 'number' | 'hearts' | 'bar' | 'text' | string;
    /** Icon component or emoji */
    icon?: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | string;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | string;
    /** Additional CSS classes */
    className?: string;
}
export declare function StatBadge({ label, value, max, format, icon, size, variant, className, source: _source, field: _field, }: StatBadgeProps): import("react/jsx-runtime").JSX.Element;
export declare namespace StatBadge {
    var displayName: string;
}
