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
import { Button } from "../atoms/Button";
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
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 border rounded-sm p-4 shadow-sm",
        severityContainerClasses[severity],
        className,
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <SeverityIcon className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
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
          <div className="mt-3 flex gap-2 flex-wrap">
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
          </div>
        )}
      </div>

      {isDismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded-sm transition-colors",
            "hover:bg-black/10",
          )}
          aria-label="Dismiss payment notice"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

DunningBanner.displayName = "DunningBanner";
