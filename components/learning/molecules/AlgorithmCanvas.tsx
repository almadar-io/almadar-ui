'use client';

/**
 * AlgorithmCanvas
 *
 * A field-scoped learning molecule for computer-science algorithm visualizations.
 * Projects semantic `bars` (sorting/histograms), `slots` (registers/variables),
 * `cells` (grids/arrays/DP tables), `buckets` (hash-table chaining), and `frames`
 * (call stacks) into pixel-space shapes on the declarative `LearningCanvas` atom,
 * so a `.lolo` behavior never computes pixel coordinates — it just sets the family
 * arrays and lets this molecule lay them out. `pointers` (index cursors) and
 * `ranges` (highlighted spans) decorate the bars/slots panel. Graph/tree
 * algorithms use `AlgoGraphCanvas` (nodes + edges + layouts); this canvas owns
 * only the bar/slot/cell/bucket/frame vocabulary.
 *
 * When more than one of `bars`/`slots`/`cells`/`buckets`/`frames` is populated,
 * they share the canvas height as equal vertical panels in that fixed order
 * (`panelHeight = height / panelCount`); with exactly one family present the
 * panel math collapses to the original full-height layout unchanged.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useMemo } from 'react';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';

export interface AlgorithmBar {
  value: number;
  color?: string;
  label?: string;
}

/** Small per-corner annotation texts inside a cell (e.g. DP transition sources). */
export interface AlgorithmCellCorner {
  tl?: string;
  tr?: string;
  bl?: string;
  br?: string;
}

export interface AlgorithmCell {
  row: number;
  col: number;
  value?: number;
  color?: string;
  label?: string;
  /** Small annotation texts in the four corners; rendered only when the cell is large enough. */
  corner?: AlgorithmCellCorner;
}

export interface AlgorithmPointer {
  index: number;
  label?: string;
  color?: string;
}

/** A highlighted span over the bars panel: a translucent fill band or a bracket with a label. */
export interface AlgorithmRange {
  from: number;
  to: number;
  color?: string;
  label?: string;
  kind?: 'fill' | 'bracket';
}

/** Fill state for a single slot box. */
export type AlgorithmSlotState = 'empty' | 'filled' | 'highlight';

/** A discrete value slot (register/variable) drawn as a labeled box. */
export interface AlgorithmSlot {
  value?: string | number;
  state?: AlgorithmSlotState;
  color?: string;
}

/** Lifecycle state for a call-stack frame. */
export type AlgorithmFrameState = 'active' | 'returning' | 'done';

/** A single call-stack frame (recursion visualization). */
export interface AlgorithmFrame {
  label: string;
  detail?: string;
  state?: AlgorithmFrameState;
  color?: string;
}

/** Highlight state for a single bucket entry (hash-table chaining). */
export type AlgorithmBucketEntryState = 'default' | 'highlight' | 'probing';

/** A single chained entry within a hash-table bucket. */
export interface AlgorithmBucketEntry {
  label: string;
  state?: AlgorithmBucketEntryState;
  color?: string;
}

/** A hash-table bucket row: an index plus its chain of entries. */
export interface AlgorithmBucket {
  index: number;
  entries: AlgorithmBucketEntry[];
}

/** A row/column header label for the cells grid. */
export interface AlgorithmAxisLabel {
  index: number;
  text: string;
  color?: string;
}

