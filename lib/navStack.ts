/**
 * Navigation-stack core — the pure logic behind the orbital-scoped
 * client-session navigation stack both execution paths share.
 *
 * The stack is what detail-page breadcrumb bands and the `navigate-back`
 * effect read. It lives client-side only (per browser tab): the runtime
 * path's OrbPreview and the compiled app's App.tsx both mount
 * `NavStackProvider` (providers/NavStackContext.tsx), which drives this
 * module on every route change.
 *
 * Semantics (deterministic):
 * - One stack per ORBITAL, keyed by the orbital owning the current page.
 * - On route change: an entry with the same href already in the stack
 *   truncates back to it (revisit); otherwise the new entry is pushed.
 * - Cold load (deep link): the stack seeds from the declared page-path
 *   hierarchy — every declared page whose pattern matches a strict prefix
 *   of the concrete path becomes an ancestor entry — so the trail is never
 *   empty and back always has a target on nested paths.
 * - Entry label = the `crumb` carried by the navigate effect when one was
 *   staged for this href, else the page's declared name humanized.
 */

import type { NavStackEntry } from "@almadar/core";
import { matchPathAmong, matchPath } from "../providers/navigation";

/** One declared page as the nav stack needs it: path pattern + name + owning orbital. */
export interface NavPageDecl {
  path: string;
  name: string;
  orbital: string;
}

/** Per-orbital stacks. */
export type NavStackState = Record<string, NavStackEntry[]>;

/** Crumb staged by a `(navigate … { crumb })` effect, consumed by the next sync. */
export interface PendingCrumb {
  href: string;
  crumb: string;
}

/**
 * Humanize a declared page name into a default stack label:
 * strip the `Page` suffix, then space the PascalCase words
 * (`ContractDetailPage` → `Contract Detail`). Mirrors the compiler's
 * `derive_nav_label` name convention, plus display spacing.
 */
export function derivePageLabel(name: string): string {
  const stripped = name.endsWith("Page") && name.length > 4 ? name.slice(0, -4) : name;
  return stripped.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function normalizePath(p: string): string {
  let normalized = p.trim();
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/** The page a concrete path resolves to (specificity-ranked), or null. */
export function matchNavPage(
  pages: readonly NavPageDecl[],
  path: string,
): NavPageDecl | null {
  const hit = matchPathAmong(pages, path, (p) => p.path);
  return hit ? hit.candidate : null;
}

/**
 * Ancestor entries for a concrete path, from the declared page hierarchy:
 * for each strict prefix of the path's segments, the declared page whose
 * pattern matches that prefix (specificity-ranked), ordered root-first.
 */
function seedAncestors(
  pages: readonly NavPageDecl[],
  path: string,
): NavStackEntry[] {
  const segments = normalizePath(path).split("/").filter(Boolean);
  const ancestors: NavStackEntry[] = [];
  for (let depth = 1; depth < segments.length; depth++) {
    const prefix = "/" + segments.slice(0, depth).join("/");
    const page = matchNavPage(pages, prefix);
    if (page) {
      ancestors.push({ href: prefix, label: derivePageLabel(page.name) });
    }
  }
  return ancestors;
}

/**
 * Fold a route change into the stack state. Returns the next state plus the
 * orbital owning the current path (`null` when no declared page matches —
 * e.g. /login — in which case the state is returned unchanged).
 */
export function syncNavStack(
  state: NavStackState,
  pages: readonly NavPageDecl[],
  path: string,
  pending: PendingCrumb | null,
): { state: NavStackState; orbital: string | null } {
  const normalized = normalizePath(path);
  const page = matchNavPage(pages, normalized);
  if (!page) return { state, orbital: null };

  const label =
    pending && normalizePath(pending.href) === normalized
      ? pending.crumb
      : derivePageLabel(page.name);

  const prior = state[page.orbital];
  const stack: NavStackEntry[] =
    prior && prior.length > 0 ? [...prior] : seedAncestors(pages, normalized);

  const existing = stack.findIndex((e) => e.href === normalized);
  if (existing >= 0) {
    stack.length = existing + 1;
    if (pending && normalizePath(pending.href) === normalized) {
      stack[existing] = { href: normalized, label };
    }
  } else {
    stack.push({ href: normalized, label });
  }

  return { state: { ...state, [page.orbital]: stack }, orbital: page.orbital };
}

/**
 * The previous entry for the current path's orbital — the `navigate-back`
 * target — or null when the stack holds no earlier entry (top-level page).
 */
export function previousEntry(
  state: NavStackState,
  pages: readonly NavPageDecl[],
  path: string,
): NavStackEntry | null {
  const page = matchNavPage(pages, normalizePath(path));
  if (!page) return null;
  const stack = state[page.orbital] ?? [];
  return stack.length >= 2 ? stack[stack.length - 2] : null;
}

/** Entries for the current path's orbital (empty when no page matches). */
export function entriesFor(
  state: NavStackState,
  pages: readonly NavPageDecl[],
  path: string,
): readonly NavStackEntry[] {
  const page = matchNavPage(pages, normalizePath(path));
  if (!page) return [];
  return state[page.orbital] ?? [];
}

/** Re-exported so provider code needs no second import site. */
export { matchPath };
