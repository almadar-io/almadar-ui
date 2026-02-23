/**
 * InputGroup Molecule Component
 *
 * A component for grouping input with addons (icons, buttons, text).
 * Uses Input, Button, Icon, and Typography atoms.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { InputProps } from "../atoms/Input";
export interface InputGroupProps extends Omit<InputProps, "icon" | "iconRight"> {
    /**
     * Left addon (icon, button, or text)
     */
    leftAddon?: React.ReactNode | LucideIcon;
    /**
     * Right addon (icon, button, or text)
     */
    rightAddon?: React.ReactNode | LucideIcon;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const InputGroup: React.FC<InputGroupProps>;
