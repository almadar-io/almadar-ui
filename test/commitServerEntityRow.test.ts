/**
 * commitServerEntityRow — G-RUNTIME-026 / G-RUNTIME-027 regression tests.
 *
 * A stateless server's post-effects entity row (`OrbitalEventResponse
 * entityByTrait`) is authoritative for EVERY mounted trait bound to the same
 * linked entity — the server keeps one row per linked entity
 * (`sharedPersistence`). Before the fix the row was written only to the
 * committing trait's live per-trait map, which no render binding ever read
 * (empty sibling charts, one empty table row).
 */

import { describe, it, expect } from 'vitest';
import type { EntityRow } from '@almadar/core';
import { commitServerEntityRow } from '../hooks/useTraitStateMachine';
import { createSharedEntityStore } from '../hooks/useSharedEntityStore';

type PublishCall = { traitName: string; entity: EntityRow };

function setup(options: {
    sharedKeys?: ReadonlyMap<string, string>;
    siblings?: ReadonlyMap<string, readonly string[]>;
} = {}) {
    const store = createSharedEntityStore();
    const traitFieldStates = new Map<string, EntityRow>();
    const published: PublishCall[] = [];
    const publishRow = (traitName: string, entity: EntityRow) => {
        published.push({ traitName, entity });
    };
    const commit = (traitName: string, entity: EntityRow) =>
        commitServerEntityRow(
            traitFieldStates,
            options.sharedKeys ?? new Map(),
            store,
            options.siblings ?? new Map(),
            publishRow,
            traitName,
            entity,
        );
    return { store, traitFieldStates, published, publishRow, commit };
}

describe('commitServerEntityRow', () => {
    it('publishes the server row to the render surface of the committing trait', () => {
        const { commit, traitFieldStates, published } = setup();
        const row: EntityRow = { points: [{ label: '2026-10', value: 1551 }] };

        commit('MonthlyRevenueChart', row);

        expect(traitFieldStates.get('MonthlyRevenueChart')).toEqual(row);
        expect(published).toEqual([{ traitName: 'MonthlyRevenueChart', entity: row }]);
    });

    it('broadcasts the server row to every mounted trait sharing the same linkedEntity (G-RUNTIME-026)', () => {
        const siblings = new Map<string, readonly string[]>([
            ['MonthlyRevenueChart', ['MonthlyRevenueChart', 'InlineLineChartRender9']],
            ['InlineLineChartRender9', ['MonthlyRevenueChart', 'InlineLineChartRender9']],
        ]);
        const { commit, published } = setup({ siblings });
        const row: EntityRow = { points: [{ label: '2026-10', value: 1551 }] };

        commit('MonthlyRevenueChart', row);

        expect(published.map((p) => p.traitName)).toEqual(['MonthlyRevenueChart', 'InlineLineChartRender9']);
        expect(published[1].entity).toEqual(row);
    });

    it('a trait with no linkedEntity siblings publishes only to itself', () => {
        const { commit, published } = setup();
        commit('SoloTrait', { status: 'done' });

        expect(published.map((p) => p.traitName)).toEqual(['SoloTrait']);
    });

    it('a [shared]-entity participant ALSO commits to the shared store (existing path, unchanged)', () => {
        const sharedKeys = new Map<string, string>([
            ['BoardWriter', 'Orbital::Board'],
            ['BoardRenderer', 'Orbital::Board'],
        ]);
        const store = createSharedEntityStore();
        store.seed('Orbital::Board', { tiles: [] });
        let notifyCount = 0;
        store.subscribe('Orbital::Board', () => { notifyCount++; });
        const traitFieldStates = new Map<string, EntityRow>();
        const published: PublishCall[] = [];
        const row: EntityRow = { tiles: [{ x: 1 }] };

        commitServerEntityRow(
            traitFieldStates,
            sharedKeys,
            store,
            new Map(),
            (t, e) => { published.push({ traitName: t, entity: e }); },
            'BoardWriter',
            row,
        );

        // Shared store sees the merged row and notifies exactly once…
        expect(store.getSnapshot('Orbital::Board')).toEqual({ tiles: [{ x: 1 }] });
        expect(notifyCount).toBe(1);
        // …AND the render surface still gets its own publish.
        expect(published.map((p) => p.traitName)).toEqual(['BoardWriter']);
    });
});
