/**
 * Minimal structural rect shape — geometry math needs only these six
 * numbers; callers may supply a raw `DOMRect`, or a unioned box built from
 * `absUnion` (OrbPreviewNode.tsx) for `display:contents` wrappers whose own
 * `getBoundingClientRect()` is always 0x0.
 */
export interface DOMRectLike {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type InsertionAxis = 'vertical' | 'horizontal';

/**
 * Pure geometry: given each child's already-resolved rect and the pointer
 * position, returns the index at which a dropped item should be inserted
 * among those children. No DOM access — every rect and the axis are
 * supplied by the caller.
 */
export function computeInsertionIndex(
  childRects: readonly DOMRectLike[],
  pointer: { x: number; y: number },
  axis: InsertionAxis,
): number {
  for (let i = 0; i < childRects.length; i++) {
    const rect = childRects[i];
    const mid = axis === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
    const pos = axis === 'vertical' ? pointer.y : pointer.x;
    if (pos < mid) return i;
  }
  return childRects.length;
}
