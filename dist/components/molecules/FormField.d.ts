/**
 * FormField Molecule Component
 *
 * A form field wrapper with label, hint, and error message support.
 * **Atomic Design**: Composed using Label and Typography atoms.
 */
import React from 'react';
export interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}
export declare const FormField: React.FC<FormFieldProps>;
