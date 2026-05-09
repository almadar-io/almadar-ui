'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModerationQueueRow } from './ModerationQueueRow';
import { Box } from '../atoms/Box';

const meta: Meta<typeof ModerationQueueRow> = {
  title: 'Core/Molecules/ModerationQueueRow',
  component: ModerationQueueRow,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box className="w-[960px] max-w-full border border-border rounded-md overflow-hidden">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Default: Story = {
  args: {
    contentId: 'c-001',
    authorName: 'Marcus Reed',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=12',
    contentType: 'comment',
    contentPreview:
      'Check out this amazing offer — limited time only. Click the link in my bio for an exclusive discount!',
    flaggedAt: '2 hours ago',
    flagReason: 'spam',
    flagCount: 1,
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

export const Abuse: Story = {
  args: {
    contentId: 'c-002',
    authorName: 'Anonymous Coward',
    contentType: 'reply',
    contentPreview:
      'You are completely useless and nobody wants to hear from you on this platform ever again.',
    flaggedAt: '12 minutes ago',
    flagReason: 'abuse',
    flagCount: 8,
    reportedBy: '8 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

export const MultipleFlags: Story = {
  args: {
    contentId: 'c-003',
    authorName: 'Lina Park',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=47',
    contentType: 'post',
    contentPreview:
      'Selling concert tickets at face value, DM me. Front row, all major cities, paypal only.',
    flaggedAt: '34 minutes ago',
    flagReason: 'spam',
    flagCount: 12,
    reportedBy: '12 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

export const Misinformation: Story = {
  args: {
    contentId: 'c-004',
    authorName: 'Greg Hollins',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=8',
    contentType: 'article',
    contentPreview:
      'Studies prove that drinking lemon water 47 times per day cures every known disease. Doctors hate this one trick.',
    flaggedAt: '1 hour ago',
    flagReason: 'misinformation',
    flagCount: 5,
    reportedBy: '5 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

export const WithReporter: Story = {
  args: {
    contentId: 'c-005',
    authorName: 'Sam Tate',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=33',
    contentType: 'review',
    contentPreview:
      'Worst restaurant in the city. The waiter insulted me and the manager is a thief. Avoid at all costs.',
    flaggedAt: '5 hours ago',
    flagReason: 'abuse',
    flagCount: 1,
    reportedBy: '@alice',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

export const WithoutAvatar: Story = {
  args: {
    contentId: 'c-006',
    authorName: 'deleted_user',
    contentType: 'comment',
    contentPreview:
      'random off-topic monologue about my breakfast on a thread about quantum computing.',
    flaggedAt: 'just now',
    flagReason: 'off-topic',
    flagCount: 2,
    reportedBy: '2 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
};

const rows: React.ComponentProps<typeof ModerationQueueRow>[] = [
  {
    contentId: 'm-1',
    authorName: 'Marcus Reed',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=12',
    contentType: 'comment',
    contentPreview:
      'Check out this amazing offer — limited time only. Click the link in my bio for an exclusive discount!',
    flaggedAt: '2 hours ago',
    flagReason: 'spam',
    flagCount: 1,
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
  {
    contentId: 'm-2',
    authorName: 'Anonymous Coward',
    contentType: 'reply',
    contentPreview:
      'You are completely useless and nobody wants to hear from you on this platform ever again.',
    flaggedAt: '12 minutes ago',
    flagReason: 'abuse',
    flagCount: 8,
    reportedBy: '8 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
  {
    contentId: 'm-3',
    authorName: 'Lina Park',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=47',
    contentType: 'post',
    contentPreview:
      'Selling concert tickets at face value, DM me. Front row, all major cities, paypal only.',
    flaggedAt: '34 minutes ago',
    flagReason: 'spam',
    flagCount: 12,
    reportedBy: '12 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
  {
    contentId: 'm-4',
    authorName: 'Eve Carmichael',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=24',
    contentType: 'image',
    contentPreview:
      'Inappropriate visual content reported by community filters and three independent users.',
    flaggedAt: '1 minute ago',
    flagReason: 'nsfw',
    flagCount: 3,
    reportedBy: '3 users',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
  {
    contentId: 'm-5',
    authorName: 'Sam Tate',
    authorAvatarUrl: 'https://i.pravatar.cc/80?img=33',
    contentType: 'review',
    contentPreview:
      'Off-topic ramble that does not relate to the product being reviewed in this listing thread.',
    flaggedAt: '5 hours ago',
    flagReason: 'off-topic',
    flagCount: 1,
    reportedBy: '@alice',
    onApprove: noop,
    onReject: noop,
    onEscalate: noop,
    onView: noop,
  },
];

export const MultipleRows: Story = {
  render: () => (
    <>
      {rows.map((row) => (
        <ModerationQueueRow key={row.contentId} {...row} />
      ))}
    </>
  ),
};
