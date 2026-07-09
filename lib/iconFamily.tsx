/**
 * Icon family runtime resolver (Layer 1 Iconography axis).
 *
 * Reads the active `--icon-family` CSS variable from the document element and
 * dispatches a canonical icon name (kebab-case, matching lucide's vocabulary)
 * to the equivalent lucide component. Subscribes to data-theme attribute changes
 * via MutationObserver so a theme switch re-renders icons without a page reload.
 *
 * Non-lucide families (phosphor, tabler, fontawesome) are temporarily disabled
 * to keep them out of client bundles. They can be re-enabled later behind an
 * async chunk boundary once the workspace/publish dust settles.
 *
 * See `docs/Almadar_Std_Variations.md` §2 and `themes/_contract.md`.
 */

'use client';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import type { IconFamily as IconFamilyType } from '@almadar/core';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type IconFamily = IconFamilyType;

/** Adapter props that EVERY family-specific icon component accepts at this layer. */
export interface RenderedIconProps {
  className?: string;
  strokeWidth?: number;
  size?: number;
  style?: React.CSSProperties;
}

const DEFAULT_FAMILY: IconFamily = 'lucide';
const VALID_FAMILIES: ReadonlyArray<IconFamily> = [DEFAULT_FAMILY];

/** Read --icon-family from <html> at runtime. Returns 'lucide' on SSR. */
export function getCurrentIconFamily(): IconFamily {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return DEFAULT_FAMILY;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--icon-family')
    .trim()
    .replace(/^["']|["']$/g, '');
  return (VALID_FAMILIES as ReadonlyArray<string>).includes(raw)
    ? (raw as IconFamily)
    : DEFAULT_FAMILY;
}

// ---------------------------------------------------------------------------
// useIconFamily — hook that re-renders consumers when data-theme changes
// ---------------------------------------------------------------------------

let cachedFamily: IconFamily | null = null;
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function ensureObserver(): void {
  if (typeof window === 'undefined' || observer) return;
  observer = new MutationObserver(() => {
    const next = getCurrentIconFamily();
    if (next !== cachedFamily) {
      cachedFamily = next;
      listeners.forEach((fn) => fn());
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'style'],
  });
  cachedFamily = getCurrentIconFamily();
}

function subscribeIconFamily(notify: () => void): () => void {
  ensureObserver();
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function getIconFamilySnapshot(): IconFamily {
  if (cachedFamily !== null) return cachedFamily;
  cachedFamily = getCurrentIconFamily();
  return cachedFamily;
}

function getIconFamilyServerSnapshot(): IconFamily {
  return DEFAULT_FAMILY;
}

/** React hook: returns the active icon family, re-renders on theme switch. */
export function useIconFamily(): IconFamily {
  return useSyncExternalStore(
    subscribeIconFamily,
    getIconFamilySnapshot,
    getIconFamilyServerSnapshot,
  );
}

// ---------------------------------------------------------------------------
// Name normalization
// ---------------------------------------------------------------------------

function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Lucide resolver (canonical, only active family)
// ---------------------------------------------------------------------------

const lucideAliases: Record<string, LucideIcon> = {
  close: LucideIcons.X,
  trash: LucideIcons.Trash2,
  loader: LucideIcons.Loader2,
  stop: LucideIcons.Square,
  volume: LucideIcons.Volume2,
  'volume-off': LucideIcons.VolumeX,
  refresh: LucideIcons.RefreshCw,
  share: LucideIcons.Share2,
  'sort-asc': LucideIcons.ArrowUpNarrowWide,
  'sort-desc': LucideIcons.ArrowDownNarrowWide,
};

type LucideModule = Record<string, object | undefined>;

/** lucide-react icons are `React.forwardRef` objects (`{$$typeof: Symbol(react.forward_ref), ...}`),
 *  NOT plain functions — so a `typeof === 'function'` guard rejects every icon
 *  and silently falls through to HelpCircle. Accept any non-null object/function
 *  (the valid React component-type shapes lucide ships). */
function isComponentLike(v: object | undefined): v is LucideIcon {
  return v != null && (typeof v === 'function' || typeof v === 'object');
}

function resolveLucide(name: string): LucideIcon {
  if (lucideAliases[name]) return lucideAliases[name];
  const pascal = kebabToPascal(name);
  const lucideMap = LucideIcons as LucideModule;
  const direct = lucideMap[pascal];
  if (isComponentLike(direct)) return direct;
  const asIs = lucideMap[name];
  if (isComponentLike(asIs)) return asIs;
  return LucideIcons.HelpCircle;
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

function makeLucideAdapter(
  name: string,
): React.ComponentType<RenderedIconProps> {
  const LucideComp = resolveLucide(name);
  const Adapter: React.FC<RenderedIconProps> = (props) => (
    <LucideComp
      className={props.className}
      strokeWidth={props.strokeWidth}
      style={props.style}
      size={props.size}
    />
  );
  Adapter.displayName = `Lucide.${name}`;
  return Adapter;
}

/**
 * Dispatch a canonical icon name to the active family component.
 * Non-lucide families are currently disabled and fall back to lucide.
 */
export function resolveIconForFamily(
  name: string,
  _family: IconFamily,
): React.ComponentType<RenderedIconProps> {
  return makeLucideAdapter(name);
}

// ---------------------------------------------------------------------------
// useResolvedIcon — re-renders when family changes, returns the right component
// ---------------------------------------------------------------------------

/**
 * Resolve a canonical icon name to a family-aware component. The returned
 * component re-renders the icon into the active family's library on theme
 * switch (via useIconFamily's MutationObserver subscription).
 */
export function useResolvedIcon(
  name: string,
): React.ComponentType<RenderedIconProps> {
  const family = useIconFamily();
  const [comp, setComp] = useState<React.ComponentType<RenderedIconProps>>(() =>
    resolveIconForFamily(name, family),
  );
  useEffect(() => {
    setComp(() => resolveIconForFamily(name, family));
  }, [name, family]);
  return comp;
}
