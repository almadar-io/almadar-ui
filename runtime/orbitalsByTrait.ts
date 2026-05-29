/**
 * Build the `trait name → owning orbital` map used to form the qualified
 * `UI:<orbital>.<trait>.<event>` bus keys that trait state machines subscribe
 * to. Pure + dependency-free so it can be unit-tested without a React render.
 *
 * Critically, it backfills from the RESOLVED page bindings, not just the source
 * `schema.orbitals[].traits`. An auto-pulled sibling trait (e.g. an embedded
 * `@trait.X` calendar lifted into the orbital by the compiler's sibling-pull)
 * is absent from the source orbital's `traits[]`, so a source-only map misses
 * it — leaving its self-subscription unregistered and its own fetch-success
 * (e.g. `CalendarEventLoaded`) unheard, so the trait sticks in `loading`. A
 * pulled sibling lands in the same orbital as the page that references it, so
 * we backfill from the resolved page's owning orbital. Source-declared mappings
 * win; the IR only fills gaps.
 */

export interface OrbitalsByTraitSchema {
  orbitals?: ReadonlyArray<{
    name: string;
    traits?: ReadonlyArray<string | { ref?: string; name?: string }>;
    pages?: ReadonlyArray<string | { path?: string }>;
  }>;
}

export interface ResolvedPageTraits {
  /** Page route path, matched against the source orbital's page paths. */
  path?: string;
  /** Resolved trait names mounted on the page (includes pulled siblings). */
  traitNames: readonly string[];
}

export function buildOrbitalsByTrait(
  schema: OrbitalsByTraitSchema | undefined,
  resolvedPages: ReadonlyArray<ResolvedPageTraits> = [],
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!schema?.orbitals) return map;

  const pagePathToOrbital: Record<string, string> = {};
  for (const orb of schema.orbitals) {
    for (const traitRef of orb.traits ?? []) {
      let traitName: string | undefined;
      if (typeof traitRef === 'string') {
        const parts = traitRef.split('.');
        traitName = parts[parts.length - 1];
      } else if (typeof traitRef.ref === 'string') {
        const parts = traitRef.ref.split('.');
        traitName = traitRef.name ?? parts[parts.length - 1];
      } else if (typeof traitRef.name === 'string') {
        traitName = traitRef.name;
      }
      if (traitName) map[traitName] = orb.name;
    }
    for (const pg of orb.pages ?? []) {
      const path = typeof pg === 'string' ? pg : pg?.path;
      if (path) pagePathToOrbital[path] = orb.name;
    }
  }

  for (const page of resolvedPages) {
    const orbital = page.path ? pagePathToOrbital[page.path] : undefined;
    if (!orbital) continue;
    for (const traitName of page.traitNames) {
      if (traitName && !(traitName in map)) map[traitName] = orbital;
    }
  }

  return map;
}
