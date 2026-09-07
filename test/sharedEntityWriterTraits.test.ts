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
import type { ResolvedTrait, ResolvedTraitBinding, ResolvedTraitTick, EventPayload, EffectTrace } from '@almadar/core';
import { createEmptyResolvedTrait } from '@almadar/core';
import type { TraitState, ServerEffectResult } from '@almadar/runtime';
import {
    effectsCallOp,
    createSharedEntityWriter,
    overlayServerEffectResults,
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

    // R-CLIENT-TICK-WRITER-CONFIG-DROPS-RESOLVED-LAYER: page-level bindings
    // arrive as bare `{ ref, refId }` with NO config, so a writer built from
    // declared defaults + raw call-site only ran every tick on the atom's
    // declared defaults — a y-up board overriding `gravity: -24` got the
    // default +24 and bodies fell UP in the browser while the server path
    // (which merges the same map) ran correctly.
    it('merges the traitConfigsByName layer when the binding carries no config', () => {
        const trait = traitWithTick('Writer', {
            effects: [['set', '@entity.g', '@config.gravity']],
        });
        trait.config = { gravity: { type: 'number', default: 24 } } as ResolvedTrait['config'];
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {}, { Writer: { gravity: -24 } });

        expect(writer({})).toEqual([{ field: 'g', value: -24 }]);
    });

    it('falls back to the declared default when neither layer carries a value', () => {
        const trait = traitWithTick('Writer', {
            effects: [['set', '@entity.g', '@config.gravity']],
        });
        trait.config = { gravity: { type: 'number', default: 24 } } as ResolvedTrait['config'];
        const binding = bindingFor(trait, 'Shared');
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {});

        expect(writer({})).toEqual([{ field: 'g', value: 24 }]);
    });

    it('an un-chained @config forward in the raw call-site cannot clobber the resolved layer', () => {
        const trait = traitWithTick('Writer', {
            effects: [['set', '@entity.g', '@config.gravity']],
        });
        trait.config = { gravity: { type: 'number', default: 24 } } as ResolvedTrait['config'];
        const binding: ResolvedTraitBinding = { trait, linkedEntity: 'Shared', config: { gravity: '@config.gravity' } };
        const traitStatesRef = traitStatesRefWith({ Writer: 'active' });
        const writer = createSharedEntityWriter(binding, trait.ticks[0], traitStatesRef, () => {}, { Writer: { gravity: -24 } });

        expect(writer({})).toEqual([{ field: 'g', value: -24 }]);
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

describe('overlayServerEffectResults — the executor\'s real outcome onto recordTransition\'s trace (C1-V7)', () => {
    // `processEventQueued` builds `reconstructedEffectTraces` from the
    // transition's declared SExprs (status hard-coded 'executed', no
    // action/resultId/outcome — see useTraitStateMachine.ts). This is
    // exactly that reconstruction for a `(persist create ApprovalRequest
    // {...})` effect; `overlayServerEffectResults` is the function that
    // then feeds the merged array to `recordTransition`.
    function reconstructedPersistTrace(entityName: string): EffectTrace {
        return { type: 'persist', entityName, args: ['create', entityName, {}], status: 'executed' };
    }

    it('a successful persist create carries action/resultId/outcome from the offline-preview handler', () => {
        const traces = [reconstructedPersistTrace('ApprovalRequest')];
        // Shape `createServerEffectHandlers`'s `record()` actually pushes on
        // a successful create (ServerEffectHandlers.ts persist case).
        const serverResults: ServerEffectResult[] = [{
            effect: 'persist',
            action: 'create',
            entityType: 'ApprovalRequest',
            data: { id: 'req_1', title: 'Invite Sam' },
            success: true,
        }];

        const merged = overlayServerEffectResults(traces, serverResults);

        expect(merged).toEqual([{
            type: 'persist',
            entityName: 'ApprovalRequest',
            args: ['create', 'ApprovalRequest', {}],
            action: 'create',
            resultId: 'req_1',
            outcome: 'success',
            status: 'executed',
        }]);
    });

    it('a denied persist reports outcome:"denied" and status:"failed", not the reconstructed "executed"', () => {
        const traces = [reconstructedPersistTrace('LeaveRequest')];
        const serverResults: ServerEffectResult[] = [{
            effect: 'persist',
            action: 'update',
            entityType: 'LeaveRequest',
            success: false,
            denied: true,
            error: 'persist update LeaveRequest resolved no row key',
        }];

        const merged = overlayServerEffectResults(traces, serverResults);

        expect(merged[0]).toMatchObject({
            outcome: 'denied',
            status: 'failed',
            error: 'persist update LeaveRequest resolved no row key',
        });
        expect(merged[0].resultId).toBeUndefined();
    });

    it('a non-denied failure (thrown store error) reports outcome:"failed"', () => {
        const traces = [reconstructedPersistTrace('Asset')];
        const serverResults: ServerEffectResult[] = [{
            effect: 'persist',
            action: 'delete',
            entityType: 'Asset',
            success: false,
            error: 'store unavailable',
        }];

        const merged = overlayServerEffectResults(traces, serverResults);

        expect(merged[0].outcome).toBe('failed');
        expect(merged[0].status).toBe('failed');
    });

    it('no server results (in-memory [runtime] tick, or a non-persistence trait) returns the traces untouched', () => {
        const traces = [reconstructedPersistTrace('X')];

        const merged = overlayServerEffectResults(traces, []);

        expect(merged).toBe(traces);
        expect(merged[0].outcome).toBeUndefined();
    });

    it('two persists in one transition realign in dispatch order, and an emit trace passes through', () => {
        const traces: EffectTrace[] = [
            reconstructedPersistTrace('ApprovalRequest'),
            { type: 'emit', args: ['APPROVAL_REQUESTED'], status: 'executed' },
            reconstructedPersistTrace('AuditLog'),
        ];
        const serverResults: ServerEffectResult[] = [
            { effect: 'persist', action: 'create', entityType: 'ApprovalRequest', data: { id: 'ar_1' }, success: true },
            { effect: 'persist', action: 'create', entityType: 'AuditLog', data: { id: 'log_1' }, success: true },
        ];

        const merged = overlayServerEffectResults(traces, serverResults);

        expect(merged[0]).toMatchObject({ entityName: 'ApprovalRequest', resultId: 'ar_1', outcome: 'success' });
        expect(merged[1]).toEqual({ type: 'emit', args: ['APPROVAL_REQUESTED'], status: 'executed' });
        expect(merged[2]).toMatchObject({ entityName: 'AuditLog', resultId: 'log_1', outcome: 'success' });
    });
});
