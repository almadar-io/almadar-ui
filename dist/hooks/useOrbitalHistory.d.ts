import type { OrbitalSchema } from '@almadar/core';
export interface ChangeSummary {
    added: number;
    modified: number;
    removed: number;
}
export interface HistoryTimelineItem {
    id: string;
    type: 'changeset' | 'snapshot';
    version: number;
    timestamp: number;
    description: string;
    source?: string;
    summary?: ChangeSummary;
    reason?: string;
}
export interface RevertResult {
    success: boolean;
    error?: string;
    restoredSchema?: OrbitalSchema;
}
export interface UseOrbitalHistoryOptions {
    appId: string | null;
    /** Firebase auth token for authenticated API requests */
    authToken?: string | null;
    /** User ID for x-user-id header (required for Firestore path) */
    userId?: string | null;
    onHistoryChange?: (timeline: HistoryTimelineItem[]) => void;
    onRevertSuccess?: (restoredSchema: OrbitalSchema) => void;
}
export interface UseOrbitalHistoryResult {
    timeline: HistoryTimelineItem[];
    currentVersion: number;
    isLoading: boolean;
    error: string | null;
    revertToSnapshot: (snapshotId: string) => Promise<RevertResult>;
    refresh: () => Promise<void>;
}
export declare function useOrbitalHistory(options: UseOrbitalHistoryOptions): UseOrbitalHistoryResult;
