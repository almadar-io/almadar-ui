/**
 * fn-form-lambda × `$renderBinding` markers: the lambda conversion pass must
 * NEVER descend into a marker's `expression` — the S-expr there is evaluated
 * whole at render time, and compiling its inner `fn` nodes into React
 * render-props corrupts it (game canvas layers arrived as unpaintable React
 * elements / empty arrays — the ui-game organisms empty-board bug).
 */
import { describe, it, expect } from 'vitest';
import { RENDER_BINDING_MARKER, type RenderBindingMarker } from '@almadar/core';
import { convertFnFormLambdasInProps } from '../lib/fn-form-lambda';
import type { SlotProps } from '../providers/UISlotContext';

const marker = (expression: RenderBindingMarker['expression']): RenderBindingMarker => ({
  [RENDER_BINDING_MARKER]: true,
  expression,
});

describe('convertFnFormLambdasInProps × render-binding markers', () => {
  it('leaves fn nodes inside marker expressions untouched', () => {
    const fnNode = ['fn', 't', { position: { x: ['object/get', '@t', 'x'] }, type: 'draw-shape' }];
    const props: SlotProps = {
      drawables: [
        { type: 'draw-shape-layer', items: marker(['array/map', '@entity.tiles', fnNode]) },
      ],
    };
    const out = convertFnFormLambdasInProps(props);
    const layer = (out.drawables as Array<{ items: RenderBindingMarker }>)[0];
    expect(layer.items[RENDER_BINDING_MARKER]).toBe(true);
    const expr = layer.items.expression as unknown[];
    expect(expr[2]).toBe(fnNode); // same reference — not compiled into a render-prop
  });

  it('still converts real fn-form lambdas outside markers', () => {
    const props: SlotProps = {
      renderItem: ['fn', 'item', { type: 'typography', content: '@item.name' }],
    } as unknown as SlotProps;
    const out = convertFnFormLambdasInProps(props);
    expect(typeof out.renderItem).toBe('function');
  });
});
