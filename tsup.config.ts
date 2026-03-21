import { defineConfig, type Options } from 'tsup';
import { resolve } from 'node:path';

// All entry points that import context/UISlotContext.tsx inline their own
// createContext() call when splitting is off. This causes duplicate React
// contexts (components/index.js gets one, context/index.js gets another).
// This plugin rewrites the relative import to the @almadar/ui/context
// package subpath so the context module is shared at runtime.
const contextPath = resolve(__dirname, 'context/UISlotContext.tsx');
const contextDir = resolve(__dirname, 'context');

const dedupeContextPlugin = {
  name: 'dedupe-ui-slot-context',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: (args: { importer: string }) => { path: string; external: boolean } | undefined) => void }) {
    // For any file outside context/ that imports UISlotContext, redirect to the package export
    build.onResolve({ filter: /UISlotContext/ }, (args: { importer: string }) => {
      // Only redirect if the importer is NOT inside the context/ directory itself
      // (context/index.ts must bundle UISlotContext normally)
      if (args.importer && !args.importer.startsWith(contextDir)) {
        return { path: '@almadar/ui/context', external: true };
      }
      return undefined;
    });
  },
};

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
    esbuildPlugins: [dedupeContextPlugin],
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
  // Docs build: SSR-safe doc components for Docusaurus swizzles
  {
    entry: { 'docs/index': 'docs/index.ts' },
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
  // Illustrations build: composable SVG visual language
  {
    entry: { 'illustrations/index': 'illustrations/index.ts' },
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
