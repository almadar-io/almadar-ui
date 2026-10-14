'use client';
/**
 * KernelEngineContext
 *
 * The one provider-level switch between the two client execution engines: `'js'` (the default,
 * `@almadar/runtime`'s client role) and `'kernel'` (the Rust client-role kernel as WebAssembly,
 * `@almadar/kernel`). The host supplies the loader, so `@almadar/ui` imports none of the package and
 * the default bundle is unchanged; the provider loads the module once and every circuit under it
 * shares that module.
 *
 * @packageDocumentation
 */
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { KernelLoader, KernelModule } from '../lib/kernel-wire';
import type { FrameScheduler } from '../lib/kernel-frames';

export type ClientEngine = 'js' | 'kernel';

export interface KernelEngineValue {
  engine: ClientEngine;
  /** Resolves the initialised `@almadar/kernel` module; shared by every circuit under the provider. */
  loadModule?: () => Promise<KernelModule>;
  /** Supplies the frame clock the kernel's ticks run on; absent = `requestAnimationFrame`. */
  scheduleFrame?: FrameScheduler;
}

const JS_ENGINE: KernelEngineValue = { engine: 'js' };

export const KernelEngineContext = createContext<KernelEngineValue>(JS_ENGINE);

export function useKernelEngine(): KernelEngineValue {
  return useContext(KernelEngineContext);
}

export interface KernelEngineProviderProps {
  engine: ClientEngine;
  /** Required when `engine` is `'kernel'`. */
  loader?: KernelLoader;
  scheduleFrame?: FrameScheduler;
  children?: ReactNode;
}

export function KernelEngineProvider({ engine, loader, scheduleFrame, children }: KernelEngineProviderProps): React.ReactElement {
  const value = useMemo<KernelEngineValue>(() => {
    if (engine === 'js') return JS_ENGINE;
    if (loader === undefined) throw new Error('KernelEngineProvider: engine "kernel" requires a loader');
    let module: Promise<KernelModule> | undefined;
    return { engine, loadModule: () => (module ??= loader()), ...(scheduleFrame !== undefined ? { scheduleFrame } : {}) };
  }, [engine, loader, scheduleFrame]);
  return <KernelEngineContext.Provider value={value}>{children}</KernelEngineContext.Provider>;
}
