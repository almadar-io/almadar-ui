/**
 * Icon family runtime resolver (Layer 1 Iconography axis).
 *
 * Reads the active `--icon-family` CSS variable from the document element and
 * dispatches a canonical icon name (kebab-case, matching lucide's vocabulary)
 * to the equivalent component in the active family. Subscribes to data-theme
 * attribute changes via MutationObserver so a theme switch re-renders icons
 * into the new family without a page reload.
 *
 * Canonical name = lucide name. Per-family alias tables resolve cross-family
 * naming differences (e.g. lucide's `search` is phosphor's `MagnifyingGlass`).
 * For names not mapped in the active family, falls back to lucide and logs a
 * console.warn — preserves semantic over family purity.
 *
 * See `docs/Almadar_Std_Variations.md` §2 and `themes/_contract.md`.
 */

'use client';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import type { IconFamily as IconFamilyType } from '@almadar/core';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as PhosphorIcons from '@phosphor-icons/react';
import * as TablerIcons from '@tabler/icons-react';
import * as FaIcons from 'react-icons/fa';

export type IconFamily = IconFamilyType;

/** Adapter props that EVERY family-specific icon component accepts at this layer. */
export interface RenderedIconProps {
  className?: string;
  strokeWidth?: number;
  size?: number;
  style?: React.CSSProperties;
}

const DEFAULT_FAMILY: IconFamily = 'lucide';
const VALID_FAMILIES: ReadonlyArray<IconFamily> = [
  'lucide',
  'phosphor-outline',
  'phosphor-fill',
  'phosphor-duotone',
  'tabler',
  'fa-solid',
];

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
// Lucide resolver (existing canonical, unchanged behavior)
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

function resolveLucide(name: string): LucideIcon {
  if (lucideAliases[name]) return lucideAliases[name];
  const pascal = kebabToPascal(name);
  const lucideMap = LucideIcons as unknown as Record<string, LucideIcon>;
  const direct = lucideMap[pascal];
  if (direct && typeof direct === 'object') return direct;
  const asIs = lucideMap[name];
  if (asIs && typeof asIs === 'object') return asIs;
  return LucideIcons.HelpCircle;
}

// ---------------------------------------------------------------------------
// Phosphor resolver — handles outline / fill / duotone via `weight` prop
// ---------------------------------------------------------------------------

/** Per-family alias for canonical names that differ in Phosphor's vocabulary. */
const phosphorAliases: Record<string, string> = {
  // lucide name → phosphor PascalCase name
  search: 'MagnifyingGlass',
  close: 'X',
  loader: 'CircleNotch',
  refresh: 'ArrowsClockwise',
  'sort-asc': 'SortAscending',
  'sort-desc': 'SortDescending',
  'chevron-down': 'CaretDown',
  'chevron-up': 'CaretUp',
  'chevron-left': 'CaretLeft',
  'chevron-right': 'CaretRight',
  'help-circle': 'Question',
  'alert-triangle': 'Warning',
  'alert-circle': 'WarningCircle',
  'check-circle': 'CheckCircle',
  'x-circle': 'XCircle',
  edit: 'PencilSimple',
  pencil: 'PencilSimple',
  trash: 'Trash',
  send: 'PaperPlaneRight',
  external: 'ArrowSquareOut',
  'external-link': 'ArrowSquareOut',
  plus: 'Plus',
  minus: 'Minus',
  x: 'X',
  check: 'Check',
  star: 'Star',
  heart: 'Heart',
  home: 'House',
  user: 'User',
  users: 'Users',
  settings: 'Gear',
  menu: 'List',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  copy: 'Copy',
  download: 'DownloadSimple',
  upload: 'UploadSimple',
  filter: 'Funnel',
  calendar: 'Calendar',
  clock: 'Clock',
  bell: 'Bell',
  mail: 'Envelope',
  envelope: 'Envelope',
  lock: 'Lock',
  unlock: 'LockOpen',
  eye: 'Eye',
  'eye-off': 'EyeSlash',
  more: 'DotsThree',
  'more-vertical': 'DotsThreeVertical',
  info: 'Info',
  warning: 'Warning',
  error: 'WarningCircle',
};

