/**
 * Pattern Resolver
 *
 * Resolves pattern configurations to component information.
 * Uses the central pattern registry and component mapping from orbital-shared/patterns/.
 *
 * This is the shared logic used by both Builder's PatternRenderer and
 * the compiled shell's UISlotRenderer.
 *
 * @packageDocumentation
 */
import type { PatternConfig, ResolvedPattern } from './types';
/**
 * Component mapping entry from component-mapping.json
 */
interface ComponentMappingEntry {
    component: string;
    importPath: string;
    category: string;
    deprecated?: boolean;
    replacedBy?: string;
}
/**
 * Pattern definition from registry.json
 */
interface PatternDefinition {
    type: string;
    category: string;
    description: string;
    propsSchema?: Record<string, {
        required?: boolean;
        types?: string[];
        description?: string;
    }>;
}
/**
 * Initialize the pattern resolver with mappings.
 * Called at app startup with data from JSON files.
 */
export declare function initializePatternResolver(config: {
    componentMapping: Record<string, ComponentMappingEntry>;
    patternRegistry: Record<string, PatternDefinition>;
}): void;
/**
 * Set component mapping (alternative to full initialization).
 */
export declare function setComponentMapping(mapping: Record<string, ComponentMappingEntry>): void;
/**
 * Set pattern registry (alternative to full initialization).
 */
export declare function setPatternRegistry(registry: Record<string, PatternDefinition>): void;
/**
 * Resolve a pattern configuration to component information.
 *
 * @param config - Pattern configuration from render-ui effect
 * @returns Resolved pattern with component name, import path, and validated props
 * @throws Error if pattern type is unknown
 *
 * @example
 * ```typescript
 * const resolved = resolvePattern({
 *   type: 'entity-table',
 *   entity: 'Task',
 *   columns: ['title', 'status']
 * });
 * // resolved.component === 'DataTable'
 * // resolved.importPath === '@/components/organisms/DataTable'
 * ```
 */
export declare function resolvePattern(config: PatternConfig): ResolvedPattern;
/**
 * Check if a pattern type is known.
 */
export declare function isKnownPattern(type: string): boolean;
/**
 * Get all known pattern types.
 */
export declare function getKnownPatterns(): string[];
/**
 * Get patterns by category.
 */
export declare function getPatternsByCategory(category: string): string[];
/**
 * Get the component mapping for a pattern type.
 */
export declare function getPatternMapping(type: string): ComponentMappingEntry | undefined;
/**
 * Get the pattern definition from the registry.
 */
export declare function getPatternDefinition(type: string): PatternDefinition | undefined;
export {};
