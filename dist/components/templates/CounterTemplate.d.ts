/**
 * CounterTemplate
 *
 * A presentational template for counter/incrementer features.
 * Supports increment, decrement, and reset operations.
 */
import React from "react";
import type { TemplateProps } from "./types";
export type CounterSize = "sm" | "md" | "lg";
export type CounterVariant = "minimal" | "standard" | "full";
export interface CounterEntity {
    /** Entity ID */
    id: string;
    /** Current count value */
    count: number;
    /** Whether decrement button is disabled */
    decrementDisabled?: boolean;
    /** Whether increment button is disabled */
    incrementDisabled?: boolean;
    /** Step label for decrement button (e.g. "-5") */
    decrementLabel?: string;
    /** Step label for increment button (e.g. "+5") */
    incrementLabel?: string;
    /** Formatted range text (e.g. "Range: 0 to 100") */
    rangeText?: string;
}
export interface CounterTemplateProps extends TemplateProps<CounterEntity> {
    /** Called when increment is clicked */
    onIncrement?: () => void;
    /** Called when decrement is clicked */
    onDecrement?: () => void;
    /** Called when reset is clicked */
    onReset?: () => void;
    /** Title displayed above the counter */
    title?: string;
    /** Show reset button */
    showReset?: boolean;
    /** Counter display size */
    size?: CounterSize;
    /** Template variant */
    variant?: CounterVariant;
}
export declare const CounterTemplate: React.FC<CounterTemplateProps>;
export default CounterTemplate;
