import React from 'react';
import type { ReactNode, ErrorInfo } from 'react';
export interface ErrorBoundaryProps {
    /** Content to render when no error */
    children: ReactNode;
    /** Fallback UI when an error is caught — ReactNode or render function */
    fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
    /** Additional CSS classes for the wrapper */
    className?: string;
    /** Called when an error is caught (for logging/telemetry) */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface ErrorBoundaryState {
    error: Error | null;
}
/**
 * ErrorBoundary — catches React render errors in child components.
 *
 * Uses `getDerivedStateFromError` and `componentDidCatch` to capture errors
 * and render a fallback UI. Supports both static ReactNode fallbacks and
 * render-function fallbacks that receive the error and a reset function.
 *
 * @example
 * ```tsx
 * // Static fallback
 * <ErrorBoundary fallback={<Alert variant="error">Something broke</Alert>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Render function fallback with reset
 * <ErrorBoundary fallback={(error, reset) => (
 *   <VStack>
 *     <Typography>Error: {error.message}</Typography>
 *     <Button onClick={reset}>Try Again</Button>
 *   </VStack>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Default fallback (uses ErrorState molecule)
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static displayName: string;
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private reset;
    render(): ReactNode;
    private renderFallback;
}
export default ErrorBoundary;