export interface AlgorithmCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  /** Sorting/histogram bars; laid out left-to-right, height proportional to value. */
  bars?: AlgorithmBar[];
  /** Grid/array/DP cells; laid out on a row/col lattice sized to the extent. */
  cells?: AlgorithmCell[];
  /** Index cursors (i/j/lo/hi/mid); drawn as markers beneath the referenced bar/slot column. */
  pointers?: AlgorithmPointer[];
  /** Highlighted index ranges over the bars panel (translucent fill bands or labeled brackets). */
  ranges?: AlgorithmRange[];
  /** Discrete value slots (registers/variables); laid out in a row or a vertical stack. */
  slots?: AlgorithmSlot[];
  /** Slot stack direction; horizontal lays slots left-to-right, vertical stacks bottom-up. */
  slotOrientation?: 'horizontal' | 'vertical';
  /** Recursion/call-stack frames; laid out bottom-up like a real call stack. */
  frames?: AlgorithmFrame[];
  /** Hash-table buckets; each row is an index chip plus its chained entries. */
  buckets?: AlgorithmBucket[];
  /** Secondary bar strip inside the bars panel (e.g. a running total beside the primary values). */
  auxBars?: AlgorithmBar[];
  /** Row-header labels drawn to the left of the cells grid. */
  rowLabels?: AlgorithmAxisLabel[];
  /** Column-header labels drawn above the cells grid. */
  colLabels?: AlgorithmAxisLabel[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  isLoading?: boolean;
  error?: UiError | null;
}

const DEFAULT_BAR_COLOR = '#3b82f6';
const DEFAULT_CELL_COLOR = '#e5e7eb';
const DEFAULT_POINTER_COLOR = '#dc2626';
const POINTER_BAND = 34;
// Reserves the label band above the tallest bar: 8px offset + an 11px centered label.
const TOP_PAD = 26;

// Fixed panel order for the multi-family vertical layout; panelCount = how many are non-empty.
const PANEL_FAMILY_ORDER = ['bars', 'slots', 'cells', 'buckets', 'frames'] as const;
type PanelFamily = (typeof PANEL_FAMILY_ORDER)[number];

// ranges
const RANGE_COLOR_DEFAULT = '#3b82f6';
const RANGE_FILL_OPACITY = 0.15;
// 16 (not 8) so the first bracket's label at bracketY - 6 clears the panel's top edge.
const BRACKET_TOP_OFFSET = 16;
const BRACKET_ROW_H = 14;
const BRACKET_TICK_H = 6;
const BRACKET_LABEL_OFFSET = 6;

// slots
const SLOT_EMPTY_FILL = '#f1f5f9';
const SLOT_EMPTY_STROKE = '#cbd5e1';
const SLOT_FILLED_STROKE = '#9ca3af';
const SLOT_HIGHLIGHT_DEFAULT = '#f59e0b';
const SLOT_VALUE_TEXT_COLOR = '#ffffff';

// frames
const FRAME_ACTIVE_COLOR = '#3b82f6';
const FRAME_RETURNING_COLOR = '#f59e0b';
const FRAME_DONE_COLOR = '#94a3b8';
const FRAME_RIM_COLOR: Record<string, string> = {
  active: '#1d4ed8',
  returning: '#b45309',
  done: '#64748b',
};
const FRAME_LABEL_COLOR = '#ffffff';
const FRAME_DETAIL_COLOR = '#e2e8f0';
const FRAME_TWO_LINE_MIN_H = 22;
// Strips are fixed-height slabs stacked from the panel bottom (a real call
// stack silhouette) — never stretched to fill the panel; they only compress
// once the stack outgrows it.
const FRAME_STRIP_H = 44;
const FRAME_GAP = 6;
const FRAME_BOTTOM_PAD = 8;
const FRAME_MIN_H = 12;

// buckets
const BUCKET_INDEX_FILL = '#e2e8f0';
const BUCKET_INDEX_STROKE = '#9ca3af';
const BUCKET_INDEX_TEXT = '#374151';
const BUCKET_ENTRY_TEXT = '#ffffff';
const BUCKET_ENTRY_DEFAULT = '#3b82f6';
const BUCKET_ENTRY_HIGHLIGHT = '#f59e0b';
const BUCKET_ENTRY_PROBING = '#38bdf8';
const BUCKET_ENTRY_MIN_W = 24;
const BUCKET_ENTRY_MAX_W = 64;

