import { defineConfig } from 'tsup';

export default defineConfig([
  // Main build: all components (ESM + CJS, no splitting)
  {
    entry: [
      'components/index.ts',
      'hooks/index.ts',
      'providers/index.ts',
      'context/index.ts',
      'renderer/index.ts',
      'runtime/index.ts',
      'stores/index.ts',
      'lib/index.ts',
      'components/organisms/game/three/index.ts',
      'locales/index.ts',
    ],
    format: ['esm', 'cjs'],
    dts: false,
    clean: true,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@almadar/ui'],
    banner: { js: '"use client";' },
  },
  // Marketing build: SSR-safe subset for Docusaurus/webpack sites
  // No game engines, no Three.js, no browser globals at module scope
  {
    entry: { 'marketing/index': 'marketing/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    clean: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    noExternal: ['clsx', 'tailwind-merge'],
    banner: { js: '"use client";' },
  },
]);
