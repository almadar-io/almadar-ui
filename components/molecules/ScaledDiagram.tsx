/**
 * ScaledDiagram Molecule
 *
 * Measures the available container width via ResizeObserver and passes it
 * as a `maxWidth` prop to child diagram components (e.g. JazariStateMachine).
 * This lets the visualizer compute its layout at the correct size from the
 * start, rather than rendering large and CSS-scaling down.
 *
 * Event Contract:
 * - No events emitted (layout-only wrapper)
 * - entityAware: false
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    if (w > 0) setContainerWidth(w);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(raf);
  }, [measure]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [measure]);

  // Clone children to inject maxWidth prop
  const enhancedChildren = containerWidth > 0
    ? React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ maxWidth?: number }>,
            { maxWidth: containerWidth },
          );
        }
        return child;
      })
    : null;

  return (
    <Box
      ref={wrapperRef}
      className={cn('w-full overflow-x-auto', className)}
    >
      {enhancedChildren}
    </Box>
  );
};

ScaledDiagram.displayName = 'ScaledDiagram';
