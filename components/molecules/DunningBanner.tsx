'use client';
/**
 * DunningBanner Molecule Component
 *
 * In-app payment-retry / update-card prompt for subscription failed-payment escalation.
 * State-machine and retry logic live in the std-dunning atom; this molecule renders only.
 */

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CreditCard,
  ExternalLink,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";

export type DunningSeverity = "soft" | "urgent" | "final";

export interface DunningBannerProps {
  severity?: DunningSeverity;
  attemptNumber?: number;
  attemptsTotal?: number;
  failedAt?: string;
  nextRetryAt?: string;
  amountDue?: number;
  currency?: string;
  onUpdatePayment?: () => void;
  onContactSupport?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

const severityContainerClasses: Record<DunningSeverity, string> = {
  soft: "bg-warning/10 text-warning border-warning",
  urgent: "bg-error/10 text-error border-error",
  final: "bg-error text-white border-error",
};

const severityIconMap: Record<DunningSeverity, LucideIcon> = {
  soft: CreditCard,
  urgent: AlertTriangle,
  final: AlertOctagon,
};

const severityTitleMap: Record<DunningSeverity, string> = {
  soft: "Payment couldn't be processed",
  urgent: "Action required: payment failed",
  final: "Final notice — service will be suspended",
};

const formatAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export const DunningBanner: React.FC<DunningBannerProps> = ({
  severity = "soft",
  attemptNumber,
  attemptsTotal,
  failedAt,
  nextRetryAt,
  amountDue,
  currency = "USD",
  onUpdatePayment,
  onContactSupport,
  onDismiss,
  dismissible,
  className,
}) => {
  const SeverityIcon = severityIconMap[severity];
  const title = severityTitleMap[severity];
  const isDismissible = dismissible ?? severity === "soft";
  const showAttempts =
    typeof attemptNumber === "number" && typeof attemptsTotal === "number";

  const bodyParts: string[] = [];
  if (typeof amountDue === "number") {
    bodyParts.push(`${formatAmount(amountDue, currency)} due.`);
  }
  if (failedAt) bodyParts.push(`Last attempted: ${failedAt}.`);
  if (nextRetryAt) bodyParts.push(`Next retry: ${nextRetryAt}.`);

  return (
    <Box
      role="alert"
      display="flex"
      border
      rounded="sm"
      shadow="sm"
      className={cn(
        "items-start gap-3 p-4",
        severityContainerClasses[severity],
        className,
      )}
    >
      <Box className="flex-shrink-0 mt-0.5">
        <Icon icon={SeverityIcon} size="md" aria-hidden="true" />
      </Box>

      <Box display="flex" className="flex-1 min-w-0 flex-col">
        <Typography variant="h6" color="inherit" className="mb-1">
          {title}
        </Typography>

        {bodyParts.length > 0 && (
          <Typography variant="body2" color="inherit">
            {bodyParts.join(" ")}
          </Typography>
        )}

        {showAttempts && (
          <Typography
            variant="caption"
            color="inherit"
            className="mt-1 block opacity-80"
          >
            {`Attempt ${attemptNumber} of ${attemptsTotal}`}
          </Typography>
        )}

        {(onUpdatePayment || onContactSupport) && (
          <Box display="flex" className="mt-3 gap-2 flex-wrap">
            {onUpdatePayment && (
              <Button
                variant="primary"
                size="sm"
                onClick={onUpdatePayment}
                leftIcon={CreditCard}
              >
                Update Payment Method
              </Button>
            )}
            {onContactSupport && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onContactSupport}
                leftIcon={ExternalLink}
              >
                Contact Support
              </Button>
            )}
          </Box>
        )}
      </Box>

      {isDismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss payment notice"
          leftIcon={X}
          className={cn(
            "flex-shrink-0 p-1",
            "hover:bg-black/10",
          )}
        />
      )}
    </Box>
  );
};

DunningBanner.displayName = "DunningBanner";
