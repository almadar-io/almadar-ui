/**
 * The behavior registries a test reads, from the installed packages: a workspace
 * link in the monorepo, the published package in a standalone checkout.
 */
import { createRequire } from 'node:module';

import { behaviorRegistryDir, readBehaviorPackage } from '@almadar/core/behavior-package';
import { dirname, join, relative, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);

/** `@almadar/std`'s package root (`behaviors/registry/…`). */
export const STD_ROOT = dirname(require.resolve('@almadar/std/package.json'));

/** `@almadar-io/behaviors`'s package root. */
export const IO_ROOT = dirname(require.resolve('@almadar-io/behaviors/package.json'));

/** `@almadar/std`'s lowered programs, through its manifest: the live mirror of its
 *  `.lolo` sources in the workspace, the shipped registry from npm. */
export const STD_REGISTRY = behaviorRegistryDir(readBehaviorPackage(STD_ROOT));

/** `@almadar-io/behaviors`'s lowered programs, through its manifest. */
export const IO_REGISTRY = behaviorRegistryDir(readBehaviorPackage(IO_ROOT));

/** This package's root. */
export const PACKAGE_ROOT = join(import.meta.dirname, '..', '..');

function outside(root: string, target: string): boolean {
  const rel = relative(root, target);
  return rel === '..' || rel.startsWith(`..${sep}`);
}

/**
 * Where source text at `file` builds a path out of `root` into a monorepo sibling:
 * a `packages/almadar-…` path, a `join(dir, '..', …)` climbing past the root, or a
 * relative literal that resolves outside it. Comments don't count.
 */
export function escapesPackage(file: string, source: string, root: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const dir = dirname(file);
  const found: string[] = [];
  for (const m of code.matchAll(/['"`](packages\/almadar-[^'"`]*)['"`]/g)) found.push(m[1]);
  for (const m of code.matchAll(/join\(\s*(?:__dirname|import\.meta\.dirname)((?:\s*,\s*['"]\.\.['"])+)/g)) {
    const hops = (m[1].match(/\.\./g) ?? []).length;
    if (outside(root, resolve(dir, ...Array<string>(hops).fill('..')))) found.push(m[0]);
  }
  for (const m of code.matchAll(/['"`]((?:\.\.\/)+[^'"`]*)['"`]/g)) {
    if (outside(root, resolve(dir, m[1]))) found.push(m[1]);
  }
  return found;
}
