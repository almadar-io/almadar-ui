import type { OrbitalSchema } from '@almadar/core';
export interface PreviewApp {
    id: string;
    name: string;
    status: 'loading' | 'ready' | 'error';
    schema?: OrbitalSchema;
    graphView: {
        version: string;
    };
}
export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: number;
    read?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    autoDismiss?: boolean;
    dismissAfter?: number;
}
export interface NotificationsState {
    notifications: Notification[];
    isPanelOpen: boolean;
    closePanel: () => void;
    dismissNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}
export interface ErrorToast {
    message: string;
}
export interface UsePreviewResult {
    previewUrl: string | null;
    isLoading: boolean;
    error: string | null;
    loadError: string | null;
    app: PreviewApp | null;
    isFullscreen: boolean;
    isExecutingEvent: boolean;
    errorToast: ErrorToast | null;
    currentStateName: string | null;
    notifications: NotificationsState;
    startPreview: () => Promise<void>;
    stopPreview: () => Promise<void>;
    refresh: () => Promise<void>;
    handleRefresh: () => Promise<void>;
    handleReset: () => Promise<void>;
    toggleFullscreen: () => void;
    setErrorToast: (toast: ErrorToast | null) => void;
    dismissErrorToast: () => void;
}
export interface UsePreviewOptions {
    appId?: string;
}
export declare function usePreview(options?: UsePreviewOptions): UsePreviewResult;
