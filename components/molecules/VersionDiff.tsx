'use client';
/**
 * VersionDiff Organism Component
 *
 * Side-by-side or inline diff render with line-level highlights and
 * a revision picker. Composes atoms for layout. Computes a minimal
 * LCS-based line diff inline (no external diff library).
 */

import React, { useState, useMemo, useCallback } from "react";
import type { EventPayloadValue, EventEmit } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { Card, Typography, Button, Badge, Icon, Box, Select } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";

export interface DiffRevision {
    id: string;
    label: string;
    author?: string;
    timestamp?: string;
    content: string;
}

export type DiffLineType = "added" | "removed" | "unchanged" | "context";

export interface DiffLine {
    type: DiffLineType;
    beforeLineNumber?: number;
    afterLineNumber?: number;
    content: string;
}

export type VersionDiffView = "side-by-side" | "inline";

export interface VersionDiffProps {
    /**
     * All available revisions (at least 2). Accepts either a typed array (direct
     * consumers) or the runtime payload shape from a render-ui binding
     * (`@payload.revisions`). Narrowed to `[]` internally when the value isn't
     * an array.
     */
    revisions: readonly DiffRevision[] | EventPayloadValue;
    /** Currently selected "before" revision id. */
    beforeId?: string;
    /** Currently selected "after" revision id. */
    afterId?: string;
    /** Display mode. */
    view?: VersionDiffView;
    /** Called when the user picks a different "before" revision. */
    onSelectBefore?: (id: string) => void;
    /** Called when the user picks a different "after" revision. */
    onSelectAfter?: (id: string) => void;
    /** Called when the user clicks the revert button (passes the "before" id). */
    onRevert?: (id: string) => void;
    /** Event name dispatched via event bus when the "before" revision changes. Payload: { id }. */
    selectBeforeEvent?: EventEmit<{ id: string }>;
    /** Event name dispatched via event bus when the "after" revision changes. Payload: { id }. */
    selectAfterEvent?: EventEmit<{ id: string }>;
    /** Event name dispatched via event bus when the user clicks revert. Payload: { id }. */
    revertEvent?: EventEmit<{ id: string }>;
    /** Language label (informational). */
    language?: string;
    /** Additional CSS classes. */
    className?: string;
}

