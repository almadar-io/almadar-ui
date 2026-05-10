'use client';
/**
 * ReplyTree Organism Component
 *
 * Recursive nested-thread reply renderer with collapse, per-node mod actions, and vote.
 * Composes the VoteStack molecule + Avatar/Typography/Button atoms.
 */

import React, { useCallback, useState } from "react";
import { ChevronRight, ChevronDown, MessageSquare, Flag } from "lucide-react";
import { cn } from "../../lib/cn";
import { Avatar, Typography, Button, Box } from "../atoms";
import { VoteStack } from "../molecules/VoteStack";

export interface ReplyNode {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    content: string;
    postedAt: string;
    voteCount?: number;
    userVote?: 'up' | 'down' | null;
    replies?: ReplyNode[];
    collapsed?: boolean;
}

export interface ReplyTreeProps {
    nodes: ReplyNode[];
    maxDepth?: number;
    onVote?: (nodeId: string, vote: 'up' | 'down' | null) => void;
    onReply?: (parentNodeId: string) => void;
    onFlag?: (nodeId: string) => void;
    onContinueThread?: (nodeId: string) => void;
    showActions?: boolean;
    className?: string;
}

interface ReplyTreeNodeProps {
    node: ReplyNode;
    depth: number;
    maxDepth: number;
    collapsedSet: Set<string>;
    toggleCollapse: (id: string) => void;
    onVote?: (nodeId: string, vote: 'up' | 'down' | null) => void;
    onReply?: (parentNodeId: string) => void;
    onFlag?: (nodeId: string) => void;
    onContinueThread?: (nodeId: string) => void;
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
    showActions,
}) => {
    const hasReplies = !!node.replies && node.replies.length > 0;
    const isCollapsed = collapsedSet.has(node.id);
    const atMaxDepth = depth >= maxDepth;

    const handleVote = useCallback(
        (next: 'up' | 'down' | null) => {
            onVote?.(node.id, next);
        },
        [node.id, onVote],
    );

    const handleReply = useCallback(() => {
        onReply?.(node.id);
    }, [node.id, onReply]);

    const handleFlag = useCallback(() => {
        onFlag?.(node.id);
    }, [node.id, onFlag]);

    const handleContinue = useCallback(() => {
        onContinueThread?.(node.id);
    }, [node.id, onContinueThread]);

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
                        leftIcon={isCollapsed ? ChevronRight : ChevronDown}
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
                            leftIcon={MessageSquare}
                            onClick={handleReply}
                            aria-label={`Reply to ${node.authorName}`}
                        >
                            Reply
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={Flag}
                            onClick={handleFlag}
                            aria-label={`Flag reply by ${node.authorName}`}
                        >
                            Flag
                        </Button>
                    </Box>
                )}

                {hasReplies && !isCollapsed && (
                    atMaxDepth ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleContinue}
                            rightIcon={ChevronRight}
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
    showActions = true,
    className,
}) => {
    const [collapsedSet, setCollapsedSet] = useState<Set<string>>(() => {
        const acc = new Set<string>();
        collectInitiallyCollapsed(nodes, acc);
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

    if (nodes.length === 0) {
        return (
            <Box className={cn("text-sm text-muted-foreground", className)}>
                No replies yet.
            </Box>
        );
    }

    return (
        <Box className={cn("flex flex-col gap-2 min-w-0", className)}>
            {nodes.map((node) => (
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
                    showActions={showActions}
                />
            ))}
        </Box>
    );
};

ReplyTree.displayName = "ReplyTree";
