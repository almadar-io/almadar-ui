import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { KernelEngineValue } from '../../providers/KernelEngineContext';
import type { KernelInstance, KernelModule } from '../../lib/kernel-wire';

interface WasmGlue {
  Kernel: new (resolvedSchemaJson: string, clientId: string) => KernelInstance;
  initSync(input: { module: Buffer }): void;
}

const resolveInstalled = createRequire(import.meta.url).resolve;

/** The kernel's glue and wasm: the installed `@almadar/kernel`, or the build in `ALMADAR_KERNEL_DIR` to test an unpublished one. */
function kernelFiles(): { glue: string; wasm: string } {
  const dir = process.env.ALMADAR_KERNEL_DIR;
  if (dir !== undefined && dir !== '') {
    return { glue: join(dir, 'pkg/orbital_wasm.js'), wasm: join(dir, 'pkg/orbital_wasm_bg.wasm') };
  }
  return { glue: resolveInstalled('@almadar/kernel'), wasm: resolveInstalled('@almadar/kernel/kernel.wasm') };
}

function kernelAvailable(): boolean {
  try {
    return existsSync(kernelFiles().glue);
  } catch {
    return false;
  }
}

export const KERNEL_AVAILABLE = kernelAvailable();

async function load(): Promise<KernelModule> {
  const files = kernelFiles();
  const glue: WasmGlue = await import(/* @vite-ignore */ pathToFileURL(files.glue).href);
  glue.initSync({ module: readFileSync(files.wasm) });
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
