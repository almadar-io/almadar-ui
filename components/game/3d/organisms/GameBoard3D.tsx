'use client';
/**
 * GameBoard3D
 *
 * Controlled 3D tactics board organism. Reads all gameplay state
 * (selectedUnitId, validMoves, attackTargets, phase, result) from the entity
 * prop and renders <GameCanvas3D> with those controlled values.
 * Emits user interactions via event bus so the parent Orbital trait drives
 * all state transitions.
 *
 * @packageDocumentation
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Button } from '../../../core/atoms/Button';
import { Typography } from '../../../core/atoms/Typography';
import { VStack, HStack } from '../../../core/atoms/Stack';
import { useEventBus } from '../../../../hooks/useEventBus';
import { GameCanvas3D } from '../molecules/GameCanvas3D';
import type { CameraMode } from '../molecules/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import { boardEntity, str, num, rows, unitPosition, unitTeam, unitHealth } from '../../shared/boardEntity';

// =============================================================================
// Props
// =============================================================================

export interface GameBoard3DProps {
    /** Entity row carrying all gameplay state (controlled). */
    entity?: EntityRow | readonly EntityRow[];
    /** Static tile data (config default). */
    tiles?: IsometricTile[];
    /** Static feature data (config default). */
    features?: IsometricFeature[];
    /** Camera mode forwarded to GameCanvas3D. */
    cameraMode?: CameraMode;
    /** Background color forwarded to GameCanvas3D. */
    backgroundColor?: string;
    /** Unit draw-size multiplier forwarded to GameCanvas3D. Default 1. */
    unitScale?: number;
    /** Board zoom/group scale forwarded to GameCanvas3D. Default 0.45. */
    scale?: number;
    /** Declarative tile click event emitted to the model. */
    tileClickEvent?: EventEmit<{ tileId: string; x: number; z: number }>;
    /** Declarative unit click event emitted to the model. */
    unitClickEvent?: EventEmit<{ unitId: string; x: number; z: number }>;
    /** Emits UI:{attackEvent} with { attackerId, targetId, damage } on attack. */
    attackEvent?: EventEmit<{ attackerId: string; targetId: string; damage: number }>;
    /** Emits UI:{endTurnEvent} with {} on end turn. */
    endTurnEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{cancelEvent} with {} on cancel. */
    cancelEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{playAgainEvent} with {} on play again / reset. */
    playAgainEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{gameEndEvent} with { result } when win/loss is detected. */
    gameEndEvent?: EventEmit<{ result: 'victory' | 'defeat' }>;
    /** Additional CSS class. */
    className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function GameBoard3D({
    entity,
    tiles = [],
    features = [],
    cameraMode = 'perspective',
    backgroundColor = '#2a1a1a',
    unitScale = 1,
    scale = 0.45,
    tileClickEvent,
    unitClickEvent,
    attackEvent,
    endTurnEvent,
    cancelEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: GameBoard3DProps): React.JSX.Element | null {
    const row = boardEntity(entity);
    const eventBus = useEventBus();

    // All gameplay state comes from the model entity.
    const entityUnits = row ? rows(row.units) : [];
    const units: IsometricUnit[] = entityUnits.map(r => ({
        id: str(r.id),
        x: num(r.x),
        y: num(r.y),
        z: num(r.z),
        faction: (str(r.faction) || 'neutral') as 'player' | 'enemy' | 'neutral',
        team: (str(r.team) || str(r.faction) || 'neutral') as 'player' | 'enemy' | 'neutral',
        unitType: r.unitType == null ? undefined : str(r.unitType),
        name: r.name == null ? undefined : str(r.name),
        health: r.health == null ? undefined : num(r.health),
        maxHealth: r.maxHealth == null ? undefined : num(r.maxHealth),
    }));
    const selectedUnitId = row ? str(row.selectedUnitId) || null : null;
    const phase = row ? str(row.phase) : 'observation';
    const result = row ? str(row.result) : 'none';

    // validMoves / attackTargets are stored in the entity as {x,z} arrays.
    const validMoves = row && Array.isArray(row.validMoves)
        ? (row.validMoves as Array<{ x: number; z: number }>)
        : [];
    const attackTargets = row && Array.isArray(row.attackTargets)
        ? (row.attackTargets as Array<{ x: number; z: number }>)
        : [];

    const turn = row ? num(row.turn) : 0;
    const currentTeam = row ? str(row.currentTeam) : 'player';

    const isGameOver = result !== 'none';

    // Ref-gate prevents double-emit when both the ATTACK click and the tick set result.
    const gameEndEmittedRef = useRef(false);
    useEffect(() => {
        if ((result === 'victory' || result === 'defeat') && gameEndEvent) {
            if (!gameEndEmittedRef.current) {
                gameEndEmittedRef.current = true;
                eventBus.emit(`UI:${gameEndEvent}`, { result });
            }
        } else {
            gameEndEmittedRef.current = false;
        }
    }, [result, gameEndEvent, eventBus]);

    // -- Check game end (emit only — state owned by model) --
    const checkGameEnd = useCallback(() => {
        const alivePlayer = entityUnits.filter(u => unitTeam(u) === 'player' && unitHealth(u) > 0);
        const aliveEnemy = entityUnits.filter(u => unitTeam(u) === 'enemy' && unitHealth(u) > 0);
        if (alivePlayer.length === 0 && gameEndEvent) {
            eventBus.emit(`UI:${gameEndEvent}`, { result: 'defeat' });
        } else if (aliveEnemy.length === 0 && gameEndEvent) {
            eventBus.emit(`UI:${gameEndEvent}`, { result: 'victory' });
        }
    }, [entityUnits, gameEndEvent, eventBus]);

    // -- Unit click callback: GameCanvas3D already emits unitClickEvent for the
    //    model's UNIT_CLICK/selection transitions. This callback intercepts the same
    //    click to emit ATTACK when an enemy is clicked in action phase.
    const handleUnitClickCallback = useCallback((isoUnit: IsometricUnit) => {
        if (phase !== 'action' || !selectedUnitId || !attackEvent) return;
        const attackerRow = entityUnits.find(u => str(u.id) === selectedUnitId);
        const targetRow = entityUnits.find(u => str(u.id) === isoUnit.id);
        if (!attackerRow || !targetRow) return;
        if (unitTeam(targetRow) !== 'enemy' || unitHealth(targetRow) <= 0) return;
        const ap = unitPosition(attackerRow);
        const tp = unitPosition(targetRow);
        const dx = Math.abs(ap.x - tp.x);
        const dy = Math.abs(ap.y - tp.y);
        if (dx <= 1 && dy <= 1 && (dx + dy) > 0) {
            const damage = Math.max(1, num(attackerRow.attack) - num(targetRow.defense));
            eventBus.emit(`UI:${attackEvent}`, {
                attackerId: str(attackerRow.id),
                targetId: str(targetRow.id),
                damage,
            });
            setTimeout(checkGameEnd, 100);
        }
    }, [phase, selectedUnitId, entityUnits, attackEvent, eventBus, checkGameEnd]);

    // -- Phase controls (emit only) --
    const handleEndTurn = useCallback(() => {
        if (endTurnEvent) eventBus.emit(`UI:${endTurnEvent}`, {});
    }, [endTurnEvent, eventBus]);

    const handleCancel = useCallback(() => {
        if (cancelEvent) eventBus.emit(`UI:${cancelEvent}`, {});
    }, [cancelEvent, eventBus]);

    const handlePlayAgain = useCallback(() => {
        if (playAgainEvent) eventBus.emit(`UI:${playAgainEvent}`, {});
    }, [playAgainEvent, eventBus]);

    return (
        <VStack className={cn('game-board-3d block w-full min-h-[85vh] relative', className)}>
            {/* Phase / turn status bar */}
            <div className="game-board-3d__status absolute top-3 left-3 z-10 flex gap-2 items-center">
                <Typography variant="small" className="status__phase capitalize">
                    {phase.replace('_', ' ')}
                </Typography>
                {currentTeam && !isGameOver && (
                    <Typography variant="small" color="muted" className="status__team">
                        — {currentTeam === 'player' ? 'Your Turn' : "Enemy's Turn"}
                    </Typography>
                )}
                <Typography variant="small" color="muted" className="status__turn">
                    Turn {turn}
                </Typography>
            </div>

            {/* 3D canvas — pure render, driven entirely by controlled props */}
            <GameCanvas3D
                tiles={tiles}
                units={units}
                features={features}
                cameraMode={cameraMode}
                showGrid
                showCoordinates={false}
                showTileInfo={false}
                shadows
                backgroundColor={backgroundColor}
                tileClickEvent={tileClickEvent}
                unitClickEvent={unitClickEvent}
                onUnitClick={handleUnitClickCallback}
                selectedUnitId={selectedUnitId}
                validMoves={validMoves}
                attackTargets={attackTargets}
                unitScale={unitScale}
                scale={scale}
                className="game-board-3d__canvas w-full min-h-[85vh]"
            />

            {/* END_TURN / CANCEL action buttons (visible during active play) */}
            {!isGameOver && (
                <HStack className="fixed bottom-6 right-6 z-50" gap="sm">
                    {(phase === 'selection' || phase === 'movement' || phase === 'action') && (
                        <Button
                            variant="secondary"
                            className="shadow-xl"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    {phase !== 'enemy_turn' && (
                        <Button
                            variant="primary"
                            className="shadow-xl"
                            onClick={handleEndTurn}
                        >
                            End Turn
                        </Button>
                    )}
                </HStack>
            )}

            {/* Win/lose overlay */}
            {isGameOver && (
                <div className="game-board-3d__overlay absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                    <VStack align="center" gap="md" className="overlay__card p-8 rounded-xl bg-gray-900/90 shadow-2xl">
                        <Typography
                            variant="h2"
                            className={cn(
                                'overlay__result',
                                result === 'victory' ? 'text-yellow-400' : 'text-red-500',
                            )}
                        >
                            {result === 'victory' ? 'Victory!' : 'Defeat'}
                        </Typography>
                        <Typography variant="body" color="muted" className="overlay__turn-count">
                            Completed in {turn} turn{turn !== 1 ? 's' : ''}
                        </Typography>
                        <Button
                            variant="primary"
                            className="px-8 py-3 font-semibold"
                            onClick={handlePlayAgain}
                        >
                            Play Again
                        </Button>
                    </VStack>
                </div>
            )}
        </VStack>
    );
}

GameBoard3D.displayName = 'GameBoard3D';

export default GameBoard3D;
