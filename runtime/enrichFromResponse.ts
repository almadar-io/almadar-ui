/**
 * enrichFromResponse
 *
 * Walks a pattern tree from a server response and injects entity data
 * into entity-aware patterns. Uses isEntityAwarePattern() from
 * @almadar/patterns (registry-driven, not a hardcoded list).
 *
 * This is the single place where entity data meets UI patterns.
 * Called by ServerBridge/ServerBridgeProvider when processing
 * clientEffects from the server response.
 *
 * @packageDocumentation
 */

import { isEntityAwarePattern } from '@almadar/patterns';

/**
 * Enrich a pattern tree with entity data from a server response.
 *
 * @param node - Pattern config node (from server clientEffects)
 * @param data - Entity records keyed by entity name (from server response.data)
 * @returns Enriched pattern with entity arrays injected
 */
export function enrichFromResponse(
  node: Record<string, unknown> | null | undefined,
  data: Record<string, unknown[]>,
): Record<string, unknown> | null {
  if (!node || typeof node !== 'object') return null;
  let enriched = node;

  // Recurse children first
  if (Array.isArray(enriched.children)) {
    enriched = {
      ...enriched,
      children: (enriched.children as unknown[]).map(
        (child) => {
          if (!child || typeof child !== 'object') return child;
          return enrichFromResponse(child as Record<string, unknown>, data);
        },
      ),
    };
  }

  // Enrich entity-aware patterns (registry-driven via isEntityAwarePattern)
  const nodeType = enriched.type as string | undefined;
  if (nodeType && isEntityAwarePattern(nodeType) && typeof enriched.entity === 'string') {
    const entityName = enriched.entity;
    const records = data[entityName];
    if (records && records.length > 0) {
      enriched = { ...enriched, entity: records };

      // Auto-generate fields from first record if not specified
      if (!enriched.fields && !enriched.columns) {
        const sample = records[0] as Record<string, unknown>;
        if (sample && typeof sample === 'object') {
          const keys = Object.keys(sample).filter((k) => k !== 'id' && k !== '_id');
          enriched = {
            ...enriched,
            fields: keys.map((k, i) => ({ name: k, variant: i === 0 ? 'h4' : 'body' })),
            children: undefined,
          };
        }
      }
    }
  }

  return enriched;
}
