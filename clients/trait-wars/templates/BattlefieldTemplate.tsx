/**
 * BattlefieldTemplate
 *
 * Main game screen combining HexGrid, HUD, sidebar panels, and controls.
 * Uses GameTemplate as base layout with trait-wars specific content.
 */

import React from 'react';
import { cn } from '@almadar/ui';
import { Box } from '@almadar/ui';
import { Button } from '@almadar/ui';
import { Typography } from '@almadar/ui';
import { GameTemplate } from '@almadar/ui';
import { HexGrid, HexTileEntity, GridUnit } from '../organisms/HexGrid';
import { CombatLog, CombatEvent } from '../organisms/CombatLog';
import { TraitPanel, TraitDefinition } from '../organisms/TraitPanel';
import { UnitCard, UnitEntity } from '../molecules/UnitCard';
import { TurnIndicator, PlayerInfo, GamePhase } from '../molecules/TurnIndicator';
import { ActionMenu, GameAction } from '../molecules/ActionMenu';
import { TraitName } from '../atoms/TraitIcon';

export interface MatchEntity {
    id: string;
    phase: GamePhase;
    turnNumber: number;
    currentPlayerId: string;
    winner?: string;
}

export interface BattlefieldTemplateProps {
    /** Match state */
    match: MatchEntity;
    /** Current player info */
    currentPlayer: PlayerInfo;
    /** All players */
    players: PlayerInfo[];
    /** Hex tiles for the grid */
    tiles: HexTileEntity[];
    /** Units on the battlefield */
    units: GridUnit[];
    /** Unit entities with full data */
    unitEntities: UnitEntity[];
    /** Combat events log */
    combatEvents?: CombatEvent[];
    /** Available traits for equipping */
    availableTraits?: TraitDefinition[];
    /** Currently selected unit */
    selectedUnit?: UnitEntity | null;
    /** Valid moves for selected unit */
    validMoves?: { x: number; y: number }[];
    /** Attack targets for selected unit */
    attackTargets?: { x: number; y: number }[];
    /** Available actions for selected unit */
    availableActions?: GameAction[];
    /** Player resources */
    resources?: number;
    /** Handler for tile clicks */
    onTileClick?: (x: number, y: number) => void;
    /** Handler for unit clicks */
    onUnitClick?: (unitId: string) => void;
    /** Handler for action selection */
    onAction?: (actionId: string) => void;
    /** Handler for ending turn */
    onEndTurn?: () => void;
    /** Handler for trait equip */
    onEquipTrait?: (traitName: TraitName) => void;
    /** Handler for trait unequip */
    onUnequipTrait?: (traitName: TraitName) => void;
    /** Show debug panel */
    showDebug?: boolean;
    /** Whether it's local player's turn */
    isYourTurn?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function BattlefieldTemplate({
    match,
    currentPlayer,
    players,
    tiles,
    units,
    unitEntities,
    combatEvents = [],
    availableTraits = [],
    selectedUnit = null,
    validMoves = [],
    attackTargets = [],
    availableActions = [],
    resources = 0,
    onTileClick,
    onUnitClick,
    onAction,
    onEndTurn,
    onEquipTrait,
    onUnequipTrait,
    showDebug = false,
    isYourTurn = false,
    className,
}: BattlefieldTemplateProps): JSX.Element {
    // Find the selected unit's grid unit
    const selectedGridUnit = selectedUnit
        ? units.find((u) => u.id === selectedUnit.id)
        : null;

    // HUD content
    const hudContent = (
        <Box display="flex" className="items-center gap-4">
            <TurnIndicator
                currentPlayer={currentPlayer}
                turnNumber={match.turnNumber}
                phase={match.phase}
                isYourTurn={isYourTurn}
            />

            {isYourTurn && (
                <Button variant="primary" size="sm" onClick={onEndTurn}>
                    End Turn
                </Button>
            )}
        </Box>
    );

    // Debug panel content
    const debugContent = showDebug ? (
        <Box className="space-y-4">
            <Box>
                <Typography variant="body2" className="font-bold">Match State</Typography>
                <Typography variant="caption" className="font-mono block">
                    Phase: {match.phase}
                </Typography>
                <Typography variant="caption" className="font-mono block">
                    Turn: {match.turnNumber}
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" className="font-bold">Units</Typography>
                <Typography variant="caption" className="font-mono block">
                    Total: {units.length}
                </Typography>
                <Typography variant="caption" className="font-mono block">
                    Selected: {selectedUnit?.name || 'None'}
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" className="font-bold">Grid</Typography>
                <Typography variant="caption" className="font-mono block">
                    Tiles: {tiles.length}
                </Typography>
                <Typography variant="caption" className="font-mono block">
                    Valid Moves: {validMoves.length}
                </Typography>
            </Box>
        </Box>
    ) : undefined;

    return (
        <GameTemplate
            title="Trait Wars"
            hud={hudContent}
            debugPanel={debugContent}
            showDebugPanel={showDebug}
            className={className}
        >
            <Box display="flex" fullWidth fullHeight className="relative">
                {/* Main Battlefield */}
                <Box display="flex" className="flex-1 items-center justify-center p-4 overflow-auto">
                    <HexGrid
                        tiles={tiles}
                        units={units}
                        selectedUnit={selectedGridUnit}
                        validMoves={validMoves}
                        attackTargets={attackTargets}
                        onTileClick={onTileClick}
                        onUnitClick={onUnitClick}
                        showCoordinates={showDebug}
                    />
                </Box>

                {/* Right Sidebar */}
                <Box
                    display="flex"
                    className="flex-col w-80 border-l-2 border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                    {/* Selected Unit Card */}
                    <Box padding="sm" className="border-b border-[var(--color-border)]">
                        {selectedUnit ? (
                            <UnitCard
                                unit={selectedUnit}
                                isSelected
                                onTraitClick={(traitName) => onAction?.(traitName)}
                            />
                        ) : (
                            <Box display="flex" className="items-center justify-center h-24 opacity-50">
                                <Typography variant="body2">Select a unit</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Action Menu */}
                    {selectedUnit && availableActions.length > 0 && (
                        <Box padding="sm" className="border-b border-[var(--color-border)]">
                            <ActionMenu
                                actions={availableActions}
                                onAction={onAction || (() => { })}
                                onCancel={() => onUnitClick?.('')}
                                orientation="horizontal"
                                title="Actions"
                            />
                        </Box>
                    )}

                    {/* Combat Log */}
                    <Box className="flex-1 overflow-hidden">
                        <CombatLog events={combatEvents} maxVisible={20} />
                    </Box>
                </Box>
            </Box>
        </GameTemplate>
    );
}

BattlefieldTemplate.displayName = 'BattlefieldTemplate';

export default BattlefieldTemplate;
