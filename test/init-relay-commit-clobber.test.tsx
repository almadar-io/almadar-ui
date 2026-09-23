/**
 * Cold-INIT listen-relay vs server-row commit ordering (project-friday
 * ExecutiveOverview "No data available" bug, 2026-09-22).
 *
 * The stateless server deliberately SKIPS on-page `listens` arms in its
 * cross-trait fan-out (`transition-handler.ts`: `if (onPageTraitNames.has(
 * listenerTraitName)) continue;`) — the client completes those arms via its
 * local relay: `ServerBridge.sendEvent` rebroadcasts the response's
 * `emittedEvents` on the qualified bus key, the `useTraitStateMachine`
 * listen subscription fires the trigger (`INVOICES_LOADED`), and the chart
 * trait's transition computes `set @entity.points` from `@payload.data`.
 *
 * The defect had two halves:
 *
 * 1. ORDERING: the rebroadcast ran synchronously inside the command pump's
 *    task (before its promise resolved), so the listen-relay's writes could
 *    land BEFORE OrbPreview's response continuation committed the response's
 *    `entityByTrait` rows — and the commit (a wholesale apply of rows the
 *    server built WITHOUT running the skipped arms, still carrying
 *    `points: []`) clobbered the relay's fresh writes. Fix: the bridge
 *    defers the rebroadcast one macrotask, so the caller's continuation
 *    (a microtask) always commits first; the relay's writes land ON TOP.
 *
 * 2. SIBLING VISIBILITY: the LineChart pattern is painted by the EMBEDDED
 *    render atom (`InlineLineChartRender9`), whose `data: @entity.points`
 *    marker resolves against the RENDER trait's OWN per-trait surface — not
 *    the chart trait's the relay wrote. The relay's write now fans out to
 *    every same-entity sibling's surface (and writes through to their live
 *    rows), mirroring the one-row-per-entity model the server keeps.
 *
 * These tests drive the REAL `ServerBridgeProvider` (fetch mocked with a
 * recorded INIT response from the live stateless server) plus the REAL
 * `useTraitStateMachine`, replay OrbPreview's INIT continuation verbatim,
 * and assert both traits' render surfaces (`entityBindingSource` — what
 * the LineChart's `@entity.points` binding resolves against).
 */
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { ServerBridgeProvider, useServerBridge, type ServerBridgeContextValue } from '../providers/ServerBridge';
import { EntitySchemaProvider } from '../providers/EntitySchemaContext';
import { UISlotProvider, useUISlots } from '../providers/UISlotContext';
import { useTraitStateMachine, type TraitStateMachineResult } from '../hooks/useTraitStateMachine';
import { asTraitId, createEmptyResolvedTrait, inferTsType, type OrbitalSchema, type ResolvedEntity, type ResolvedTraitBinding, type SExpr } from '@almadar/core';

const ORBITAL = 'ExecutiveOverviewOrbital';
const INVOICE_TRAIT = 'ExecutiveOverviewOrbitalExecInvoiceData';
const MONTHLY_CHART = 'ExecutiveOverviewOrbitalExecMonthlyRevenueChart';
const WEEKLY_CHART = 'ExecutiveOverviewOrbitalExecWeeklyRevenueChart';
// The inline render atom the monthly chart embeds via `render-ui main
// @trait.X`. Shares the chart's linkedEntity and renders the LineChart with
// `data: "@entity.points"` — resolved against ITS OWN per-trait surface at
// render time (the production cold-INIT bug: the relay wrote points on the
// chart trait's surface; this trait's surface only ever got the stale
// server row via the commit's sibling broadcast).
const MONTHLY_RENDER = 'ExecutiveOverviewOrbitalInlineLineChartRender9';

const ORBITALS_BY_TRAIT: Record<string, string> = {
    [INVOICE_TRAIT]: ORBITAL,
    [MONTHLY_CHART]: ORBITAL,
    [WEEKLY_CHART]: ORBITAL,
    [MONTHLY_RENDER]: ORBITAL,
};

