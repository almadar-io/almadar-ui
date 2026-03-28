'use client';

/**
 * ZoomLegend — Collapsible HTML overlay showing AVL primitives
 * relevant to the current zoom band.
 */

import React, { useState } from 'react';
import type { ZoomBand } from '../../molecules/avl/avl-canvas-types';

export interface ZoomLegendProps {
  band: ZoomBand;
}

interface LegendItem {
  icon: string;
  label: string;
}

const BAND_LEGENDS: Record<ZoomBand, LegendItem[]> = {
  system: [
    { icon: '\u25C9', label: 'Entity' },
    { icon: '\u25CF\u25B2\u25A0\u25C6', label: 'Field types' },
    { icon: '\u25CF\u2501\u25CF', label: 'State chain' },
    { icon: '\u25A0', label: 'Page' },
    { icon: '\u2500 \u2500', label: 'Event wire' },
  ],
  module: [
    { icon: '\u25C9', label: 'Entity' },
    { icon: '\u26C1', label: 'Persistence' },
    { icon: '\u25CF\u25B2\u25A0\u25C6\u25CB\u2B21\u2261', label: 'Field types' },
    { icon: '\u2501\u25CF\u2501', label: 'State machine' },
    { icon: '\u229E\u270E\u26C1\uD83D\uDCE1', label: 'Effects' },
    { icon: '\u25A0', label: 'Page' },
    { icon: '\u25C0\u301C\u301C / \u301C\u301C\u25B6', label: 'Emit/Listen' },
  ],
  behavior: [
    { icon: '\u25CF green', label: 'Initial state' },
    { icon: '\u25CF red', label: 'Terminal state' },
    { icon: '\u25CF blue', label: 'Hub state' },
    { icon: '\u26A1', label: 'Event' },
    { icon: '\u25C7', label: 'Guard' },
    { icon: '\u229E\u270E\u26C1\uD83D\uDCE1\uD83D\uDD14', label: 'Effects' },
    { icon: '\u2500 \u2500 orange', label: 'Emit/Listen' },
  ],
  detail: [
    { icon: '\u26A1', label: 'Trigger event' },
    { icon: '\u25C7', label: 'Guard diamond' },
    { icon: '\u229E', label: 'render-ui' },
    { icon: '\u270E', label: 'set' },
    { icon: '\u26C1', label: 'persist' },
    { icon: '\uD83D\uDCE1', label: 'emit' },
    { icon: '@', label: 'Binding' },
    { icon: '\u25CF\u25B2\u25A0', label: 'Field types' },
  ],
};

export const ZoomLegend: React.FC<ZoomLegendProps> = ({ band }) => {
  const [collapsed, setCollapsed] = useState(true);
  const items = BAND_LEGENDS[band];

  return (
    <div className="absolute bottom-2 left-2 z-10">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="px-2 py-1 text-[10px] rounded-md bg-[var(--color-card)]/90 border border-[var(--color-border)] text-[var(--color-muted-foreground)] backdrop-blur-sm cursor-pointer hover:bg-[var(--color-card)]"
      >
        {collapsed ? 'Legend' : 'Hide'}
      </button>
      {!collapsed && (
        <div className="mt-1 px-2 py-1.5 rounded-md bg-[var(--color-card)]/95 border border-[var(--color-border)] backdrop-blur-sm space-y-0.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted-foreground)]">
              <span className="opacity-70 w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ZoomLegend.displayName = 'ZoomLegend';
