/**
 * hitTestSprites — rotation.
 *
 * A `draw-sprite` painted with `rotation` (radians, about its rect centre —
 * the same convention `paintSprite` composes: translate-to-centre, rotate,
 * translate-back) must hit-test against what is actually PAINTED, not its
 * unrotated axis-aligned rect. A 90° rotation on a 1×3 (portrait) rect turns
 * the painted shape into a 3×1 (landscape) rect around the same centre, so
 * the two orientations disagree on enough of the plane to prove the function
 * inverse-rotates the test point rather than ignoring `rotation`.
 */
import { describe, it, expect } from 'vitest';
import { hitTestSprites, type DrawnItem } from '../hitTest';
import { create2DProjector } from '../projector';

describe('hitTestSprites', () => {
    // `free` layout: the projector's tileWidth collapses to 1, so world units
    // read directly as painter px — the rect math below is exact, not scaled.
    const projector = create2DProjector({ baseOffsetX: 0, layout: 'free' });

    describe('rotated sprite', () => {
        // position (0,0), anchor top-left, width 1 / height 3 → unrotated rect
        // x:[0,1] y:[0,3], centre (0.5, 1.5). Rotated 90°, the painted shape is
        // the landscape rect x:[-1,2] y:[1,2] around the same centre.
        const item: DrawnItem = {
            pos: { x: 0, y: 0 },
            id: 'sprite-1',
            anchor: 'top-left',
            width: 1,
            height: 3,
            rotation: Math.PI / 2,
        };

        it('hits a point inside the ROTATED bounds that lies outside the unrotated rect', () => {
            expect(hitTestSprites([item], projector, { x: 1.7, y: 1.5 })).toBe('sprite-1');
        });

        it('misses a point inside the UNROTATED rect once rotation moves it out of the painted shape', () => {
            expect(hitTestSprites([item], projector, { x: 0.5, y: 2.8 })).toBeUndefined();
        });

        it('hits dead-centre regardless of orientation', () => {
            expect(hitTestSprites([item], projector, { x: 0.5, y: 1.5 })).toBe('sprite-1');
        });

        it('misses a point clearly outside any orientation', () => {
            expect(hitTestSprites([item], projector, { x: 100, y: 100 })).toBeUndefined();
        });
    });

    describe('unrotated sprite (rotation undefined)', () => {
        const item: DrawnItem = {
            pos: { x: 0, y: 0 },
            id: 'sprite-2',
            anchor: 'top-left',
            width: 1,
            height: 3,
        };

        it('hits inside its own (unrotated) rect', () => {
            expect(hitTestSprites([item], projector, { x: 0.5, y: 2.8 })).toBe('sprite-2');
        });

        it('misses where the rotated-90° variant above would have hit', () => {
            expect(hitTestSprites([item], projector, { x: 1.7, y: 1.5 })).toBeUndefined();
        });
    });
});
