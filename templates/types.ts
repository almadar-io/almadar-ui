/**
 * Template Base Types
 *
 * All design system templates must extend TemplateProps<E> to ensure they are
 * compatible with the flattener pipeline (JSX → JSON → JSX).
 *
 * See docs/Almadar_Templates.md for the full template authoring guide.
 */

/**
 * Base props interface for all design system templates.
 *
 * Enforces that:
 * - All runtime data flows through the `entity` prop
 * - Entity must have at least an `id` field
 * - Templates are pure functions of their props (no hooks for data)
 *
 * @template E - The entity type this template renders
 *
 * @example
 * ```typescript
 * interface HeroEntity {
 *   id: string;
 *   name: string;
 *   level: number;
 * }
 *
 * interface HeroTemplateProps extends TemplateProps<HeroEntity> {
 *   scale?: number;
 * }
 *
 * function HeroTemplate({ entity, className }: HeroTemplateProps) {
 *   return <Typography text={entity.name} />;
 * }
 * ```
 */
export interface TemplateProps<E extends { id: string }> {
  /** Entity data — the sole source of runtime state */
  entity: E;

  /** External styling override */
  className?: string;
}
