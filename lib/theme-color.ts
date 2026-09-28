/**
 * theme-color — resolve a theme color expression (`var(--color-*)`, `color-mix(…)`)
 * to a concrete sRGB value for surfaces that cannot evaluate CSS themselves:
 * canvas 2D `fillStyle` and three.js materials. SVG and DOM take the expression
 * as-is and never need this.
 *
 * @packageDocumentation
 */

import { createLogger } from '@almadar/logger';

const log = createLogger('almadar:ui:theme-color');

export interface ResolvedColor {
  r: number;
  g: number;
  b: number;
  a: number;
  /** Opaque `rgb(r, g, b)`; alpha is carried separately in `a`. */
  css: string;
}

/** Categorical series drawn from the semantic tokens — the one palette every chart/diagram shares. */
export const THEME_SERIES: readonly string[] = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-info)',
  'var(--color-accent)',
];

function channel(value: string, unitScale: number): number {
  return Math.round(Math.min(255, Math.max(0, Number(value) * unitScale)));
}

function make(r: number, g: number, b: number, a: number): ResolvedColor {
  return { r, g, b, a, css: `rgb(${r}, ${g}, ${b})` };
}

/** Parse the color serializations a browser's computed style produces. Null when unsupported. */
export function parseComputedColor(value: string): ResolvedColor | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1];
    return make(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1);
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i.exec(v);
  if (rgb) {
    return make(channel(rgb[1], 1), channel(rgb[2], 1), channel(rgb[3], 1), rgb[4] === undefined ? 1 : Number(rgb[4]));
  }
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/i.exec(v);
  if (srgb) {
    return make(channel(srgb[1], 255), channel(srgb[2], 255), channel(srgb[3], 255), srgb[4] === undefined ? 1 : Number(srgb[4]));
  }
  return null;
}

const SENTINEL = 'rgb(1, 2, 3)';

function getComputedSentinel(doc: Document): string {
  const s = doc.createElement('span');
  s.style.display = 'none';
  s.style.color = SENTINEL;
  doc.body.appendChild(s);
  const c = getComputedStyle(s).color;
  doc.body.removeChild(s);
  return c;
}

/**
 * Resolve `value` as it computes inside `scope` (so the scope's `data-theme`
 * applies). Null — and a logged error — when the value does not compute.
 */
export function resolveThemeColor(value: string, scope: Element): ResolvedColor | null {
  const doc = scope.ownerDocument;
  // An undefined var() is invalid at computed-value time and silently inherits;
  // the sentinel parent makes that inheritance detectable.
  const wrapper = doc.createElement('span');
  wrapper.style.display = 'none';
  wrapper.style.color = SENTINEL;
  const probe = doc.createElement('span');
  probe.style.color = value;
  wrapper.appendChild(probe);
  scope.appendChild(wrapper);
  const computed = probe.style.color === '' ? '' : getComputedStyle(probe).color;
  scope.removeChild(wrapper);
  const parsed = computed === getComputedSentinel(doc) ? null : parseComputedColor(computed);
  if (!parsed) log.error('unresolvable-theme-color', { value, computed });
  return parsed;
}
