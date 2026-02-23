import React from "react";
export interface ErrorStateProps {
    title?: string;
    /** Error message to display */
    message?: string;
    /** Alias for message (schema compatibility) */
    description?: string;
    onRetry?: () => void;
    className?: string;
    /** Declarative retry event — emits UI:{retryEvent} via eventBus when retry button is clicked */
    retryEvent?: string;
}
export declare const ErrorState: React.FC<ErrorStateProps>;
