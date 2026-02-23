import React from "react";
import { type LucideIcon } from "lucide-react";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "default";
export type ButtonSize = "sm" | "md" | "lg";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    /** Left icon as ReactNode (preferred) */
    leftIcon?: React.ReactNode;
    /** Right icon as ReactNode (preferred) */
    rightIcon?: React.ReactNode;
    /** Left icon as Lucide icon component (convenience prop, renders with default size) */
    icon?: LucideIcon;
    /** Right icon as Lucide icon component (convenience prop) */
    iconRight?: LucideIcon;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
    /** Button label text (alternative to children for schema-driven rendering) */
    label?: string;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
