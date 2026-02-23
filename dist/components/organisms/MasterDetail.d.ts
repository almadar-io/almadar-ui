/**
 * MasterDetail Component
 *
 * A layout pattern that shows a list/table of entities.
 * This is a thin wrapper around DataTable that accepts master-detail specific props.
 *
 * When `entity` prop is provided without `data`, automatically fetches data
 * using the useEntityList hook.
 *
 * The "detail" part is typically rendered separately via another render_ui effect
 * to a sidebar or detail panel when an item is selected.
 */
import React from 'react';
export interface MasterDetailProps<T extends {
    id: string | number;
} = {
    id: string | number;
}> {
    /** Entity type name - when provided without data, auto-fetches from API */
    entity?: string;
    /** Fields to show in the master list (maps to DataTable columns) */
    masterFields?: readonly string[];
    /** Fields for detail view (passed through but typically handled by separate render_ui) */
    detailFields?: readonly string[];
    /** Data array - if not provided and entity is set, data is auto-fetched */
    data?: readonly T[] | T[];
    /** Loading state */
    loading?: boolean;
    /** Loading state alias */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional class name */
    className?: string;
}
export declare function MasterDetail<T extends {
    id: string | number;
}>({ entity, masterFields, detailFields: _detailFields, // Captured but not used here - detail handled separately
data: externalData, loading: externalLoading, isLoading: externalIsLoading, error: externalError, className, ...rest }: MasterDetailProps<T>): React.ReactElement;
export declare namespace MasterDetail {
    var displayName: string;
}
export default MasterDetail;
