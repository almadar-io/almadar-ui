'use client';

/**
 * AvlCosmicZoom - Interactive Zoomable Orbital Visualization
 *
 * The host organism that owns the SVG viewport and delegates to
 * scene renderers at each zoom level. Manages animation, pan/zoom,
 * and breadcrumb navigation.
 *
 * @packageDocumentation
 */

import React, { useReducer, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { HStack } from '../../atoms/Stack';
import type { OrbitalSchema } from '@almadar/core';
import {
  parseApplicationLevel,
  parseOrbitalLevel,
  parseTraitLevel,
  parseTransitionLevel,
} from './avl-schema-parser';
import {
  zoomReducer,
  initialZoomState,
  getBreadcrumbs,
  type ZoomLevel,
  type ZoomAction,
} from './avl-zoom-state';
import { AvlApplicationScene } from './AvlApplicationScene';
import { AvlOrbitalScene } from './AvlOrbitalScene';
import { AvlTraitScene } from './AvlTraitScene';
import { AvlTransitionScene } from './AvlTransitionScene';
import { AvlLegend } from './AvlLegend';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AvlCosmicZoomProps {
  /** The orbital schema (parsed object or JSON string) */
  schema: OrbitalSchema | string;
  /** CSS class for the outer container */
  className?: string;
  /** Primary color for the visualization */
  color?: string;
  /** Enable animations (default: true) */
  animated?: boolean;
  /** Pre-select an orbital on mount */
  initialOrbital?: string;
  /** Pre-select a trait on mount */
  initialTrait?: string;
  /** Callback when zoom level changes */
  onZoomChange?: (level: ZoomLevel, context: { orbital?: string; trait?: string }) => void;
  /** Container width */
  width?: number | string;
  /** Container height */
  height?: number | string;
  /** Coverage data for verification overlay */
  stateCoverage?: Record<string, 'covered' | 'uncovered' | 'partial'>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEWBOX_W = 600;
const VIEWBOX_H = 400;
const ANIMATION_DURATION = 600;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AvlCosmicZoom: React.FC<AvlCosmicZoomProps> = ({
  schema: schemaProp,
  className,
  color = 'var(--color-primary)',
  animated = true,
  initialOrbital,
  initialTrait,
  onZoomChange,
  width = '100%',
  height = 400,
  stateCoverage,
}) => {
  // Parse schema
  const schema: OrbitalSchema = useMemo(() => {
    if (typeof schemaProp === 'string') {
      try { return JSON.parse(schemaProp); }
      catch { return { name: 'Error', orbitals: [] }; }
    }
    return schemaProp;
  }, [schemaProp]);

  // Zoom state machine
  const [state, dispatch] = useReducer(zoomReducer, initialZoomState);
  const sceneRef = useRef<SVGGElement>(null);
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});

  // Handle initial selections
  useEffect(() => {
    if (initialOrbital) {
      dispatch({ type: 'ZOOM_INTO_ORBITAL', orbital: initialOrbital, targetPosition: { x: VIEWBOX_W / 2, y: VIEWBOX_H / 2 } });
      // Immediately complete animation for initial state
      setTimeout(() => dispatch({ type: 'ANIMATION_COMPLETE' }), 0);

      if (initialTrait) {
        setTimeout(() => {
          dispatch({ type: 'ZOOM_INTO_TRAIT', trait: initialTrait, targetPosition: { x: VIEWBOX_W / 2, y: VIEWBOX_H / 2 } });
          setTimeout(() => dispatch({ type: 'ANIMATION_COMPLETE' }), 0);
        }, 10);
      }
    }
  }, [initialOrbital, initialTrait]);

  // Notify zoom changes
  useEffect(() => {
    onZoomChange?.(state.level, {
      orbital: state.selectedOrbital ?? undefined,
      trait: state.selectedTrait ?? undefined,
    });
  }, [state.level, state.selectedOrbital, state.selectedTrait, onZoomChange]);

  // Animation handling
  useEffect(() => {
    if (!state.animating || !animated) {
      if (state.animating) {
        dispatch({ type: 'ANIMATION_COMPLETE' });
      }
      setTransitionStyle({});
      return;
    }

    const target = state.animationTarget;
    if (!target) return;

    if (state.animationDirection === 'in') {
      // Zoom in: scale up around target point
      setTransitionStyle({
        transform: `scale(${target.scale}) translate(${-(target.x - VIEWBOX_W / 2)}px, ${-(target.y - VIEWBOX_H / 2)}px)`,
        transformOrigin: `${target.x}px ${target.y}px`,
        transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease`,
        opacity: 0.3,
      });
    } else {
      // Zoom out: scale down from current position
      setTransitionStyle({
        transform: `scale(${target.scale})`,
        transformOrigin: 'center center',
        transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease`,
        opacity: 0.3,
      });
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'ANIMATION_COMPLETE' });
      setTransitionStyle({});
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [state.animating, state.animationDirection, state.animationTarget, animated]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch({ type: 'ZOOM_OUT' });
    }
  }, []);

  // Dispatch helpers
  const handleOrbitalClick = useCallback((name: string, pos: { x: number; y: number }) => {
    dispatch({ type: 'ZOOM_INTO_ORBITAL', orbital: name, targetPosition: pos });
  }, []);

  const handleTraitClick = useCallback((name: string, pos: { x: number; y: number }) => {
    dispatch({ type: 'ZOOM_INTO_TRAIT', trait: name, targetPosition: pos });
  }, []);

  const handleTraitSwitch = useCallback((name: string) => {
    dispatch({ type: 'SWITCH_TRAIT', trait: name });
  }, []);

  // Highlighted trait at orbital level (hover, not zoom)
  const [highlightedTrait, setHighlightedTrait] = React.useState<string | null>(null);

  const handleTransitionClick = useCallback((index: number, pos: { x: number; y: number }) => {
    dispatch({ type: 'ZOOM_INTO_TRANSITION', transitionIndex: index, targetPosition: pos });
  }, []);

  const handleBreadcrumbClick = useCallback((targetLevel: ZoomLevel) => {
    // Zoom out until we reach the target level
    const levelOrder: ZoomLevel[] = ['application', 'orbital', 'trait', 'transition'];
    const currentIdx = levelOrder.indexOf(state.level);
    const targetIdx = levelOrder.indexOf(targetLevel);
    if (targetIdx < currentIdx) {
      dispatch({ type: 'ZOOM_OUT' });
    }
  }, [state.level]);

  // Parse data for current level
  const sceneContent = useMemo(() => {
    switch (state.level) {
      case 'application': {
        const data = parseApplicationLevel(schema);
        return (
          <AvlApplicationScene
            data={data}
            color={color}
            onOrbitalClick={handleOrbitalClick}
          />
        );
      }

      case 'orbital': {
        if (!state.selectedOrbital) return null;
        const data = parseOrbitalLevel(schema, state.selectedOrbital);
        if (!data) return null;
        return (
          <AvlOrbitalScene
            data={data}
            color={color}
            highlightedTrait={highlightedTrait}
            onTraitClick={handleTraitClick}
            onTraitHighlight={setHighlightedTrait}
          />
        );
      }

      case 'trait': {
        if (!state.selectedOrbital || !state.selectedTrait) return null;
        const data = parseTraitLevel(schema, state.selectedOrbital, state.selectedTrait);
        if (!data) return null;
        return (
          <AvlTraitScene
            data={data}
            color={color}
            onTransitionClick={handleTransitionClick}
          />
        );
      }

      case 'transition': {
        if (!state.selectedOrbital || !state.selectedTrait || state.selectedTransition === null) return null;
        const data = parseTransitionLevel(schema, state.selectedOrbital, state.selectedTrait, state.selectedTransition);
        if (!data) return null;
        return (
          <AvlTransitionScene
            data={data}
            color={color}
          />
        );
      }

      default:
        return null;
    }
  }, [state.level, state.selectedOrbital, state.selectedTrait, state.selectedTransition, schema, color, handleOrbitalClick, handleTraitClick, handleTransitionClick, highlightedTrait, setHighlightedTrait]);

  const breadcrumbs = getBreadcrumbs(state);

  return (
    <Box
      className={`relative ${className ?? ''}`}
      style={{ width, height: typeof height === 'number' ? `${height}px` : height }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Breadcrumb navigation */}
      <HStack
        gap="xs"
        align="center"
        className="absolute top-2 left-2 z-10 bg-[var(--color-surface)]/80 backdrop-blur rounded-md px-3 py-1.5"
      >
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.level}>
            {i > 0 && (
              <Typography variant="small" color="muted" className="mx-1">/</Typography>
            )}
            {i < breadcrumbs.length - 1 ? (
              <Box
                as="span"
                className="cursor-pointer hover:underline"
                onClick={() => handleBreadcrumbClick(crumb.level)}
              >
                <Typography variant="small" color="muted">
                  {crumb.label}
                </Typography>
              </Box>
            ) : (
              <Typography variant="small" color="primary" className="font-bold">
                {crumb.label}
              </Typography>
            )}
          </React.Fragment>
        ))}
      </HStack>

      {/* Sibling trait tabs (shown at trait level) */}
      {state.level === 'trait' && state.selectedOrbital && (() => {
        const orbData = parseOrbitalLevel(schema, state.selectedOrbital!);
        if (!orbData || orbData.traits.length <= 1) return null;
        return (
          <HStack
            gap="xs"
            align="center"
            className="absolute top-2 right-2 z-10 bg-[var(--color-surface)]/80 backdrop-blur rounded-md px-1.5 py-1"
          >
            {orbData.traits.map((t) => (
              <Box
                key={t.name}
                as="button"
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${
                  t.name === state.selectedTrait
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                    : 'bg-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)]'
                }`}
                onClick={() => handleTraitSwitch(t.name)}
              >
                {t.name}
              </Box>
            ))}
          </HStack>
        );
      })()}

      {/* Zoom out hint */}
      {state.level !== 'application' && (
        <Typography
          variant="small"
          color="muted"
          className="absolute bottom-2 right-2 z-10 bg-[var(--color-surface)]/60 backdrop-blur rounded px-2 py-1"
        >
          Press Esc to zoom out
        </Typography>
      )}

      {/* SVG viewport */}
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label={`${schema.name} orbital visualization - ${state.level} level`}
      >
        <g ref={sceneRef} style={transitionStyle}>
          {sceneContent}
        </g>
        <AvlLegend level={state.level} color={color} />

      </svg>
    </Box>
  );
};

AvlCosmicZoom.displayName = 'AvlCosmicZoom';
