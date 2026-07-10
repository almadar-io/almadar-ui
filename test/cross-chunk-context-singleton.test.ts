/**
 * Cross-chunk React context singleton guard.
 *
 * When tsup splits the library into multiple entries/chunks, any context that
 * is defined in more than one place creates two unrelated `createContext()`
 * objects. A Provider mounted from one entry then does not reach a consumer
 * rendered from another entry, causing silent failures (theme not flipping,
 * slots not updating, event bus losing events, etc.).
 *
 * This test reads the built dist output and asserts that each critical context
 * is defined exactly once per format (one ESM definition, one CJS definition).
 *
 * Requires `pnpm run build` first — it reads `dist/`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');

function collectFiles(dir: string, ext: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && extname(e.name) === ext && !e.name.endsWith('.map'))
    .map((e) => resolve(e.parentPath ?? e.path, e.name));
}

const esmFiles = collectFiles(distDir, '.js');
const cjsFiles = collectFiles(distDir, '.cjs');

function contextDefinitionRegex(name: string): RegExp {
  // Tolerant of /* @__PURE__ */ markers, React.createContext, and numeric
  // suffixes tsup adds on collision (e.g. EventBusContext2).
  return new RegExp(`\\b${name}\\d*\\s*=\\s*(?:\\/\\*[^*]*\\*\\/\\s*)?(?:[Rr]eact\\.)?createContext`, 'g');
}

function findDefinitions(name: string, files: string[]): { file: string; matches: number }[] {
  const regex = contextDefinitionRegex(name);
  return files
    .map((file) => {
      const text = readFileSync(file, 'utf8');
      const matches = text.match(regex)?.length ?? 0;
      return { file, matches };
    })
    .filter((r) => r.matches > 0);
}

interface ContextCheck {
  name: string;
  // A basename or path fragment we expect the ESM definition to live under.
  expectedHome: string;
}

const contexts: ContextCheck[] = [
  { name: 'EventBusContext', expectedHome: 'providers/index.js' },
  { name: 'UISlotContext', expectedHome: 'context/index.js' },
  { name: 'ThemeContext', expectedHome: 'context/index.js' },
  { name: 'UserContext', expectedHome: 'providers/index.js' },
  { name: 'GameAudioContext', expectedHome: 'providers/index.js' },
  { name: 'NavigationContext', expectedHome: 'providers/index.js' },
  { name: 'EntitySchemaContext', expectedHome: 'providers/index.js' },
  // I18nContext is defined inside the hooks barrel; with splitting it lands in
  // a shared chunk rather than the hooks entry stub.
  { name: 'I18nContext', expectedHome: 'chunk' },
];

function normalizeHome(path: string): string {
  return path.replace(/\.js$/, '').replace(/\.cjs$/, '');
}

function assertSingleton(check: ContextCheck, files: string[], format: string): void {
  const defs = findDefinitions(check.name, files);
  const total = defs.reduce((sum, d) => sum + d.matches, 0);
  const paths = defs.map((d) => d.file);

  expect(
    total,
    `${check.name} must be defined exactly once in ${format} dist, but found ${total} definitions across:\n${paths.join('\n')}`,
  ).toBe(1);

  const home = paths[0];
  expect(
    normalizeHome(home),
    `${check.name} ${format} definition should live under ${check.expectedHome}`,
  ).toContain(normalizeHome(check.expectedHome));
}

describe('React contexts are cross-chunk singletons', () => {
  it.each(contexts)('$name has exactly one ESM definition', (check) => {
    assertSingleton(check, esmFiles, 'ESM');
  });

  it.each(contexts)('$name has exactly one CJS definition', (check) => {
    assertSingleton(check, cjsFiles, 'CJS');
  });
});
