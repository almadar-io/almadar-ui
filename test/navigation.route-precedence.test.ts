/**
 * Route resolution precedence — static segments outrank `:param` siblings.
 *
 * `findPageByPath` used to be a flat first-match over declaration order, so a
 * `/listings/:id` page declared before `/listings/moderation` swallowed its
 * static sibling (recorded as R-ROUTE-MATCH-FLAT-FIRST-MATCH-NO-STATIC-PRECEDENCE
 * in `docs/Almadar_Runtime_Gaps.md`). `matchPathAmong` is the single resolver
 * both `findPageByPath` and `OrbPreview`'s navigate/mount paths go through, so
 * these cases pin the shared behaviour.
 */
import { describe, it, expect } from 'vitest';
import type { OrbitalSchema } from '@almadar/core';
import {
  comparePathSpecificity,
  findPageByPath,
  matchPathAmong,
} from '../providers/navigation';

const pageEntry = (path: string, name: string) => ({ page: { name, path } });

describe('comparePathSpecificity', () => {
  it('ranks a static segment ahead of a param at the same position', () => {
    expect(comparePathSpecificity('/listings/moderation', '/listings/:id')).toBeLessThan(0);
    expect(comparePathSpecificity('/listings/:id', '/listings/moderation')).toBeGreaterThan(0);
  });

  it('ties patterns that agree in kind, leaving declaration order to decide', () => {
    expect(comparePathSpecificity('/listings/:id', '/orders/:id')).toBe(0);
    expect(comparePathSpecificity('/a/b', '/c/d')).toBe(0);
  });

  it('decides on the first disagreeing segment', () => {
    expect(comparePathSpecificity('/x/:a/y', '/:b/c/y')).toBeLessThan(0);
  });
});

describe('matchPathAmong', () => {
  const candidates = [
    pageEntry('/listings/:id', 'ListingDetailPage'),
    pageEntry('/listings/moderation', 'ModerationPage'),
    pageEntry('/listings', 'ListingsPage'),
  ];
  const resolve = (path: string) =>
    matchPathAmong(candidates, path, (entry) => entry.page.path);

  it('prefers the static sibling even though the param route is declared first', () => {
    expect(resolve('/listings/moderation')?.candidate.page.name).toBe('ModerationPage');
  });

  it('still routes a concrete id to the param page, with params extracted', () => {
    const hit = resolve('/listings/abc-123');
    expect(hit?.candidate.page.name).toBe('ListingDetailPage');
    expect(hit?.params).toEqual({ id: 'abc-123' });
  });

  it('returns null when nothing matches', () => {
    expect(resolve('/nope/at/all')).toBeNull();
  });

  it('leaves the caller array untouched (declaration order is still theirs)', () => {
    const order = candidates.map((c) => c.page.name);
    resolve('/listings/moderation');
    expect(candidates.map((c) => c.page.name)).toEqual(order);
  });
});

describe('findPageByPath', () => {
  const schema = {
    name: 'fixture',
    orbitals: [
      {
        name: 'ListingOrbital',
        pages: [
          { name: 'ListingDetailPage', path: '/listings/:id', traits: [] },
          { name: 'ModerationPage', path: '/listings/moderation', traits: [] },
        ],
      },
    ],
  } as unknown as OrbitalSchema;

  it('resolves the static route the param route used to shadow', () => {
    const hit = findPageByPath(schema, '/listings/moderation');
    expect(hit?.page.name).toBe('ModerationPage');
    expect(hit?.params).toEqual({});
    expect(hit?.orbitalName).toBe('ListingOrbital');
  });

  it('resolves a concrete id to the param route with its params', () => {
    const hit = findPageByPath(schema, '/listings/xyz');
    expect(hit?.page.name).toBe('ListingDetailPage');
    expect(hit?.params).toEqual({ id: 'xyz' });
  });
});
