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

    // Resolve schema synchronously using shared resolver, then enrich each
    // trait's listens entries with the `source` field that
    // @almadar/core's `schemaToIR` doesn't propagate (its
    // `ResolvedTraitListener` type predates the Phase-4 qualified-key
    // listen wiring). Without this enrichment, useTraitStateMachine's
    // `listen.source?.trait` lookup is always undefined and every
    // cross-trait `Source EVENT -> Trigger` declaration becomes a no-op.
    //
    // Match input → output by (event, triggers) position so two listens
    // on the same event name (e.g. ContactBrowse EDIT vs ContactView
    // EDIT) keep their distinct sources. Resolution preserves order and
    // count, so a per-trait sequential walk is enough; the
    // (event, triggers, occurrence) tuple disambiguates duplicates.
    const ir = useMemo<ResolvedIR | null>(() => {
        if (!schema) return null;
        try {
            const resolved = sharedSchemaToIR(schema);
            const sourceListsByTrait = new Map<string, Array<{ kind?: string; trait?: string; orbital?: string } | undefined>>();
            const orbitals = (schema as { orbitals?: Array<{ traits?: unknown[] }> }).orbitals;
            if (Array.isArray(orbitals)) {
                for (const orb of orbitals) {
                    const traits = (orb as { traits?: unknown[] }).traits;
                    if (!Array.isArray(traits)) continue;
                    for (const trait of traits) {
                        const t = trait as { name?: string; listens?: unknown };
                        if (typeof t.name !== 'string' || !Array.isArray(t.listens)) continue;
                        const sources = t.listens.map((listen) => {
                            const l = listen as { source?: { kind?: string; trait?: string; orbital?: string } };
                            return l.source;
                        });
                        sourceListsByTrait.set(t.name, sources);
                    }
                }
            }
            for (const [traitName, trait] of resolved.traits) {
                const sources = sourceListsByTrait.get(traitName);
                if (!sources) continue;
                trait.listens.forEach((listen, i) => {
                    const src = sources[i];
                    if (src !== undefined) {
                        (listen as { source?: { kind?: string; trait?: string; orbital?: string } }).source = src;
                    }
                });
            }
            return resolved;
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
