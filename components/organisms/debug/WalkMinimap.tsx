'use client';
/**
 * WalkMinimap
 *
 * Visual minimap for orbital-verify state walks.
 * Shows trait overview pills, state graph for active trait,
 * and coverage progress. Replaces the text-based walk step indicator.
 *
 * Data comes from window.__orbitalWalkStep, window.__orbitalWalkTraits,
 * and window.__orbitalCoveredEdges (broadcast by phase4-browser.ts).
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { Box } from '../../atoms/Box';
import { HStack, VStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';

// ---------------------------------------------------------------------------
// Types (mirrored from phase4-browser.ts broadcasts)
// ---------------------------------------------------------------------------

interface WalkStepInfo {
  from: string;
  event: string;
  to: string;
  guardCase: string | null;
  isRepositioning: boolean;
  accepted: boolean;
  stepIndex: number;
  stepTotal: number;
  traitName: string;
  phase: string;
}

interface WalkTraitInfo {
  name: string;
  route?: string;
  initialState: string;
  states: string[];
  transitions: Array<{ from: string; to: string; event: string }>;
}

interface CoveredEdge {
  trait: string;
  from: string;
  event: string;
  to: string;
  phase: string;
}

// ---------------------------------------------------------------------------
// Layout: simple layered positioning for small state graphs
// ---------------------------------------------------------------------------

interface NodePos {
  x: number;
  y: number;
  state: string;
}

function layoutGraph(
  states: string[],
  transitions: Array<{ from: string; to: string; event: string }>,
  initialState: string,
  width: number,
  height: number,
): NodePos[] {
  if (states.length === 0) return [];

  // BFS layer assignment from initial state
  const layers = new Map<string, number>();
  const queue = [initialState];
  layers.set(initialState, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const layer = layers.get(current)!;
    for (const tr of transitions) {
      if (tr.from === current && !layers.has(tr.to)) {
        layers.set(tr.to, layer + 1);
        queue.push(tr.to);
      }
    }
  }

  // Assign unvisited states
  for (const s of states) {
    if (!layers.has(s)) layers.set(s, (layers.size > 0 ? Math.max(...layers.values()) + 1 : 0));
  }

  // Group by layer
  const layerGroups = new Map<number, string[]>();
  for (const [state, layer] of layers) {
    const group = layerGroups.get(layer) ?? [];
    group.push(state);
    layerGroups.set(layer, group);
  }

  const maxLayer = Math.max(...layerGroups.keys(), 0);
  const padX = 24;
  const padY = 20;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const positions: NodePos[] = [];
  for (const [layer, group] of layerGroups) {
    const y = maxLayer === 0 ? usableH / 2 + padY : padY + (layer / maxLayer) * usableH;
    for (let i = 0; i < group.length; i++) {
      const x = group.length === 1
        ? width / 2
        : padX + (i / (group.length - 1)) * usableW;
      positions.push({ x, y, state: group[i] });
    }
  }

  return positions;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WalkMinimap(): React.ReactElement | null {
  const [walkStep, setWalkStep] = React.useState<WalkStepInfo | null>(null);
  const [traits, setTraits] = React.useState<WalkTraitInfo[]>([]);
  const [coveredEdges, setCoveredEdges] = React.useState<CoveredEdge[]>([]);
  const [completedTraits, setCompletedTraits] = React.useState<Set<string>>(new Set());
  const prevTraitRef = React.useRef<string | null>(null);

  // Poll for walk data from window globals
  React.useEffect(() => {
    const interval = setInterval(() => {
      const w = window as unknown as Record<string, unknown>;
      const step = w.__orbitalWalkStep as WalkStepInfo | undefined;
      const traitConfigs = w.__orbitalWalkTraits as WalkTraitInfo[] | undefined;
      const edges = w.__orbitalCoveredEdges as CoveredEdge[] | undefined;

      if (step) setWalkStep(step);
      if (traitConfigs) setTraits(traitConfigs);
      if (edges) setCoveredEdges(edges);

      // Track completed traits (when active trait changes, previous is done)
      if (step && prevTraitRef.current && prevTraitRef.current !== step.traitName) {
        setCompletedTraits(prev => new Set(prev).add(prevTraitRef.current!));
      }
      if (step) prevTraitRef.current = step.traitName;
    }, 250);
    return () => clearInterval(interval);
  }, []);

  if (!walkStep || traits.length === 0) return null;

  const activeTrait = traits.find(t => t.name === walkStep.traitName);
  const engineCount = coveredEdges.filter(e => e.phase === 'engine').length;
  const domCount = coveredEdges.filter(e => e.phase === 'dom').length;
  const totalTransitions = traits.reduce((sum, t) => sum + t.transitions.length, 0);

  // Build edge coverage lookup for active trait
  const activeEdgeKeys = new Set(
    coveredEdges
      .filter(e => e.trait === walkStep.traitName)
      .map(e => `${e.from}+${e.event}->${e.to}`),
  );
  const activeEdgePhases = new Map(
    coveredEdges
      .filter(e => e.trait === walkStep.traitName)
      .map(e => [`${e.from}+${e.event}->${e.to}`, e.phase] as const),
  );

  // Current firing edge
  const currentEdgeKey = `${walkStep.from}+${walkStep.event}->${walkStep.to}`;

  // Graph layout
  const graphW = 260;
  const graphH = 120;
  const nodeR = 10;
  const positions = activeTrait
    ? layoutGraph(activeTrait.states, activeTrait.transitions, activeTrait.initialState, graphW, graphH)
    : [];
  const posMap = new Map(positions.map(p => [p.state, p]));

  // Visited states
  const visitedStates = new Set(
    coveredEdges
      .filter(e => e.trait === walkStep.traitName)
      .flatMap(e => [e.from, e.to]),
  );

  return (
    <VStack gap="none" className="w-64 flex-shrink-0 border-l border-border bg-[var(--color-card)] overflow-hidden">
      {/* Layer 1: Trait pills */}
      <Box className="px-2 py-1.5 border-b border-border overflow-x-auto">
        <HStack gap="xs" className="flex-nowrap">
          {traits.map(t => {
            const isDone = completedTraits.has(t.name);
            const isActive = t.name === walkStep.traitName;
            const variant = isDone ? 'success' : isActive ? 'info' : 'neutral';
            // Shorten name: remove entity prefix for display
            const shortName = t.name.replace(/^[A-Z][a-z]+/, '');
            return (
              <Badge
                key={t.name}
                variant={variant}
                size="sm"
                className={`flex-shrink-0 text-[9px] ${isActive ? 'ring-1 ring-cyan-400' : ''}`}
              >
                {isDone ? '\u2713' : isActive ? '\u25CF' : '\u25CB'} {shortName || t.name}
              </Badge>
            );
          })}
        </HStack>
      </Box>

      {/* Layer 2: State graph SVG */}
      <Box className="flex-1 flex items-center justify-center px-1 py-1">
        {activeTrait && (
          <svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`}>
            <defs>
              <marker id="mm-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="#888" />
              </marker>
              <marker id="mm-arrow-green" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="#22c55e" />
              </marker>
              <marker id="mm-arrow-cyan" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="#06b6d4" />
              </marker>
              <marker id="mm-arrow-yellow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="#eab308" />
              </marker>
            </defs>

            {/* Edges */}
            {activeTrait.transitions.map((tr, i) => {
              const fromPos = posMap.get(tr.from);
              const toPos = posMap.get(tr.to);
              if (!fromPos || !toPos) return null;

              const key = `${tr.from}+${tr.event}->${tr.to}` as const;
              const isCurrent = key === currentEdgeKey && !walkStep.isRepositioning;
              const isCovered = activeEdgeKeys.has(key);
              const phase = activeEdgePhases.get(key);

              // Edge color
              let stroke = '#555';
              let markerEnd = 'url(#mm-arrow)';
              let strokeWidth = 1;
              let opacity = 0.4;

              if (isCurrent) {
                stroke = '#eab308';
                markerEnd = 'url(#mm-arrow-yellow)';
                strokeWidth = 2.5;
                opacity = 1;
              } else if (isCovered && phase === 'dom') {
                stroke = '#06b6d4';
                markerEnd = 'url(#mm-arrow-cyan)';
                strokeWidth = 1.5;
                opacity = 0.9;
              } else if (isCovered) {
                stroke = '#22c55e';
                markerEnd = 'url(#mm-arrow-green)';
                strokeWidth = 1.5;
                opacity = 0.9;
              }

              // Self-loop
              if (tr.from === tr.to) {
                const cx = fromPos.x;
                const cy = fromPos.y - nodeR - 8;
                return (
                  <g key={`e-${i}`}>
                    <path
                      d={`M${cx - 5},${fromPos.y - nodeR} C${cx - 18},${cy - 14} ${cx + 18},${cy - 14} ${cx + 5},${fromPos.y - nodeR}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      markerEnd={markerEnd}
                    />
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize="7" fill={stroke} opacity={opacity}>
                      {tr.event.length > 10 ? tr.event.slice(0, 8) + '..' : tr.event}
                    </text>
                  </g>
                );
              }

              // Offset for parallel edges
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;

              // Check for parallel edge (same from/to pair, different direction)
              const hasReverse = activeTrait.transitions.some(
                t2 => t2.from === tr.to && t2.to === tr.from,
              );
              const offset = hasReverse ? 4 : 0;

              const x1 = fromPos.x + (dx / len) * nodeR + nx * offset;
              const y1 = fromPos.y + (dy / len) * nodeR + ny * offset;
              const x2 = toPos.x - (dx / len) * (nodeR + 6) + nx * offset;
              const y2 = toPos.y - (dy / len) * (nodeR + 6) + ny * offset;

              // Label position
              const mx = (x1 + x2) / 2 + nx * 8;
              const my = (y1 + y2) / 2 + ny * 8;

              return (
                <g key={`e-${i}`}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    markerEnd={markerEnd}
                  >
                    {isCurrent && (
                      <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
                    )}
                  </line>
                  <text x={mx} y={my} textAnchor="middle" fontSize="7" fill={stroke} opacity={Math.min(opacity + 0.2, 1)}>
                    {tr.event.length > 12 ? tr.event.slice(0, 10) + '..' : tr.event}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {positions.map(pos => {
              const isCurrentState = pos.state === walkStep.from || pos.state === walkStep.to;
              const isVisited = visitedStates.has(pos.state);
              const isInitial = pos.state === activeTrait.initialState;

              let fill = '#333';
              let strokeColor = '#555';
              let sw = 1;

              if (isCurrentState) {
                fill = '#1e40af';
                strokeColor = '#3b82f6';
                sw = 2;
              } else if (isVisited) {
                fill = '#166534';
                strokeColor = '#22c55e';
                sw = 1.5;
              }

              return (
                <g key={pos.state}>
                  {isInitial && (
                    <circle cx={pos.x} cy={pos.y} r={nodeR + 3} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={0.4} />
                  )}
                  <circle
                    cx={pos.x} cy={pos.y} r={nodeR}
                    fill={fill} stroke={strokeColor} strokeWidth={sw}
                  >
                    {isCurrentState && (
                      <animate attributeName="r" values={`${nodeR};${nodeR + 2};${nodeR}`} dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <text
                    x={pos.x} y={pos.y + nodeR + 10}
                    textAnchor="middle" fontSize="8" fill="#aaa"
                  >
                    {pos.state.length > 10 ? pos.state.slice(0, 8) + '..' : pos.state}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </Box>

      {/* Layer 3: Progress footer */}
      <Box className="px-2 py-1 border-t border-border">
        <HStack gap="sm" className="items-center justify-between">
          <Typography variant="caption" className="text-[10px] font-mono text-green-500">
            Engine: {engineCount}/{totalTransitions}
          </Typography>
          {domCount > 0 && (
            <Typography variant="caption" className="text-[10px] font-mono text-cyan-500">
              DOM: {domCount}
            </Typography>
          )}
          <Badge variant={walkStep.phase === 'engine' ? 'info' : 'warning'} size="sm" className="text-[9px]">
            {walkStep.phase === 'engine' ? 'Engine' : 'DOM'}
          </Badge>
        </HStack>
      </Box>
    </VStack>
  );
}

WalkMinimap.displayName = 'WalkMinimap';
