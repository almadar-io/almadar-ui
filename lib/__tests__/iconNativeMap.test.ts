import { describe, it, expect } from 'vitest';
import { ICON_NATIVE_MAP, ICON_ALIASES, ICON_FALLBACK, resolveNativeIcon } from '../iconNativeMap';

describe('ICON_NATIVE_MAP', () => {
  it('every value has a non-empty sfSymbol and materialSymbol', () => {
    for (const [name, glyph] of Object.entries(ICON_NATIVE_MAP)) {
      expect(glyph.sfSymbol.length, `${name}.sfSymbol`).toBeGreaterThan(0);
      expect(glyph.materialSymbol.length, `${name}.materialSymbol`).toBeGreaterThan(0);
    }
  });

  it('every iconAliases key is present', () => {
    for (const alias of ICON_ALIASES) {
      expect(ICON_NATIVE_MAP[alias], alias).toBeDefined();
    }
  });

  it('ICON_FALLBACK is a real questionmark/help glyph', () => {
    expect(ICON_FALLBACK).toEqual({ sfSymbol: 'questionmark.circle', materialSymbol: 'help' });
  });

  it('sorted key snapshot', () => {
    expect(Object.keys(ICON_NATIVE_MAP).sort()).toMatchSnapshot();
  });
});

describe('resolveNativeIcon', () => {
  it('resolves an exact key', () => {
    expect(resolveNativeIcon('search')).toEqual({ sfSymbol: 'magnifyingglass', materialSymbol: 'search' });
  });

  it('resolves an iconAliases name', () => {
    expect(resolveNativeIcon('close')).toEqual(ICON_NATIVE_MAP.close);
  });

  it('falls back deterministically for an unknown name', () => {
    expect(resolveNativeIcon('totally-made-up-icon-xyz')).toEqual(ICON_FALLBACK);
  });
});