/** Minimal LCS-based line diff. */
function computeDiff(before: string, after: string): DiffLine[] {
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");
    const m = beforeLines.length;
    const n = afterLines.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (beforeLines[i] === afterLines[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const out: DiffLine[] = [];
    let i = 0;
    let j = 0;
    let bn = 1;
    let an = 1;
    while (i < m && j < n) {
        if (beforeLines[i] === afterLines[j]) {
            out.push({
                type: "unchanged",
                beforeLineNumber: bn++,
                afterLineNumber: an++,
                content: beforeLines[i],
            });
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push({ type: "removed", beforeLineNumber: bn++, content: beforeLines[i] });
            i++;
        } else {
            out.push({ type: "added", afterLineNumber: an++, content: afterLines[j] });
            j++;
        }
    }
    while (i < m) {
        out.push({ type: "removed", beforeLineNumber: bn++, content: beforeLines[i++] });
    }
    while (j < n) {
        out.push({ type: "added", afterLineNumber: an++, content: afterLines[j++] });
    }
    return out;
}

const INLINE_STYLES: Record<DiffLineType, { bg: string; prefix: string; text: string }> = {
    added: { bg: "bg-success/10", prefix: "+", text: "text-success" },
    removed: { bg: "bg-error/10", prefix: "-", text: "text-error" },
    unchanged: { bg: "", prefix: " ", text: "text-foreground" },
    context: { bg: "", prefix: " ", text: "text-muted-foreground" },
};

export const VersionDiff: React.FC<VersionDiffProps> = ({
    revisions: revisionsProp,
    beforeId,
    afterId,
    view = "side-by-side",
    onSelectBefore,
    onSelectAfter,
    onRevert,
    selectBeforeEvent,
    selectAfterEvent,
    revertEvent,
    language,
    className,
}) => {
    const eventBus = useEventBus();
    const revisions: readonly DiffRevision[] = Array.isArray(revisionsProp)
        ? (revisionsProp as readonly DiffRevision[])
        : [];
    const fallbackBefore = revisions[0]?.id ?? "";
    const fallbackAfter = revisions[1]?.id ?? revisions[0]?.id ?? "";

    const [internalBefore, setInternalBefore] = useState<string>(beforeId ?? fallbackBefore);
    const [internalAfter, setInternalAfter] = useState<string>(afterId ?? fallbackAfter);
    const [internalView, setInternalView] = useState<VersionDiffView>(view);

    const activeBeforeId = beforeId ?? internalBefore;
    const activeAfterId = afterId ?? internalAfter;
    const activeView = view ?? internalView;

    const beforeRev = useMemo(
        () => revisions.find((r) => r.id === activeBeforeId) ?? revisions[0],
        [revisions, activeBeforeId],
    );
    const afterRev = useMemo(
        () => revisions.find((r) => r.id === activeAfterId) ?? revisions[1] ?? revisions[0],
        [revisions, activeAfterId],
    );

    const diff = useMemo(
        () => computeDiff(beforeRev?.content ?? "", afterRev?.content ?? ""),
        [beforeRev, afterRev],
    );

    const stats = useMemo(() => {
        let added = 0;
        let removed = 0;
        for (const line of diff) {
            if (line.type === "added") added++;
            else if (line.type === "removed") removed++;
        }
        return { added, removed };
    }, [diff]);

    const handleBeforeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const id = e.target.value;
            setInternalBefore(id);
            onSelectBefore?.(id);
            if (selectBeforeEvent) eventBus.emit(`UI:${selectBeforeEvent}`, { id });
        },
        [onSelectBefore, selectBeforeEvent, eventBus],
    );

    const handleAfterChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const id = e.target.value;
            setInternalAfter(id);
            onSelectAfter?.(id);
            if (selectAfterEvent) eventBus.emit(`UI:${selectAfterEvent}`, { id });
        },
        [onSelectAfter, selectAfterEvent, eventBus],
    );

    const handleViewToggle = useCallback(() => {
        setInternalView((v) => (v === "side-by-side" ? "inline" : "side-by-side"));
    }, []);

    const handleRevert = useCallback(() => {
        if (beforeRev) {
            onRevert?.(beforeRev.id);
            if (revertEvent) eventBus.emit(`UI:${revertEvent}`, { id: beforeRev.id });
        }
    }, [beforeRev, onRevert, revertEvent, eventBus]);

    const options = useMemo(
        () => revisions.map((r) => ({ value: r.id, label: r.label })),
        [revisions],
    );

    const beforeLines = useMemo(
        () =>
            diff.filter((l) => l.type === "removed" || l.type === "unchanged" || l.type === "context"),
        [diff],
    );
    const afterLines = useMemo(
        () =>
            diff.filter((l) => l.type === "added" || l.type === "unchanged" || l.type === "context"),
        [diff],
    );

    return (
        <Card className={cn("overflow-hidden", className)}>
            <VStack gap="none">
                {/* Header: revision pickers + view toggle + revert */}
                <HStack
                    gap="sm"
                    align="center"
                    justify="between"
                    className="px-4 py-2 border-b border-border bg-muted/30 flex-wrap"
                >
                    <HStack gap="sm" align="center" className="flex-wrap">
                        <Icon name="git-commit" size="sm" className="text-muted-foreground" />
                        <Typography variant="small" weight="medium" className="whitespace-nowrap">
                            Compare
                        </Typography>
                        <Box className="min-w-0 md:min-w-[160px]">
                            <Select
                                options={options}
                                value={activeBeforeId}
                                onChange={handleBeforeChange}
                                aria-label="Before revision"
                            />
                        </Box>
                        <Typography variant="caption" color="secondary">
                            to
                        </Typography>
                        <Box className="min-w-0 md:min-w-[160px]">
                            <Select
                                options={options}
                                value={activeAfterId}
                                onChange={handleAfterChange}
                                aria-label="After revision"
                            />
                        </Box>
                        {language && <Badge variant="default">{language}</Badge>}
                        <Badge variant="success">+{stats.added}</Badge>
                        <Badge variant="error">-{stats.removed}</Badge>
                    </HStack>

                    <HStack gap="xs" align="center">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={activeView === "side-by-side" ? "align-left" : "columns"}
                            onClick={handleViewToggle}
                            aria-label={
                                activeView === "side-by-side"
                                    ? "Switch to inline view"
                                    : "Switch to side-by-side view"
                            }
                        />
                        {(onRevert || revertEvent) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon="rotate-ccw"
                                onClick={handleRevert}
                            >
                                Revert
                            </Button>
                        )}
                    </HStack>
                </HStack>

                {/* Optional revision metadata row */}
                {(beforeRev?.author || beforeRev?.timestamp || afterRev?.author || afterRev?.timestamp) && (
                    <HStack
                        gap="sm"
                        align="center"
                        justify="between"
                        className="px-4 py-1 border-b border-border bg-muted/10"
                    >
                        <Typography variant="caption" color="secondary" className="truncate">
                            {beforeRev?.label}
                            {beforeRev?.author ? ` by ${beforeRev.author}` : ""}
                            {beforeRev?.timestamp ? ` (${beforeRev.timestamp})` : ""}
                        </Typography>
                        <Typography variant="caption" color="secondary" className="truncate">
                            {afterRev?.label}
                            {afterRev?.author ? ` by ${afterRev.author}` : ""}
                            {afterRev?.timestamp ? ` (${afterRev.timestamp})` : ""}
                        </Typography>
                    </HStack>
                )}

                {/* Body */}
                <Box className="overflow-auto bg-muted/20" style={{ maxHeight: 600 }}>
                    {activeView === "side-by-side" ? (
                        <Box className="grid grid-cols-1 md:grid-cols-2">
                            {/* Before column. Below md the columns stack vertically so the
                                separator flips from right-edge to bottom-edge. */}
                            <Box className="border-b md:border-b-0 md:border-r border-border">
                                <VStack gap="none" className="font-mono text-xs">
                                    {beforeLines.map((line, idx) => {
                                        const isRemoved = line.type === "removed";
                                        return (
                                            <HStack
                                                key={`b-${idx}`}
                                                gap="none"
                                                align="start"
                                                className={cn(
                                                    "px-3 py-0.5",
                                                    isRemoved && "bg-error/10",
                                                )}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="secondary"
                                                    className="w-8 text-right mr-3 select-none tabular-nums flex-shrink-0"
                                                >
                                                    {line.beforeLineNumber ?? ""}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    className={cn(
                                                        "font-mono flex-1 min-w-0 whitespace-pre",
                                                        isRemoved ? "text-error" : "text-foreground",
                                                    )}
                                                >
                                                    {line.content || " "}
                                                </Typography>
                                            </HStack>
                                        );
                                    })}
                                </VStack>
                            </Box>
                            {/* After column */}
                            <Box>
                                <VStack gap="none" className="font-mono text-xs">
                                    {afterLines.map((line, idx) => {
                                        const isAdded = line.type === "added";
                                        return (
                                            <HStack
                                                key={`a-${idx}`}
                                                gap="none"
                                                align="start"
                                                className={cn(
                                                    "px-3 py-0.5",
                                                    isAdded && "bg-success/10",
                                                )}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="secondary"
                                                    className="w-8 text-right mr-3 select-none tabular-nums flex-shrink-0"
                                                >
                                                    {line.afterLineNumber ?? ""}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    className={cn(
                                                        "font-mono flex-1 min-w-0 whitespace-pre",
                                                        isAdded ? "text-success" : "text-foreground",
                                                    )}
                                                >
                                                    {line.content || " "}
                                                </Typography>
                                            </HStack>
                                        );
                                    })}
                                </VStack>
                            </Box>
                        </Box>
                    ) : (
                        <VStack gap="none" className="font-mono text-xs">
                            {diff.map((line, idx) => {
                                const style = INLINE_STYLES[line.type];
                                return (
                                    <HStack
                                        key={`i-${idx}`}
                                        gap="none"
                                        align="start"
                                        className={cn("px-4 py-0.5", style.bg)}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="secondary"
                                            className="w-8 text-right mr-2 select-none tabular-nums flex-shrink-0"
                                        >
                                            {line.beforeLineNumber ?? ""}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="secondary"
                                            className="w-8 text-right mr-3 select-none tabular-nums flex-shrink-0"
                                        >
                                            {line.afterLineNumber ?? ""}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className={cn(
                                                "font-mono flex-1 min-w-0 whitespace-pre",
                                                style.text,
                                            )}
                                        >
                                            <Box as="span" className="select-none opacity-50 mr-2">
                                                {style.prefix}
                                            </Box>
                                            {line.content || " "}
                                        </Typography>
                                    </HStack>
                                );
                            })}
                        </VStack>
                    )}
                </Box>
            </VStack>
        </Card>
    );
};

VersionDiff.displayName = "VersionDiff";
