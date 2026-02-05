/**
 * ChecklistItem
 *
 * Individual checklist item component.
 * Wrapper around RuleCheckItem for simpler use cases.
 *
 * Event Contract:
 * - Emits: UI:ITEM_CHECKED with { itemId, checked, notes }
 */

import React from "react";
import { cn } from "../../../lib/cn";
import { VStack, HStack } from "../../../components/atoms/Stack";
import { Typography } from "../../../components/atoms/Typography";
import { Card } from "../../../components/atoms/Card";
import { Badge } from "../../../components/atoms/Badge";
import { Button } from "../../../components/atoms/Button";
import { Textarea } from "../../../components/atoms/Textarea";
import { useEventBus } from "../../../hooks/useEventBus";
import { Check, X, Eye, Edit } from "lucide-react";

export interface ChecklistItemProps {
  /** Item ID */
  id?: string;
  /** Item name/title */
  name?: string;
  /** Item description */
  description?: string;
  /** Display fields */
  displayFields?: string[];
  /** Item data for detail variant */
  data?: Record<string, unknown>;
  /** Display variant */
  variant?: "default" | "compact" | "detail";
  /** Whether item is checked/compliant */
  isChecked?: boolean | null;
  /** Notes for the item */
  notes?: string;
  /** Show severity badge */
  showSeverityBadge?: boolean;
  /** Severity level */
  severity?: "critical" | "major" | "minor" | "info";
  /** Read-only mode */
  readOnly?: boolean;
  /** Actions */
  actions?: Array<{ label: string; event: string }>;
  /** Additional CSS classes */
  className?: string;
  /** Change handler */
  onChange?: (data: { checked: boolean | null; notes: string }) => void;
}

const severityConfig = {
  critical: { color: "text-red-600", bgColor: "bg-red-100", label: "Critical" },
  major: { color: "text-orange-600", bgColor: "bg-orange-100", label: "Major" },
  minor: { color: "text-yellow-600", bgColor: "bg-yellow-100", label: "Minor" },
  info: { color: "text-blue-600", bgColor: "bg-blue-100", label: "Info" },
};

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  id,
  name,
  description,
  displayFields,
  data,
  variant = "default",
  isChecked = null,
  notes = "",
  showSeverityBadge = false,
  severity = "info",
  readOnly = false,
  actions,
  className,
  onChange,
}) => {
  const eventBus = useEventBus();
  const [localChecked, setLocalChecked] = React.useState(isChecked);
  const [localNotes, setLocalNotes] = React.useState(notes);

  const severityStyle = severityConfig[severity];

  const handleCheck = (value: boolean) => {
    if (readOnly) return;
    setLocalChecked(value);
    onChange?.({ checked: value, notes: localNotes });
    eventBus.emit("UI:ITEM_CHECKED", { itemId: id, checked: value, notes: localNotes });
  };

  const handleAction = (event: string) => {
    eventBus.emit(`UI:${event}`, { item: { id, name, description, ...data } });
  };

  if (variant === "detail") {
    return (
      <Card className={cn("p-4", className)}>
        <VStack gap="md">
          <HStack justify="between" align="start">
            <VStack gap="xs">
              <Typography variant="h4" className="text-neutral-800">
                {name}
              </Typography>
              {description && (
                <Typography variant="body" className="text-neutral-600">
                  {description}
                </Typography>
              )}
            </VStack>
            {showSeverityBadge && (
              <Badge className={cn(severityStyle.bgColor, severityStyle.color)}>
                {severityStyle.label}
              </Badge>
            )}
          </HStack>

          {displayFields && data && (
            <VStack gap="xs" className="text-neutral-600">
              {displayFields.map((field) => (
                <HStack key={field} justify="between">
                  <Typography variant="small" className="capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}:
                  </Typography>
                  <Typography variant="small" className="font-medium">
                    {String(data[field] ?? "-")}
                  </Typography>
                </HStack>
              ))}
            </VStack>
          )}

          {actions && (
            <HStack gap="sm" className="pt-2 border-t">
              {actions.map((action) => (
                <Button
                  key={action.event}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(action.event)}
                  className="gap-1"
                >
                  {action.event === "EDIT" && <Edit className="h-3 w-3" />}
                  {action.event === "VIEW" && <Eye className="h-3 w-3" />}
                  {action.label}
                </Button>
              ))}
            </HStack>
          )}
        </VStack>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <HStack justify="between" align="start" gap="md">
        <VStack gap="xs" className="flex-1">
          {showSeverityBadge && (
            <Badge className={cn(severityStyle.bgColor, severityStyle.color, "w-fit")}>
              {severityStyle.label}
            </Badge>
          )}
          <Typography variant="body" className="font-medium text-neutral-800">
            {name || description}
          </Typography>
          {name && description && (
            <Typography variant="small" className="text-neutral-500">
              {description}
            </Typography>
          )}
        </VStack>

        {!readOnly && (
          <HStack gap="xs">
            <button
              type="button"
              onClick={() => handleCheck(true)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                localChecked === true
                  ? "bg-green-100 border-green-300 text-green-600"
                  : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-green-50"
              )}
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleCheck(false)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                localChecked === false
                  ? "bg-red-100 border-red-300 text-red-600"
                  : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-red-50"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </HStack>
        )}

        {readOnly && localChecked !== null && (
          <div
            className={cn(
              "p-2 rounded-lg",
              localChecked ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}
          >
            {localChecked ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </div>
        )}
      </HStack>

      {localChecked === false && !readOnly && (
        <VStack gap="xs" className="mt-3">
          <Typography variant="small" className="font-medium text-neutral-600">
            Notes
          </Typography>
          <Textarea
            value={localNotes}
            onChange={(e) => {
              setLocalNotes(e.target.value);
              onChange?.({ checked: localChecked, notes: e.target.value });
            }}
            placeholder="Add notes..."
            rows={2}
            className="w-full"
          />
        </VStack>
      )}
    </Card>
  );
};

ChecklistItem.displayName = "ChecklistItem";
