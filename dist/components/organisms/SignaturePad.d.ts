/**
 * SignaturePad Organism Component
 *
 * A canvas-based signature capture pad.
 * Uses a minimal canvas wrapper (necessary for drawing) but composes all
 * surrounding UI with atoms and molecules.
 *
 * Orbital Component Interface Compliance:
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export interface SignaturePadProps {
    /** Label above the pad */
    label?: string;
    /** Helper text */
    helperText?: string;
    /** Stroke color */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Pad height */
    height?: number;
    /** Whether the pad is read-only */
    readOnly?: boolean;
    /** Existing signature image URL */
    value?: string;
    /** Callback when signature changes */
    onChange?: (dataUrl: string | null) => void;
    /** Event to emit on sign */
    signEvent?: string;
    /** Event to emit on clear */
    clearEvent?: string;
    /** Entity name for schema-driven context */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const SignaturePad: React.FC<SignaturePadProps>;
