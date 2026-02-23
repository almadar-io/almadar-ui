import React from "react";
import { LucideIcon } from "lucide-react";
export interface EmptyStateProps {
    /**
     * Icon to display. Accepts either:
     * - A Lucide icon component (LucideIcon)
     * - A string icon name (e.g., "check-circle", "x-circle")
     */
    icon?: LucideIcon | string;
    /** Primary text to display - use title or message (message is alias for backwards compat) */
    title?: string;
    /** Alias for title - used by schema patterns */
    message?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    /** Destructive styling for confirmation dialogs */
    destructive?: boolean;
    /** Variant for color styling */
    variant?: "default" | "success" | "error" | "warning" | "info";
    /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
    actionEvent?: string;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
