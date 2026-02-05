/**
 * ViolationListItem
 *
 * List item component for displaying violations.
 * Shows violation details with severity and status.
 *
 * Event Contract:
 * - Emits: UI:VIEW, UI:EDIT, UI:DELETE with { item }
 */

import React from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Edit,
  Trash2,
  Camera,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  cn,
  VStack,
  HStack,
  Typography,
  Card,
  Badge,
  Button,
  useEventBus,
} from '@almadar/ui';

export type ViolationSeverity = "critical" | "major" | "minor";
export type ViolationStatus = "open" | "corrected" | "verified" | "waived";

export interface ViolationListItemData {
  id: string;
  ruleName?: string;
  ruleId?: string;
  description: string;
  severity: ViolationSeverity;
  status?: ViolationStatus;
  correctionDeadline?: string;
  photoCount?: number;
  notes?: string;
  correctedAt?: string;
}

export interface ViolationListItemProps {
  /** Violation data */
  data?: ViolationListItemData;
  /** Violation data alias */
  item?: ViolationListItemData;
  /** Display variant */
  variant?: "default" | "compact";
  /** Show actions */
  showActions?: boolean;
  /** Item actions */
  itemActions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
}

const severityConfig: Record<ViolationSeverity, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  critical: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100", label: "Critical" },
  major: { icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-100", label: "Major" },
  minor: { icon: Info, color: "text-yellow-600", bgColor: "bg-yellow-100", label: "Minor" },
};

const statusConfig: Record<ViolationStatus, { variant: "danger" | "warning" | "success" | "neutral"; label: string }> = {
  open: { variant: "danger", label: "Open" },
  corrected: { variant: "warning", label: "Corrected" },
  verified: { variant: "success", label: "Verified" },
  waived: { variant: "neutral", label: "Waived" },
};

export const ViolationListItem: React.FC<ViolationListItemProps> = ({
  data,
  item,
  variant = "default",
  showActions = true,
  itemActions,
  className,
}) => {
  const eventBus = useEventBus();
  const violation = data || item;

  if (!violation) return null;

  const severityInfo = severityConfig[violation.severity];
  const SeverityIcon = severityInfo.icon;
  const statusInfo = violation.status ? statusConfig[violation.status] : null;

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: violation });
  };

  const defaultActions = [
    { label: "View", event: "VIEW" },
    { label: "Edit", event: "EDIT" },
  ];

  const actions = itemActions || defaultActions;

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <SeverityIcon className={cn("h-4 w-4", severityInfo.color)} />
            <Typography variant="body" className="font-medium line-clamp-1">
              {violation.description}
            </Typography>
          </HStack>
          <HStack gap="xs">
            <Badge className={cn(severityInfo.bgColor, severityInfo.color)}>
              {severityInfo.label}
            </Badge>
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
          </HStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <VStack gap="md">
        {/* Header */}
        <HStack justify="between" align="start">
          <HStack gap="sm" align="start">
            <div className={cn("p-2 rounded-lg", severityInfo.bgColor)}>
              <SeverityIcon className={cn("h-4 w-4", severityInfo.color)} />
            </div>
            <VStack gap="xs">
              <Typography variant="body" className="font-medium text-neutral-800">
                {violation.description}
              </Typography>
              {violation.ruleName && (
                <Typography variant="small" className="text-neutral-500">
                  Rule: {violation.ruleName}
                </Typography>
              )}
            </VStack>
          </HStack>
          <HStack gap="xs">
            <Badge className={cn(severityInfo.bgColor, severityInfo.color)}>
              {severityInfo.label}
            </Badge>
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
          </HStack>
        </HStack>

        {/* Details */}
        <HStack gap="md" wrap className="text-neutral-500">
          {violation.correctionDeadline && (
            <HStack gap="xs" align="center">
              <Calendar className="h-3 w-3" />
              <Typography variant="small">
                Due: {violation.correctionDeadline}
              </Typography>
            </HStack>
          )}
          {violation.photoCount !== undefined && violation.photoCount > 0 && (
            <HStack gap="xs" align="center">
              <Camera className="h-3 w-3" />
              <Typography variant="small">
                {violation.photoCount} photo{violation.photoCount !== 1 ? "s" : ""}
              </Typography>
            </HStack>
          )}
          {violation.correctedAt && (
            <HStack gap="xs" align="center">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <Typography variant="small">
                Corrected: {violation.correctedAt}
              </Typography>
            </HStack>
          )}
        </HStack>

        {/* Notes */}
        {violation.notes && (
          <Typography variant="small" className="text-neutral-600 italic">
            "{violation.notes}"
          </Typography>
        )}

        {/* Actions */}
        {showActions && (
          <HStack gap="sm" className="pt-2 border-t">
            {actions.map((action) => (
              <Button
                key={action.event}
                variant="ghost"
                size="sm"
                onClick={() => handleAction(action.event)}
                className={cn(
                  "gap-1",
                  action.event === "DELETE" && "text-red-600"
                )}
              >
                {action.event === "VIEW" && <Eye className="h-3 w-3" />}
                {action.event === "EDIT" && <Edit className="h-3 w-3" />}
                {action.event === "DELETE" && <Trash2 className="h-3 w-3" />}
                {action.label}
              </Button>
            ))}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

ViolationListItem.displayName = "ViolationListItem";
