'use client';

/**
 * DiagramTooltip — A portaled tooltip for SVG diagram visualizations.
 *
 * Renders a positioned overlay at a given (x, y) screen coordinate.
 * Supports viewport clamping and pinning (click to lock).
 *
 * Extracted from the builder's OrbitalStateMachineView pattern.
 */

import React, { useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../atoms/Box';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface DiagramTooltipProps {
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Anchor X in viewport coordinates */
  x: number;
  /** Anchor Y in viewport coordinates */
  y: number;
  /** Tooltip content */
  children: React.ReactNode;
  /** Whether the tooltip is pinned (click-locked) */
  pinned?: boolean;
  /** Called when mouse enters the tooltip (prevents hide) */
  onMouseEnter?: () => void;
  /** Called when mouse leaves the tooltip */
  onMouseLeave?: () => void;
  /** Max width in px */
  maxWidth?: number;
  /** Additional CSS class */
  className?: string;
}

const VIEWPORT_PADDING = 20;

export const DiagramTooltip: React.FC<DiagramTooltipProps> = ({
  visible,
  x,
  y,
  children,
  pinned = false,
  onMouseEnter,
  onMouseLeave,
  maxWidth = 400,
  className,
}) => {
  const { t } = useTranslate();
  void t;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const rect = tooltipRef.current.getBoundingClientRect();
    const tooltipWidth = rect.width;
    const tooltipHeight = rect.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: prefer right of anchor, fallback left, then center
    let left: number;
    const spaceRight = vw - x - VIEWPORT_PADDING;
    const spaceLeft = x - VIEWPORT_PADDING;

    if (spaceRight >= tooltipWidth + 20) {
      left = x + 20;
    } else if (spaceLeft >= tooltipWidth + 20) {
      left = x - tooltipWidth - 20;
    } else {
      left = Math.max(VIEWPORT_PADDING, Math.min(x - tooltipWidth / 2, vw - tooltipWidth - VIEWPORT_PADDING));
    }

    // Vertical: center on anchor, clamp to viewport
    let top = y - tooltipHeight / 2;
    top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - tooltipHeight - VIEWPORT_PADDING));

    // Final clamps
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - tooltipWidth - VIEWPORT_PADDING));

    setPosition({ left, top });
  }, [visible, x, y]);

  if (!visible || typeof window === 'undefined') return null;

  return createPortal(
    <Box
      ref={tooltipRef}
      className={cn(
        'fixed z-[99999] animate-in fade-in-0 zoom-in-95 duration-150',
        pinned ? 'pointer-events-auto' : 'pointer-events-none',
        className,
      )}
      style={{
        left: position.left,
        top: position.top,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box
        className="rounded-lg shadow-xl border px-4 py-3"
        style={{
          backgroundColor: 'rgba(22, 27, 34, 0.98)',
          borderColor: pinned ? 'var(--color-success)' : '#8b5cf6',
          borderWidth: pinned ? 2 : 1,
          maxWidth,
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>,
    document.body,
  );
};

DiagramTooltip.displayName = 'DiagramTooltip';
