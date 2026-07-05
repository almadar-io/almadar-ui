'use client';
/**
 * `sprite-layer` — batch multiple sprites in one descriptor for O(layers) rendering.
 */
import type React from 'react';
import type { DrawableBase, PaintFn } from './types';
import { type SpriteDrawable, paintSprite } from './sprite';

export interface SpriteLayerDrawable extends DrawableBase {
	type: 'sprite-layer';
	/** Sprites painted in array order; z-ordering is the caller's responsibility. */
	items: SpriteDrawable[];
}

/** Paint a {@link SpriteLayerDrawable}. Renders all sprites in order; never throws. */
export const paintSpriteLayer: PaintFn<SpriteLayerDrawable> = (painter, node, dctx) => {
	for (const item of node.items) {
		paintSprite(painter, item, dctx);
	}
};

/** Registry/standalone stub — the host paints this molecule; the DOM renders nothing. */
export function SpriteLayer2D(_props: SpriteLayerDrawable): React.JSX.Element | null {
	return null;
}

export default SpriteLayer2D;
