/**
 * Shared-entity writer/render trait folding — unit tests for the pure pieces
 * `useTraitStateMachine` wires the Phase-5 shared-entity primitive through:
 * classification (`effectsCallOp`), the synchronous per-tick writer
 * (`createSharedEntityWriter`), and folding several writer traits' ticks
 * into one merged `runTickFrame` commit in binding order.
 *
 * No React harness exists for mounting `useTraitStateMachine` itself (see
 * `dashboard-cross-trait.test.ts` for the same testing shape: exercise the
 * exported pure pieces directly rather than mounting the hook).
 */

import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import type { ResolvedTrait, ResolvedTraitBinding, ResolvedTraitTick, EventPayload } from '@almadar/core';
import { createEmptyResolvedTrait } from '@almadar/core';
import type { TraitState } from '@almadar/runtime';
import {
    effectsCallOp,
    createSharedEntityWriter,
    SHARED_ENTITY_WRITE_OPS,
    SHARED_ENTITY_RENDER_OPS,
} from '../hooks/useTraitStateMachine';
import { createSharedEntityStore, runTickFrame } from '../hooks/useSharedEntityStore';

function traitWithTick(name: string, tick: Partial<ResolvedTraitTick> & Pick<ResolvedTraitTick, 'effects'>): ResolvedTrait {
    const trait = createEmptyResolvedTrait(name, 'schema');
    trait.ticks = [{
        name: `${name}Tick`,
        interval: 'frame',
        priority: 0,
        appliesTo: [],
        ...tick,
    }];
    return trait;
}

function bindingFor(trait: ResolvedTrait, linkedEntity: string): ResolvedTraitBinding {
    return { trait, linkedEntity };
}

function traitStatesRefWith(entries: Record<string, string>) {
    const ref = createRef<Map<string, TraitState>>();
    const map = new Map<string, TraitState>();
    for (const [traitName, currentState] of Object.entries(entries)) {
        map.set(traitName, { traitName, currentState, previousState: null, lastEvent: null, context: {} });
    }
    (ref as { current: Map<string, TraitState> }).current = map;
    return ref as { current: Map<string, TraitState> };
}

describe('effectsCallOp — deterministic structural classification', () => {
    it('finds a nested `set` inside `do`/`if`/`let` wrappers', () => {
        const effects = [
            ['let', [['delta', 1]], ['do', ['if', true, ['set', '@entity.x', ['+', '@entity.x', '@delta']]]]],
        ];
        expect(effectsCallOp(effects, SHARED_ENTITY_WRITE_OPS)).toBe(true);
        expect(effectsCallOp(effects, SHARED_ENTITY_RENDER_OPS)).toBe(false);
    });

    it('finds `render-ui` and does not mistake it for a writer', () => {
        const effects = [['render-ui', 'main', { x: '@entity.x' }]];
        expect(effectsCallOp(effects, SHARED_ENTITY_RENDER_OPS)).toBe(true);
        expect(effectsCallOp(effects, SHARED_ENTITY_WRITE_OPS)).toBe(false);
    });

    it('a trait with neither op classifies as neither', () => {
        const effects = [['emit', 'SOMETHING']];
        expect(effectsCallOp(effects, SHARED_ENTITY_WRITE_OPS)).toBe(false);
        expect(effectsCallOp(effects, SHARED_ENTITY_RENDER_OPS)).toBe(false);
    });
});

describe('createSharedEntityWriter — synchronous per-tick write capture', () => {
    it('captures every `set` in a multi-effect tick, not just the first', () => {
        // Regression guard: `@almadar/runtime`'s EffectExecutor is async
        // (`executeAll`'s for...of await), so a naive fire-and-forget call
        // would only guarantee the FIRST top-level effect lands before this
        // synchronous writer returns. `@almadar/evaluator`'s `executeEffects`
        // (what `createSharedEntityWriter` actually uses) is fully
        // synchronous, so BOTH sets below must be captured.
        const trait = traitWithTick('Writer', {
            effects: [['do', ['set', '@entity.x', 1], ['set', '@entity.y', 2]]],
        });
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {});

        const writes = writer({});

        expect(writes).toEqual([{ field: 'x', value: 1 }, { field: 'y', value: 2 }]);
    });

    it('a later expression in the same tick reads an earlier set in the same tick', () => {
        const trait = traitWithTick('Writer', {
            effects: [['do', ['set', '@entity.x', 5], ['set', '@entity.y', ['+', '@entity.x', 1]]]],
        });
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {});

        const writes = writer({});

        expect(writes).toEqual([{ field: 'x', value: 5 }, { field: 'y', value: 6 }]);
    });

    it('appliesTo gates the writer — no writes when the trait is outside the declared states', () => {
        const trait = traitWithTick('Writer', {
            effects: [['set', '@entity.x', 1]],
            appliesTo: ['active'],
        });
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'idle' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {});

        expect(writer({})).toEqual([]);
    });

    it('a failing guard blocks the writer — no writes', () => {
        const trait = traitWithTick('Writer', {
            effects: [['set', '@entity.x', 1]],
            guard: ['=', '@entity.result', 'none'],
        });
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {});

        expect(writer({ result: 'done' })).toEqual([]);
    });
});

describe('runTickFrame + createSharedEntityWriter — several writer traits, one merged commit', () => {
    it('folds two writer traits bound to the same entity in binding order, one commit', () => {
        const writerA = traitWithTick('WriterA', { effects: [['set', '@entity.x', ['+', '@entity.x', 1]]] });
        const writerB = traitWithTick('WriterB', { effects: [['set', '@entity.fx', 0.5]] });
        const bindingA = bindingFor(writerA, 'Shared');
        const bindingB = bindingFor(writerB, 'Shared');
        const traitStatesRef = traitStatesRefWith({ WriterA: 'active', WriterB: 'active' });

        const store = createSharedEntityStore();
        store.commit('Orbital::Shared', { x: 10 });

        let notifyCount = 0;
        store.subscribe('Orbital::Shared', () => { notifyCount++; });

        const writers = [
            createSharedEntityWriter(bindingA, writerA.ticks[0], traitStatesRef, () => {}),
            createSharedEntityWriter(bindingB, writerB.ticks[0], traitStatesRef, () => {}),
        ];
        const merged = runTickFrame('Orbital::Shared', writers, store);

        expect(merged).toEqual({ x: 11, fx: 0.5 });
        expect(store.getSnapshot('Orbital::Shared')).toEqual({ x: 11, fx: 0.5 });
        expect(notifyCount).toBe(1);
    });

    it('emits through the supplied emit callback without affecting the merged writes', () => {
        const emitted: Array<{ event: string; payload?: EventPayload }> = [];
        const writer = traitWithTick('Writer', {
            effects: [['do', ['set', '@entity.x', 1], ['emit', 'ADVANCED']]],
        });
        const binding = bindingFor(writer, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const store = createSharedEntityStore();

        const fn = createSharedEntityWriter(binding, writer.ticks[0], traitStatesRef, (event, payload) => {
            emitted.push({ event, payload });
        });
        const merged = runTickFrame('Orbital::Shared', [fn], store);

        expect(merged).toEqual({ x: 1 });
        expect(emitted).toEqual([{ event: 'ADVANCED', payload: undefined }]);
    });
});
