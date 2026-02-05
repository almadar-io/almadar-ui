/**
 * InspectorCard
 *
 * Card component for displaying inspector information.
 * Used in inspector lists and grids.
 *
 * Event Contract:
 * - Emits: UI:VIEW, UI:EDIT, UI:DELETE with { item }
 */

import React from "react";
import { cn } from "../../../lib/cn";
import { VStack, HStack } from "../../../components/atoms/Stack";
import { Typography } from "../../../components/atoms/Typography";
import { Button } from "../../../components/atoms/Button";
import { Card } from "../../../components/atoms/Card";
import { Badge } from "../../../components/atoms/Badge";
import { Avatar } from "../../../components/atoms/Avatar";
import { useEventBus } from "../../../hooks/useEventBus";
import {
  Mail,
  Phone,
  Building,
  Eye,
  Edit,
  Trash2,
  ClipboardList,
} from "lucide-react";

export interface InspectorCardData {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  department?: string;
  employeeId?: string;
  isActive?: boolean;
  inspectionCount?: number;
}

export interface InspectorCardProps {
  /** Inspector data */
  data?: InspectorCardData;
  /** Inspector data alias */
  item?: InspectorCardData;
  /** Display variant */
  variant?: "default" | "compact" | "detail";
  /** Show avatar */
  showAvatar?: boolean;
  /** Display fields to show */
  displayFields?: string[];
  /** Item actions */
  itemActions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
}

export const InspectorCard: React.FC<InspectorCardProps> = ({
  data,
  item,
  variant = "default",
  showAvatar = true,
  displayFields,
  itemActions,
  className,
}) => {
  const eventBus = useEventBus();
  const inspector = data || item;

  if (!inspector) return null;

  const fullName = `${inspector.name} ${inspector.surname}`;

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: inspector });
  };

  const defaultActions = [
    { label: "View", event: "VIEW" },
    { label: "Edit", event: "EDIT" },
    { label: "Delete", event: "DELETE" },
  ];

  const actions = itemActions || defaultActions;

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            {showAvatar && <Avatar name={fullName} size="sm" />}
            <VStack gap="xs">
              <Typography variant="body" className="font-medium">
                {fullName}
              </Typography>
              {inspector.department && (
                <Typography variant="small" className="text-neutral-500">
                  {inspector.department}
                </Typography>
              )}
            </VStack>
          </HStack>
          <HStack gap="xs">
            {actions.slice(0, 2).map((action) => (
              <Button
                key={action.event}
                variant="ghost"
                size="sm"
                onClick={() => handleAction(action.event)}
              >
                {action.label}
              </Button>
            ))}
          </HStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
      <VStack gap="md">
        <HStack justify="between" align="start">
          <HStack gap="sm" align="center">
            {showAvatar && <Avatar name={fullName} size="md" />}
            <VStack gap="xs">
              <Typography variant="body" className="font-medium text-neutral-800">
                {fullName}
              </Typography>
              {inspector.employeeId && (
                <Typography variant="small" className="text-neutral-500">
                  {inspector.employeeId}
                </Typography>
              )}
            </VStack>
          </HStack>
          {inspector.isActive !== undefined && (
            <Badge variant={inspector.isActive ? "success" : "neutral"}>
              {inspector.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </HStack>

        <VStack gap="xs" className="text-neutral-500">
          {inspector.department && (
            <HStack gap="xs" align="center">
              <Building className="h-3 w-3" />
              <Typography variant="small">{inspector.department}</Typography>
            </HStack>
          )}
          {inspector.email && (
            <HStack gap="xs" align="center">
              <Mail className="h-3 w-3" />
              <Typography variant="small">{inspector.email}</Typography>
            </HStack>
          )}
          {inspector.phone && (
            <HStack gap="xs" align="center">
              <Phone className="h-3 w-3" />
              <Typography variant="small">{inspector.phone}</Typography>
            </HStack>
          )}
        </VStack>

        {inspector.inspectionCount !== undefined && (
          <HStack gap="xs" align="center" className="text-neutral-500">
            <ClipboardList className="h-3 w-3" />
            <Typography variant="small">
              {inspector.inspectionCount} inspection{inspector.inspectionCount !== 1 ? "s" : ""}
            </Typography>
          </HStack>
        )}

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
      </VStack>
    </Card>
  );
};

InspectorCard.displayName = "InspectorCard";
