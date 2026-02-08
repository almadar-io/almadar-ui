import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'components/index.ts',
    'hooks/index.ts',
    'providers/index.ts',
    'context/index.ts',
    'renderer/index.ts',
    'stores/index.ts',
    'lib/index.ts',
    // Client-specific component libraries
    'clients/trait-wars/index.ts',
    'clients/winning-11/index.ts',
    'clients/inspection-system/index.ts',
    'clients/blaz-kelemnc/index.ts',
    'clients/builder/index.ts',
    'clients/kflow/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react-router-dom', '@almadar/ui'],
});
