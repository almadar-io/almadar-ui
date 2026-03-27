'use client';
/**
 * RuntimeDebugger - Main debug panel for KFlow applications
 *
 * Press backtick (`) to toggle. Displays traits, ticks, entities, events,
 * guards, verification checks, transition timeline, and server bridge health.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { cn } from '../../../lib/cn';
import type { EffectTrace, ServerResponseTrace, TransitionTrace } from '../../../lib/verificationRegistry';
import { useDebugData } from './hooks/useDebugData';
import { onDebugToggle, isDebugEnabled } from '../../../lib/debugUtils';
import { Tabs, type TabItem } from '../../molecules/Tabs';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Badge } from '../../atoms/Badge';
import { Typography } from '../../atoms/Typography';
import { TraitsTab } from './tabs/TraitsTab';
import { TicksTab } from './tabs/TicksTab';
import { EntitiesTab } from './tabs/EntitiesTab';
import { EventFlowTab } from './tabs/EventFlowTab';
import { GuardsPanel } from './tabs/GuardsPanel';
import { VerificationTab } from './tabs/VerificationTab';
import { TransitionTimeline } from './tabs/TransitionTimeline';
import { ServerBridgeTab } from './tabs/ServerBridgeTab';
import { EventDispatcherTab } from './tabs/EventDispatcherTab';
import './RuntimeDebugger.css';

// ---------------------------------------------------------------------------
// VerifyModePanel - extracted for auto-scroll ref handling
// ---------------------------------------------------------------------------

function ServerResponseRow({ sr }: { sr: ServerResponseTrace }) {
    const entityEntries = Object.entries(sr.dataEntities);
    return (
        <div className="ml-4 pl-2 border-l border-purple-700/50 py-0.5 text-[10px] font-mono">
            <div className="flex items-center gap-2">
                <span className={sr.success ? 'text-green-400' : 'text-red-400'}>
                    {sr.success ? '\u2713' : '\u2717'} server
                </span>
                <span className="text-purple-300">
                    {sr.orbitalName}
                </span>
                {sr.clientEffects > 0 && (
                    <span className="px-1 rounded bg-purple-900/50 text-purple-300">
                        {sr.clientEffects} clientEffect{sr.clientEffects !== 1 ? 's' : ''}
                    </span>
                )}
                {sr.emittedEvents.length > 0 && (
                    <span className="px-1 rounded bg-blue-900/50 text-blue-300">
                        emit: {sr.emittedEvents.join(', ')}
                    </span>
                )}
                {sr.error && (
                    <span className="px-1 rounded bg-red-900/50 text-red-400 truncate max-w-[300px]">
                        {sr.error}
                    </span>
                )}
            </div>
            {entityEntries.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                    {entityEntries.map(([name, count]) => (
                        <span key={name} className="px-1 rounded bg-gray-800 text-gray-300">
                            {name}: {count} row{count !== 1 ? 's' : ''}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function TransitionRow({ trace }: { trace: TransitionTrace }) {
    const isServerEntry = !!trace.serverResponse && trace.traitName.startsWith('server:');
    const hasFailedEffects = trace.effects.some((e: EffectTrace) => e.status === 'failed');

    // Pure server response entry (no local transition)
    if (isServerEntry && trace.serverResponse) {
        return (
            <div className="py-0.5 border-b border-gray-800 last:border-0">
                <div className="flex items-start gap-2 text-xs font-mono">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-purple-500" />
                    <Badge variant="warning" size="sm" className="flex-shrink-0">
                        {trace.event}
                    </Badge>
                    <span className="text-purple-400 flex-shrink-0">server response</span>
                </div>
                <ServerResponseRow sr={trace.serverResponse} />
            </div>
        );
    }

    // Local transition (may also have a server response attached)
    return (
        <div className="py-0.5 border-b border-gray-800 last:border-0">
            <div className="flex items-start gap-2 text-xs font-mono">
                <span className={cn(
                    'mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                    hasFailedEffects ? 'bg-red-500' : 'bg-green-500'
                )} />
                <Badge variant="info" size="sm" className="flex-shrink-0">{trace.event}</Badge>
                <span className="text-gray-300 flex-shrink-0">{trace.traitName}</span>
                <span className="text-gray-400 flex-shrink-0">{trace.from} {'\u2192'} {trace.to}</span>
            </div>
            {/* Effects */}
            {trace.effects.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-6 mt-0.5">
                    {trace.effects.map((eff: EffectTrace, i: number) => (
                        <span key={i} className={cn(
                            'px-1 rounded text-[10px]',
                            eff.status === 'executed' ? 'bg-green-900/50 text-green-400' :
                            eff.status === 'failed' ? 'bg-red-900/50 text-red-400' :
                            'bg-yellow-900/50 text-yellow-400'
                        )}>
                            {eff.status === 'executed' ? '\u2713' : eff.status === 'failed' ? '\u2717' : '-'} {eff.type}
                            {eff.args.length > 0 && (
                                <span className="text-gray-500 ml-0.5">
                                    {JSON.stringify(eff.args).slice(0, 40)}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            )}
            {/* Attached server response (when local transition was forwarded to server) */}
            {trace.serverResponse && <ServerResponseRow sr={trace.serverResponse} />}
        </div>
    );
}

function VerifyModePanel({
    className,
    failedChecks,
    transitions,
    traitStates,
    serverCount,
    localCount,
}: {
    className?: string;
    failedChecks: number;
    transitions: TransitionTrace[];
    traitStates: string;
    serverCount: number;
    localCount: number;
}) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const prevCountRef = React.useRef(0);

    // Auto-scroll to bottom when new transitions arrive
    React.useEffect(() => {
        if (transitions.length > prevCountRef.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        prevCountRef.current = transitions.length;
    }, [transitions.length]);

    return (
        <div
            className={cn(
                'runtime-debugger runtime-debugger--verify',
                'fixed bottom-0 left-0 right-0 z-[9999] h-[35vh] flex flex-col bg-gray-900 text-white border-t-2 border-cyan-500',
                className
            )}
            data-testid="debugger-verify"
        >
            {/* Status bar */}
            <div className="px-3 py-1.5 flex items-center gap-3 text-xs font-mono border-b border-gray-700 flex-shrink-0">
                <Badge variant={failedChecks > 0 ? 'danger' : 'success'} size="sm">
                    {failedChecks > 0 ? `${failedChecks} fail` : 'OK'}
                </Badge>
                <span className="text-gray-400">
                    {localCount} local
                </span>
                <span className="text-purple-400">
                    {serverCount} server
                </span>
                {traitStates && (
                    <span className="text-cyan-400 truncate max-w-[400px]">{traitStates}</span>
                )}
            </div>

            {/* Full interaction timeline */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="px-2 py-1">
                    {transitions.length === 0 ? (
                        <div className="text-gray-500 text-xs font-mono py-2 text-center">
                            Waiting for transitions...
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {transitions.map((trace) => (
                                <TransitionRow key={trace.id} trace={trace} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export interface RuntimeDebuggerProps {
    /** Initial position */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Initial collapsed state */
    defaultCollapsed?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Display mode: floating (fixed overlay), inline (block element), or verify (always-visible compact overlay for verification runs) */
    mode?: 'floating' | 'inline' | 'verify';
    /** Default active tab id */
    defaultTab?: string;
    /** Raw schema for EventDispatcherTab payload extraction */
    schema?: Record<string, unknown>;
}

export function RuntimeDebugger({
    position = 'bottom-right',
    defaultCollapsed = true,
    className,
    mode = 'floating',
    defaultTab,
    schema,
}: RuntimeDebuggerProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(mode === 'verify' ? true : defaultCollapsed);
    const [isVisible, setIsVisible] = React.useState(mode === 'inline' || mode === 'verify' || isDebugEnabled());

    const debugData = useDebugData();

    // Listen for keyboard toggle (floating mode only)
    React.useEffect(() => {
        if (mode === 'inline') return;
        return onDebugToggle((enabled) => {
            setIsVisible(enabled);
            if (enabled) {
                setIsCollapsed(false);
            }
        });
    }, [mode]);

    // Keyboard shortcut to toggle collapse (floating mode only)
    React.useEffect(() => {
        if (mode === 'inline') return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`' && isVisible) {
                // Don't toggle if typing in input
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                setIsCollapsed(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, mode]);

    if (!isVisible) {
        return null;
    }

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
    };

    const { verification } = debugData;
    const failedChecks = verification.summary.failed;

    // Build tab items using existing Tabs molecule
    const tabItems: TabItem[] = [
        {
            id: 'dispatch',
            label: 'Dispatch',
            badge: debugData.traits.length || undefined,
            content: <EventDispatcherTab traits={debugData.traits} schema={schema} />,
        },
        {
            id: 'verify',
            label: failedChecks > 0 ? 'Verify (!)' : 'Verify',
            badge: verification.summary.totalChecks || undefined,
            content: <VerificationTab checks={verification.checks} summary={verification.summary} />,
        },
        {
            id: 'timeline',
            label: 'Timeline',
            badge: verification.transitions.length || undefined,
            content: <TransitionTimeline transitions={verification.transitions} />,
        },
        {
            id: 'bridge',
            label: 'Bridge',
            badge: verification.bridge?.connected ? undefined : 1,
            content: <ServerBridgeTab bridge={verification.bridge} />,
        },
        {
            id: 'traits',
            label: 'Traits',
            badge: debugData.traits.length || undefined,
            content: <TraitsTab traits={debugData.traits} />,
        },
        {
            id: 'ticks',
            label: 'Ticks',
            badge: debugData.ticks.filter((t: { active: boolean }) => t.active).length || undefined,
            content: <TicksTab ticks={debugData.ticks} />,
        },
        {
            id: 'entities',
            label: 'Entities',
            badge: debugData.entitySnapshot?.runtime.length || undefined,
            content: <EntitiesTab snapshot={debugData.entitySnapshot} />,
        },
        {
            id: 'events',
            label: 'Events',
            badge: debugData.events.length > 0 ? debugData.events.length : undefined,
            content: <EventFlowTab events={debugData.events} />,
        },
        {
            id: 'guards',
            label: 'Guards',
            badge: debugData.guards.filter((g: { result: boolean }) => !g.result).length || undefined,
            content: <GuardsPanel guards={debugData.guards} />,
        },
    ];

    // Inline mode: collapsible, no fixed positioning
    if (mode === 'inline') {
        return (
            <div
                className={cn(
                    'runtime-debugger',
                    'runtime-debugger--inline',
                    className
                )}
                data-testid="debugger-inline"
            >
                <Card className={cn(
                    'runtime-debugger__panel',
                    isCollapsed ? 'runtime-debugger__panel--inline-collapsed' : 'runtime-debugger__panel--inline',
                )}>
                    {/* Header - always visible, acts as toggle */}
                    <div
                        className="runtime-debugger__header"
                        onClick={() => setIsCollapsed(prev => !prev)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        <div className="flex items-center gap-2">
                            <Typography variant="h6" style={{ fontSize: '0.75rem' }}>
                                {isCollapsed ? '\u25B6' : '\u25BC'} Debugger
                            </Typography>
                            {failedChecks > 0 ? (
                                <Badge variant="danger" size="sm">{failedChecks} failed</Badge>
                            ) : debugData.traits.length > 0 ? (
                                <Badge variant="success" size="sm">{debugData.traits.length} traits</Badge>
                            ) : (
                                <Badge variant="info" size="sm">Idle</Badge>
                            )}
                        </div>
                    </div>

                    {/* Tabs - only visible when expanded */}
                    {!isCollapsed && (
                        <div className="runtime-debugger__content">
                            <Tabs
                                items={tabItems}
                                defaultActiveTab={defaultTab}
                                variant="pills"
                                className="runtime-debugger__tabs"
                            />
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // Verify mode: always-visible panel at bottom showing full interaction timeline
    if (mode === 'verify') {
        const traitStates = debugData.traits.map((t: { name: string; currentState: string }) => `${t.name}:${t.currentState}`).join(' | ');
        const serverEntries = verification.transitions.filter((t) => t.serverResponse);
        const localEntries = verification.transitions.filter((t) => !t.serverResponse);

        return (
            <VerifyModePanel
                className={className}
                failedChecks={failedChecks}
                transitions={verification.transitions}
                traitStates={traitStates}
                serverCount={serverEntries.length}
                localCount={localEntries.length}
            />
        );
    }

    // Floating mode: fixed position overlay with collapse/expand
    return (
        <div
            className={cn(
                'runtime-debugger',
                'fixed z-[9999]',
                positionClasses[position],
                isCollapsed ? 'runtime-debugger--collapsed' : 'runtime-debugger--expanded',
                className
            )}
            data-testid={isCollapsed ? 'debugger-collapsed' : 'debugger-expanded'}
        >
            {isCollapsed ? (
                <Button
                    onClick={() => setIsCollapsed(false)}
                    variant="secondary"
                    size="sm"
                    className="runtime-debugger__toggle"
                    title="Open Debugger (`)"
                >
                    {failedChecks > 0 ? (
                        <span className="relative">
                            <span>V</span>
                            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
                        </span>
                    ) : (
                        <span>V</span>
                    )}
                </Button>
            ) : (
                <Card className="runtime-debugger__panel">
                    {/* Header */}
                    <div className="runtime-debugger__header">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">V</span>
                            <Typography variant="h6">KFlow Verifier</Typography>
                            {failedChecks > 0 ? (
                                <Badge variant="danger" size="sm">{failedChecks} failed</Badge>
                            ) : verification.summary.totalChecks > 0 ? (
                                <Badge variant="success" size="sm">All passing</Badge>
                            ) : (
                                <Badge variant="info" size="sm">Runtime</Badge>
                            )}
                        </div>
                        <Button
                            onClick={() => setIsCollapsed(true)}
                            variant="ghost"
                            size="sm"
                            title="Close (`)"
                        >
                            x
                        </Button>
                    </div>

                    {/* Tabs - using existing Tabs molecule */}
                    <div className="runtime-debugger__content">
                        <Tabs
                            items={tabItems}
                            defaultActiveTab={defaultTab}
                            variant="pills"
                            className="runtime-debugger__tabs"
                        />
                    </div>

                    {/* Footer */}
                    <div className="runtime-debugger__footer">
                        <Typography variant="small" className="text-gray-500">
                            Press ` to toggle | window.__orbitalVerification for automation
                        </Typography>
                    </div>
                </Card>
            )}
        </div>
    );
}

RuntimeDebugger.displayName = 'RuntimeDebugger';
