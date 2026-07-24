#!/usr/bin/env node
/**
 * WCAG contrast audit for all themes in packages/almadar-ui/themes/.
 * Parses each [data-theme="..."] block, resolves var() aliases and rgba
 * compositing over the theme's own background, then checks the canonical
 * foreground/background pairs every component relies on.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDir = resolve(__dirname, '..', 'themes');

const PAIRS = [
  ['--color-foreground', '--color-background'],
  ['--color-card-foreground', '--color-card'],
  ['--color-primary-foreground', '--color-primary'],
  ['--color-primary-foreground', '--color-primary-hover'],
  ['--color-secondary-foreground', '--color-secondary'],
  ['--color-secondary-foreground', '--color-secondary-hover'],
  ['--color-accent-foreground', '--color-accent'],
  ['--color-muted-foreground', '--color-muted'],
  ['--color-muted-foreground', '--color-card'],
  ['--color-error-foreground', '--color-error'],
  ['--color-success-foreground', '--color-success'],
  ['--color-warning-foreground', '--color-warning'],
  ['--color-info-foreground', '--color-info'],
];

function parseColor(raw) {
  const s = raw.trim();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(',').map(p => parseFloat(p));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  return null;
}

function compositeOver(fg, bg) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
  };
}

function luminance({ r, g, b }) {
  const f = c => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(c1, c2) {
  const l1 = luminance(c1), l2 = luminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const filter = process.argv[2];
const files = readdirSync(themesDir).filter(f => f.endsWith('.css') && !f.startsWith('_') && f !== 'index.css' && (!filter || f === filter));
let violations = 0;

for (const file of files.sort()) {
  const css = readFileSync(resolve(themesDir, file), 'utf8');
  const blocks = [...css.matchAll(/\[data-theme="([^"]+)"\]\s*\{([^}]*)\}/gs)];
  for (const [, themeName, body] of blocks) {
    const vars = {};
    for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      vars[decl[1]] = decl[2].trim();
    }
    const resolveVar = (name, depth = 0) => {
      let v = vars[name];
      if (v === undefined || depth > 5) return undefined;
      const ref = v.match(/^var\((--[\w-]+)\)$/);
      if (ref) return resolveVar(ref[1], depth + 1);
      return v;
    };
    const bgRaw = resolveVar('--color-background');
    const bg = bgRaw ? parseColor(bgRaw) : null;
    const results = [];
    for (const [fgName, bgName] of PAIRS) {
      const fgRaw = resolveVar(fgName);
      const bgRaw2 = resolveVar(bgName);
      if (!fgRaw || !bgRaw2) continue;
      const fg = parseColor(fgRaw);
      let bgc = parseColor(bgRaw2);
      if (!fg || !bgc) continue;
      // Composite translucent fills over the theme background
      if (bgc.a < 1 && bg) bgc = { ...compositeOver(bgc, bg), a: 1 };
      if (fg.a < 1 && bg) { const c = compositeOver(fg, bgc); fg.r = c.r; fg.g = c.g; fg.b = c.b; }
      const ratio = contrast(fg, bgc);
      // Text on filled surfaces needs 4.5:1 (WCAG AA normal text)
      if (ratio < 4.5) results.push({ pair: `${fgName} on ${bgName}`, ratio: ratio.toFixed(2), fg: fgRaw, bg: bgRaw2 });
    }
    if (results.length) {
      violations += results.length;
      console.log(`\n${themeName}  (${file})`);
      for (const r of results) console.log(`  FAIL ${r.ratio}:1  ${r.pair}   fg=${r.fg} bg=${r.bg}`);
    }
  }
}
console.log(violations === 0 ? '\nAll theme pairs pass WCAG AA (4.5:1).' : `\n${violations} violation(s).`);