/** Recorded from `POST localhost:4104/api/orbitals/ExecutiveOverviewOrbital/events`
 *  `{"event":"INIT","behavior":"project-friday"}` (2026-09-22), trimmed to the
 *  three traits under test. The server evaluated every active trait's INIT
 *  (discovery mode) but skipped the on-page listen arms — the chart rows
 *  still carry `points: []`, while `emittedEvents` carries the fully-stamped
 *  `ExecInvoicesLoaded` the client relay completes. */
const INIT_RESPONSE = {
    success: true,
    transitioned: true,
    states: {
        [INVOICE_TRAIT]: 'idle',
        [MONTHLY_CHART]: 'idle',
        [WEEKLY_CHART]: 'idle',
        [MONTHLY_RENDER]: 'idle',
    },
    emittedEvents: [
        {
            event: 'ExecInvoicesLoaded',
            payload: {
                data: [
                    { clientName: 'Acme Corp', project: 'Heath Keystone', department: 'Timber Summit', kind: 'retainer', amount: 408, status: 'draft', issuedAt: '2026-09-11', paidAt: '2026-10-03', id: 'ExecInvoice Id 1', createdAt: '2026-06-22T13:34:11.203Z', updatedAt: '2026-06-24T13:34:11.203Z' },
                    { clientName: 'Globex Inc', project: 'Canyon Lagoon', department: 'Aspen Inlet', kind: 'project', amount: 90, status: 'sent', id: 'ExecInvoice Id 2', createdAt: '2025-09-24T15:07:02.128Z', updatedAt: '2025-10-20T15:07:02.128Z' },
                    { clientName: 'Initech', project: 'Elm Cove', department: 'Grove Horizon', kind: 'retainer', amount: 500, status: 'paid', issuedAt: '2026-09-15', paidAt: '2026-10-05', id: 'ExecInvoice Id 3', createdAt: '2026-08-02T11:52:32.445Z', updatedAt: '2026-08-31T11:52:32.445Z' },
                    { clientName: 'Wayne Enterprises', project: 'Wharf Basalt', department: 'Atlas Summit', kind: 'project', amount: 488, status: 'overdue', id: 'ExecInvoice Id 4', createdAt: '2025-11-26T19:45:53.720Z', updatedAt: '2025-11-30T19:45:53.720Z' },
                    { clientName: 'Stark Industries', project: 'North Timber', department: 'Inlet Onyx', kind: 'retainer', amount: 643, status: 'draft', issuedAt: '2026-09-29', paidAt: '2026-10-07', id: 'ExecInvoice Id 5', createdAt: '2025-11-23T17:39:41.733Z', updatedAt: '2025-12-19T17:39:41.733Z' },
                    { clientName: 'Umbrella Corp', project: 'Indigo Zenith', department: 'Ember Terrace', kind: 'project', amount: 539, status: 'sent', id: 'ExecInvoice Id 6', createdAt: '2026-04-11T12:16:42.772Z', updatedAt: '2026-04-14T12:16:42.772Z' },
                ],
                totalCount: 6,
            },
            source: {
                orbital: ORBITAL,
                trait: INVOICE_TRAIT,
                transition: 'idle--INIT-->idle',
                orbitalId: 'orb_01M2JK33S2AHJQ9MSVFW0T1KPB',
                traitId: 'trt_XXGQ8QWPRGBC85K4HM0XV950E3',
                dispatched: true,
            },
        },
    ],
    effectResults: [],
    entityByTrait: {
        [INVOICE_TRAIT]: {},
        [MONTHLY_CHART]: { points: [], id: 'runtime', createdAt: '2026-06-22T13:51:40.739Z', updatedAt: '2026-06-24T13:51:40.739Z' },
        [WEEKLY_CHART]: { points: [], id: 'runtime', createdAt: '2026-06-22T13:51:40.739Z', updatedAt: '2026-06-24T13:51:40.739Z' },
        [MONTHLY_RENDER]: { points: [], id: 'runtime', createdAt: '2026-06-22T13:51:40.739Z', updatedAt: '2026-06-24T13:51:40.739Z' },
    },
    clientEffects: [],
    clientEffectsByTrait: [],
};

