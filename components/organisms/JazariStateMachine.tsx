'use client';

/**
 * JazariStateMachine — Full Al-Jazari state machine diagram organism.
 *
 * Extracts a trait's state machine from an orbital schema (or accepts a trait
 * directly), runs the layout engine, and composes gears, arms, axis, and border
 * into a single SVG wrapped in a Box.
 */

import React, { useMemo } from 'react';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { JazariGear } from '../atoms/JazariGear';
import { JazariTransitionArm } from '../molecules/JazariTransitionArm';
import { JazariGoldenAxis } from '../molecules/JazariGoldenAxis';
import { JazariArabesqueBorder } from '../molecules/JazariArabesqueBorder';
import { computeJazariLayout } from '../../lib/jazari/layout';
import { arrowheadPath } from '../../lib/jazari/svg-paths';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';
import type { EntityDisplayProps } from './types';

// ---------------------------------------------------------------------------
// Loose schema types (avoid hard dependency on @almadar/core)
// ---------------------------------------------------------------------------

interface SmState {
  name: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  isFinal?: boolean;
}

interface SmTransition {
  from: string;
  to: string;
  event: string;
  guard?: unknown;
  effects?: unknown[];
}

interface SmStateMachine {
  states: SmState[];
  transitions: SmTransition[];
}

interface SmTrait {
  name: string;
  stateMachine?: SmStateMachine;
  linkedEntity?: string;
}

interface SmEntity {
  name: string;
  fields?: Array<{ name: string }>;
}

interface SmOrbital {
  entity?: SmEntity;
  traits?: SmTrait[];
}

interface SmSchema {
  orbitals?: SmOrbital[];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface JazariStateMachineProps extends EntityDisplayProps {
  /** Full schema — extracts first trait's state machine */
  schema?: SmSchema;
  /** Or pass a single trait directly */
  trait?: SmTrait;
  /** Which trait to visualize (default: 0) */
  traitIndex?: number;
  /** Override entity field labels on golden axis */
  entityFields?: string[];
  /** Text direction (default: 'ltr') */
  direction?: 'ltr' | 'rtl';
  /** Show arabesque border (default: true) */
  showBorder?: boolean;
  /** Show golden axis (default: true) */
  showAxis?: boolean;
  /** Show guard lock icons (default: true) */
  showGuards?: boolean;
  /** Show effect pipe icons (default: true) */
  showEffects?: boolean;
}

// ---------------------------------------------------------------------------
// Extract trait from schema
// ---------------------------------------------------------------------------

function extractTrait(
  schema: SmSchema | undefined,
  trait: SmTrait | undefined,
  traitIndex: number,
): SmTrait | null {
  if (trait) return trait;
  if (!schema?.orbitals?.length) return null;

  // Scan all orbitals for traits
  for (const orbital of schema.orbitals) {
    const traits = orbital.traits ?? [];
    if (traitIndex < traits.length) {
      return traits[traitIndex];
    }
  }
  return null;
}

function extractEntityFields(schema: SmSchema | undefined): string[] {
  if (!schema?.orbitals?.length) return [];
  const entity = schema.orbitals[0].entity;
  if (!entity?.fields) return [];
  return entity.fields.map((f) => f.name);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ARROW_SIZE = 8;

export const JazariStateMachine: React.FC<JazariStateMachineProps> = ({
  schema,
  trait: traitProp,
  traitIndex = 0,
  entityFields: entityFieldsProp,
  direction = 'ltr',
  showBorder = true,
  showAxis = true,
  showGuards = true,
  showEffects = true,
  className,
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslate();
  void t;

  const resolvedTrait = useMemo(
    () => extractTrait(schema, traitProp, traitIndex),
    [schema, traitProp, traitIndex],
  );

  const entityFields = useMemo(
    () => entityFieldsProp ?? extractEntityFields(schema),
    [entityFieldsProp, schema],
  );

  const layout = useMemo(() => {
    if (!resolvedTrait?.stateMachine) return null;
    const sm = resolvedTrait.stateMachine;
    return computeJazariLayout({
      states: sm.states,
      transitions: sm.transitions,
      entityFields,
      direction,
    });
  }, [resolvedTrait, entityFields, direction]);

  if (isLoading) {
    return <LoadingState message="Loading state machine…" />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!resolvedTrait || !layout || layout.gears.length === 0) {
    return (
      <Box padding="lg" className={cn('text-center', className)}>
        <Typography variant="body" className="opacity-60">
          No state machine to visualize
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={cn('jazari-state-machine', className)} padding="none">
      <svg
        width="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: layout.width, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label={`State machine diagram for ${resolvedTrait.name}`}
      >
        <defs>
          {/* Glow filter for initial state */}
          <filter id="jazari-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrowhead marker */}
          <marker
            id="jazari-arrow"
            viewBox={`0 0 ${ARROW_SIZE} ${ARROW_SIZE}`}
            refX={ARROW_SIZE}
            refY={ARROW_SIZE / 2}
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d={arrowheadPath(ARROW_SIZE)} fill={JAZARI_COLORS.brass} fillOpacity={0.7} />
          </marker>
        </defs>

        {/* Background */}
        <rect
          x={0}
          y={0}
          width={layout.width}
          height={layout.height}
          fill={JAZARI_COLORS.ivory}
          fillOpacity={0.03}
          rx={8}
        />

        {/* Arabesque border */}
        {showBorder && (
          <JazariArabesqueBorder width={layout.width} height={layout.height} />
        )}

        {/* Golden axis */}
        {showAxis && (
          <JazariGoldenAxis
            y={layout.axisY}
            startX={layout.axisStartX}
            endX={layout.axisEndX}
            entityFields={layout.entityFields}
          />
        )}

        {/* Transition arms (rendered before gears so gears overlap) */}
        {layout.arms.map((arm, i) => (
          <JazariTransitionArm
            key={`${arm.from}-${arm.to}-${arm.event}-${i}`}
            arm={arm}
            showGuards={showGuards}
            showEffects={showEffects}
          />
        ))}

        {/* State gears */}
        {layout.gears.map((gear) => (
          <JazariGear
            key={gear.name}
            cx={gear.cx}
            cy={gear.cy}
            radius={gear.radius}
            label={gear.name}
            isInitial={gear.isInitial}
            isTerminal={gear.isTerminal}
          />
        ))}

        {/* Trait name */}
        <text
          x={layout.width / 2}
          y={20}
          textAnchor="middle"
          fill={JAZARI_COLORS.gold}
          fontSize={13}
          fontWeight={700}
          fontFamily="'Noto Naskh Arabic', serif"
        >
          {resolvedTrait.name}
        </text>
      </svg>
    </Box>
  );
};

JazariStateMachine.displayName = 'JazariStateMachine';
