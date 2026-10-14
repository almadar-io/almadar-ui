import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

// Runs the whole suite with every circuit under `KernelEngineProvider`'s `'kernel'` engine (the Rust
// client-role kernel as WebAssembly): `vitest run -c vitest.kernel.config.ts`. A test-only default; the
// product default stays `'js'`. Needs the built `@almadar/kernel` (`ALMADAR_KERNEL_DIR` or the monorepo path).
export default mergeConfig(
  base,
  defineConfig({
    test: {
      setupFiles: ['./test/helpers/kernel-engine-default.setup.ts'],
      // Asserts the provider's own default and loader contract, which this config overrides.
      exclude: [...(base.test?.exclude ?? []), 'test/kernel-engine.test.tsx'],
    },
  }),
);
