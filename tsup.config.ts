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

// Same pattern for ThemeContext. components/core/atoms/ThemeToggle.tsx (and other theme
// consumers) import useTheme from context/ThemeContext; without this the components chunk inlines
// its own createContext(), so the app's <ThemeProvider> (from @almadar/ui/context) never reaches
// useTheme()/ThemeToggle in the components chunk and toggleMode() silently no-ops (theme won't flip).
const dedupeThemePlugin = {
  name: 'dedupe-theme-context',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: (args: { importer: string }) => { path: string; external: boolean } | undefined) => void }) {
    build.onResolve({ filter: /ThemeContext/ }, (args: { importer: string }) => {
      if (args.importer && !args.importer.startsWith(contextDir)) {
        return { path: '@almadar/ui/context', external: true };
      }
      return undefined;
    });
  },
};

// Same pattern for EventBusProvider/EventBusContext.
// hooks/useEventBus.ts imports EventBusContext from providers/EventBusProvider.
// Without this plugin, the hooks chunk inlines its own createContext() call,
// creating a different context than the one in the providers chunk.
// This plugin redirects the import to @almadar/ui/providers (external),
// so both chunks share the same EventBusContext at runtime.
const providersDir = resolve(__dirname, 'providers');

const dedupeEventBusPlugin = {
  name: 'dedupe-event-bus-context',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: (args: { importer: string }) => { path: string; external: boolean } | undefined) => void }) {
    build.onResolve({ filter: /EventBusProvider/ }, (args: { importer: string }) => {
      if (args.importer && !args.importer.startsWith(providersDir)) {
        return { path: '@almadar/ui/providers', external: true };
      }
      return undefined;
    });
  },
};

// Same pattern for the i18n context. hooks/useTranslate.ts defines I18nContext;
// every entry that imports `useTranslate` (components, avl, runtime, …) otherwise
// inlines its OWN createContext(), so a `<I18nProvider>` mounted from one entry
// (@almadar/ui/hooks) never reaches a `useTranslate()` consumer from another entry
// (@almadar/ui main / avl) — the consumer silently falls back to the passthrough
// default (English-only core locale; app keys render raw). Redirect every
// useTranslate import from outside hooks/ to the shared @almadar/ui/hooks export.
const hooksDir = resolve(__dirname, 'hooks');

const dedupeI18nPlugin = {
  name: 'dedupe-i18n-context',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: (args: { importer: string }) => { path: string; external: boolean } | undefined) => void }) {
    // Match both the direct file (`../../hooks/useTranslate`) and the barrel
    // (`../hooks`, re-exported by components/index.ts via `export * from '../hooks'`)
    // — the barrel is how I18nContext leaks into the components entry.
    build.onResolve({ filter: /(^|\/)hooks($|\/useTranslate$)/ }, (args: { importer: string }) => {
      if (args.importer && !args.importer.startsWith(hooksDir)) {
        return { path: '@almadar/ui/hooks', external: true };
      }
      return undefined;
    });
  },
};

// Dedupe ALL providers/* relative imports from non-providers chunks.
//
// This is broader than the per-context plugins above because providers form
// a transitive graph: runtime/OrbPreview.tsx imports `../providers/
// OrbitalProvider`, which itself imports `./EntityStoreProvider` and others.
// The per-file plugin only matches the literal import string, so transitive
// providers/* imports inside providers/ files (importer = inside providersDir)
// are still inlined into whichever chunk pulls them in. Result: the runtime/
// chunk inlines its own copy of EntityStoreProvider with its own module-level
// `store` Map, separate from the providers/ chunk's store. SchemaRunner
// writes to one, data-grid reads from the other, previews stay empty.
//
// This plugin redirects ANY `../providers/*` (or `../../providers/*`, etc.)
// import to `@almadar/ui/providers` (external) UNLESS the importer is the
// providers/ entry file itself (providers/index.ts). That way the providers/
// chunk gets the real implementation and every other chunk gets a runtime
// reference to it.
const providersIndexFile = resolve(__dirname, 'providers/index.ts');

const dedupeProvidersPlugin = {
  name: 'dedupe-providers',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: (args: { importer: string; path: string }) => { path: string; external: boolean } | undefined) => void }) {
    build.onResolve({ filter: /(^|\/)providers\// }, (args: { importer: string; path: string }) => {
      if (!args.importer) return undefined;
      // Don't redirect imports made by providers/index.ts itself — that's the
      // file we're trying to bundle. Every other importer (including other
      // files inside providers/ when bundled into a non-providers chunk) gets
      // the external redirect.
      if (args.importer === providersIndexFile) return undefined;
      return { path: '@almadar/ui/providers', external: true };
    });
  },
};

// The component registry lazy-loads the heavy Three.js bundle via the package's
// own published subpath: `import('@almadar/ui/components/organisms/game/three')`.
// It is a runtime code-split (resolved in the consumer's installed package), so
// it must stay EXTERNAL during this build — esbuild otherwise resolves the
// self-reference through `exports` to a dist file that doesn't exist yet at
// bundle time. The `three` entry below still emits that dist chunk.
const externalThreeSubpathPlugin = {
  name: 'external-three-subpath',
  setup(build: { onResolve: (opts: { filter: RegExp }, cb: () => { path: string; external: boolean }) => void }) {
    build.onResolve({ filter: /^@almadar\/ui\/components\/(organisms|molecules)\/game\/three$/ }, () => ({
      path: '@almadar/ui/components/molecules/game/three',
      external: true,
    }));
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
      'lib/index.ts',
      'components/game/3d/index.ts',
      'locales/index.ts',
    ],
    format: ['esm', 'cjs'],
    dts: false,
    clean: true,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@almadar/ui', '@almadar/runtime', '@almadar/core', '@almadar/evaluator', '@almadar/patterns'],
    banner: { js: '"use client";' },
    esbuildPlugins: [dedupeContextPlugin, dedupeThemePlugin, dedupeEventBusPlugin, dedupeProvidersPlugin, dedupeI18nPlugin, externalThreeSubpathPlugin],
  },
  // Marketing build: SSR-safe subset for Docusaurus/webpack sites
  // No game engines, no Three.js, no browser globals at module scope
  {
    entry: { 'marketing/index': 'marketing/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    noExternal: ['clsx', 'tailwind-merge'],
    banner: { js: '"use client";' },
    esbuildPlugins: [externalThreeSubpathPlugin],
  },
  // AVL build: Almadar Visual Language formal notation
  {
    entry: { 'avl/index': 'avl/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    noExternal: ['clsx', 'tailwind-merge'],
    banner: { js: '"use client";' },
    esbuildPlugins: [dedupeContextPlugin, dedupeThemePlugin, dedupeEventBusPlugin, dedupeProvidersPlugin, dedupeI18nPlugin, externalThreeSubpathPlugin],
  },
]);
