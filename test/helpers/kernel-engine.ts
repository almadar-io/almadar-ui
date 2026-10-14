import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { KernelEngineValue } from '../../providers/KernelEngineContext';
import type { KernelInstance, KernelModule } from '../../lib/kernel-wire';

interface WasmGlue {
  Kernel: new (resolvedSchemaJson: string, clientId: string) => KernelInstance;
  initSync(input: { module: Buffer }): void;
}

/** The built `@almadar/kernel` package directory: `ALMADAR_KERNEL_DIR`, else the monorepo's `orbital-wasm/js`. */
function kernelDir(): string {
  return process.env.ALMADAR_KERNEL_DIR ?? resolve(__dirname, '../../../../orbital-rust/crates/orbital-wasm/js');
}

export const KERNEL_AVAILABLE = existsSync(join(kernelDir(), 'pkg/orbital_wasm.js'));

async function load(): Promise<KernelModule> {
  const dir = kernelDir();
  const glue: WasmGlue = await import(/* @vite-ignore */ pathToFileURL(join(dir, 'pkg/orbital_wasm.js')).href);
  glue.initSync({ module: readFileSync(join(dir, 'pkg/orbital_wasm_bg.wasm')) });
  return { Kernel: glue.Kernel };
}

let shared: Promise<KernelModule> | undefined;

export const KERNEL_ENGINE: KernelEngineValue = { engine: 'kernel', loadModule: () => (shared ??= load()) };
export const JS_ENGINE: KernelEngineValue = { engine: 'js' };
export const ENGINES: ReadonlyArray<readonly [string, KernelEngineValue]> = [
  ['js', JS_ENGINE],
  ...(KERNEL_AVAILABLE ? [['kernel', KERNEL_ENGINE] as const] : []),
];

/** Load the WebAssembly and the adapter chunk before a timing-sensitive test: the first dispatch otherwise waits on both. */
export async function warmKernel(): Promise<void> {
  if (!KERNEL_AVAILABLE) return;
  await KERNEL_ENGINE.loadModule?.();
  await import('../../lib/kernel-client');
}
