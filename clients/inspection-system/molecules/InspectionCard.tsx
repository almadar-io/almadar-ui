/**
 * InspectionCard
 *
 * Card component for displaying inspection information.
 * Used in inspection lists and grids.
 *
 * Event Contract:
 * - Emits: UI:VIEW, UI:EDIT, UI:DELETE, UI:START with { item }
 */

import React from "react";
import {
  ClipboardCheck,
  Calendar,
  Building2,
  User,
  Eye,
  Edit,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  cn,
  VStack,
  HStack,
  Typography,
  Button,
  Card,
  Badge,
  useEventBus,
} from '@almadar/ui';

export type InspectionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "pending_review";

export interface InspectionCardData {
  id: string;
  companyName?: string;
  companyId?: string;
  inspectorName?: string;
  inspectorId?: string;
  scheduledDate?: string;
  status?: InspectionStatus;
  fieldType?: string;
  violationCount?: number;
  completedDate?: string;
}

export interface InspectionCardProps {
  /** Inspection data */
  data?: InspectionCardData;
  /** Inspection data alias */
  item?: InspectionCardData;
  /** Display variant */
  variant?: "default" | "compact" | "detail";
  /** Display fields to show */
  displayFields?: string[];
  /** Item actions */
  itemActions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<InspectionStatus, { variant: "success" | "warning" | "danger" | "neutral" | "info"; label: string; icon: React.ElementType }> = {
  scheduled: { variant: "info", label: "Scheduled", icon: Calendar },
  in_progress: { variant: "warning", label: "In Progress", icon: Clock },
  completed: { variant: "success", label: "Completed", icon: CheckCircle },
  cancelled: { variant: "neutral", label: "Cancelled", icon: AlertTriangle },
  pending_review: { variant: "warning", label: "Pending Review", icon: Clock },
};

export const InspectionCard: React.FC<InspectionCardProps> = ({
  data,
  item,
  variant = "default",
  itemActions,
  className,
}) => {
  const eventBus = useEventBus();
  const inspection = data || item;

  if (!inspection) return null;

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: inspection });
  };

  const defaultActions = [
    { label: "View", event: "VIEW" },
    { label: "Edit", event: "EDIT" },
  ];

  // Add Start action for scheduled inspections
  if (inspection.status === "scheduled") {
    defaultActions.push({ label: "Start", event: "START" });
  }

  const actions = itemActions || defaultActions;
  const status = inspection.status || "scheduled";
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <ClipboardCheck className="h-5 w-5 text-neutral-400" />
            <VStack gap="xs">
              <Typography variant="body" className="font-medium">
                {inspection.companyName || `Inspection #${inspection.id}`}
              </Typography>
              {inspection.scheduledDate && (
                <Typography variant="small" className="text-neutral-500">
                  {inspection.scheduledDate}
                </Typography>
              )}
            </VStack>
          </HStack>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </HStack>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
      <VStack gap="md">
        <HStack justify="between" align="start">
          <HStack gap="sm" align="center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-teal-600" />
            </div>
            <VStack gap="xs">
              <Typography variant="body" className="font-medium text-neutral-800">
                {inspection.companyName || `Inspection #${inspection.id}`}
              </Typography>
              {inspection.fieldType && (
                <Typography variant="small" className="text-neutral-500">
                  {inspection.fieldType}
                </Typography>
              )}
            </VStack>
          </HStack>
          <Badge variant={statusInfo.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </HStack>

        <VStack gap="xs" className="text-neutral-500">
          {inspection.scheduledDate && (
            <HStack gap="xs" align="center">
              <Calendar className="h-3 w-3" />
              <Typography variant="small">{inspection.scheduledDate}</Typography>
            </HStack>
          )}
          {inspection.inspectorName && (
            <HStack gap="xs" align="center">
              <User className="h-3 w-3" />
              <Typography variant="small">{inspection.inspectorName}</Typography>
            </HStack>
          )}
          {inspection.companyName && (
            <HStack gap="xs" align="center">
              <Building2 className="h-3 w-3" />
              <Typography variant="small">{inspection.companyName}</Typography>
            </HStack>
          )}
        </VStack>

        {inspection.violationCount !== undefined && inspection.violationCount > 0 && (
          <HStack gap="xs" align="center" className="text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <Typography variant="small">
              {inspection.violationCount} violation{inspection.violationCount !== 1 ? "s" : ""}
            </Typography>
          </HStack>
        )}

        <HStack gap="sm" className="pt-2 border-t">
          {actions.map((action) => (
            <Button
              key={action.event}
              variant={action.event === "START" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleAction(action.event)}
              className="gap-1"
            >
              {action.event === "VIEW" && <Eye className="h-3 w-3" />}
              {action.event === "EDIT" && <Edit className="h-3 w-3" />}
              {action.event === "START" && <Play className="h-3 w-3" />}
              {action.label}
            </Button>
          ))}
        </HStack>
      </VStack>
    </Card>
  );
};

InspectionCard.displayName = "InspectionCard";
