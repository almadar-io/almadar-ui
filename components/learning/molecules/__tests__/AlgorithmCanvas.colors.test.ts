import { describe, it, expect } from 'vitest';
import * as AlgorithmCanvasModule from '../AlgorithmCanvas';

const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

const COLOR_EXPORT_NAMES = [
  'DEFAULT_BAR_COLOR',
  'DEFAULT_CELL_COLOR',
  'DEFAULT_POINTER_COLOR',
  'RANGE_COLOR_DEFAULT',
  'SLOT_EMPTY_FILL',
  'SLOT_EMPTY_STROKE',
  'SLOT_FILLED_STROKE',
  'SLOT_HIGHLIGHT_DEFAULT',
  'SLOT_VALUE_TEXT_COLOR',
  'FRAME_ACTIVE_COLOR',
  'FRAME_RETURNING_COLOR',
  'FRAME_DONE_COLOR',
  'FRAME_LABEL_COLOR',
  'FRAME_DETAIL_COLOR',
  'BUCKET_INDEX_FILL',
  'BUCKET_INDEX_STROKE',
  'BUCKET_INDEX_TEXT',
  'BUCKET_ENTRY_TEXT',
  'BUCKET_ENTRY_DEFAULT',
  'BUCKET_ENTRY_HIGHLIGHT',
  'BUCKET_ENTRY_PROBING',
  'AXIS_LABEL_COLOR',
  'CORNER_TEXT_COLOR',
] as const;

describe('AlgorithmCanvas color constants hold no literal color', () => {
  it.each(COLOR_EXPORT_NAMES)('%s is a theme token or color-mix expression, never a literal', (name) => {
    const value = AlgorithmCanvasModule[name];
    expect(typeof value, name).toBe('string');
    expect(value, `${name}: ${value}`).not.toMatch(LITERAL);
  });

  it('FRAME_RIM_COLOR (active/returning/done) is theme-derived for every state', () => {
    const rim = AlgorithmCanvasModule.FRAME_RIM_COLOR;
    expect(Object.keys(rim)).toEqual(['active', 'returning', 'done']);
    for (const [state, c] of Object.entries(rim)) expect(c, `${state}: ${c}`).not.toMatch(LITERAL);
  });
});
