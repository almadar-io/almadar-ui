/**
 * Client Effect Handlers Factory
 *
 * Creates the standard effect handler set for client-side trait execution.
 *
 * @packageDocumentation
 */

import type { EventPayload, EntityRow, ServiceParams } from '@almadar/core';
import type { EffectHandlers } from '@almadar/runtime';

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
    const { eventBus, slotSetter, navigate, notify, callService } = options;

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
            console.warn('[ClientEffectHandlers] persist is server-side only, ignored on client');
        },
        set: () => {
            console.warn('[ClientEffectHandlers] set is server-side only, ignored on client');
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
            console.warn('[ClientEffectHandlers] No navigate handler, ignoring:', path);
        }),
        notify: notify ?? ((msg: string, type?: string) => {
            console.log(`[ClientEffectHandlers] notify (${type}):`, msg);
        }),
    };
}