/** The chart traits' real `INVOICES_LOADED` effect from the resolved catalog
 *  (project-friday, `ExecutiveOverviewOrbital`), verbatim minus the trailing
 *  `@trait.X` render-ui embed (no inline child in this harness). Only
 *  'ExecInvoice Id 3' is paid → exactly one point, value 500. */
const SET_MONTHLY_POINTS: SExpr = ['let', [['paid', ['array/filter', '@payload.data', ['fn', 'i', ['=', '@i.status', 'paid']]]]], ['do',
    ['set', '@entity.points', ['array/map', ['array/sort', ['array/unique', ['array/map', '@paid', ['fn', 'i', ['time/format', ['time/parse', '@i.paidAt'], 'YYYY-MM']]]]], ['fn', 'm', { date: ['str/concat', '@m', '-01'], label: '@m', value: ['array/sum', ['array/filter', '@paid', ['fn', 'i', ['=', ['time/format', ['time/parse', '@i.paidAt'], 'YYYY-MM'], '@m']]], 'amount'] }]]],
    ['render-ui', 'main', { direction: 'vertical', gap: 'none', type: 'stack' }],
]];

const SET_WEEKLY_POINTS: SExpr = ['let', [['paid', ['array/filter', '@payload.data', ['fn', 'i', ['=', '@i.status', 'paid']]]]], ['do',
    ['set', '@entity.points', ['array/map', ['array/sort', ['array/unique', ['array/map', '@paid', ['fn', 'i', ['time/startOf', ['time/parse', '@i.paidAt'], 'week']]]]], ['fn', 'w', { date: ['time/format', '@w', 'YYYY-MM-DD'], label: ['time/format', '@w', 'MMM D'], value: ['array/sum', ['array/filter', '@paid', ['fn', 'i', ['=', ['time/startOf', ['time/parse', '@i.paidAt'], 'week'], '@w']]], 'amount'] }]]],
    ['render-ui', 'main', { direction: 'vertical', gap: 'none', type: 'stack' }],
]];

const RENDER_STACK: SExpr = ['render-ui', 'main', { direction: 'vertical', gap: 'none', type: 'stack' }];

function makeTraits(): ResolvedTraitBinding[] {
    const invoice = createEmptyResolvedTrait(INVOICE_TRAIT, 'inline');
    invoice.linkedEntity = 'ExecInvoice';
    invoice.states = [{ name: 'idle', isInitial: true, isFinal: false }];
    invoice.events = [
        { key: 'INIT', name: 'Initialize' },
        { key: 'ExecInvoicesLoaded', name: 'Invoices loaded' },
    ];
    invoice.transitions = [
        // The fetch runs SERVER-side only (the client handler set has no
        // fetch); the local INIT emits nothing, exactly the cold-mount case.
        { from: 'idle', to: 'idle', event: 'INIT', effects: [['fetch', 'ExecInvoice', { emit: { success: 'ExecInvoicesLoaded' } }]] },
    ];

    const monthly = createEmptyResolvedTrait(MONTHLY_CHART, 'inline');
    monthly.linkedEntity = 'ExecutiveOverviewOrbitalExecMonthlyRevenueData';
    monthly.states = [{ name: 'idle', isInitial: true, isFinal: false }];
    monthly.events = [
        { key: 'INIT', name: 'Initialize' },
        { key: 'INVOICES_LOADED', name: 'Invoices Loaded' },
    ];
    monthly.listens = [
        { event: 'ExecInvoicesLoaded', triggers: 'INVOICES_LOADED', source: { kind: 'trait', trait: INVOICE_TRAIT, traitId: asTraitId('trt_XXGQ8QWPRGBC85K4HM0XV950E3') } },
    ];
    monthly.transitions = [
        { from: 'idle', to: 'idle', event: 'INIT', effects: [RENDER_STACK] },
        { from: 'idle', to: 'idle', event: 'INVOICES_LOADED', effects: [SET_MONTHLY_POINTS] },
    ];

    const weekly = createEmptyResolvedTrait(WEEKLY_CHART, 'inline');
    weekly.linkedEntity = 'ExecutiveOverviewOrbitalExecWeeklyRevenueData';
    weekly.states = [{ name: 'idle', isInitial: true, isFinal: false }];
    weekly.events = [
        { key: 'INIT', name: 'Initialize' },
        { key: 'INVOICES_LOADED', name: 'Invoices Loaded' },
    ];
    weekly.listens = [
        { event: 'ExecInvoicesLoaded', triggers: 'INVOICES_LOADED', source: { kind: 'trait', trait: INVOICE_TRAIT, traitId: asTraitId('trt_XXGQ8QWPRGBC85K4HM0XV950E3') } },
    ];
    weekly.transitions = [
        { from: 'idle', to: 'idle', event: 'INIT', effects: [RENDER_STACK] },
        { from: 'idle', to: 'idle', event: 'INVOICES_LOADED', effects: [SET_WEEKLY_POINTS] },
    ];

    // The embedded render atom: SAME linkedEntity as the monthly chart, and
    // its LineChart's `data` defaults to `@entity.points` — which resolves
    // against THIS trait's own surface at render time.
    const render = createEmptyResolvedTrait(MONTHLY_RENDER, 'inline');
    render.linkedEntity = 'ExecutiveOverviewOrbitalExecMonthlyRevenueData';
    render.states = [{ name: 'idle', isInitial: true, isFinal: false }];
    render.events = [{ key: 'INIT', name: 'Initialize' }];
    render.transitions = [
        { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'line-chart', data: '@entity.points' }]] },
    ];

    return [{ trait: invoice }, { trait: monthly }, { trait: weekly }, { trait: render }];
}