// cells: rowLabels/colLabels/corner decorations
const AXIS_LABEL_COLOR = '#6b7280';
const AXIS_LABEL_FONT_SIZE = 10;
// Near-black like the cell value label — mid-gray corners washed out on colored cell fills.
const CORNER_TEXT_COLOR = '#111827';
const CORNER_FONT_SIZE = 7;
const CORNER_MIN_CELL = 28;
const CORNER_INSET_X = 3;
const CORNER_INSET_Y = 6;

// auxBars: secondary strip inside the bars panel
const AUX_PRIMARY_RATIO = 0.6;
const AUX_LABEL_BAND = 18;
const AUX_BASELINE_PAD = 8;

export const AlgorithmCanvas: React.FC<AlgorithmCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  bars = [],
  cells = [],
  pointers = [],
  ranges = [],
  slots = [],
  slotOrientation = 'horizontal',
  frames = [],
  buckets = [],
  auxBars = [],
  rowLabels = [],
  colLabels = [],
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];

    // --- panel partition: bars/slots/cells/buckets/frames share the height as equal bands ---
    const presence: Record<PanelFamily, boolean> = {
      bars: bars.length > 0,
      slots: slots.length > 0,
      cells: cells.length > 0,
      buckets: buckets.length > 0,
      frames: frames.length > 0,
    };
    const panelCount = PANEL_FAMILY_ORDER.filter((f) => presence[f]).length;
    const panelHeight = height / Math.max(1, panelCount);
    const panelY: Record<PanelFamily, number> = { bars: 0, slots: 0, cells: 0, buckets: 0, frames: 0 };
    let compactIndex = 0;
    PANEL_FAMILY_ORDER.forEach((f) => {
      if (presence[f]) {
        panelY[f] = compactIndex * panelHeight;
        compactIndex += 1;
      }
    });

    // --- bars: even columns across the width, height ∝ value / max, pointers in a bottom band ---
    // ranges (fill/bracket) and auxBars decorate this panel; both collapse to no-ops when unused.
    if (bars.length > 0) {
      const panelYBars = panelY.bars;
      const slot = width / bars.length;
      const barW = slot * 0.8;
      const gap = slot * 0.1;

      const bracketRanges = ranges.filter((r) => r.kind === 'bracket');
      const bracketCount = bracketRanges.length;
      const bracketHeadroom = bracketCount > 0 ? BRACKET_TOP_OFFSET + bracketCount * BRACKET_ROW_H : 0;

      const hasAux = auxBars.length > 0;
      // No auxBars → primaryH = panelHeight, and with one panel panelHeight = height: today's math exactly.
      const primaryH = hasAux ? panelHeight * AUX_PRIMARY_RATIO : panelHeight;

      const baseline = panelYBars + primaryH - POINTER_BAND;
      const usableH = baseline - (panelYBars + TOP_PAD + bracketHeadroom);
      const maxV = Math.max(1, ...bars.map((b) => (Number.isFinite(b.value) ? b.value : 0)));

      bars.forEach((bar, i) => {
        const v = Number.isFinite(bar.value) ? bar.value : 0;
        const bh = Math.max(0, (v / maxV) * usableH);
        const x = i * slot + gap;
        const color = bar.color ?? DEFAULT_BAR_COLOR;
        out.push({
          type: 'rect',
          id: `bar-${i}`,
          x,
          y: baseline - bh,
          width: barW,
          height: bh,
          color,
          fill: color,
        });
        const label = bar.label ?? (bars.length <= 24 ? String(v) : undefined);
        if (label) {
          out.push({
            type: 'text',
            x: x + barW / 2,
            y: baseline - bh - 8,
            text: label,
            color: '#374151',
            fontSize: 11,
            align: 'center',
          });
        }
      });

      ranges.forEach((r) => {
        const kind = r.kind ?? 'fill';
        if (kind !== 'fill') return;
        const color = r.color ?? RANGE_COLOR_DEFAULT;
        out.push({
          type: 'rect',
          x: r.from * slot,
          y: panelYBars,
          width: (r.to - r.from + 1) * slot,
          height: primaryH,
          color,
          fill: color,
          opacity: RANGE_FILL_OPACITY,
        });
        if (r.label) {
          out.push({
            type: 'text',
            x: r.from * slot + 4,
            // Sits below the bracket block (if any) so fill and bracket labels never collide.
            y: panelYBars + 10 + bracketHeadroom,
            text: r.label,
            color,
            fontSize: 10,
            align: 'left',
          });
        }
      });

      bracketRanges.forEach((r, i) => {
        const bracketY = panelYBars + BRACKET_TOP_OFFSET + i * BRACKET_ROW_H;
        const x1 = r.from * slot + slot * 0.1;
        const x2 = (r.to + 1) * slot - slot * 0.1;
        const color = r.color ?? RANGE_COLOR_DEFAULT;
        out.push({ type: 'line', x1, y1: bracketY, x2, y2: bracketY, color, lineWidth: 2 });
        out.push({ type: 'line', x1, y1: bracketY, x2: x1, y2: bracketY + BRACKET_TICK_H, color, lineWidth: 2 });
        out.push({ type: 'line', x1: x2, y1: bracketY, x2: x2, y2: bracketY + BRACKET_TICK_H, color, lineWidth: 2 });
        if (r.label) {
          out.push({
            type: 'text',
            x: (x1 + x2) / 2,
            y: bracketY - BRACKET_LABEL_OFFSET,
            text: r.label,
            color,
            fontSize: 10,
            align: 'center',
          });
        }
      });

      if (hasAux) {
        const auxH = panelHeight - primaryH;
        const slot2 = width / auxBars.length;
        const auxBaseline = panelYBars + primaryH + auxH - AUX_BASELINE_PAD;
        const auxUsableH = auxBaseline - (panelYBars + primaryH + AUX_LABEL_BAND);
        const maxAuxV = Math.max(1, ...auxBars.map((b) => (Number.isFinite(b.value) ? b.value : 0)));

        auxBars.forEach((bar, i) => {
          const v = Number.isFinite(bar.value) ? bar.value : 0;
          const bh = Math.max(0, (v / maxAuxV) * auxUsableH);
          const x = i * slot2 + slot2 * 0.1;
          const w = slot2 * 0.8;
          const color = bar.color ?? DEFAULT_BAR_COLOR;
          out.push({
            type: 'rect',
            id: `auxbar-${i}`,
            x,
            y: auxBaseline - bh,
            width: w,
            height: bh,
            color,
            fill: color,
          });
          const label = bar.label ?? (auxBars.length <= 24 ? String(v) : undefined);
          if (label) {
            out.push({
              type: 'text',
              x: x + w / 2,
              y: auxBaseline - bh - 8,
              text: label,
              color: '#374151',
              fontSize: 11,
              align: 'center',
            });
          }
        });
      }

      // Bars win the pointer tie-break: pointers only retarget slots when bars is empty (below).
      pointers.forEach((p) => {
        if (p.index < 0 || p.index >= bars.length) return;
        const cx = p.index * slot + slot / 2;
        const color = p.color ?? DEFAULT_POINTER_COLOR;
        out.push({
          type: 'arrow',
          x1: cx,
          y1: panelYBars + primaryH - 18,
          x2: cx,
          y2: baseline + 4,
          color,
          lineWidth: 2,
        });
        if (p.label) {
          out.push({
            type: 'text',
            x: cx,
            y: panelYBars + primaryH - 8,
            text: p.label,
            color,
            fontSize: 11,
            align: 'center',
          });
        }
      });
    }

    // --- slots: registers/variables as boxes, horizontal row or bottom-up vertical stack ---
    if (slots.length > 0) {
      const panelYSlots = panelY.slots;
      const n = slots.length;
      const vertical = slotOrientation === 'vertical';

      const vBoxH = panelHeight / n;
      const vBoxW = Math.min(width * 0.5, 120);
      const vBoxX = (width - vBoxW) / 2;

      const hCellW = width / n;
      const hBoxW = hCellW * 0.82;
      const hBoxH = Math.min(panelHeight * 0.6, 48);
      const hBoxY = panelYSlots + (panelHeight - hBoxH) / 2;

      const slotBox = (i: number): { x: number; y: number; width: number; height: number } =>
        vertical
          ? { x: vBoxX, y: panelYSlots + panelHeight - (i + 1) * vBoxH, width: vBoxW, height: vBoxH }
          : { x: i * hCellW + (hCellW - hBoxW) / 2, y: hBoxY, width: hBoxW, height: hBoxH };

      slots.forEach((s, i) => {
        const box = slotBox(i);
        const state: AlgorithmSlotState = s.state ?? 'filled';
        const fill =
          state === 'empty'
            ? SLOT_EMPTY_FILL
            : state === 'highlight'
              ? (s.color ?? SLOT_HIGHLIGHT_DEFAULT)
              : (s.color ?? DEFAULT_BAR_COLOR);
        const stroke = state === 'empty' ? SLOT_EMPTY_STROKE : SLOT_FILLED_STROKE;
        out.push({
          type: 'rect',
          id: `slot-${i}`,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          color: stroke,
          fill,
        });
        if (s.value != null && state !== 'empty') {
          out.push({
            type: 'text',
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            text: String(s.value),
            color: SLOT_VALUE_TEXT_COLOR,
            fontSize: 12,
            align: 'center',
          });
        }
      });

      if (bars.length === 0) {
        pointers.forEach((p) => {
          if (p.index < 0 || p.index >= slots.length) return;
          const box = slotBox(p.index);
          const color = p.color ?? DEFAULT_POINTER_COLOR;
          if (vertical) {
            const cy = box.y + box.height / 2;
            out.push({
              type: 'arrow',
              x1: box.x + box.width + 34,
              y1: cy,
              x2: box.x + box.width + 4,
              y2: cy,
              color,
              lineWidth: 2,
            });
            if (p.label) {
              out.push({
                type: 'text',
                x: box.x + box.width + 38,
                y: cy,
                text: p.label,
                color,
                fontSize: 11,
                align: 'left',
              });
            }
          } else {
            const cx = box.x + box.width / 2;
            out.push({
              type: 'arrow',
              x1: cx,
              y1: panelYSlots + panelHeight - 18,
              x2: cx,
              y2: box.y + box.height + 4,
              color,
              lineWidth: 2,
            });
            if (p.label) {
              out.push({
                type: 'text',
                x: cx,
                y: panelYSlots + panelHeight - 8,
                text: p.label,
                color,
                fontSize: 11,
                align: 'center',
              });
            }
          }
        });
      }
    }

    // --- cells: a row/col lattice sized to the observed extent; rowLabels/colLabels add gutters ---
    if (cells.length > 0) {
      const panelYCells = panelY.cells;
      const maxCol = Math.max(0, ...cells.map((c) => c.col)) + 1;
      const maxRow = Math.max(0, ...cells.map((c) => c.row)) + 1;
      const colLabelH = colLabels.length > 0 ? 16 : 0;
      const rowLabelW = rowLabels.length > 0 ? 20 : 0;
      const gridX0 = rowLabelW;
      const gridY0 = panelYCells + colLabelH;
      const cw = (width - rowLabelW) / maxCol;
      const ch = (panelHeight - colLabelH) / maxRow;

      cells.forEach((c, i) => {
        const x = gridX0 + c.col * cw;
        const y = gridY0 + c.row * ch;
        const color = c.color ?? DEFAULT_CELL_COLOR;
        out.push({
          type: 'rect',
          id: `cell-${i}`,
          x: x + 1,
          y: y + 1,
          width: cw - 2,
          height: ch - 2,
          color: '#9ca3af',
          fill: color,
        });
        const label = c.label ?? (c.value != null ? String(c.value) : undefined);
        if (label && cw >= 18 && ch >= 14) {
          out.push({
            type: 'text',
            x: x + cw / 2,
            y: y + ch / 2,
            text: label,
            color: '#111827',
            fontSize: 12,
            align: 'center',
          });
        }
        if (c.corner && cw >= CORNER_MIN_CELL && ch >= CORNER_MIN_CELL) {
          const { tl, tr, bl, br } = c.corner;
          if (tl) {
            out.push({
              type: 'text',
              x: x + CORNER_INSET_X,
              y: y + CORNER_INSET_Y,
              text: tl,
              color: CORNER_TEXT_COLOR,
              fontSize: CORNER_FONT_SIZE,
              align: 'left',
            });
          }
          if (tr) {
            out.push({
              type: 'text',
              x: x + cw - CORNER_INSET_X,
              y: y + CORNER_INSET_Y,
              text: tr,
              color: CORNER_TEXT_COLOR,
              fontSize: CORNER_FONT_SIZE,
              align: 'right',
            });
          }
          if (bl) {
            out.push({
              type: 'text',
              x: x + CORNER_INSET_X,
              y: y + ch - CORNER_INSET_Y,
              text: bl,
              color: CORNER_TEXT_COLOR,
              fontSize: CORNER_FONT_SIZE,
              align: 'left',
            });
          }
          if (br) {
            out.push({
              type: 'text',
              x: x + cw - CORNER_INSET_X,
              y: y + ch - CORNER_INSET_Y,
              text: br,
              color: CORNER_TEXT_COLOR,
              fontSize: CORNER_FONT_SIZE,
              align: 'right',
            });
          }
        }
      });

      colLabels.forEach((l) => {
        out.push({
          type: 'text',
          x: gridX0 + l.index * cw + cw / 2,
          y: panelYCells + colLabelH / 2,
          text: l.text,
          color: l.color ?? AXIS_LABEL_COLOR,
          fontSize: AXIS_LABEL_FONT_SIZE,
          align: 'center',
        });
      });
      rowLabels.forEach((l) => {
        out.push({
          type: 'text',
          x: rowLabelW - 6,
          y: gridY0 + l.index * ch + ch / 2,
          text: l.text,
          color: l.color ?? AXIS_LABEL_COLOR,
          fontSize: AXIS_LABEL_FONT_SIZE,
          align: 'right',
        });
      });
    }

    // --- buckets: hash-table rows, an index chip plus a clamped chain of entries ---
    if (buckets.length > 0) {
      const panelYBuckets = panelY.buckets;
      const bucketCount = Math.max(0, ...buckets.map((b) => b.index)) + 1;
      const rowH = panelHeight / bucketCount;
      const indexColW = Math.min(width * 0.12, 40);
      const maxChainLen = Math.max(1, ...buckets.map((b) => b.entries.length));
      const entryW = Math.min(BUCKET_ENTRY_MAX_W, Math.max(BUCKET_ENTRY_MIN_W, (width - indexColW - 8) / maxChainLen));
      const maxVisible = Math.floor((width - indexColW - 4) / entryW);

      buckets.forEach((b) => {
        const rowY = panelYBuckets + b.index * rowH;
        out.push({
          type: 'rect',
          id: `bucket-index-${b.index}`,
          x: 2,
          y: rowY + 2,
          width: indexColW - 4,
          height: rowH - 4,
          color: BUCKET_INDEX_STROKE,
          fill: BUCKET_INDEX_FILL,
        });
        out.push({
          type: 'text',
          x: 2 + (indexColW - 4) / 2,
          y: rowY + rowH / 2,
          text: String(b.index),
          color: BUCKET_INDEX_TEXT,
          fontSize: 10,
          align: 'center',
        });

        const overflow = b.entries.length > maxVisible;
        const visibleCount = overflow ? Math.max(0, maxVisible - 1) : b.entries.length;
        for (let j = 0; j < visibleCount; j++) {
          const entry = b.entries[j];
          const ex = indexColW + 4 + j * entryW;
          const state = entry.state ?? 'default';
          const fill =
            state === 'highlight'
              ? (entry.color ?? BUCKET_ENTRY_HIGHLIGHT)
              : state === 'probing'
                ? (entry.color ?? BUCKET_ENTRY_PROBING)
                : (entry.color ?? BUCKET_ENTRY_DEFAULT);
          out.push({
            type: 'rect',
            id: `bucket-${b.index}-${j}`,
            x: ex,
            y: rowY + 2,
            width: entryW - 2,
            height: rowH - 4,
            color: fill,
            fill,
          });
          if (entryW >= 20 && rowH >= 16) {
            out.push({
              type: 'text',
              x: ex + (entryW - 2) / 2,
              y: rowY + rowH / 2,
              text: entry.label,
              color: BUCKET_ENTRY_TEXT,
              fontSize: 10,
              align: 'center',
            });
          }
        }
        if (overflow) {
          const ex = indexColW + 4 + visibleCount * entryW;
          out.push({
            type: 'rect',
            id: `bucket-${b.index}-overflow`,
            x: ex,
            y: rowY + 2,
            width: entryW - 2,
            height: rowH - 4,
            color: BUCKET_ENTRY_DEFAULT,
            fill: BUCKET_ENTRY_DEFAULT,
          });
          out.push({
            type: 'text',
            x: ex + (entryW - 2) / 2,
            y: rowY + rowH / 2,
            text: `+${b.entries.length - visibleCount}`,
            color: BUCKET_ENTRY_TEXT,
            fontSize: 10,
            align: 'center',
          });
        }
      });
    }

    // --- frames: a bottom-up call stack, one strip per frame ---
    if (frames.length > 0) {
      const panelYFrames = panelY.frames;
      const n = frames.length;
      const maxStride = (panelHeight - FRAME_BOTTOM_PAD - TOP_PAD) / n;
      const stride = Math.min(FRAME_STRIP_H + FRAME_GAP, maxStride);
      const frameH = Math.max(FRAME_MIN_H, stride - FRAME_GAP);
      const x = 8;
      const w = width - 16;
      const bottom = panelYFrames + panelHeight - FRAME_BOTTOM_PAD;

      frames.forEach((f, i) => {
        const y = bottom - i * stride - frameH;
        const state = f.state ?? 'active';
        const fill =
          state === 'returning'
            ? (f.color ?? FRAME_RETURNING_COLOR)
            : state === 'done'
              ? (f.color ?? FRAME_DONE_COLOR)
              : (f.color ?? FRAME_ACTIVE_COLOR);
        const rim = f.color ?? FRAME_RIM_COLOR[state] ?? FRAME_RIM_COLOR.active;
        out.push({ type: 'rect', id: `frame-${i}`, x, y, width: w, height: frameH, color: rim, fill });
        if (frameH >= FRAME_TWO_LINE_MIN_H) {
          out.push({
            type: 'text',
            x: 16,
            y: y + frameH * 0.35,
            text: f.label,
            color: FRAME_LABEL_COLOR,
            fontSize: 11,
            align: 'left',
          });
          if (f.detail) {
            out.push({
              type: 'text',
              x: 16,
              y: y + frameH * 0.72,
              text: f.detail,
              color: FRAME_DETAIL_COLOR,
              fontSize: 10,
              align: 'left',
            });
          }
        } else {
          out.push({
            type: 'text',
            x: 16,
            y: y + frameH / 2,
            text: f.label,
            color: FRAME_LABEL_COLOR,
            fontSize: 10,
            align: 'left',
          });
        }
      });
    }

    out.push(...shapes);
    return out;
  }, [bars, cells, pointers, ranges, slots, slotOrientation, frames, buckets, auxBars, rowLabels, colLabels, shapes, width, height]);

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <LearningCanvas
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          shapes={derivedShapes}
          interactive={interactive}
          animate={animate}
          onShapeClick={onShapeClick}
          isLoading={isLoading}
          error={error}
        />
      </VStack>
    </Card>
  );
};