type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

function resolvePhosphor(
  name: string,
  weight: PhosphorWeight,
): React.ComponentType<RenderedIconProps> | null {
  const target = phosphorAliases[name] ?? kebabToPascal(name);
  const map = PhosphorIcons as unknown as Record<string, unknown>;
  const PhosphorComp = map[target];
  if (!PhosphorComp || typeof PhosphorComp !== 'object') return null;
  const Component = PhosphorComp as React.ComponentType<{
    weight?: PhosphorWeight;
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }>;
  const Adapter: React.FC<RenderedIconProps> = (props) => (
    <Component
      weight={weight}
      className={props.className}
      style={props.style}
      size={props.size ?? '1em'}
    />
  );
  Adapter.displayName = `Phosphor.${target}.${weight}`;
  return Adapter;
}

// ---------------------------------------------------------------------------
// Tabler resolver — kebab → IconPascalCase
// ---------------------------------------------------------------------------

const tablerAliases: Record<string, string> = {
  // lucide name → tabler suffix (after the `Icon` prefix)
  search: 'Search',
  close: 'X',
  loader: 'Loader2',
  refresh: 'Refresh',
  'sort-asc': 'SortAscending',
  'sort-desc': 'SortDescending',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'help-circle': 'HelpCircle',
  'alert-triangle': 'AlertTriangle',
  'alert-circle': 'AlertCircle',
  'check-circle': 'CircleCheck',
  'x-circle': 'CircleX',
  edit: 'Pencil',
  trash: 'Trash',
  send: 'Send',
  external: 'ExternalLink',
  plus: 'Plus',
  x: 'X',
  check: 'Check',
  star: 'Star',
  heart: 'Heart',
  home: 'Home',
  user: 'User',
  users: 'Users',
  settings: 'Settings',
  menu: 'Menu2',
  copy: 'Copy',
  download: 'Download',
  upload: 'Upload',
  filter: 'Filter',
  calendar: 'Calendar',
  clock: 'Clock',
  bell: 'Bell',
  mail: 'Mail',
  envelope: 'Mail',
  lock: 'Lock',
  unlock: 'LockOpen',
  eye: 'Eye',
  'eye-off': 'EyeOff',
  more: 'Dots',
  'more-vertical': 'DotsVertical',
  info: 'InfoCircle',
};

function resolveTabler(name: string): React.ComponentType<RenderedIconProps> | null {
  const suffix = tablerAliases[name] ?? kebabToPascal(name);
  const target = `Icon${suffix}`;
  const map = TablerIcons as unknown as Record<string, unknown>;
  const TablerComp = map[target];
  if (!TablerComp || typeof TablerComp !== 'object') return null;
  const Component = TablerComp as React.ComponentType<{
    stroke?: number;
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }>;
  const Adapter: React.FC<RenderedIconProps> = (props) => (
    <Component
      stroke={props.strokeWidth ?? 1.5}
      className={props.className}
      style={props.style}
      size={props.size ?? 24}
    />
  );
  Adapter.displayName = `Tabler.${target}`;
  return Adapter;
}

// ---------------------------------------------------------------------------
// FontAwesome (react-icons/fa) resolver — kebab → FaPascalCase
// ---------------------------------------------------------------------------

