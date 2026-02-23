/**
 * Radio Atom Component
 *
 * A radio button component with label support and accessibility.
 */
import React from "react";
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    /**
     * Label text displayed next to the radio button
     */
    label?: string;
    /**
     * Helper text displayed below the radio button
     */
    helperText?: string;
    /**
     * Error message displayed below the radio button
     */
    error?: string;
    /**
     * Size of the radio button
     * @default 'md'
     */
    size?: "sm" | "md" | "lg";
}
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
