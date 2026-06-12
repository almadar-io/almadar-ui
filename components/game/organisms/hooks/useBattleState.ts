'use client';
/**
 * useBattleState Hook
 *
 * Extracts all game-logic state management from BattleBoard into a
 * standalone hook.  This powers the **UncontrolledBattleBoard** wrapper,
 * keeping the core BattleBoard organism purely controlled (read-only).
 *
 * Manages:
 * - units, selectedUnitId, phase, turn, gameResult
 * - checkGameEnd, attack damage, movement, phase transitions, turn advancement
 * - handleRestart (reset to initial state)
 *
 * Emits events via `useEventBus()` when event prop names are provided.
 *
 * @packageDocumentation
 */

import { useState, useCallback } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { useEventBus } from '../../../../hooks/useEventBus';
import type { BattlePhase } from '../BattleBoard';
import { str, num, unitPosition, unitTeam, unitHealth } from '../boardEntity';

// =============================================================================
// Types
// =============================================================================

export interface BattleStateEventConfig {
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    unitClickEvent?: EventEmit<{ unitId: string }>;
    endTurnEvent?: EventEmit<Record<string, never>>;
    cancelEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'victory' | 'defeat' }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    attackEvent?: EventEmit<{ attackerId: string; targetId: string; damage: number }>;
}

export interface BattleStateCallbacks {
    /** Called when a unit attacks another */
    onAttack?: (attacker: EntityRow, target: EntityRow, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: EntityRow, to: { x: number; y: number }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: EntityRow, target: EntityRow) => number;
}

export interface BattleStateResult {
    // State
    units: EntityRow[];
    selectedUnitId: string | null;
    phase: BattlePhase;
    turn: number;
    gameResult: 'victory' | 'defeat' | null;

    // Handlers
    handleTileClick: (x: number, y: number) => void;
    handleUnitClick: (unitId: string) => void;
    handleEndTurn: () => void;
    handleRestart: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useBattleState(
    initialUnits: EntityRow[],
    eventConfig: BattleStateEventConfig = {},
    callbacks: BattleStateCallbacks = {},
): BattleStateResult {
    const eventBus = useEventBus();

    const {
        tileClickEvent,
        unitClickEvent,
        endTurnEvent,
        gameEndEvent,
        playAgainEvent,
        attackEvent,
        cancelEvent,
    } = eventConfig;

    const { onAttack, onGameEnd, onUnitMove, calculateDamage } = callbacks;

    // ── Game-logic state ─────────────────────────────────────────────────
    const [units, setUnits] = useState<EntityRow[]>(initialUnits);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [phase, setPhase] = useState<BattlePhase>('observation');
    const [turn, setTurn] = useState(1);
    const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

    // ── Check game end ───────────────────────────────────────────────────
    const checkGameEnd = useCallback((currentUnits: EntityRow[]) => {
        const pa = currentUnits.filter(u => unitTeam(u) === 'player' && unitHealth(u) > 0);
        const ea = currentUnits.filter(u => unitTeam(u) === 'enemy' && unitHealth(u) > 0);
        if (pa.length === 0) {
            setGameResult('defeat');
            setPhase('game_over');
            onGameEnd?.('defeat');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'defeat' });
            }
        } else if (ea.length === 0) {
            setGameResult('victory');
            setPhase('game_over');
            onGameEnd?.('victory');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'victory' });
            }
        }
    }, [onGameEnd, gameEndEvent, eventBus]);

    // ── Handle unit click ────────────────────────────────────────────────
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => str(u.id) === unitId);
        if (!unit) return;

        if (unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId });
        }

        if (phase === 'observation' || phase === 'selection') {
            if (unitTeam(unit) === 'player') {
                setSelectedUnitId(unitId);
                setPhase('movement');
            }
        } else if (phase === 'action') {
            const selectedUnit = units.find(u => str(u.id) === selectedUnitId);
            if (!selectedUnit) return;

            if (unitTeam(unit) === 'enemy') {
                // Check adjacency for melee attack
                const up = unitPosition(unit);
                const sp = unitPosition(selectedUnit);
                const dx = Math.abs(up.x - sp.x);
                const dy = Math.abs(up.y - sp.y);
                if (dx <= 1 && dy <= 1 && dx + dy > 0) {
                    const damage = calculateDamage
                        ? calculateDamage(selectedUnit, unit)
                        : Math.max(1, num(selectedUnit.attack) - num(unit.defense));

                    const newHealth = Math.max(0, unitHealth(unit) - damage);
                    const updatedUnits = units.map(u =>
                        str(u.id) === str(unit.id) ? { ...u, health: newHealth } : u,
                    );
                    setUnits(updatedUnits);

                    onAttack?.(selectedUnit, unit, damage);
                    if (attackEvent) {
                        eventBus.emit(`UI:${attackEvent}`, {
                            attackerId: str(selectedUnit.id),
                            targetId: str(unit.id),
                            damage,
                        });
                    }

                    setSelectedUnitId(null);
                    setPhase('observation');
                    setTurn(t => t + 1);

                    setTimeout(() => checkGameEnd(updatedUnits), 100);
                }
            }
        }
    }, [units, selectedUnitId, phase, checkGameEnd, onAttack, calculateDamage, unitClickEvent, attackEvent, eventBus]);

    // ── Handle tile click (movement) ─────────────────────────────────────
    const handleTileClick = useCallback((x: number, y: number) => {
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }

        if (phase === 'movement' && selectedUnitId) {
            const selectedUnit = units.find(u => str(u.id) === selectedUnitId);
            if (!selectedUnit) return;

            // Validate the move is in range
            const sp = unitPosition(selectedUnit);
            const dx = Math.abs(x - sp.x);
            const dy = Math.abs(y - sp.y);
            const dist = dx + dy;
            if (dist > 0 && dist <= num(selectedUnit.movement)) {
                // Check no unit occupies the target tile
                if (!units.some(u => {
                    const p = unitPosition(u);
                    return p.x === x && p.y === y && unitHealth(u) > 0;
                })) {
                    setUnits(prev =>
                        prev.map(u =>
                            str(u.id) === selectedUnitId ? { ...u, position: { x, y } } : u,
                        ),
                    );
                    setPhase('action');
                    onUnitMove?.(selectedUnit, { x, y });
                }
            }
        }
    }, [phase, selectedUnitId, units, tileClickEvent, eventBus, onUnitMove]);

    // ── End turn ─────────────────────────────────────────────────────────
    const handleEndTurn = useCallback(() => {
        setSelectedUnitId(null);
        setPhase('observation');
        setTurn(t => t + 1);
        if (endTurnEvent) {
            eventBus.emit(`UI:${endTurnEvent}`, {});
        }
    }, [endTurnEvent, eventBus]);

    // ── Restart ──────────────────────────────────────────────────────────
    const handleRestart = useCallback(() => {
        setUnits(initialUnits);
        setSelectedUnitId(null);
        setPhase('observation');
        setTurn(1);
        setGameResult(null);
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [initialUnits, playAgainEvent, eventBus]);

    return {
        units,
        selectedUnitId,
        phase,
        turn,
        gameResult,
        handleTileClick,
        handleUnitClick,
        handleEndTurn,
        handleRestart,
    };
}
