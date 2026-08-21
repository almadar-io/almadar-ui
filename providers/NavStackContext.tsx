'use client';
/**
 * NavStackProvider — the orbital-scoped client-session navigation stack.
 *
 * One provider instance per app host. Both execution paths mount it:
 * - Runtime path: OrbPreview supplies `currentPath` + `navigate` explicitly.
 * - Compiled path: the emitted App.tsx mounts `NavStackRouterBridge`, which
 *   reads react-router's location/navigate and renders this provider.
 *
 * Pure stack semantics live in lib/navStack.ts (one owner for both paths).
 * State persists to sessionStorage (per-tab) so a compiled app's full page
 * reload keeps the trail; every storage access is guarded with an in-memory
 * fallback.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NavStackEntry } from '@almadar/core';
import {
  entriesFor,
  previousEntry,
  syncNavStack,
  type NavPageDecl,
  type NavStackState,
  type PendingCrumb,
} from '../lib/navStack';

export interface NavStackApi {
  /** Stack of the current page's orbital, root-first (empty when no declared page matches). */
  entries: readonly NavStackEntry[];
  /** True when a previous entry exists for the current page's orbital. */
  canGoBack: boolean;
  /** Stage the crumb label for the entry the target page will record, then call navigate yourself. */
  beginNavigate: (href: string, crumb?: string) => void;
  /** Pop the current orbital's stack: navigate to the previous entry (no-op without one). */
  back: () => void;
  /** Navigate to an arbitrary stack entry (breadcrumb click). */
  goTo: (href: string) => void;
}

/**
 * Inert default: patterns render safely outside a provider (verification
 * harnesses, isolated component tests) — empty trail, no-op back.
 */
const INERT_API: NavStackApi = {
  entries: [],
  canGoBack: false,
  beginNavigate: () => undefined,
  back: () => undefined,
  goTo: () => undefined,
};

const NavStackContext = createContext<NavStackApi>(INERT_API);

export function useNavStack(): NavStackApi {
  return useContext(NavStackContext);
}

export interface NavStackProviderProps {
  pages: readonly NavPageDecl[];
  /** Concrete current path (route params substituted), e.g. /contracts/42. */
  currentPath: string;
  /** Host navigation function (SPA route change). */
  navigate: (path: string) => void;
  /** sessionStorage key; omit to keep the stack in memory only. */
  storageKey?: string;
  children: React.ReactNode;
}

function loadStored(storageKey: string | undefined): NavStackState {
  if (!storageKey) return {};
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NavStackState;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

function persistStored(storageKey: string | undefined, state: NavStackState): void {
  if (!storageKey) return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode, quota) — in-memory state still works.
  }
}

export const NavStackProvider: React.FC<NavStackProviderProps> = ({
  pages,
  currentPath,
  navigate,
  storageKey,
  children,
}) => {
  const [state, setState] = useState<NavStackState>(() => loadStored(storageKey));
  const pendingCrumbRef = useRef<PendingCrumb | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const pending = pendingCrumbRef.current;
    pendingCrumbRef.current = null;
    setState((prev) => {
      const next = syncNavStack(prev, pages, currentPath, pending);
      if (next.state !== prev) persistStored(storageKey, next.state);
      return next.state;
    });
  }, [currentPath, pages, storageKey]);

  const beginNavigate = useCallback((href: string, crumb?: string) => {
    pendingCrumbRef.current = crumb !== undefined && crumb !== '' ? { href, crumb } : null;
  }, []);

  const back = useCallback(() => {
    const prev = previousEntry(stateRef.current, pages, currentPath);
    if (prev) navigate(prev.href);
  }, [pages, currentPath, navigate]);

  const goTo = useCallback(
    (href: string) => {
      navigate(href);
    },
    [navigate],
  );

  const entries = useMemo(
    () => entriesFor(state, pages, currentPath),
    [state, pages, currentPath],
  );

  const api = useMemo<NavStackApi>(
    () => ({
      entries,
      canGoBack: previousEntry(state, pages, currentPath) !== null,
      beginNavigate,
      back,
      goTo,
    }),
    [entries, state, pages, currentPath, beginNavigate, back, goTo],
  );

  return <NavStackContext.Provider value={api}>{children}</NavStackContext.Provider>;
};

NavStackProvider.displayName = 'NavStackProvider';

export interface NavStackRouterBridgeProps {
  pages: readonly NavPageDecl[];
  storageKey?: string;
  children: React.ReactNode;
}

/**
 * Compiled-path host: binds NavStackProvider to react-router. Must render
 * inside a Router (the emitted App.tsx mounts it directly under
 * BrowserRouter).
 */
export const NavStackRouterBridge: React.FC<NavStackRouterBridgeProps> = ({
  pages,
  storageKey = 'almadar:navstack',
  children,
}) => {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const navigate = useCallback(
    (path: string) => {
      routerNavigate(path);
    },
    [routerNavigate],
  );
  return (
    <NavStackProvider
      pages={pages}
      currentPath={location.pathname}
      navigate={navigate}
      storageKey={storageKey}
    >
      {children}
    </NavStackProvider>
  );
};

NavStackRouterBridge.displayName = 'NavStackRouterBridge';

export type { NavPageDecl } from '../lib/navStack';
