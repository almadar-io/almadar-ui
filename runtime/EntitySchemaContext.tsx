/**
 * EntitySchemaContext
 *
 * Minimal context providing entity schema definitions (field metadata).
 * This is NOT a data store - data comes from FetchedDataContext via server.
 *
 * Replaces EntityStore's schema functionality without the mock data generation.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { ResolvedEntity } from '@almadar/core';

// ============================================================================
// Types
// ============================================================================

export interface EntitySchemaContextValue {
    /** Entity definitions (schema metadata only) */
    entities: Map<string, ResolvedEntity>;
}

// ============================================================================
// Context
// ============================================================================

const EntitySchemaContext = createContext<EntitySchemaContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface EntitySchemaProviderProps {
    /** Entity definitions from resolved schema */
    entities: ResolvedEntity[];
    /** Children */
    children: React.ReactNode;
}

/**
 * Provides entity schema definitions to the component tree.
 *
 * This is a lightweight provider that only holds schema metadata (field definitions).
 * Actual entity data comes from FetchedDataContext via server responses.
 */
export function EntitySchemaProvider({
    entities,
    children,
}: EntitySchemaProviderProps): React.ReactElement {
    // Build entities map from array
    const entitiesMap = useMemo(() => {
        const map = new Map<string, ResolvedEntity>();
        for (const entity of entities) {
            map.set(entity.name, entity);
        }
        return map;
    }, [entities]);

    const contextValue = useMemo<EntitySchemaContextValue>(
        () => ({
            entities: entitiesMap,
        }),
        [entitiesMap]
    );

    return (
        <EntitySchemaContext.Provider value={contextValue}>
            {children}
        </EntitySchemaContext.Provider>
    );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access entity schema definitions.
 * Use this for field metadata (form building, filter enrichment).
 * For actual data, use useFetchedDataContext.
 */
export function useEntitySchema(): EntitySchemaContextValue {
    const context = useContext(EntitySchemaContext);
    if (!context) {
        throw new Error('useEntitySchema must be used within an EntitySchemaProvider');
    }
    return context;
}

/**
 * Get a specific entity's schema definition.
 */
export function useEntityDefinition(entityName: string): ResolvedEntity | undefined {
    const { entities } = useEntitySchema();
    return entities.get(entityName);
}

/**
 * Safe version of useEntitySchema that returns null when no provider is present.
 * Used by UISlotRenderer which may render outside an EntitySchemaProvider (compiled mode).
 */
export function useEntitySchemaOptional(): EntitySchemaContextValue | null {
    return useContext(EntitySchemaContext);
}

export default EntitySchemaProvider;
