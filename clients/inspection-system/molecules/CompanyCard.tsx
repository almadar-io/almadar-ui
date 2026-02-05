/**
 * CompanyCard
 *
 * Card component for displaying company information.
 * Used in company lists and grids.
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
import { useEventBus } from "../../../hooks/useEventBus";
import {
  Building2,
  MapPin,
  FileText,
  Eye,
  Edit,
  Trash2,
  ClipboardList,
} from "lucide-react";

export interface CompanyCardData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  companyId?: string;
  registrationNumber?: string;
  taxNumber?: string;
  postalCode?: string;
  inspectionCount?: number;
  lastInspectionDate?: string;
}

export interface CompanyCardProps {
  /** Company data */
  data?: CompanyCardData;
  /** Company data alias */
  item?: CompanyCardData;
  /** Display variant */
  variant?: "default" | "compact" | "detail";
  /** Display fields to show */
  displayFields?: string[];
  /** Show inspection history indicator */
  showInspectionHistory?: boolean;
  /** Item actions */
  itemActions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  data,
  item,
  variant = "default",
  showInspectionHistory = false,
  itemActions,
  className,
}) => {
  const eventBus = useEventBus();
  const company = data || item;

  if (!company) return null;

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: company });
  };

  const defaultActions = [
    { label: "View", event: "VIEW" },
    { label: "Edit", event: "EDIT" },
    { label: "Delete", event: "DELETE" },
  ];

  const actions = itemActions || defaultActions;

  const location = [company.city, company.country].filter(Boolean).join(", ");

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <Building2 className="h-5 w-5 text-neutral-400" />
            <VStack gap="xs">
              <Typography variant="body" className="font-medium">
                {company.name}
              </Typography>
              {location && (
                <Typography variant="small" className="text-neutral-500">
                  {location}
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <VStack gap="xs">
              <Typography variant="body" className="font-medium text-neutral-800">
                {company.name}
              </Typography>
              {company.registrationNumber && (
                <Typography variant="small" className="text-neutral-500">
                  Reg: {company.registrationNumber}
                </Typography>
              )}
            </VStack>
          </HStack>
        </HStack>

        <VStack gap="xs" className="text-neutral-500">
          {company.address && (
            <HStack gap="xs" align="center">
              <MapPin className="h-3 w-3" />
              <Typography variant="small">{company.address}</Typography>
            </HStack>
          )}
          {location && (
            <HStack gap="xs" align="center">
              <MapPin className="h-3 w-3" />
              <Typography variant="small">{location}</Typography>
            </HStack>
          )}
          {company.taxNumber && (
            <HStack gap="xs" align="center">
              <FileText className="h-3 w-3" />
              <Typography variant="small">Tax: {company.taxNumber}</Typography>
            </HStack>
          )}
        </VStack>

        {showInspectionHistory && company.inspectionCount !== undefined && (
          <HStack gap="xs" align="center" className="text-neutral-500">
            <ClipboardList className="h-3 w-3" />
            <Typography variant="small">
              {company.inspectionCount} inspection{company.inspectionCount !== 1 ? "s" : ""}
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

CompanyCard.displayName = "CompanyCard";
