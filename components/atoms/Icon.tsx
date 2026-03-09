/**
 * Icon Atom Component
 *
 * A wrapper component for Lucide icons with consistent sizing and styling.
 * Uses theme-aware CSS variables for stroke width and color.
 *
 * Supports two APIs:
 * - `icon` prop: Pass a LucideIcon component directly
 * - `name` prop: Pass a string icon name (resolved from iconMap)
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconAnimation = 'spin' | 'pulse' | 'none';

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
  /** Lucide icon component (preferred for type-safe usage) */
  icon?: LucideIcon;
  /** Icon name as string (resolved from iconMap) */
  name?: string;
  /** Size of the icon */
  size?: IconSize;
  /** Color class (Tailwind color class) or 'inherit' for theme default */
  color?: string;
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
  md: 'w-5 h-5',
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
  // Resolve icon: use provided icon component, or resolve from name
  const IconComponent = icon ?? (name ? resolveIcon(name) : LucideIcons.HelpCircle);

  // Use theme's icon stroke width if not explicitly set
  const effectiveStrokeWidth = strokeWidth ?? undefined;

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        animationClasses[animation],
        // Use theme's icon color or provided color
        color ? color : 'text-[var(--icon-color,currentColor)]',
        className
      )}
      strokeWidth={effectiveStrokeWidth}
      style={{
        ...(effectiveStrokeWidth === undefined
          ? { strokeWidth: 'var(--icon-stroke-width, 2)' }
          : {}),
        ...style,
      }}
    />
  );
};

Icon.displayName = 'Icon';
