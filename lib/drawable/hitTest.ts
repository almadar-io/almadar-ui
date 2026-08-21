/**
 * Drawable click hit-test — the shared walk both canvas hosts (2D + 3D) use to
 * resolve a pointer/raycast at a scene cell to a per-entity id.
 *
 * A drawable descriptor carries an optional source-tagged `id` (see
 * {@link DrawableBase.id}); a board tags its unit sprites (`id: (@u id)`). The
 * host collects every drawn descriptor's `ScenePos` + `id`, builds a
 * `"x,y" → id` index (later descriptors win, so a unit drawn over its tile takes
 * the cell), and resolves a pointer two ways: first against the tagged sprites'
 * painted rects ({@link hitTestSprites} — a body/head click hangs over the cells
 * behind the unit's floor cell), then against the floor-cell index. No id → the
 * host emits only the coordinate (tile click). One owner, both hosts —
 * no per-host duplicate walker.
 */
import type { ScenePos } from '@almadar/core';
import type { DrawableNode } from './paintDispatch';
import { isValidScenePos, spriteRect } from './contract';
import type { DrawableAnchor, Projector } from './contract';
import type { PainterPoint } from '../painter2d';

/** One drawn descriptor's scene position + optional hit-test id. */
export interface DrawnItem {
    pos: ScenePos;
    id?: string;
    /** Sprite placement geometry (present for sprite descriptors) — lets the
     *  hit-test resolve a pointer against the painted rect, not just the cell. */
    anchor?: DrawableAnchor;
    width?: number;
    height?: number;
}

/** Collect every drawable's scene position + hit id (atoms directly; layers via `items`). */
export function collectDrawnItems(nodes: DrawableNode[]): DrawnItem[] {
    const out: DrawnItem[] = [];
    for (const n of nodes) {
        switch (n.type) {
            case 'draw-sprite':
                if (isValidScenePos(n.position)) out.push({ pos: n.position, id: n.id, anchor: n.anchor, width: n.width, height: n.height });
                break;
            case 'draw-shape':
            case 'draw-text':
            case 'draw-group':
            case 'draw-mesh':
                if (isValidScenePos(n.position)) out.push({ pos: n.position, id: n.id });
                break;
            case 'draw-sprite-layer':
                for (const it of n.items) {
                    if (isValidScenePos(it.position)) out.push({ pos: it.position, id: it.id, anchor: it.anchor, width: it.width, height: it.height });
                }
                break;
            case 'draw-shape-layer':
            case 'draw-text-layer':
                for (const it of n.items) {
                    if (isValidScenePos(it.position)) out.push({ pos: it.position, id: it.id });
                }
                break;
            case 'draw-fx-layer':
                // Transient effects are never click targets.
                break;
        }
    }
    return out;
}

/** Build the `"x,y" → id` cell index from the tagged descriptors (later wins). */
export function buildHitIndex(items: DrawnItem[]): Map<string, string> {
    const m = new Map<string, string>();
    for (const it of items) {
        if (it.id !== undefined) m.set(`${it.pos.x},${it.pos.y}`, it.id);
    }
    return m;
}

/**
 * Resolve a world point to the id of the topmost tagged sprite whose PAINTED
 * RECT contains it. A sprite anchored `ground` extends `height × tileWidth`
 * above its floor cell (a unit's body/head hangs over the cells behind it), so
 * the floor-cell inverse alone mis-resolves clicks on the visible body to the
 * cell behind. Testing the painted rect — the same {@link spriteRect} math the
 * painter uses — resolves the click to what is actually under the cursor.
 * Later descriptors win (reverse walk = painter's topmost), matching what the
 * user sees. Returns undefined when no tagged sprite contains the point; the
 * caller then falls back to the floor-cell inverse (tile click / cell-tagged id).
 */
export function hitTestSprites(items: DrawnItem[], projector: Projector, point: PainterPoint): string | undefined {
    for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.id === undefined) continue;
        const r = spriteRect(projector, { position: it.pos, anchor: it.anchor, width: it.width, height: it.height });
        if (point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h) return it.id;
    }
    return undefined;
}
