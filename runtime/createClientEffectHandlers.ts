/**
 * Client Effect Handlers Factory
 *
 * Creates the standard effect handler set for client-side trait execution.
 *
 * @packageDocumentation
 */

import type { EventPayload } from '@almadar/core';
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
}

export function createClientEffectHandlers(
    options: CreateClientEffectHandlersOptions
): EffectHandlers {
    const { eventBus, slotSetter, navigate, notify } = options;

    return {
        emit: (event: string, payload?: EventPayload) => {
            const prefixedEvent = event.startsWith('UI:') ? event : `UI:${event}`;
            eventBus.emit(prefixedEvent, { payload });
        },
        persist: async () => {
            console.warn('[ClientEffectHandlers] persist is server-side only, ignored on client');
        },
        set: () => {
            console.warn('[ClientEffectHandlers] set is server-side only, ignored on client');
        },
        callService: async () => {
            console.warn('[ClientEffectHandlers] callService is server-side only, ignored on client');
            return {};
        },
        renderUI: (slot: string, pattern: unknown, props?: Record<string, unknown>) => {
            if (pattern === null) {
                slotSetter.clearSlot(slot);
                return;
            }
            // Diagnostic for VG31 DELETE: dump resolved render-ui config so
            // we can see whether `@payload.id` actually interpolated.
            if (typeof console !== 'undefined' && slot === 'modal') {
                try {
                    const str = JSON.stringify(pattern);
                    if (str && str.includes('actionPayload')) {
                        console.warn('[render-ui modal] pattern=', str.slice(0, 800));
                    }
                } catch { /* ignore */ }
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
