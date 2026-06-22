/**
 * Client Effect Handlers Factory
 *
 * Creates the standard effect handler set for client-side trait execution.
 *
 * @packageDocumentation
 */

import type { EventPayload, EntityRow, FieldValue, ServiceParams } from '@almadar/core';
import type { EffectHandlers } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';

const log = createLogger('almadar:ui:effects:client-handlers');

export interface ClientEventBus {
    emit: (type: string, payload?: EventPayload) => void;
}

export interface SlotSetter {
    addPattern: (slot: string, pattern: unknown, props?: Record<string, unknown>) => void;
    clearSlot: (slot: string) => void;
}

export interface CreateClientEffectHandlersOptions {
    eventBus: ClientEventBus;
    slotSetter: SlotSetter;
    navigate?: (path: string, params?: Record<string, unknown>) => void;
    notify?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    /**
     * Live client-entity write target for `[runtime]` entities. `(set
     * @entity.<field> value)` runs entirely in the browser for in-memory
     * entities (game boards, wizards): there is no server row to persist to,
     * so the canonical client `set` must mutate THIS object — the same object
     * `EffectExecutor` reads `@entity.*` from for the current `executeAll` and
     * the next tick seeds from. When omitted, `set` is a no-op (bridge mode:
     * the server owns persistence). One store, read live by render-ui, guards,
     * and ticks — no guard-vs-render split.
     */
    liveEntity?: EntityRow;
    /**
     * Optional consumer-supplied call-service handler. When set, it runs
     * instead of the default mock fallback — use to wire the playground
     * to real backends. When omitted, `callService` returns a synthetic
     * mock result so service-atom chains advance end-to-end in offline /
     * standalone-preview mode (see OrbitalServerRuntime's mock parallel).
     */
    callService?: (
        service: string,
        action: string,
        params?: ServiceParams
    ) => Promise<unknown>;
}

export function createClientEffectHandlers(
    options: CreateClientEffectHandlersOptions
): EffectHandlers {
    const { eventBus, slotSetter, navigate, notify, callService, liveEntity } = options;

    return {
        emit: (event: string, payload?: EventPayload) => {
            // The event bus wraps its second arg AS the event's `payload`
            // field (see IEventBus contract). Double-wrapping as `{ payload }`
            // here made subscribers see `event.payload = { payload: realPayload }`,
            // and `@payload.X` binding resolution failed (one level too deep).
            // Pass the caller's payload through directly.
            const prefixedEvent = event.startsWith('UI:') ? event : `UI:${event}`;
            eventBus.emit(prefixedEvent, payload);
        },
        persist: async () => {
            log.warn('persist is server-side only, ignored on client');
        },
        set: (_entityId: string, field: string, value: unknown) => {
            // `[runtime]` entities live only in the browser — `(set @entity.X)`
            // must land in the live client store so the same `executeAll`'s
            // render-ui, the next tick, and guards all read the advanced value.
            // Without a `liveEntity` we are in bridge mode (server persists),
            // so the write is a no-op here.
            if (!liveEntity) {
                log.warn('set is server-side only, ignored on client (no live entity)');
                return;
            }
            liveEntity[field] = value as FieldValue;
        },
        callService: async (service: string, action: string, params?: ServiceParams) => {
            // Consumer-supplied handler wins — playgrounds wire real backends here.
            if (callService) return callService(service, action, params);
            // Mock fallback: return a synthetic result that satisfies common
            // service-atom emit shapes (id, clientSecret, success, status,
            // params-echo). Mirrors OrbitalServerRuntime's mock-mode default
            // so client-side state machines (offline preview, runtime-verify
            // standalone) advance instead of stalling at null payloads. The
            // server-side parallel exists for bridge mode where the SERVER
            // processes call-service; this branch is the same intent for
            // browser-only execution.
            const mockId = `mock_${service}_${action}_${Math.random().toString(36).slice(2, 10)}`;
            const paramsEcho: Partial<EntityRow> = {};
            if (params) {
                for (const [k, v] of Object.entries(params)) {
                    if (v !== undefined && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null || v instanceof Date)) {
                        paramsEcho[k] = v;
                    }
                }
            }
            return {
                id: mockId,
                clientSecret: `secret_${mockId}`,
                success: true,
                status: 'succeeded',
                ...paramsEcho,
            };
        },
        renderUI: (slot: string, pattern: unknown, props?: Record<string, unknown>) => {
            if (pattern === null) {
                slotSetter.clearSlot(slot);
                return;
            }
            slotSetter.addPattern(slot, pattern, props);
        },
        navigate: navigate ?? ((path: string) => {
            log.warn('No navigate handler, ignoring', { path });
        }),
        notify: notify ?? ((msg: string, type?: string) => {
            log.debug('notify', { type, message: msg });
        }),
    };
}
