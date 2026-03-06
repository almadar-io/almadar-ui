/**
 * Base template types for Almadar UI.
 *
 * All templates MUST extend `TemplateProps<E>` to enforce entity-only data flow
 * and JSON round-trip compatibility with the flattener pipeline.
 *
 * The compiler passes `entity` as `E[]` (array from data store), so
 * TemplateProps accepts the same union as EntityDisplayProps.
 *
 * @see docs/Almadar_Templates.md
 */

/** Base props for all templates — enforces entity-only data flow. */
export interface TemplateProps<E extends { id: string } = { id: string }> {
    /** Entity data — single object, array from compiler, or string entity name */
    entity?: string | E | readonly E[];
    /** External styling override */
    className?: string;
}
