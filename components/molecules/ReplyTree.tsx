'use client';
/**
 * ReplyTree Organism Component
 *
 * Recursive nested-thread reply renderer with collapse, per-node mod actions, and vote.
 * Composes the VoteStack molecule + Avatar/Typography/Button atoms.
 */

import React, { useCallback, useState } from "react";
import type { EventEmit, EntityCollection } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { Avatar, Typography, Button, Box, Input } from "../atoms";
import { VoteStack, type VoteValue } from "../molecules/VoteStack";

export interface ReplyNode {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    content: string;
    postedAt: string;
    voteCount?: number;
    userVote?: VoteValue;
    replies?: ReplyNode[];
    collapsed?: boolean;
}

export interface ReplyTreeProps {
    nodes: EntityCollection<ReplyNode>;
    maxDepth?: number;
    onVote?: (nodeId: string, vote: VoteValue) => void;
    onReply?: (parentNodeId: string) => void;
    onFlag?: (nodeId: string) => void;
    onContinueThread?: (nodeId: string) => void;
    voteEvent?: EventEmit<{ nodeId: string; vote: VoteValue }>;
    replyEvent?: EventEmit<{ parentNodeId: string; content: string }>;
    flagEvent?: EventEmit<{ nodeId: string }>;
    continueThreadEvent?: EventEmit<{ nodeId: string }>;
    showActions?: boolean;
    className?: string;
}

interface ReplyTreeNodeProps {
    node: ReplyNode;
    depth: number;
    maxDepth: number;
    collapsedSet: Set<string>;
    toggleCollapse: (id: string) => void;
    onVote?: (nodeId: string, vote: VoteValue) => void;
    onReply?: (parentNodeId: string) => void;
    onFlag?: (nodeId: string) => void;
    onContinueThread?: (nodeId: string) => void;
    voteEvent?: EventEmit<{ nodeId: string; vote: VoteValue }>;
    replyEvent?: EventEmit<{ parentNodeId: string; content: string }>;
    flagEvent?: EventEmit<{ nodeId: string }>;
    continueThreadEvent?: EventEmit<{ nodeId: string }>;
    showActions: boolean;
}