function makeEntities(): ResolvedEntity[] {
    const invoiceFields = ['id', 'clientName', 'project', 'department', 'kind', 'amount', 'status', 'issuedAt', 'paidAt'].map((name) => ({ name, type: 'string', tsType: inferTsType('string'), required: true }));
    const chartFields = [{ name: 'points', type: '[object]', tsType: inferTsType('[object]'), required: true }, { name: 'id', type: 'string', tsType: inferTsType('string'), required: true }];
    return [
        { name: 'ExecInvoice', collection: 'exec-invoices', fields: invoiceFields, runtime: true, usedByTraits: [], usedByPages: [] },
        { name: 'ExecutiveOverviewOrbitalExecMonthlyRevenueData', collection: 'exec-monthly-revenue', fields: chartFields, runtime: true, usedByTraits: [], usedByPages: [] },
        { name: 'ExecutiveOverviewOrbitalExecWeeklyRevenueData', collection: 'exec-weekly-revenue', fields: chartFields, runtime: true, usedByTraits: [], usedByPages: [] },
    ];
}

const SCHEMA: OrbitalSchema = { name: 'project-friday', orbitals: [] };
/** Identity-stable (a fresh `{}` per render would recreate the manager memo
 *  every render → setState loop). */
const TRAIT_CONFIGS = {};

let smRef: TraitStateMachineResult | null = null;
let bridgeRef: ServerBridgeContextValue | null = null;

