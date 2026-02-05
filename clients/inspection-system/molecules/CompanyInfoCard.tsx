/**
 * CompanyInfoCard
 *
 * Detailed company information card.
 * Shows full company details with inspection history.
 *
 * Event Contract:
 * - Emits: UI:EDIT, UI:DELETE, UI:START_INSPECTION with { item }
 */

import React from "react";
import {
  Building2,
  MapPin,
  FileText,
  Phone,
  Mail,
  Globe,
  Calendar,
  ClipboardCheck,
  Edit,
  Trash2,
  Play,
  ExternalLink,
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

export interface CompanyInfoData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  companyId?: string;
  registrationNumber?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  inspectionCount?: number;
  lastInspectionDate?: string;
  lastInspectionStatus?: "compliant" | "non_compliant" | "pending";
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyInfoCardProps {
  /** Company data */
  data?: CompanyInfoData;
  /** Company data alias */
  item?: CompanyInfoData;
  /** Display fields */
  displayFields?: string[];
  /** Show inspection history */
  showInspectionHistory?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Actions */
  actions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
}

const statusLabels: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
  compliant: { variant: "success", label: "Compliant" },
  non_compliant: { variant: "danger", label: "Non-Compliant" },
  pending: { variant: "warning", label: "Pending" },
};

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  data,
  item,
  displayFields,
  showInspectionHistory = true,
  showActions = true,
  actions,
  className,
}) => {
  const eventBus = useEventBus();
  const company = data || item;

  if (!company) return null;

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: company });
  };

  const defaultActions = [
    { label: "Edit", event: "EDIT" },
    { label: "Delete", event: "DELETE" },
  ];

  const actionList = actions || defaultActions;

  const location = [company.address, company.city, company.postalCode, company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className={cn("p-6", className)}>
      <VStack gap="lg">
        {/* Header */}
        <HStack justify="between" align="start" wrap>
          <HStack gap="md" align="center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <VStack gap="xs">
              <Typography variant="h2" className="text-neutral-800">
                {company.name}
              </Typography>
              {company.registrationNumber && (
                <Typography variant="body" className="text-neutral-500">
                  Reg. No: {company.registrationNumber}
                </Typography>
              )}
            </VStack>
          </HStack>
        </HStack>

        {/* Company details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          {location && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <MapPin className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Address
                </Typography>
              </HStack>
              <Typography variant="body" className="text-neutral-700 pl-5">
                {location}
              </Typography>
            </VStack>
          )}

          {/* Company ID */}
          {company.companyId && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <FileText className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Company ID
                </Typography>
              </HStack>
              <Typography variant="body" className="text-neutral-700 pl-5">
                {company.companyId}
              </Typography>
            </VStack>
          )}

          {/* Tax Number */}
          {company.taxNumber && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <FileText className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Tax Number
                </Typography>
              </HStack>
              <Typography variant="body" className="text-neutral-700 pl-5">
                {company.taxNumber}
              </Typography>
            </VStack>
          )}

          {/* Contact - Phone */}
          {company.phone && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <Phone className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Phone
                </Typography>
              </HStack>
              <Typography variant="body" className="text-neutral-700 pl-5">
                {company.phone}
              </Typography>
            </VStack>
          )}

          {/* Contact - Email */}
          {company.email && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <Mail className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Email
                </Typography>
              </HStack>
              <Typography variant="body" className="text-neutral-700 pl-5">
                {company.email}
              </Typography>
            </VStack>
          )}

          {/* Website */}
          {company.website && (
            <VStack gap="xs">
              <HStack gap="xs" align="center" className="text-neutral-500">
                <Globe className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Website
                </Typography>
              </HStack>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline pl-5 flex items-center gap-1"
              >
                <Typography variant="body">{company.website}</Typography>
                <ExternalLink className="h-3 w-3" />
              </a>
            </VStack>
          )}
        </div>

        {/* Inspection history */}
        {showInspectionHistory && (
          <Card className="p-4 bg-neutral-50 border-0">
            <VStack gap="md">
              <HStack justify="between" align="center">
                <Typography variant="h4" className="text-neutral-700">
                  Inspection History
                </Typography>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction("START_INSPECTION")}
                  className="gap-1"
                >
                  <Play className="h-3 w-3" />
                  New Inspection
                </Button>
              </HStack>

              <div className="grid grid-cols-3 gap-4">
                <VStack gap="xs" align="center" className="p-3 bg-white rounded-lg">
                  <Typography variant="h3" className="text-neutral-800">
                    {company.inspectionCount ?? 0}
                  </Typography>
                  <Typography variant="small" className="text-neutral-500">
                    Total Inspections
                  </Typography>
                </VStack>

                {company.lastInspectionDate && (
                  <VStack gap="xs" align="center" className="p-3 bg-white rounded-lg">
                    <HStack gap="xs" align="center">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <Typography variant="body" className="font-medium">
                        {company.lastInspectionDate}
                      </Typography>
                    </HStack>
                    <Typography variant="small" className="text-neutral-500">
                      Last Inspection
                    </Typography>
                  </VStack>
                )}

                {company.lastInspectionStatus && (
                  <VStack gap="xs" align="center" className="p-3 bg-white rounded-lg">
                    <Badge variant={statusLabels[company.lastInspectionStatus].variant}>
                      {statusLabels[company.lastInspectionStatus].label}
                    </Badge>
                    <Typography variant="small" className="text-neutral-500">
                      Last Status
                    </Typography>
                  </VStack>
                )}
              </div>
            </VStack>
          </Card>
        )}

        {/* Actions */}
        {showActions && (
          <HStack gap="sm" className="pt-4 border-t">
            {actionList.map((action) => (
              <Button
                key={action.event}
                variant={action.event === "DELETE" ? "ghost" : "secondary"}
                onClick={() => handleAction(action.event)}
                className={cn(
                  "gap-2",
                  action.event === "DELETE" && "text-red-600"
                )}
              >
                {action.event === "EDIT" && <Edit className="h-4 w-4" />}
                {action.event === "DELETE" && <Trash2 className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

CompanyInfoCard.displayName = "CompanyInfoCard";