const ReplyTreeNode: React.FC<ReplyTreeNodeProps> = ({
    node,
    depth,
    maxDepth,
    collapsedSet,
    toggleCollapse,
    onVote,
    onReply,
    onFlag,
    onContinueThread,
    voteEvent,
    replyEvent,
    flagEvent,
    continueThreadEvent,
    showActions,
}) => {
    const eventBus = useEventBus();
    const hasReplies = !!node.replies && node.replies.length > 0;
    const isCollapsed = collapsedSet.has(node.id);
    const atMaxDepth = depth >= maxDepth;
    // Inline reply composer: opens beneath this node so the reply box stays in
    // place instead of swapping the whole view.
    const [replyOpen, setReplyOpen] = useState(false);
    const [draft, setDraft] = useState("");

    const handleVote = useCallback(
        (next: VoteValue) => {
            onVote?.(node.id, next);
            if (voteEvent) eventBus.emit(`UI:${voteEvent}`, { nodeId: node.id, vote: next });
        },
        [node.id, onVote, voteEvent, eventBus],
    );

    // Toggle the inline composer open/closed (notify the host that a reply was
    // initiated, but don't emit the reply itself until the user submits text).
    const handleReply = useCallback(() => {
        onReply?.(node.id);
        setReplyOpen((open) => !open);
    }, [node.id, onReply]);

    const handleSubmitReply = useCallback(() => {
        const content = draft.trim();
        if (!content) return;
        if (replyEvent) eventBus.emit(`UI:${replyEvent}`, { parentNodeId: node.id, content });
        setDraft("");
        setReplyOpen(false);
    }, [node.id, draft, replyEvent, eventBus]);

    const handleCancelReply = useCallback(() => {
        setDraft("");
        setReplyOpen(false);
    }, []);

    const handleFlag = useCallback(() => {
        onFlag?.(node.id);
        if (flagEvent) eventBus.emit(`UI:${flagEvent}`, { nodeId: node.id });
    }, [node.id, onFlag, flagEvent, eventBus]);

    const handleContinue = useCallback(() => {
        onContinueThread?.(node.id);
        if (continueThreadEvent) eventBus.emit(`UI:${continueThreadEvent}`, { nodeId: node.id });
    }, [node.id, onContinueThread, continueThreadEvent, eventBus]);

    const handleToggle = useCallback(() => {
        toggleCollapse(node.id);
    }, [node.id, toggleCollapse]);

    return (
        <Box className="flex flex-row gap-2 items-stretch min-w-0">
            <Box className="flex flex-col items-center flex-shrink-0 w-6">
                {hasReplies ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggle}
                        aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
                        aria-expanded={!isCollapsed}
                        leftIcon={isCollapsed ? "chevron-right" : "chevron-down"}
                        className={cn(
                            "w-6 h-6 p-0 min-w-0",
                            "rounded-sm text-muted-foreground",
                            "hover:bg-muted hover:text-foreground",
                        )}
                    />
                ) : (
                    <Box className="w-6 h-6" aria-hidden="true" />
                )}
                {hasReplies && !isCollapsed && (
                    <Box
                        className="flex-1 w-px bg-border mt-1"
                        aria-hidden="true"
                    />
                )}
            </Box>

            <Box className="flex flex-col gap-2 flex-1 min-w-0 pb-3">
                <Box className="flex flex-row gap-2 items-center min-w-0">
                    <Avatar
                        src={node.authorAvatarUrl}
                        name={node.authorName}
                        size="sm"
                    />
                    <Typography variant="body" weight="semibold">
                        {node.authorName}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        {node.postedAt}
                    </Typography>
                </Box>

                <Typography variant="body" className="whitespace-pre-wrap break-words">
                    {node.content}
                </Typography>

                {showActions && (
                    <Box className="flex flex-row gap-2 items-center">
                        <VoteStack
                            count={node.voteCount ?? 0}
                            userVote={node.userVote ?? null}
                            onVote={handleVote}
                            size="sm"
                            variant="horizontal"
                            label={`Vote on reply by ${node.authorName}`}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon="message-square"
                            onClick={handleReply}
                            aria-label={`Reply to ${node.authorName}`}
                        >
                            Reply
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon="flag"
                            onClick={handleFlag}
                            aria-label={`Flag reply by ${node.authorName}`}
                        >
                            Flag
                        </Button>
                    </Box>
                )}

                {replyOpen && (
                    <Box className="flex flex-col gap-2 mt-1">
                        <Input
                            inputType="textarea"
                            rows={2}
                            value={draft}
                            placeholder={`Reply to ${node.authorName}…`}
                            onChange={(e) => setDraft(e.target.value)}
                            aria-label={`Reply to ${node.authorName}`}
                        />
                        <Box className="flex flex-row gap-2 items-center">
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon="send"
                                onClick={handleSubmitReply}
                                disabled={!draft.trim()}
                            >
                                Send
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}

                {hasReplies && !isCollapsed && (
                    atMaxDepth ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleContinue}
                            rightIcon="chevron-right"
                            className={cn(
                                "self-start gap-1 px-0 h-auto",
                                "text-sm text-primary hover:underline hover:bg-transparent",
                            )}
                        >
                            Continue thread
                        </Button>
                    ) : (
                        <Box className="flex flex-col gap-2 mt-1">
                            {node.replies!.map((child) => (
                                <ReplyTreeNode
                                    key={child.id}
                                    node={child}
                                    depth={depth + 1}
                                    maxDepth={maxDepth}
                                    collapsedSet={collapsedSet}
                                    toggleCollapse={toggleCollapse}
                                    onVote={onVote}
                                    onReply={onReply}
                                    onFlag={onFlag}
                                    onContinueThread={onContinueThread}
                                    voteEvent={voteEvent}
                                    replyEvent={replyEvent}
                                    flagEvent={flagEvent}
                                    continueThreadEvent={continueThreadEvent}
                                    showActions={showActions}
                                />
                            ))}
                        </Box>
                    )
                )}
            </Box>
        </Box>
    );
};

function collectInitiallyCollapsed(nodes: readonly ReplyNode[], acc: Set<string>): void {
    for (const n of nodes) {
        if (n.collapsed) acc.add(n.id);
        if (n.replies && n.replies.length > 0) {
            collectInitiallyCollapsed(n.replies, acc);
        }
    }
}

export const ReplyTree: React.FC<ReplyTreeProps> = ({
    nodes,
    maxDepth = 6,
    onVote,
    onReply,
    onFlag,
    onContinueThread,
    voteEvent,
    replyEvent,
    flagEvent,
    continueThreadEvent,
    showActions = true,
    className,
}) => {
    const nodeList = Array.isArray(nodes) ? nodes : nodes ? [nodes] : [];
    const [collapsedSet, setCollapsedSet] = useState<Set<string>>(() => {
        const acc = new Set<string>();
        collectInitiallyCollapsed(nodeList, acc);
        return acc;
    });

    const toggleCollapse = useCallback((id: string) => {
        setCollapsedSet((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    if (nodeList.length === 0) {
        return (
            <Box className={cn("text-sm text-muted-foreground", className)}>
                No replies yet.
            </Box>
        );
    }

    return (
        <Box className={cn("flex flex-col gap-2 min-w-0", className)}>
            {nodeList.map((node) => (
                <ReplyTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    maxDepth={maxDepth}
                    collapsedSet={collapsedSet}
                    toggleCollapse={toggleCollapse}
                    onVote={onVote}
                    onReply={onReply}
                    onFlag={onFlag}
                    onContinueThread={onContinueThread}
                    voteEvent={voteEvent}
                    replyEvent={replyEvent}
                    flagEvent={flagEvent}
                    continueThreadEvent={continueThreadEvent}
                    showActions={showActions}
                />
            ))}
        </Box>
    );
};

ReplyTree.displayName = "ReplyTree";
