export interface HealthBarProps {
    /** Current health value */
    current: number;
    /** Maximum health value */
    max: number;
    /** Display format */
    format?: 'hearts' | 'bar' | 'numeric';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Animation on change */
    animated?: boolean;
}
export declare function HealthBar({ current, max, format, size, className, animated, }: HealthBarProps): import("react/jsx-runtime").JSX.Element;
export declare namespace HealthBar {
    var displayName: string;
}
