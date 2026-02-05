/**
 * WorldMapTemplate Component
 *
 * Navigate between locations, encounter enemies on the strategic map.
 */

import React, { useState } from 'react';
import { Box, Typography, HStack, VStack, cn } from '@almadar/ui';
import { MapNode } from '../atoms/MapNode';
import { ResourceBar } from '../molecules/ResourceBar';
import { Resources, MapNodeData } from '../types/resources';

export interface WorldMapTemplateProps {
    /** Map data */
    mapData: {
        id: string;
        name: string;
        nodes: MapNodeData[];
        playerPosition: string;
        turnNumber: number;
    };
    /** Player hero info */
    playerHero: {
        id: string;
        name: string;
        level: number;
        archetype: string;
    };
    /** Player resources */
    resources: Resources;
    /** Handler when a node is selected */
    onNodeSelect?: (node: MapNodeData) => void;
    /** Handler when player moves to a node */
    onMove?: (nodeId: string) => void;
    /** Handler for end turn */
    onEndTurn?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * WorldMapTemplate displays the strategic world map for navigation.
 */
export function WorldMapTemplate({
    mapData,
    playerHero,
    resources,
    onNodeSelect,
    onMove,
    onEndTurn,
    className,
}: WorldMapTemplateProps): JSX.Element {
    const [selectedNode, setSelectedNode] = useState<MapNodeData | null>(null);

    const handleNodeClick = (node: MapNodeData) => {
        setSelectedNode(node);
        onNodeSelect?.(node);
    };

    const handleMove = () => {
        if (selectedNode && selectedNode.accessible) {
            onMove?.(selectedNode.id);
            setSelectedNode(null);
        }
    };

    return (
        <Box
            className={cn(
                'min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
                className
            )}
        >
            {/* Top Bar: Resources + Turn */}
            <Box className="p-4 bg-slate-900/80 border-b border-slate-700">
                <HStack justify="between" className="max-w-6xl mx-auto">
                    <ResourceBar resources={resources} compact />
                    <HStack className="gap-4 items-center">
                        <Typography variant="body1" className="text-white">
                            Turn {mapData.turnNumber}
                        </Typography>
                        <Box
                            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg cursor-pointer hover:bg-amber-400 transition-colors"
                            onClick={onEndTurn}
                        >
                            End Turn
                        </Box>
                    </HStack>
                </HStack>
            </Box>

            {/* Main Content */}
            <HStack className="h-[calc(100vh-72px)]">
                {/* Map Area */}
                <Box className="flex-1 relative overflow-hidden">
                    {/* Map background */}
                    <Box className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-amber-900/10 to-blue-900/20" />

                    {/* Grid pattern overlay */}
                    <Box
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* Map nodes */}
                    <Box className="absolute inset-4">
                        {/* Connection lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {mapData.nodes.map((node) =>
                                node.connectedTo.map((targetId) => {
                                    const target = mapData.nodes.find((n) => n.id === targetId);
                                    if (!target) return null;
                                    return (
                                        <line
                                            key={`${node.id}-${targetId}`}
                                            x1={`${node.x}%`}
                                            y1={`${node.y}%`}
                                            x2={`${target.x}%`}
                                            y2={`${target.y}%`}
                                            stroke="rgba(100,100,100,0.4)"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                        />
                                    );
                                })
                            )}
                        </svg>

                        {/* Player position indicator */}
                        {mapData.nodes.map((node) =>
                            node.id === mapData.playerPosition ? (
                                <Box
                                    key={`player-${node.id}`}
                                    className="absolute w-8 h-8 -mt-6 transform -translate-x-1/2"
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    <Typography variant="h5" className="text-2xl animate-bounce">
                                        👤
                                    </Typography>
                                </Box>
                            ) : null
                        )}

                        {/* Map nodes */}
                        {mapData.nodes.map((node) => (
                            <MapNode
                                key={node.id}
                                {...node}
                                type={node.type as any}
                                selected={selectedNode?.id === node.id}
                                onClick={() => handleNodeClick(node)}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Side Panel */}
                <Box className="w-80 bg-slate-800/90 border-l border-slate-700 p-4">
                    {/* Hero Info */}
                    <Box className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
                        <Typography variant="h5" className="text-white mb-2">
                            {playerHero.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Level {playerHero.level} {playerHero.archetype}
                        </Typography>
                    </Box>

                    {/* Selected Node Info */}
                    {selectedNode ? (
                        <Box className="p-4 bg-slate-900 rounded-lg border border-amber-500/50">
                            <Typography variant="h5" className="text-amber-400 mb-2">
                                {selectedNode.name}
                            </Typography>
                            <Typography variant="body2" className="text-gray-300 mb-2">
                                Type: {selectedNode.type}
                            </Typography>
                            {selectedNode.owner && (
                                <Typography variant="body2" className="text-gray-300 mb-2">
                                    Owner: {selectedNode.owner}
                                </Typography>
                            )}
                            {selectedNode.resourceType && (
                                <Typography variant="body2" className="text-green-400 mb-2">
                                    Resource: {selectedNode.resourceType} (+{selectedNode.resourceAmount})
                                </Typography>
                            )}
                            {selectedNode.enemyStrength && (
                                <Typography variant="body2" className="text-red-400 mb-2">
                                    Enemy Strength: {selectedNode.enemyStrength}
                                </Typography>
                            )}

                            {selectedNode.accessible && selectedNode.id !== mapData.playerPosition && (
                                <Box
                                    className="mt-4 py-2 bg-green-600 text-white font-bold rounded-lg text-center cursor-pointer hover:bg-green-500 transition-colors"
                                    onClick={handleMove}
                                >
                                    Move Here
                                </Box>
                            )}
                            {selectedNode.id === mapData.playerPosition && (
                                <Typography variant="caption" className="text-green-400 block mt-2 text-center">
                                    You are here
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Box className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                            <Typography variant="body2" className="text-gray-500">
                                Select a location on the map
                            </Typography>
                        </Box>
                    )}

                    {/* Map Legend */}
                    <Box className="mt-6">
                        <Typography variant="h6" className="text-white mb-3">
                            Legend
                        </Typography>
                        <VStack className="gap-2">
                            {[
                                { icon: '🏛️', name: 'City' },
                                { icon: '🏰', name: 'Castle' },
                                { icon: '⚔️', name: 'Dungeon' },
                                { icon: '💎', name: 'Resource' },
                                { icon: '⚡', name: 'Battle' },
                            ].map((item) => (
                                <HStack key={item.name} className="gap-2">
                                    <Typography variant="body1">{item.icon}</Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        {item.name}
                                    </Typography>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
}

export default WorldMapTemplate;
