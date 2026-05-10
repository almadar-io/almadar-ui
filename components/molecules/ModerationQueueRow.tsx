'use client';

/**
 * ModerationQueueRow Molecule
 *
 * Row representation of a flagged item in a moderation queue. Renders author
 * metadata, content preview, flag reason / count, and approve / reject /
 * escalate / view actions. Pure presentational molecule — queue state is
 * owned by the std-mod-queue atom.
 */
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Box } from '../atoms/Box';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import type { BadgeVariant } from '../atoms/Badge';

export type FlagReason =
  | 'spam'
  | 'abuse'
  | 'off-topic'
  | 'misinformation'
  | 'nsfw'
  | 'other';

export interface ModerationQueueRowProps {
  contentId: string;
  authorName: string;
  authorAvatarUrl?: string;
  contentPreview: string;
  contentType?: string;
  flaggedAt: string;
  flagReason?: FlagReason;
  flagCount?: number;
  reportedBy?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onEscalate?: () => void;
  onView?: () => void;
  className?: string;
}

const reasonVariant: Record<FlagReason, BadgeVariant> = {
  spam: 'warning',
  abuse: 'danger',
  'off-topic': 'neutral',
  misinformation: 'danger',
  nsfw: 'danger',
  other: 'info',
};

const reasonLabel: Record<FlagReason, string> = {
  spam: 'Spam',
  abuse: 'Abuse',
  'off-topic': 'Off-topic',
  misinformation: 'Misinformation',
  nsfw: 'NSFW',
  other: 'Other',
};

export const ModerationQueueRow: React.FC<ModerationQueueRowProps> = ({
  contentId,
  authorName,
  authorAvatarUrl,
  contentPreview,
  contentType = 'item',
  flaggedAt,
  flagReason,
  flagCount,
  reportedBy,
  onApprove,
  onReject,
  onEscalate,
  onView,
  className,
}) => {
  const showFlagCountBadge = typeof flagCount === 'number' && flagCount > 1;

  return (
    <Box
      data-content-id={contentId}
      className={cn(
        'flex items-start gap-4 p-4 border-b border-border bg-surface',
        className,
      )}
    >
      <Box className="flex items-start gap-3 min-w-0 w-44 shrink-0">
        <Avatar
          src={authorAvatarUrl}
          name={authorName}
          alt={authorName}
          size="md"
        />
        <Box className="min-w-0">
          <Typography variant="body2" weight="semibold" truncate>
            {authorName}
          </Typography>
          <Typography variant="caption" color="muted" overflow="clamp-2">
            {contentType} flagged at {flaggedAt}
          </Typography>
        </Box>
      </Box>

      <Box className="flex-1 min-w-0 flex flex-col gap-2">
        <Typography variant="body2" overflow="clamp-2">
          {contentPreview}
        </Typography>
        <Box className="flex flex-wrap items-center gap-2">
          {flagReason ? (
            <Badge variant={reasonVariant[flagReason]} size="sm">
              {reasonLabel[flagReason]}
            </Badge>
          ) : null}
          {showFlagCountBadge ? (
            <Badge variant="neutral" size="sm">
              {flagCount} reports
            </Badge>
          ) : null}
        </Box>
        {reportedBy ? (
          <Typography variant="caption" color="muted">
            Reported by {reportedBy}
          </Typography>
        ) : null}
      </Box>

      <Box className="flex items-center gap-2 shrink-0">
        {onView ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            View
          </Button>
        ) : null}
        {onApprove ? (
          <Button
            variant="success"
            size="sm"
            onClick={onApprove}
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
          >
            Approve
          </Button>
        ) : null}
        {onEscalate ? (
          <Button
            variant="warning"
            size="sm"
            onClick={onEscalate}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
          >
            Escalate
          </Button>
        ) : null}
        {onReject ? (
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Reject
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

ModerationQueueRow.displayName = 'ModerationQueueRow';
