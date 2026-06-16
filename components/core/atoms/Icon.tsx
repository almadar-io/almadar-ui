/**
 * Icon Atom Component
 *
 * Renders an icon from the active icon family (Layer 1 Iconography axis —
 * see lib/iconFamily.ts). Canonical names are lucide kebab-case; the resolver
 * dispatches to phosphor / tabler / fa-solid when `--icon-family` selects them,
 * re-rendering automatically on theme switch.
 *
 * Supports two APIs:
 * - `icon` prop: Pass a LucideIcon component directly (bypasses family resolver
 *   — used for direct lucide component refs, stays in lucide regardless of theme)
 * - `name` prop: Pass a canonical kebab-case name (family-aware, swaps on theme)
 */

'use client';
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../../lib/cn';
import { resolveIconForFamily, useIconFamily } from '../../../lib/iconFamily';
import type { ColorToken } from './types';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconAnimation = 'spin' | 'pulse' | 'none';
export type { ColorToken };

const colorTokenClasses: Record<ColorToken, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  muted: 'text-muted-foreground',
};

/**
 * Explicit aliases for icon names that don't follow standard kebab-to-PascalCase conversion.
 * Standard names (e.g. 'shopping-cart' -> ShoppingCart) are resolved dynamically.
 */
const iconAliases: Record<string, LucideIcon> = {
  'close': LucideIcons.X,
  'trash': LucideIcons.Trash2,
  'loader': LucideIcons.Loader2,
  'stop': LucideIcons.Square,
  'volume': LucideIcons.Volume2,
  'volume-off': LucideIcons.VolumeX,
  'refresh': LucideIcons.RefreshCw,
  'share': LucideIcons.Share2,
  'sort-asc': LucideIcons.ArrowUpNarrowWide,
  'sort-desc': LucideIcons.ArrowDownNarrowWide,
};

/** Convert kebab-case to PascalCase: 'shopping-cart' -> 'ShoppingCart' */
function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map(part => {
      // Handle numeric segments: 'trash-2' -> 'Trash2'
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/** Cache resolved icons to avoid repeated lookups */
const resolvedCache = new Map<string, LucideIcon>();

/**
 * Resolve an icon name to a Lucide icon component.
 * Supports all 1500+ Lucide icons via dynamic PascalCase lookup.
 * Falls back to HelpCircle if not found.
 */
export function resolveIcon(name: string): LucideIcon {
  const cached = resolvedCache.get(name);
  if (cached) return cached;

  const resolved = doResolve(name);
  resolvedCache.set(name, resolved);
  return resolved;
}

function doResolve(name: string): LucideIcon {
  // Check aliases first (non-standard mappings)
  if (iconAliases[name]) return iconAliases[name];

  // Convert kebab-case name to PascalCase and look up in lucide-react exports
  const pascalName = kebabToPascal(name);
  const directLookup = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalName];
  if (directLookup && typeof directLookup === 'object') return directLookup;

  // Try the name as-is (already PascalCase)
  const asIs = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (asIs && typeof asIs === 'object') return asIs;

  // Fallback
  return LucideIcons.HelpCircle;
}

export interface IconProps {
  /**
   * Lucide icon component (preferred for type-safe usage), OR a canonical
   * kebab-case icon name string — a string is treated exactly like `name` so
   * trait/factory authors can pass an icon by name through the `icon` prop.
   */
  icon?: LucideIcon | string;
  /** Icon name as string (resolved from iconMap) */
  name?: string;
  /** Size of the icon */
  size?: IconSize;
  /** Semantic palette token or an arbitrary Tailwind color class. */
  color?: ColorToken | string;
  /** Animation type */
  animation?: IconAnimation;
  /** Additional CSS classes */
  className?: string;
  /** Icon stroke width - uses theme default if not specified */
  strokeWidth?: number;
  /** Inline style */
  style?: React.CSSProperties;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'h-icon-default w-icon-default',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const animationClasses: Record<IconAnimation, string> = {
  none: '',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
};

export const Icon: React.FC<IconProps> = ({
  icon,
  name,
  size = 'md',
  color,
  animation = 'none',
  className,
  strokeWidth,
  style,
}) => {
  // The `icon` prop bypasses the family resolver (caller already chose a specific
  // component reference, usually a direct lucide import). The `name` prop dispatches
  // through useIconFamily so the icon swaps families when the user changes theme.
  // A string `icon` is an icon NAME, not a component — route it through the
  // family-aware `name` path so it resolves (and theme-swaps) like `name`.
  const directIcon: LucideIcon | undefined =
    typeof icon === "string" ? undefined : icon;
  const effectiveName = typeof icon === "string" ? icon : name;
  const family = useIconFamily();
  const RenderedComponent = React.useMemo(() => {
    if (directIcon) return null;
    return effectiveName ? resolveIconForFamily(effectiveName, family) : null;
  }, [directIcon, effectiveName, family]);

  const effectiveStrokeWidth = strokeWidth ?? undefined;
  const inlineStyle: React.CSSProperties = {
    ...(effectiveStrokeWidth === undefined
      ? { strokeWidth: 'var(--icon-stroke-width, 2)' }
      : {}),
    ...style,
  };
  const resolvedColor = color
    ? (color in colorTokenClasses
        ? colorTokenClasses[color as ColorToken]
        : color)
    : 'text-current';
  const composedClassName = cn(
    sizeClasses[size],
    animationClasses[animation],
    resolvedColor,
    className,
  );

  if (directIcon) {
    const Direct = directIcon;
    return (
      <Direct
        className={composedClassName}
        strokeWidth={effectiveStrokeWidth}
        style={inlineStyle}
      />
    );
  }
  if (RenderedComponent) {
    return (
      <RenderedComponent
        className={composedClassName}
        strokeWidth={effectiveStrokeWidth}
        style={inlineStyle}
      />
    );
  }
  // Last-resort fallback if neither icon nor name was passed.
  const Fallback = LucideIcons.HelpCircle;
  return (
    <Fallback
      className={composedClassName}
      strokeWidth={effectiveStrokeWidth}
      style={inlineStyle}
    />
  );
};

Icon.displayName = 'Icon';
