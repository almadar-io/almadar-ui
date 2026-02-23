import * as React from 'react';
export interface ControlButtonProps {
    /** Button label text */
    label?: string;
    /** Icon component or emoji */
    icon?: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | string;
    /** Shape variant */
    shape?: 'circle' | 'rounded' | 'square' | string;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | string;
    /** Called when button is pressed */
    onPress?: () => void;
    /** Called when button is released */
    onRelease?: () => void;
    /** Declarative event name emitted on press via useEventBus */
    pressEvent?: string;
    /** Declarative event name emitted on release via useEventBus */
    releaseEvent?: string;
    /** Whether the button is currently pressed */
    pressed?: boolean;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}
export declare function ControlButton({ label, icon, size, shape, variant, onPress, onRelease, pressEvent, releaseEvent, pressed, disabled, className, }: ControlButtonProps): import("react/jsx-runtime").JSX.Element;
export declare namespace ControlButton {
    var displayName: string;
}
