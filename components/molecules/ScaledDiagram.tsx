/**
 * ScaledDiagram Molecule
 *
 * Wraps a fixed-size diagram (like JazariStateMachine / StateMachineView)
 * and scales it down via CSS transform to fit the parent container width.
 * Measures the child's intrinsic width on mount and computes a scale factor.
 *
 * Event Contract:
 * - No events emitted (layout-only wrapper)
 * - entityAware: false
 */

import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Box } from '../atoms/Box';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface ScaledDiagramProps {
  children: React.ReactNode;
  className?: string;
}

export const ScaledDiagram: React.FC<ScaledDiagramProps> = ({
  children,
  className,
}) => {
  const { t: _t } = useTranslate();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerHeight, setInnerHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const containerW = outer.clientWidth;
    const childW = inner.scrollWidth;

    if (childW > 0 && containerW > 0 && childW > containerW) {
      const s = containerW / childW;
      setScale(s);
      setInnerHeight(inner.scrollHeight * s);
    } else {
      setScale(1);
      setInnerHeight(undefined);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  // Re-measure on resize
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(outer);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <Box
      ref={outerRef}
      className={cn('w-full overflow-hidden', className)}
      style={{ height: innerHeight }}
    >
      <div
        ref={innerRef}
        style={{
          transformOrigin: 'top left',
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </Box>
  );
};

ScaledDiagram.displayName = 'ScaledDiagram';