const faAliases: Record<string, string> = {
  // lucide name → fa-solid suffix (after the `Fa` prefix).
  // react-icons/fa ships FontAwesome 5 — names like `FaFileText` don't exist
  // (FA renamed to `FaFileAlt`). When you see a console.warn from
  // [iconFamily] about an unmapped lucide name in this family, add the
  // closest FA5 sibling here so the fallback stays in-family.
  search: 'Search',
  close: 'Times',
  x: 'Times',
  loader: 'Spinner',
  refresh: 'Sync',
  'sort-asc': 'SortAmountUp',
  'sort-desc': 'SortAmountDown',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'help-circle': 'QuestionCircle',
  'alert-triangle': 'ExclamationTriangle',
  'alert-circle': 'ExclamationCircle',
  'check-circle': 'CheckCircle',
  'x-circle': 'TimesCircle',
  edit: 'Edit',
  pencil: 'Pencil',
  trash: 'Trash',
  send: 'PaperPlane',
  external: 'ExternalLinkAlt',
  plus: 'Plus',
  minus: 'Minus',
  check: 'Check',
  star: 'Star',
  heart: 'Heart',
  home: 'Home',
  user: 'User',
  users: 'Users',
  settings: 'Cog',
  menu: 'Bars',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  copy: 'Copy',
  download: 'Download',
  upload: 'Upload',
  filter: 'Filter',
  calendar: 'Calendar',
  clock: 'Clock',
  bell: 'Bell',
  mail: 'Envelope',
  envelope: 'Envelope',
  lock: 'Lock',
  unlock: 'LockOpen',
  eye: 'Eye',
  'eye-off': 'EyeSlash',
  more: 'EllipsisH',
  'more-vertical': 'EllipsisV',
  info: 'InfoCircle',
  warning: 'ExclamationTriangle',

  // Files (FA renamed FileText → FileAlt)
  file: 'File',
  'file-text': 'FileAlt',
  'file-plus': 'FileMedical',
  'file-minus': 'FileExcel',
  'file-check': 'FileSignature',
  document: 'FileAlt',

  // Charts (lucide BarChart2 / BarChart3 → FA ChartBar)
  'bar-chart': 'ChartBar',
  'bar-chart-2': 'ChartBar',
  'bar-chart-3': 'ChartBar',
  'line-chart': 'ChartLine',
  'pie-chart': 'ChartPie',
  activity: 'ChartLine',
  'trending-up': 'ChartLine',
  'trending-down': 'ChartLine',

  // Messages (lucide MessageCircle/MessageSquare → FA CommentDots/CommentAlt)
  message: 'Comment',
  'message-circle': 'CommentDots',
  'message-square': 'CommentAlt',
  'messages-square': 'Comments',
  comment: 'Comment',
  comments: 'Comments',
  inbox: 'Inbox',

  // Support / help
  'life-buoy': 'LifeRing',
  lifebuoy: 'LifeRing',

  // Project / kanban (FA has no kanban; closest semantic is Tasks/Columns)
  kanban: 'Tasks',
  columns: 'Columns',
  rows: 'Bars',
  layout: 'ThLarge',
  grid: 'Th',
  list: 'List',
  table: 'Table',

  // Storage / folders
  folder: 'Folder',
  'folder-open': 'FolderOpen',
  archive: 'Archive',
  bookmark: 'Bookmark',
  briefcase: 'Briefcase',
  package: 'Box',
  box: 'Box',

  // Map / location
  map: 'Map',
  'map-pin': 'MapMarkerAlt',
  navigation: 'LocationArrow',
  compass: 'Compass',
  globe: 'Globe',
  target: 'Bullseye',

  // Media
  image: 'Image',
  video: 'Video',
  film: 'Film',
  camera: 'Camera',
  music: 'Music',
  play: 'Play',
  pause: 'Pause',
  'skip-forward': 'Forward',
  'skip-back': 'Backward',
  volume: 'VolumeUp',
  'volume-2': 'VolumeUp',
  'volume-x': 'VolumeMute',
  mic: 'Microphone',
  'mic-off': 'MicrophoneSlash',
  phone: 'Phone',

  // Code / data
  code: 'Code',
  terminal: 'Terminal',
  database: 'Database',
  server: 'Server',
  cloud: 'Cloud',
  wifi: 'Wifi',

  // Security
  shield: 'ShieldAlt',
  key: 'Key',

  // Misc actions
  printer: 'Print',
  save: 'Save',
  link: 'Link',
  unlink: 'Unlink',
  paperclip: 'Paperclip',
  flag: 'Flag',
  tag: 'Tag',
  tags: 'Tags',
  zap: 'Bolt',
};

