/**
 * Drawable click hit-test — the shared walk both canvas hosts (2D + 3D) use to
 * resolve a pointer/raycast at a scene cell to a per-entity id.
 *
 * A drawable descriptor carries an optional source-tagged `id` (see
 * {@link DrawableBase.id}); a board tags its unit sprites (`id: (@u id)`). The
 * host collects every drawn descriptor's `ScenePos` + `id`, builds a
 * `"x,y" → id` index (later descriptors win, so a unit drawn over its tile takes
 * the cell), and a click that lands on a tagged cell becomes `unitClick {unitId}`.
 * No id → the host emits only the coordinate (tile click). One owner, both hosts —
 * no per-host duplicate walker.
 */
import type { ScenePos } from '@almadar/core';
import type { DrawableNode } from './paintDispatch';
import { isValidScenePos } from './contract';

/** One drawn descriptor's scene position + optional hit-test id. */
export interface DrawnItem {
    pos: ScenePos;
    id?: string;
}

/** Collect every drawable's scene position + hit id (atoms directly; layers via `items`). */
export function collectDrawnItems(nodes: DrawableNode[]): DrawnItem[] {
    const out: DrawnItem[] = [];
    for (const n of nodes) {
        switch (n.type) {
            case 'draw-sprite':
            case 'draw-shape':
            case 'draw-text':
                if (isValidScenePos(n.position)) out.push({ pos: n.position, id: n.id });
                break;
            case 'draw-sprite-layer':
            case 'draw-shape-layer':
            case 'draw-text-layer':
                for (const it of n.items) {
                    if (isValidScenePos(it.position)) out.push({ pos: it.position, id: it.id });
                }
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
