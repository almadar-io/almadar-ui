import React from "react";
import { type LucideIcon } from "lucide-react";
export interface SelectOption {
    value: string;
    label: string;
}
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    /** Input type - supports 'select' and 'textarea' in addition to standard types */
    inputType?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "datetime-local" | "time" | "checkbox" | "select" | "textarea";
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    /** Lucide icon component for left side (convenience prop) */
    icon?: LucideIcon;
    /** Show clear button when input has value */
    clearable?: boolean;
    /** Callback when clear button is clicked */
    onClear?: () => void;
    /** Options for select type */
    options?: SelectOption[];
    /** Rows for textarea type */
    rows?: number;
    /** onChange handler - accepts events from input, select, or textarea */
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>;