function resolveFa(name: string): React.ComponentType<RenderedIconProps> | null {
  const suffix = faAliases[name] ?? kebabToPascal(name);
  const target = `Fa${suffix}`;
  const map = FaIcons as unknown as Record<string, unknown>;
  const FaComp = map[target];
  if (!FaComp || typeof FaComp !== 'function') return null;
  const Component = FaComp as React.ComponentType<{
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }>;
  const Adapter: React.FC<RenderedIconProps> = (props) => (
    <Component
      className={props.className}
      style={props.style}
      size={props.size ?? '1em'}
    />
  );
  Adapter.displayName = `Fa.${target}`;
  return Adapter;
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const warned = new Set<string>();

function warnFallback(name: string, family: IconFamily): void {
  const key = `${family}::${name}`;
  if (warned.has(key)) return;
  warned.add(key);
  if (typeof console !== 'undefined') {
    // Designers can add aliases in lib/iconFamily.ts for any missing mapping.
    console.warn(
      `[iconFamily] No '${name}' mapping in family '${family}'; falling back to lucide. Add an alias in lib/iconFamily.ts.`,
    );
  }
}

/**
 * Adapter that renders a lucide icon under the universal RenderedIconProps.
 * Used both as the lucide path AND as the cross-family fallback.
 *
 * When `isFallback` is true, the active theme targets a fill-based family
 * (phosphor-fill / fa-solid / phosphor-duotone) and likely sets
 * `--icon-stroke-width: 0` — that's correct for fill-based icons but makes
 * stroke-based lucide icons invisible. Override the inline stroke-width and
 * pass an explicit strokeWidth=2 so the lucide fallback renders visibly.
 */
function makeLucideAdapter(
  name: string,
  isFallback: boolean = false,
): React.ComponentType<RenderedIconProps> {
  const LucideComp = resolveLucide(name);
  const Adapter: React.FC<RenderedIconProps> = (props) => {
    const stroke = props.strokeWidth ?? (isFallback ? 2 : undefined);
    // For the fallback case we also clobber the inline strokeWidth so the
    // theme's --icon-stroke-width: 0 (set for fill-based families) doesn't
    // win the cascade and zero out the stroke.
    const style = isFallback
      ? { ...(props.style ?? {}), strokeWidth: stroke ?? 2 }
      : props.style;
    return (
      <LucideComp
        className={props.className}
        strokeWidth={stroke}
        style={style}
        size={props.size}
      />
    );
  };
  Adapter.displayName = `Lucide.${name}${isFallback ? '.fallback' : ''}`;
  return Adapter;
}

/**
 * Dispatch a canonical icon name to the right family component.
 * Falls back to lucide (with console.warn) when the family has no mapping.
 */
export function resolveIconForFamily(
  name: string,
  family: IconFamily,
): React.ComponentType<RenderedIconProps> {
  switch (family) {
    case 'lucide':
      return makeLucideAdapter(name, false);
    case 'phosphor-outline': {
      const p = resolvePhosphor(name, 'regular');
      if (p) return p;
      warnFallback(name, family);
      return makeLucideAdapter(name, true);
    }
    case 'phosphor-fill': {
      const p = resolvePhosphor(name, 'fill');
      if (p) return p;
      warnFallback(name, family);
      return makeLucideAdapter(name, true);
    }
    case 'phosphor-duotone': {
      const p = resolvePhosphor(name, 'duotone');
      if (p) return p;
      warnFallback(name, family);
      return makeLucideAdapter(name, true);
    }
    case 'tabler': {
      const t = resolveTabler(name);
      if (t) return t;
      warnFallback(name, family);
      return makeLucideAdapter(name, true);
    }
    case 'fa-solid': {
      const f = resolveFa(name);
      if (f) return f;
      warnFallback(name, family);
      return makeLucideAdapter(name, true);
    }
  }
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
