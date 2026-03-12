/**
 * useResolvedSchema Hook
 *
 * Resolves OrbitalSchema to IR for the OrbitalRuntime.
 * Uses the shared resolver to ensure consistency with the compiler.
 *
 * TRAIT-DRIVEN ARCHITECTURE:
 * - Pages have traits, NOT sections
 * - UI is produced by trait effects (render_ui)
 * - No backwards compatibility with legacy formats
 *
 * @packageDocumentation
 */

import { useState, useEffect, useMemo } from 'react';
import type { OrbitalSchema } from '@almadar/core';

// Import shared resolver and types from main orbital export
import {
    schemaToIR as sharedSchemaToIR,
    clearSchemaCache as sharedClearSchemaCache,
    getPage,
} from '@almadar/core';

import type {
    ResolvedIR,
    ResolvedPage,
    ResolvedTrait,
    ResolvedEntity,
    ResolvedTraitBinding,
} from './types';

export interface ResolvedSchemaResult {
    /** The resolved page (or undefined if not found) */
    page: ResolvedPage | undefined;
    /** Trait bindings for this page */
    traits: ResolvedTraitBinding[];
    /** Entities used by this page */
    entities: Map<string, ResolvedEntity>;
    /** All entities from schema */
    allEntities: Map<string, ResolvedEntity>;
    /** All resolved traits */
    allTraits: Map<string, ResolvedTrait>;
    /** Loading state */
    loading: boolean;
    /** Error message if resolution failed */
    error: string | null;
    /** Full IR (for debugging) */
    ir: ResolvedIR | null;
}

/**
 * Hook to resolve an OrbitalSchema to IR.
 *
 * @param schema - The OrbitalSchema to resolve
 * @param pageName - Optional page name (defaults to first page or initial page)
 * @returns Resolved schema data including page, traits, and entities
 */
export function useResolvedSchema(
    schema: OrbitalSchema | null | undefined,
    pageName?: string
): ResolvedSchemaResult {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve schema synchronously using shared resolver
    const ir = useMemo<ResolvedIR | null>(() => {
        if (!schema) return null;
        try {
            return sharedSchemaToIR(schema);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Schema resolution failed');
            return null;
        }
    }, [schema]);

    useEffect(() => {
        setLoading(false);
    }, [ir]);

    // Derive page, traits, and entities from IR
    const result = useMemo<ResolvedSchemaResult>(() => {
        if (!ir) {
            return {
                page: undefined,
                traits: [],
                entities: new Map(),
                allEntities: new Map(),
                allTraits: new Map(),
                loading,
                error: error || (schema ? null : 'No schema provided'),
                ir: null,
            };
        }

        // Find the requested page using shared helper
        const page = getPage(ir, pageName);

        console.log('[useResolvedSchema] Resolved page:', page?.name, '| path:', page?.path, '| traits:', page?.traits.length);

        // Get trait bindings for this page
        const traits = page?.traits || [];

        // Collect entities
        const entities = new Map<string, ResolvedEntity>();
        if (page) {
            for (const binding of page.entityBindings) {
                entities.set(binding.entity.name, binding.entity);
            }
        }

        return {
            page,
            traits,
            entities,
            allEntities: ir.entities,
            allTraits: ir.traits,
            loading,
            error,
            ir,
        };
    }, [ir, pageName, loading, error, schema]);

    return result;
}

/**
 * Clear the schema resolution cache
 */
export function clearSchemaCache(): void {
    sharedClearSchemaCache();
}
