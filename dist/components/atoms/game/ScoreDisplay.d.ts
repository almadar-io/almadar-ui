import * as React from 'react';
export interface ScoreDisplayProps {
    /** Current score value */
    value: number;
    /** Label to display before score */
    label?: string;
    /** Icon component or emoji */
    icon?: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Additional CSS classes */
    className?: string;
    /** Animation on value change */
    animated?: boolean;
    /** Number formatting locale */
    locale?: string;
}
export declare function ScoreDisplay({ value, label, icon, size, className, animated, locale, }: ScoreDisplayProps): import("react/jsx-runtime").JSX.Element;
export declare namespace ScoreDisplay {
    var displayName: string;
}
