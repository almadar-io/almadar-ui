import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useCallback, useState } from 'react';
import { ReplyTree, type ReplyNode } from './ReplyTree';

const meta: Meta<typeof ReplyTree> = {
    title: 'Core/Organisms/ReplyTree',
    component: ReplyTree,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const flatNodes: ReplyNode[] = [
    {
        id: 'r1',
        authorName: 'Ada Lovelace',
        content: 'I disagree with the framing in the parent post.',
        postedAt: '2 hours ago',
        voteCount: 14,
        userVote: 'up',
    },
    {
        id: 'r2',
        authorName: 'Linus Torvalds',
        content: 'Show me the code.',
        postedAt: '1 hour ago',
        voteCount: 42,
        userVote: null,
    },
    {
        id: 'r3',
        authorName: 'Grace Hopper',
        content: 'A nanosecond is a foot long.',
        postedAt: '32 min ago',
        voteCount: 7,
        userVote: null,
    },
];

const twoLevelNodes: ReplyNode[] = [
    {
        id: 't1',
        authorName: 'Edsger Dijkstra',
        content: 'Indentation matters more than you think.',
        postedAt: '4 hours ago',
        voteCount: 22,
        replies: [
            {
                id: 't1-1',
                authorName: 'Donald Knuth',
                content: 'Premature optimization is the root of all evil.',
                postedAt: '3 hours ago',
                voteCount: 18,
            },
            {
                id: 't1-2',
                authorName: 'Barbara Liskov',
                content: 'Substitutability is the underrated principle.',
                postedAt: '2 hours ago',
                voteCount: 9,
            },
        ],
    },
    {
        id: 't2',
        authorName: 'Alan Kay',
        content: 'The best way to predict the future is to invent it.',
        postedAt: '1 hour ago',
        voteCount: 31,
        replies: [
            {
                id: 't2-1',
                authorName: 'Margaret Hamilton',
                content: 'Software engineering deserves the name.',
                postedAt: '40 min ago',
                voteCount: 15,
            },
        ],
    },
];

const deepNodes: ReplyNode[] = [
    {
        id: 'd1',
        authorName: 'Author 1',
        content: 'Top-level reply.',
        postedAt: 'just now',
        voteCount: 5,
        replies: [
            {
                id: 'd2',
                authorName: 'Author 2',
                content: 'Depth 1.',
                postedAt: 'just now',
                voteCount: 3,
                replies: [
                    {
                        id: 'd3',
                        authorName: 'Author 3',
                        content: 'Depth 2.',
                        postedAt: 'just now',
                        voteCount: 2,
                        replies: [
                            {
                                id: 'd4',
                                authorName: 'Author 4',
                                content: 'Depth 3.',
                                postedAt: 'just now',
                                voteCount: 1,
                                replies: [
                                    {
                                        id: 'd5',
                                        authorName: 'Author 5',
                                        content: 'Depth 4.',
                                        postedAt: 'just now',
                                        voteCount: 0,
                                        replies: [
                                            {
                                                id: 'd6',
                                                authorName: 'Author 6',
                                                content: 'Depth 5 — the bottom of the rabbit hole.',
                                                postedAt: 'just now',
                                                voteCount: 0,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const collapsedDefaultNodes: ReplyNode[] = [
    {
        id: 'c1',
        authorName: 'Open Author',
        content: 'This thread is open by default.',
        postedAt: '5 min ago',
        voteCount: 4,
        replies: [
            {
                id: 'c1-1',
                authorName: 'Reply A',
                content: 'Visible child.',
                postedAt: '4 min ago',
                voteCount: 1,
            },
        ],
    },
    {
        id: 'c2',
        authorName: 'Hidden Subthread',
        content: 'This subtree starts collapsed — click the chevron to expand.',
        postedAt: '10 min ago',
        voteCount: 8,
        collapsed: true,
        replies: [
            {
                id: 'c2-1',
                authorName: 'Hidden Reply A',
                content: 'You will only see me after expand.',
                postedAt: '8 min ago',
                voteCount: 2,
            },
            {
                id: 'c2-2',
                authorName: 'Hidden Reply B',
                content: 'Same.',
                postedAt: '7 min ago',
                voteCount: 0,
            },
        ],
    },
];

export const FlatThread: Story = {
    args: {
        nodes: flatNodes,
    },
};

export const TwoLevels: Story = {
    args: {
        nodes: twoLevelNodes,
    },
};

export const DeepNesting: Story = {
    args: {
        nodes: deepNodes,
        maxDepth: 10,
    },
};

export const CollapsedByDefault: Story = {
    args: {
        nodes: collapsedDefaultNodes,
    },
};

export const MaxDepthFlatten: Story = {
    args: {
        nodes: deepNodes,
        maxDepth: 2,
        onContinueThread: (id) => {
            // eslint-disable-next-line no-console
            console.log('continue thread', id);
        },
    },
};

const interactiveSeed: ReplyNode[] = [
    {
        id: 'i1',
        authorName: 'Interactive Alice',
        content: 'Vote and collapse work in this story.',
        postedAt: 'now',
        voteCount: 10,
        userVote: null,
        replies: [
            {
                id: 'i1-1',
                authorName: 'Interactive Bob',
                content: 'Try the up/down arrows on me.',
                postedAt: 'now',
                voteCount: 3,
                userVote: 'up',
            },
            {
                id: 'i1-2',
                authorName: 'Interactive Carol',
                content: 'And try collapsing my parent.',
                postedAt: 'now',
                voteCount: 1,
                userVote: null,
            },
        ],
    },
];

function updateVote(
    nodes: ReplyNode[],
    targetId: string,
    next: 'up' | 'down' | null,
): ReplyNode[] {
    return nodes.map((n) => {
        if (n.id === targetId) {
            const prev = n.userVote ?? null;
            const base = n.voteCount ?? 0;
            const prevDelta = prev === 'up' ? 1 : prev === 'down' ? -1 : 0;
            const nextDelta = next === 'up' ? 1 : next === 'down' ? -1 : 0;
            return {
                ...n,
                userVote: next,
                voteCount: base - prevDelta + nextDelta,
            };
        }
        if (n.replies) {
            return { ...n, replies: updateVote(n.replies, targetId, next) };
        }
        return n;
    });
}

const InteractiveStory: React.FC = () => {
    const [nodes, setNodes] = useState<ReplyNode[]>(interactiveSeed);

    const handleVote = useCallback(
        (id: string, next: 'up' | 'down' | null) => {
            setNodes((prev) => updateVote(prev, id, next));
        },
        [],
    );

    return (
        <div style={{ width: 480 }}>
            <ReplyTree
                nodes={nodes}
                onVote={handleVote}
                onReply={(id) => {
                    // eslint-disable-next-line no-console
                    console.log('reply to', id);
                }}
                onFlag={(id) => {
                    // eslint-disable-next-line no-console
                    console.log('flag', id);
                }}
            />
        </div>
    );
};

export const Interactive: Story = {
    render: () => <InteractiveStory />,
};
