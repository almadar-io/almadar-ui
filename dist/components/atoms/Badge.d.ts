import React from "react";
export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "error" | "info" | "neutral";
export type BadgeSize = "sm" | "md" | "lg";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
}
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