function Probe({ bindings }: { bindings: ResolvedTraitBinding[] }) {
    const uiSlots = useUISlots();
    const sm = useTraitStateMachine(bindings, uiSlots, {
        orbitalsByTrait: ORBITALS_BY_TRAIT,
        traitConfigsByName: TRAIT_CONFIGS,
    });
    useEffect(() => {
        smRef = sm;
    });
    bridgeRef = useServerBridge();
    return null;
}

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
    const url = String(input);
    if (url.endsWith('/register')) {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/events')) {
        return new Response(JSON.stringify(INIT_RESPONSE), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

beforeEach(() => {
    smRef = null;
    bridgeRef = null;
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

async function mountAndRunColdInit(): Promise<void> {
    render(
        <EventBusProvider>
            <ServerBridgeProvider schema={SCHEMA} serverUrl="http://bridge.test/api/orbitals">
                <EntitySchemaProvider entities={makeEntities()}>
                    <UISlotProvider>
                        <Probe bindings={makeTraits()} />
                    </UISlotProvider>
                </EntitySchemaProvider>
            </ServerBridgeProvider>
        </EventBusProvider>,
    );
    await waitFor(() => expect(bridgeRef?.connected).toBe(true));

    // OrbPreview's "Server INIT when bridge connects" effect, verbatim:
    // bridge.sendEvent → applyServerStates → commit every entityByTrait row.
    // The bridge defers the cascade rebroadcast one macrotask, so this
    // continuation (a microtask) always commits BEFORE the listen-relay
    // fires — the ordering the whole fix rests on.
    await act(async () => {
        const { meta } = await bridgeRef!.sendEvent(ORBITAL, 'INIT', { _activeTraits: [INVOICE_TRAIT, MONTHLY_CHART, WEEKLY_CHART, MONTHLY_RENDER] });
        if (meta.stateSource === 'stateless-http' && meta.states) {
            smRef!.applyServerStates(meta.states);
        }
        if (meta.entityByTrait) {
            for (const [traitName, entity] of Object.entries(meta.entityByTrait)) {
                smRef!.commitServerEntity(traitName, entity);
            }
        }
    });
    // Let the deferred rebroadcast + the listen relay's async drain settle.
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
    });
}

describe('cold INIT: server-row commit lands before the listen-relay', () => {
    it('the relay-computed points land on the chart trait\'s surface (monthly)', async () => {
        await mountAndRunColdInit();

        const snapshot = smRef!.entityBindingSource.getEntitySnapshot(MONTHLY_CHART);
        expect(snapshot.points).toEqual([{ date: '2026-10-01', label: '2026-10', value: 500 }]);
    });

    it('the relay-computed points land on the chart trait\'s surface (weekly)', async () => {
        await mountAndRunColdInit();

        const snapshot = smRef!.entityBindingSource.getEntitySnapshot(WEEKLY_CHART);
        expect(Array.isArray(snapshot.points)).toBe(true);
        expect(snapshot.points).toHaveLength(1);
        expect((snapshot.points as Array<{ value: number }>)[0].value).toBe(500);
    });

    it('server-authoritative fields on the same row still land (id/createdAt/updatedAt)', async () => {
        await mountAndRunColdInit();

        const snapshot = smRef!.entityBindingSource.getEntitySnapshot(MONTHLY_CHART);
        expect(snapshot.id).toBe('runtime');
        expect(snapshot.createdAt).toBe('2026-06-22T13:51:40.739Z');
    });

    it('the embedded render trait\'s OWN surface receives the relay-computed points (sibling fan-out)', async () => {
        await mountAndRunColdInit();

        // The LineChart's `data: @entity.points` marker resolves against the
        // RENDER trait's per-trait surface — this is the surface the live
        // cold-INIT bug left empty.
        const snapshot = smRef!.entityBindingSource.getEntitySnapshot(MONTHLY_RENDER);
        expect(snapshot.points).toEqual([{ date: '2026-10-01', label: '2026-10', value: 500 }]);
        expect(snapshot.id).toBe('runtime');
    });

    it('a LATER server-executed write still wins over the relay-computed local value', async () => {
        await mountAndRunColdInit();
        // Sanity: the relay won the INIT commit.
        expect(smRef!.entityBindingSource.getEntitySnapshot(MONTHLY_CHART).points).toHaveLength(1);

        // A subsequent response whose server row the server DID compute
        // (e.g. the field was round-tripped via Fix C and recomputed
        // server-side) must clobber the local value — the commit/relay
        // ordering protects the relay's writes only from the response whose
        // OWN rebroadcast produced them, not from later server executions.
        act(() => {
            smRef!.commitServerEntity(MONTHLY_CHART, { points: [{ date: '2026-11-01', label: '2026-11', value: 42 }], id: 'runtime' });
        });

        const snapshot = smRef!.entityBindingSource.getEntitySnapshot(MONTHLY_CHART);
        expect(snapshot.points).toEqual([{ date: '2026-11-01', label: '2026-11', value: 42 }]);
    });
});
